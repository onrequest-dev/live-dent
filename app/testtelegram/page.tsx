// "use client";
// import { telegramClient } from "@/lib/telegram-media";
// import { useState, useRef } from "react";

// // تحديد أنواع الملفات المسموحة
// type FileType = "image" | "pdf";

// const TelegramMediaTester: React.FC = () => {
//   const [botToken, setBotToken] = useState("");
//   const [chatId, setChatId] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [fileType, setFileType] = useState<FileType>("image");
//   const [filePreview, setFilePreview] = useState<string | null>(null);
//   const [caption, setCaption] = useState("");
//   const [fileId, setFileId] = useState("");
//   const [retrievedFileUrl, setRetrievedFileUrl] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [logs, setLogs] = useState<string[]>([]);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const addLog = (message: string, isError: boolean = false) => {
//     const timestamp = new Date().toLocaleTimeString();
//     setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
//     if (isError) {
//       setError(message);
//       setTimeout(() => setError(null), 5000);
//     } else {
//       setSuccess(message);
//       setTimeout(() => setSuccess(null), 3000);
//     }
//   };

//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       // التحقق من نوع الملف
//       const isImage = file.type.startsWith("image/");
//       const isPdf = file.type === "application/pdf";

//       if (!isImage && !isPdf) {
//         addLog("❌ الرجاء اختيار صورة أو ملف PDF فقط", true);
//         return;
//       }

//       // التحقق من الحجم (حد أقصى 20 ميجابايت)
//       if (file.size > 20 * 1024 * 1024) {
//         addLog("❌ حجم الملف يجب أن لا يتجاوز 20 ميجابايت", true);
//         return;
//       }

//       setSelectedFile(file);
//       setFileType(isImage ? "image" : "pdf");

//       // معاينة الملف
//       if (isImage) {
//         const reader = new FileReader();
//         reader.onloadend = () => setFilePreview(reader.result as string);
//         reader.readAsDataURL(file);
//       } else {
//         // للـ PDF نعرض أيقونة واسم الملف
//         setFilePreview(null);
//         addLog(`✅ تم اختيار PDF: ${file.name}`);
//       }

//       addLog(
//         `✅ تم اختيار: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
//       );
//     }
//   };

//   const handleUpload = async () => {
//     if (!botToken || !chatId) {
//       addLog("❌ الرجاء إدخال Bot Token و Chat ID", true);
//       return;
//     }
//     if (!selectedFile) {
//       addLog("❌ الرجاء اختيار ملف", true);
//       return;
//     }

//     setLoading(true);
//     try {
//       addLog("🚀 جاري تهيئة المدير...");
//       const manager = telegramClient;

//       addLog("📦 تحويل الملف إلى Buffer...");
//       const arrayBuffer = await selectedFile.arrayBuffer();
//       const fileBuffer = Buffer.from(arrayBuffer);

//       addLog(
//         `☁️ جاري رفع ${fileType === "image" ? "الصورة" : "PDF"} إلى تليجرام...`,
//       );

//       let newFileId: string;
//       if (fileType === "image") {
//         newFileId = await manager.addImage(fileBuffer, caption);
//       } else {
//         newFileId = await manager.addDocument(
//           fileBuffer,
//           caption,
//           selectedFile.name,
//         );
//       }

//       setFileId(newFileId);
//       addLog(`✅ تم الرفع! File ID: ${newFileId}`);

