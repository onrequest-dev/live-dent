// components/XRayImageManager.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  getPatientImages,
  addXRayImage,
  deleteXRayImage,
  revokeLocalUrl,
  PatientImage,
} from "@/lib/xrayStorage";

interface XRayImageManagerProps {
  patientId: string;
  patientName?: string;
}

export default function XRayImageManager({
  patientId,
  patientName,
}: XRayImageManagerProps) {
  const [images, setImages] = useState<PatientImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageTitle, setImageTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // تحميل الصور
  const loadImages = useCallback(async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);
    try {
      const imgs = await getPatientImages(patientId);
      setImages(imgs);
    } catch (err) {
      console.error("Error loading images:", err);
      setError(err instanceof Error ? err.message : "فشل تحميل الصور");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  // تحميل الصور عند تغيير patientId
  useEffect(() => {
    loadImages();

    // تنظيف الروابط عند فك المكون
    return () => {
      images.forEach((img) => revokeLocalUrl(img.localUrl));
      if (previewUrl) revokeLocalUrl(previewUrl);
    };
  }, [loadImages, patientId]);

  // معاينة الملف المختار
  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => {
        if (url) revokeLocalUrl(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  // رفع صورة جديدة
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("الرجاء اختيار ملف أولاً");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const newImage = await addXRayImage({
        patientId,
        file: selectedFile,
        title:
          imageTitle.trim() || `صورة ${new Date().toLocaleDateString("ar-EG")}`,
      });

      // إضافة الصورة الجديدة إلى القائمة
      setImages((prev) => [newImage, ...prev]);

      // إعادة تعيين النموذج
      setSelectedFile(null);
      setImageTitle("");
      setPreviewUrl(null);

      // إعادة تحميل الصور للتأكد من التزامن مع الخادم
      await loadImages();
    } catch (err) {
      console.error("Error uploading:", err);
      setError(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  // حذف صورة
  const handleDelete = async (imageId: string, imageTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${imageTitle}"؟`)) return;

    try {
      await deleteXRayImage(imageId, patientId);
      // إزالة الصورة من القائمة المحلية
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Error deleting:", err);
      setError(err instanceof Error ? err.message : "فشل حذف الصورة");
    }
  };

  // عرض الصورة في نافذة منبثقة
  const viewFullImage = (image: PatientImage) => {
    const win = window.open();
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>${image.title}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; }
              img { max-width: 90vw; max-height: 90vh; object-fit: contain; }
              .info { position: fixed; bottom: 20px; left: 20px; color: white; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; font-family: sans-serif; }
            </style>
          </head>
          <body>
            <img src="${image.localUrl}" alt="${image.title}" />
            <div class="info">
              <strong>${image.title}</strong><br>
              التاريخ: ${new Date(image.created_at).toLocaleDateString("ar-EG")}
            </div>
          </body>
        </html>
      `);
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md"
      dir="rtl"
    >
      {/* Header */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          إدارة صور الأشعة
          {patientName && (
            <span className="text-blue-600 mr-2">لـ {patientName}</span>
          )}
        </h2>
        <p className="text-gray-600 text-sm mt-1">معرف المريض: {patientId}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>خطأ:</strong> {error}
          <button
            onClick={() => setError(null)}
            className="float-left text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Form */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          رفع صورة جديدة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اختيار ملف *
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept="image/*,application/pdf"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              يدعم الصور (JPG, PNG, GIF) وملفات PDF
            </p>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان الصورة (اختياري)
            </label>
            <input
              type="text"
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
              placeholder="مثال: صورة الأشعة الأولى"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">معاينة:</p>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-48 object-contain border rounded-md"
            />
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`mt-4 px-4 py-2 rounded-md text-white font-medium transition-colors
            ${
              !selectedFile || uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              جاري الرفع...
            </span>
          ) : (
            "رفع الصورة"
          )}
        </button>
      </div>

      {/* Images Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            الصور المحفوظة ({images.length})
          </h3>
          <button
            onClick={loadImages}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {loading ? "جاري التحميل..." : "تحديث"}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="mt-2 text-gray-600">جاري تحميل الصور...</p>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-gray-500">لا توجد صور حالياً</p>
            <p className="text-sm text-gray-400">
              قم برفع أول صورة باستخدام النموذج أعلاه
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image Thumbnail */}
                <div
                  className="relative bg-gray-100 cursor-pointer"
                  style={{ height: "200px" }}
                  onClick={() => viewFullImage(image)}
                >
                  <img
                    src={image.localUrl}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Image Info */}
                <div className="p-3">
                  <h4
                    className="font-medium text-gray-800 truncate"
                    title={image.title}
                  >
                    {image.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(image.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => viewFullImage(image)}
                      className="flex-1 px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100 transition-colors"
                    >
                      عرض
                    </button>
                    <button
                      onClick={() => handleDelete(image.id, image.title)}
                      className="flex-1 px-2 py-1 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
