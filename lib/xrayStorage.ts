// lib/xrayStorage.ts

import { handleUploadXrayFile } from '@/client/helpers/upload_image';
import { db, XrayImageMetadata } from './db';
import { telegramClient } from './telegram-media';

// تحويل File أو Blob إلى Buffer (لـ Telegram API)
async function toBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// تخزين الملف المحلي في IndexedDB
async function storeLocalFile(fileId: string, blob: Blob, fileName: string): Promise<void> {
  await db.files.put({
    key: fileId,
    blob: blob,
    mimeType: blob.type,
    fileName: fileName,
  });
}

// استرداد الملف المحلي
async function getLocalFile(fileId: string): Promise<Blob | null> {
  const record = await db.files.get(fileId);
  return record ? record.blob : null;
}

// ✅ دالة جديدة: الحصول على الرابط الصحيح من Telegram باستخدام file_id
async function getTelegramFileUrl(fileId: string): Promise<string> {
  // استدعاء API /getFile للحصول على file_path الصحيح
  const botToken = process.env.NEXT_PUBLIC_XRAY_TELEGRAM_BOT_TOKEN!;
  
  const response = await fetch(`https://api.telegram.org/bot${botToken}/getFile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  });
  
  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Telegram API error: ${data.description}`);
  }
  
  // بناء الرابط الصحيح باستخدام file_path من الاستجابة
  const filePath = data.result.file_path;
  const fullUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  
  
  return fullUrl;
}

// دالة إضافة صورة واحدة
export interface AddImageParams {
  patientId: string;
  file: File;
  title?: string;
}

export interface AddedImageResult {
  id: string;
  title: string;
  img_tele_id: string;
  created_at: string;
  localUrl: string;
}

