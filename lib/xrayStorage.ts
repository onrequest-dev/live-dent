// lib/xrayStorage.ts
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

// إنشاء رابط محلي (blob URL) من ملف مخزن
export async function getLocalImageUrl(fileId: string): Promise<string | null> {
  const blob = await getLocalFile(fileId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

// دالة إضافة صورة واحدة (مع دعم المصفوفات)
export interface AddImageParams {
  patientId: string;
  file: File;          // الملف المختار من المستخدم
  title?: string;
}

export interface AddedImageResult {
  id: string;
  title: string;
  img_tele_id: string;
  created_at: string;
  localUrl: string;    // رابط مؤقت للعرض
}

// lib/xrayStorage.ts

export async function addXRayImage({ patientId, file, title = '' }: AddImageParams): Promise<AddedImageResult> {
  // 1. رفع الملف إلى تلجرام
  const buffer = await toBuffer(file);
  const isImage = file.type.startsWith('image/');
  let imgTeleId: string;
  if (isImage) {
    imgTeleId = await telegramClient.addImage(buffer, title);
  } else {
    imgTeleId = await telegramClient.addDocument(buffer, title, file.name);
  }

  // 2. ✅ تخزين الملف محلياً مع حفظ نوع MIME الأصلي
  await storeLocalFile(imgTeleId, file, file.name); // file.type هو الـ MIME الحقيقي (مثلاً: 'image/png', 'application/pdf')

  // 3. استدعاء API
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

  // 4. ✅ تخزين البيانات الوصفية مع mimeType
  const metadata: XrayImageMetadata = {
    id: inserted.id,
    patientId,
    title: inserted.title,
    img_tele_id: inserted.img_tele_id,
    created_at: inserted.created_at,
    mimeType: file.type,  // ✅ حفظ نوع الملف
  };
  await db.images.put(metadata);

  // إنشاء رابط محلي
  const localUrl = URL.createObjectURL(file);

  return {
    id: inserted.id,
    title: inserted.title,
    img_tele_id: inserted.img_tele_id,
    created_at: inserted.created_at,
    localUrl,
  };
}

// دالة استعادة كل صور مريض مع روابط محلية
export interface PatientImage {
  id: string;
  title: string;
  img_tele_id: string;
  created_at: string;
  localUrl: string;     // رابط blob مؤقت
}

export async function getPatientImages(patientId: string): Promise<PatientImage[]> {
  let localImages = await db.images.where('patientId').equals(patientId).toArray();

  if (localImages.length === 0) {
    const jwt = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
    const response = await fetch(`/api/v1/xray_img?patientId=${encodeURIComponent(patientId)}`, {
      headers: jwt ? { 'Authorization': `Bearer ${jwt}` } : {},
    });
    if (!response.ok) {
      throw new Error('فشل جلب الصور من الخادم');
    }
    const data = await response.json();
    const serverImages = data.images;

    for (const img of serverImages) {
      try {
        // ✅ إضافة patientId و mimeType افتراضي
        const imageWithPatient: XrayImageMetadata = {
          ...img,
          patientId: patientId,
          mimeType: img.mimeType || 'image/jpeg', // استخدم الـ mimeType المخزن أو افتراضي
        };

        let fileBlob = await getLocalFile(img.img_tele_id);
        if (!fileBlob) {
          try {
            const buffer = await telegramClient.getFileBuffer(img.img_tele_id);
            // ✅ استخدام الـ mimeType الصحيح بدلاً من فرض 'image/jpeg'
            const mimeType = imageWithPatient.mimeType || 'image/jpeg';
            fileBlob = new Blob([new Uint8Array(buffer)], { type: mimeType });
            await storeLocalFile(img.img_tele_id, fileBlob, `${img.id}.${getExtensionFromMime(mimeType)}`);
          } catch (downloadErr) {
            console.error(`فشل تحميل الملف ${img.img_tele_id}:`, downloadErr);
            fileBlob = null;
          }
        }
        
        await db.images.put(imageWithPatient);
        localImages.push(imageWithPatient);
        
      } catch (err) {
        console.error(`خطأ في معالجة الصورة ${img.id}:`, err);
      }
    }
  }

  // إنشاء النتيجة
  const result: PatientImage[] = [];
  for (const img of localImages) {
    let localUrl: string | null = null;
    const blob = await getLocalFile(img.img_tele_id);
    if (blob) {
      localUrl = URL.createObjectURL(blob);
    } else {
      try {
        const directUrl = await telegramClient.getFileUrl(img.img_tele_id);
        localUrl = directUrl;
      } catch (urlErr) {
        console.error(`لا يمكن الحصول على رابط للصورة ${img.id}:`, urlErr);
        continue;
      }
    }
    result.push({
      id: img.id,
      title: img.title,
      img_tele_id: img.img_tele_id,
      created_at: img.created_at,
      localUrl,
    });
  }
  return result;
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
    'video/mp4': 'mp4',
  };
  return extensions[mimeType] || 'bin';
}

// دالة حذف صورة
export async function deleteXRayImage(imageId: string, patientId?: string): Promise<void> {
  // 1. استدعاء API route للحذف من supabase
  const jwt = document.cookie.split('; ').find(row => row.startsWith('jwt='))?.split('=')[1];
  const response = await fetch(`/api/v1/xray_img?imageId=${imageId}`, {
    method: 'DELETE',
    headers: jwt ? { 'Authorization': `Bearer ${jwt}` } : {},
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'فشل حذف الصورة من الخادم');
  }

  // 2. الحصول على بيانات الصورة قبل حذفها من IndexedDB (لنعرف img_tele_id)
  const imageMeta = await db.images.get(imageId);
  if (imageMeta) {
    // حذف الملف المخزن محلياً
    await db.files.delete(imageMeta.img_tele_id);
    // حذف البيانات الوصفية
    await db.images.delete(imageId);
  }
}

// اختياري: تحرير الروابط المؤقتة (عند إغلاق المكون)
export function revokeLocalUrl(url: string) {
  URL.revokeObjectURL(url);
}