//       // استرجاع الملف تلقائياً
//       addLog("🔄 جاري استرجاع الملف...");
//       const fileUrl = await manager.getFileUrl(newFileId);
//       setRetrievedFileUrl(fileUrl);
//       addLog(`✅ تم الاسترجاع! الرابط: ${fileUrl.substring(0, 50)}...`);
//     } catch (err) {
//       addLog(
//         `❌ خطأ: ${err instanceof Error ? err.message : "خطأ غير معروف"}`,
//         true,
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRetrieve = async () => {
//     if (!botToken || !chatId) {
//       addLog("❌ الرجاء إدخال Bot Token و Chat ID", true);
//       return;
//     }
//     if (!fileId) {
//       addLog("❌ لا يوجد File ID للاسترجاع", true);
//       return;
//     }

//     setLoading(true);
//     try {
//       addLog("🚀 جاري تهيئة المدير...");
//       const manager = telegramClient;

//       addLog("🔍 جاري استرجاع رابط الملف...");
//       const fileUrl = await manager.getFileUrl(fileId);
//       setRetrievedFileUrl(fileUrl);
//       addLog(`✅ تم استرجاع الرابط: ${fileUrl.substring(0, 50)}...`);

//       addLog("💾 جاري استرجاع الملف كـ Buffer...");
//       const fileBuffer = await manager.getFileBuffer(fileId);
//       addLog(
//         `✅ تم استرجاع Buffer بحجم: ${(fileBuffer.length / 1024).toFixed(2)} KB`,
//       );
//     } catch (err) {
//       addLog(
//         `❌ خطأ في الاسترجاع: ${err instanceof Error ? err.message : "خطأ غير معروف"}`,
//         true,
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setSelectedFile(null);
//     setFilePreview(null);
//     setCaption("");
//     setFileId("");
//     setRetrievedFileUrl(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//     addLog("🔄 تم إعادة تعيين النموذج");
//   };

//   return (
//     <div
//       className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8"
//       dir="rtl"
//     >
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
//             <span className="text-4xl">📸📄</span>
//           </div>
//           <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
//             اختبار رفع واسترجاع الملفات
//           </h1>
//           <p className="text-gray-600">
//             دعم الصور و PDF - Telegram Media Manager
//           </p>
//         </div>

//         {/* Configuration Card */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
//           <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//             <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
//               1
//             </span>
//             إعدادات البوت
//           </h2>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Bot Token
//               </label>
//               <input
//                 type="password"
//                 value={botToken}
//                 onChange={(e) => setBotToken(e.target.value)}
//                 placeholder="أدخل توكن البوت"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 dir="ltr"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Chat ID
//               </label>
//               <input
//                 type="text"
//                 value={chatId}
//                 onChange={(e) => setChatId(e.target.value)}
//                 placeholder="أدخل معرف الدردشة"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                 dir="ltr"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Upload Card */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
//           <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//             <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">
//               2
//             </span>
//             رفع ملف جديد
//           </h2>

//           <div className="grid md:grid-cols-2 gap-6">
//             <div>
//               <div
//                 onClick={() => fileInputRef.current?.click()}
//                 className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
//               >
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*,application/pdf"
//                   onChange={handleFileSelect}
//                   className="hidden"
//                 />
//                 <svg
//                   className="w-12 h-12 text-gray-400 mx-auto mb-3"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                   />
//                 </svg>
//                 <p className="text-gray-600">انقر لاختيار صورة أو PDF</p>
//                 <p className="text-xs text-gray-400 mt-1">
//                   JPG, PNG, GIF, PDF - حتى 20MB
//                 </p>
//               </div>

//               {filePreview && fileType === "image" && (
//                 <img
//                   src={filePreview}
//                   alt="معاينة"
//                   className="mt-4 w-full h-40 object-cover rounded-xl shadow"
//                 />
//               )}

//               {selectedFile && fileType === "pdf" && (
//                 <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 text-center">
//                   <span className="text-3xl">📄</span>
//                   <p className="text-sm font-medium text-red-700 mt-1">
//                     {selectedFile.name}
//                   </p>
//                   <p className="text-xs text-red-500">
//                     {(selectedFile.size / 1024).toFixed(2)} KB
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 تعليق (اختياري)
//               </label>
//               <textarea
//                 value={caption}
//                 onChange={(e) => setCaption(e.target.value)}
//                 rows={3}
//                 placeholder="أضف تعليقاً للملف..."
//                 className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />

//               <div className="flex gap-3 mt-4">
//                 <button
//                   onClick={handleUpload}
//                   disabled={loading || !selectedFile}
//                   className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50 font-semibold shadow-lg"
//                 >
//                   {loading ? "⏳ جاري الرفع..." : "📤 رفع الملف"}
//                 </button>
//                 <button
//                   onClick={resetForm}
//                   className="px-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition"
//                 >
//                   🔄 reset
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Results Card */}
//         {(fileId || retrievedFileUrl) && (
//           <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-green-200">
//             <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
//               <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">
//                 ✓
//               </span>
//               النتائج
//             </h2>