export async function addXRayImage({ patientId, file, title = '' }: AddImageParams): Promise<AddedImageResult> {
  // 1. رفع الملف إلى تلجرام
  const buffer = await toBuffer(file);
  const isImage = file.type.startsWith('image/');
  let imgTeleId: string;
  imgTeleId = await handleUploadXrayFile(file, patientId);


  // 2. تخزين الملف محلياً
  await storeLocalFile(imgTeleId, file, file.name);

  // 3. استدعاء API لحفظ البيانات في الخادم
  const jwt = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
  const response = await fetch('/api/v1/xray_img', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { 'Authorization': `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify({
      patientId,
      images: [{ img_tele_id: imgTeleId, title }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل حفظ البيانات في الخادم');
  }

  const result = await response.json();
  const inserted = result.images[0];

  // 4. تخزين البيانات الوصفية في IndexedDB
  const metadata: XrayImageMetadata = {
    id: inserted.id,
    patientId,
    title: inserted.title,
    img_tele_id: inserted.img_tele_id,
    created_at: inserted.created_at,
    mimeType: file.type,
  };
  await db.images.put(metadata);

  // إنشاء رابط محلي من الملف المخزن محلياً
  const localUrl = URL.createObjectURL(file);
   try {
    const CACHE_NAME = 'xray-images-api-cache';
    const cacheKey = `/api/v1/xray_img?patientId=${encodeURIComponent(patientId)}`;
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(cacheKey);
    console.log('✅ Cache cleared for patient:', patientId);
  } catch (err) {
    console.warn('⚠️ Failed to clear cache:', err);
  }

  return {
    id: inserted.id,
    title: inserted.title,
    img_tele_id: inserted.img_tele_id,
    created_at: inserted.created_at,
    localUrl,
  };
}

// واجهة صورة المريض
export interface PatientImage {
  id: string;
  title: string;
  img_tele_id: string;
  created_at: string;
  localUrl: string;
  mimeType?: string;
}

// ✅ دالة مساعدة لاستخراج الامتداد من نوع MIME
function getExtensionFromMime(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };
  return extensions[mimeType] || 'bin';
}

export async function getPatientImages(patientId: string): Promise<PatientImage[]> {
  const CACHE_NAME = 'xray-images-api-cache';
  const CACHE_DURATION = 60 * 1000; // دقيقة واحدة
  const cacheKey = `/api/v1/xray_img?patientId=${encodeURIComponent(patientId)}`;
  
  const jwt = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
  let serverImages: any[] = [];
  let serverAvailable = false;

  // 0. محاولة قراءة من Cache API قبل الجلب من الخادم
  let cachedResponseUsed = false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      const cachedData = await cachedResponse.clone().json();
      const cachedTimestamp = cachedResponse.headers.get('x-cache-timestamp');
      
      if (cachedTimestamp && (Date.now() - parseInt(cachedTimestamp)) < CACHE_DURATION) {
        serverImages = cachedData.images;
        serverAvailable = true;
        cachedResponseUsed = true;
      }
    }
  } catch (err) {
    console.warn('⚠️ فشل قراءة من Cache API:', err);
  }

  // 1. محاولة جلب البيانات من الخادم (إذا لم يتم استخدام الكاش أو انتهت صلاحيته)
  if (!cachedResponseUsed) {
    try {
      const response = await fetch(cacheKey, {
        headers: jwt ? { 'Authorization': `Bearer ${jwt}` } : {},
      });
      
      if (response.ok) {
        const data = await response.json();
        serverImages = data.images;
        serverAvailable = true;
        
        // تخزين الاستجابة في Cache API مع إضافة توقيت
        try {
          const cache = await caches.open(CACHE_NAME);
          const responseToCache = response.clone();
          const headers = new Headers(responseToCache.headers);
          headers.set('x-cache-timestamp', Date.now().toString());
          
          const cachedResponse = new Response(JSON.stringify(data), {
            status: responseToCache.status,
            statusText: responseToCache.statusText,
            headers: headers,
          });
          
          await cache.put(cacheKey, cachedResponse);
        } catch (err) {
          console.warn('⚠️ فشل تخزين في Cache API:', err);
        }
      }
    } catch (err) {
      console.warn('⚠️ الخادم غير متاح، استخدام البيانات المحلية فقط:', err);
    }
  }

  // 2. إذا الخادم متاح، مزامنة IndexedDB
  if (serverAvailable) {
    const existingLocalImages = await db.images.where('patientId').equals(patientId).toArray();
    const serverImageIds = new Set(serverImages.map((img: any) => img.id));
    
    for (const localImg of existingLocalImages) {
      if (!serverImageIds.has(localImg.id)) {
        await db.files.delete(localImg.img_tele_id);
        await db.images.delete(localImg.id);
      }
    }

    for (const img of serverImages) {
      const metadata: XrayImageMetadata = {
        id: img.id,
        patientId,
        title: img.title,
        img_tele_id: img.img_tele_id,
        created_at: img.created_at,
        mimeType: img.mimeType || 'image/jpeg',
      };
      await db.images.put(metadata);
    }
  }

  // 3. استرجاع الصور من التخزين المحلي
  const localImages = await db.images.where('patientId').equals(patientId).toArray();
  
  // 4. بناء الروابط
  const result: PatientImage[] = [];

  for (const img of localImages) {
    let localUrl: string | null = null;

    // (أ) البحث عن الملف في التخزين المحلي (IndexedDB)
    const blob = await getLocalFile(img.img_tele_id);
    if (blob) {
      // ✅ موجود محلياً - استخدمه مباشرة
      localUrl = URL.createObjectURL(blob);
    } else {
      // (ب) غير موجود محلياً - احصل على الرابط الصحيح من Telegram
      try {
        // ✅ استخدام الدالة الجديدة للحصول على الرابط الصحيح
        localUrl = img.img_tele_id
      } catch (error) {
        console.error(`❌ Failed to get URL for ${img.id}:`, error);
        // استخدم placeholder في حالة الفشل
        const isImage = img.mimeType?.startsWith('image/');
        localUrl = isImage ? '/images/image-placeholder.svg' : '/images/pdf-placeholder.svg';
      }
    }

    result.push({
      id: img.id,
      title: img.title,
      img_tele_id: img.img_tele_id,
      created_at: img.created_at,
      localUrl,
      mimeType: img.mimeType,
    });
  }

  return result;
}

// دالة حذف صورة
export async function deleteXRayImage(imageId: string, patientId?: string): Promise<void> {
  const jwt = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
  const response = await fetch(`/api/v1/xray_img?imageId=${imageId}`, {
    method: 'DELETE',
    headers: jwt ? { 'Authorization': `Bearer ${jwt}` } : {},
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل حذف الصورة من الخادم');
  }

  const imageMeta = await db.images.get(imageId);
  if (imageMeta) {
    await db.files.delete(imageMeta.img_tele_id);
    await db.images.delete(imageId);
  }
}

// تحرير الروابط المؤقتة
export function revokeLocalUrl(url: string) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}