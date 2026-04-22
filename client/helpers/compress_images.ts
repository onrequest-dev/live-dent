// lib/imageCompressor.ts
import imageCompression from 'browser-image-compression';

interface CompressOptions {
  maxSizeMB?: number;      // الحجم النهائي بالميجابايت
  maxWidthOrHeight?: number; // أقصى عرض أو ارتفاع
  useWebWorker?: boolean;   // استخدام WebWorker (أسرع)
  preserveExif?: boolean;   // الحفاظ على بيانات الصورة
}

export const compressImageAdvanced = async (
  file: File,
  options: CompressOptions = {}
): Promise<File> => {
  const {
    maxSizeMB = 0.5,        // 500KB كحد أقصى
    maxWidthOrHeight = 1200,
    useWebWorker = true,
    preserveExif = false,
  } = options;

  try {
    // خيارات الضغط المثالية
    const compressOptions = {
      maxSizeMB: maxSizeMB,
      maxWidthOrHeight: maxWidthOrHeight,
      useWebWorker: useWebWorker,
      preserveExif: preserveExif,
      // جودة تلقائية (تتغير حسب الحاجة)
      initialQuality: 0.8,
      // منع الضغط الزائد للصور الصغيرة
      alwaysKeepResolution: false,
    };

    console.log(`🔄 Compressing: ${(file.size / 1024).toFixed(1)}KB`);
    
    // ضغط الصورة
    const compressedFile = await imageCompression(file, compressOptions);
    
    const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    console.log(`✅ Result: ${(compressedFile.size / 1024).toFixed(1)}KB (${reduction}% reduction)`);
    
    return compressedFile;
    
  } catch (error) {
    console.error('Compression error:', error);
    throw error;
  }
};

// دالة مخصصة للشعارات
export const compressLogo = async (file: File): Promise<File> => {
  return compressImageAdvanced(file, {
    maxSizeMB: 0.2,    // 200KB
    maxWidthOrHeight: 500,
  });
};

// دالة مخصصة لصور المنيو
export const compressPfpImage = async (file: File): Promise<File> => {
  return compressImageAdvanced(file, {
    maxSizeMB: 0.3,    // 300KB
    maxWidthOrHeight: 800,
  });
};