//             {fileId && (
//               <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
//                 <p className="text-sm font-medium text-blue-700 mb-1">
//                   File ID:
//                 </p>
//                 <code className="text-xs break-all text-blue-600">
//                   {fileId}
//                 </code>
//               </div>
//             )}

//             {retrievedFileUrl && (
//               <div>
//                 <div className="mb-3 p-3 bg-green-50 rounded-xl border border-green-200">
//                   <p className="text-sm font-medium text-green-700 mb-1">
//                     رابط الملف:
//                   </p>
//                   <code className="text-xs break-all text-green-600">
//                     {retrievedFileUrl}
//                   </code>
//                 </div>

//                 {fileType === "image" ? (
//                   <img
//                     src={retrievedFileUrl}
//                     alt="مسترجعة"
//                     className="w-full rounded-xl shadow-lg"
//                   />
//                 ) : (
//                   <a
//                     href={retrievedFileUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
//                   >
//                     <span>📄</span>
//                     فتح PDF
//                   </a>
//                 )}
//               </div>
//             )}

//             <button
//               onClick={handleRetrieve}
//               disabled={loading || !fileId}
//               className="mt-4 w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 rounded-xl hover:from-purple-600 hover:to-purple-700 transition disabled:opacity-50 font-semibold shadow-lg"
//             >
//               🔄 إعادة استرجاع الملف
//             </button>
//           </div>
//         )}

//         {/* Logs Card */}
//         <div className="bg-gray-900 rounded-2xl shadow-xl p-6">
//           <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
//             <span>📋 سجل العمليات</span>
//             <button
//               onClick={() => setLogs([])}
//               className="text-xs bg-gray-700 text-white px-3 py-1 rounded-lg hover:bg-gray-600 transition"
//             >
//               مسح الكل
//             </button>
//           </h2>
//           <div className="bg-gray-800 rounded-xl p-4 h-64 overflow-y-auto">
//             {logs.length === 0 ? (
//               <p className="text-gray-400 text-center">لا توجد سجلات بعد...</p>
//             ) : (
//               logs.map((log, i) => (
//                 <div
//                   key={i}
//                   className="text-sm font-mono mb-2 text-green-400 border-b border-gray-700 pb-1"
//                 >
//                   {log}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Notifications */}
//         {error && (
//           <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
//             ❌ {error}
//           </div>
//         )}
//         {success && !error && (
//           <div className="fixed bottom-4 left-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-pulse">
//             ✅ {success}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default TelegramMediaTester;



// app/test/xray/page.tsx
'use client';

import XRayImageManager from '@/components/XRayImageManager';
import { useState } from 'react';

export default function TestXRayPage() {
  const [patientId, setPatientId] = useState('test-patient-123');
  const [inputPatientId, setInputPatientId] = useState(patientId);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Patient ID Selector */}
        <div className="max-w-6xl mx-auto mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            معرف المريض للتجريب:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputPatientId}
              onChange={(e) => setInputPatientId(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="أدخل معرف المريض"
            />
            <button
              onClick={() => setPatientId(inputPatientId)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              تغيير
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ملاحظة: يمكنك تجربة مع معرفات مختلفة، سيتم حفظ الصور لكل مريض على حدة
          </p>
        </div>

        {/* XRay Manager Component */}
        <XRayImageManager 
          patientId={patientId}
          patientName={`مريض تجريبي (${patientId})`}
        />

        {/* Instructions */}
        <div className="max-w-6xl mx-auto mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">تعليمات التجريب:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ يمكنك رفع صور (JPG, PNG, GIF) أو ملفات PDF</li>
            <li>✓ الصور تُرفع إلى Telegram أولاً للحصول على file_id</li>
            <li>✓ تُخزن البيانات الوصفية في Supabase عبر API route</li>
            <li>✓ تُخزن الصور محلياً في IndexedDB لتسريع التحميل المستقبلي</li>
            <li>✓ عند حذف صورة، تُحذف من Supabase ومن التخزين المحلي</li>
            <li>✓ يمكنك تغيير معرف المريض لتجربة مرضى مختلفين</li>
            <li>⚠️ تأكد من إعداد متغيرات البيئة: <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_TELEGRAM_BOT_TOKEN</code> و <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_TELEGRAM_CHAT_ID</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}