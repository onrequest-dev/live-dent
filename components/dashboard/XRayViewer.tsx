// components/dashboard/XRayViewer.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Trash2,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Maximize2,
  Minimize2,
  Camera,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  addXRayImage,
  getPatientImages,
  deleteXRayImage,
  revokeLocalUrl,
  type PatientImage,
} from "@/lib/xrayStorage";
import { useModalBackHandler } from "@/hooks/useModalBackHandler";

interface XRayViewerProps {
  patientId: string;
  patientName: string;
  primaryColor: string;
  isMobile?: boolean;
}

// ============================================================
// Skeleton Loader Component (مع SVG متحرك)
// ============================================================
function ViewerSkeleton() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-5">
      {/* SVG متحرك لملف وهمي */}
      <div className="w-24 h-24">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* ظل الملف */}
          <rect
            x="25"
            y="28"
            width="50"
            height="60"
            rx="6"
            className="fill-gray-300 animate-pulse"
          />

          {/* الملف الرئيسي */}
          <rect
            x="20"
            y="20"
            width="50"
            height="60"
            rx="6"
            className="fill-gray-200"
            stroke="#D1D5DB"
            strokeWidth="1.5"
          />

          {/* طية الملف */}
          <path
            d="M55 20 L55 35 Q55 40 60 40 L70 40"
            className="fill-gray-300"
            stroke="#D1D5DB"
            strokeWidth="1.5"
          />
          <path
            d="M55 20 L55 35 Q55 40 60 40 L70 40 L70 35 L55 20Z"
            className="fill-gray-300"
          />

          {/* أسطر النص الوهمية */}
          <rect
            x="28"
            y="46"
            width="24"
            height="3"
            rx="1.5"
            className="fill-gray-300 animate-pulse"
          />
          <rect
            x="28"
            y="52"
            width="32"
            height="3"
            rx="1.5"
            className="fill-gray-300 animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <rect
            x="28"
            y="58"
            width="20"
            height="3"
            rx="1.5"
            className="fill-gray-300 animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
          <rect
            x="28"
            y="64"
            width="28"
            height="3"
            rx="1.5"
            className="fill-gray-300 animate-pulse"
            style={{ animationDelay: "0.6s" }}
          />

          {/* أيقونة الصورة في المنتصف */}
          <rect
            x="35"
            y="46"
            width="16"
            height="14"
            rx="2"
            className="fill-gray-300 animate-pulse"
            style={{ animationDelay: "0.3s" }}
          />
          <circle
            cx="40"
            cy="50"
            r="2.5"
            className="fill-gray-400 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <path
            d="M35 57 L40 53 L45 57"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            className="animate-pulse"
            style={{ animationDelay: "0.7s" }}
          />
        </svg>
      </div>

      {/* نص التحميل */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-600 text-sm font-semibold">
          جاري تحميل الملفات
        </p>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
          <span
            className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Upload Skeleton (مع SVG رفع)
// ============================================================
function UploadSkeleton() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-5">
      {/* SVG متحرك للرفع */}
      <div className="w-24 h-24 relative">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* دائرة خارجية دوارة */}
          <circle
            cx="50"
            cy="50"
            r="42"
            className="stroke-gray-200"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            className="stroke-blue-500"
            strokeWidth="3"
            fill="none"
            strokeDasharray="264"
            strokeDashoffset="80"
            strokeLinecap="round"
            style={{
              animation: "spin 1.5s linear infinite",
              transformOrigin: "center",
            }}
          />

          {/* أيقونة الملف في المنتصف */}
          <rect
            x="32"
            y="30"
            width="36"
            height="40"
            rx="4"
            className="fill-gray-200"
            stroke="#D1D5DB"
            strokeWidth="1.5"
          />

          {/* طية الملف */}
          <path
            d="M56 30 L56 40 Q56 43 59 43 L68 43"
            className="fill-gray-300"
            stroke="#D1D5DB"
            strokeWidth="1.5"
          />

          {/* سهم للأعلى */}
          <path
            d="M50 55 L50 70"
            className="stroke-blue-500"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <animate
              attributeName="d"
              values="M50 55 L50 70;M50 52 L50 67;M50 55 L50 70"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M44 60 L50 54 L56 60"
            className="stroke-blue-500"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <animate
              attributeName="d"
              values="M44 60 L50 54 L56 60;M44 57 L50 51 L56 57;M44 60 L50 54 L56 60"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>

      {/* نص الرفع */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-600 text-sm font-semibold">جاري رفع الملف</p>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
          <span
            className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// ✅ عارض PDF باستخدام تحويل الصفحات إلى صور
// ============================================================

interface PDFImageViewerProps {
  url: string;
  title?: string;
  onPrev: () => void;
  onNext: () => void;
  hasMultiple: boolean;
  isMobile: boolean;
}

function PDFImageViewer({
  url,
  title,
  onPrev,
  onNext,
  hasMultiple,
  isMobile,
}: PDFImageViewerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentUrlRef = useRef<string>("");
  const transformRef = useRef<any>(null);

  // ---------- IndexedDB Cache ----------
  const DB_NAME = "PDFCache";
  const STORE_NAME = "pdfImages";
  const DB_VERSION = 1;
  const dbRef = useRef<IDBDatabase | null>(null);

  const openDB = useCallback(async (): Promise<IDBDatabase> => {
    if (dbRef.current?.name === DB_NAME) return dbRef.current;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        dbRef.current = request.result;
        resolve(dbRef.current);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }, []);

  const getCachedImages = useCallback(
    async (pdfUrl: string): Promise<string[] | null> => {
      try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const request = store.get(pdfUrl);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
      } catch (err) {
        console.error("Failed to read cache:", err);
        return null;
      }
    },
    [openDB],
  );

  const saveToCache = useCallback(
    async (pdfUrl: string, imgData: string[]) => {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(imgData, pdfUrl);
      } catch (err) {
        console.error("Failed to save cache:", err);
      }
    },
    [openDB],
  );

  // Load pdf.js
  useEffect(() => {
    if ((window as any).pdfjsLib) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js";
    script.async = true;
    script.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
      setScriptLoaded(true);
    };
    script.onerror = () => setError(true);
    document.head.appendChild(script);
  }, []);

  // Reset state when URL changes
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setImages([]);
    setNumPages(0);
    setCurrentPage(0);
    setIsLoading(true);
    setError(false);
    currentUrlRef.current = url;
  }, [url]);

  // Convert PDF to images
  useEffect(() => {
    if (!scriptLoaded || !url) return;

    const loadOrConvert = async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const currentUrl = url;

      try {
        const cached = await getCachedImages(currentUrl);

        if (controller.signal.aborted || currentUrlRef.current !== currentUrl)
          return;

        if (cached?.length) {
          if (currentUrlRef.current === currentUrl) {
            setImages(cached);
            setNumPages(cached.length);
            setCurrentPage(0);
            setIsLoading(false);
          }
          return;
        }

        const pdfjsLib = (window as any).pdfjsLib;
        const loadingTask = pdfjsLib.getDocument({ url: currentUrl });
        const pdf = await loadingTask.promise;

        if (controller.signal.aborted || currentUrlRef.current !== currentUrl)
          return;

        setNumPages(pdf.numPages);

        const imageUrls: string[] = [];
        const scaleQuality = 2.5;

        for (let i = 1; i <= pdf.numPages; i++) {
          if (controller.signal.aborted || currentUrlRef.current !== currentUrl)
            return;

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: scaleQuality });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d")!;

          await page.render({ canvasContext: context, viewport }).promise;
          imageUrls.push(canvas.toDataURL("image/jpeg", 0.95));
          canvas.remove();
        }

        if (controller.signal.aborted || currentUrlRef.current !== currentUrl)
          return;

        await saveToCache(currentUrl, imageUrls);

        if (currentUrlRef.current === currentUrl) {
          setImages(imageUrls);
          setCurrentPage(0);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (err?.name === "AbortError" || err?.message?.includes("abort"))
          return;
        console.error("Error converting PDF:", err);
        if (currentUrlRef.current === currentUrl) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    loadOrConvert();
    return () => abortControllerRef.current?.abort();
  }, [scriptLoaded, url, getCachedImages, saveToCache]);

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      transformRef.current?.resetTransform();
    } else if (hasMultiple) {
      onPrev();
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages - 1) {
      setCurrentPage(currentPage + 1);
      transformRef.current?.resetTransform();
    } else if (hasMultiple) {
      onNext();
    }
  };

  if (error || (!isLoading && images.length === 0)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gray-100">
        <FileText size={32} className="text-red-400 mb-2" />
        <p className="text-gray-600 text-sm">تعذر عرض PDF</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-blue-500 underline text-sm"
        >
          فتح في نافذة جديدة
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden bg-gray-100 relative select-none">
      {isLoading && <ViewerSkeleton />}

      {!isLoading && images[currentPage] && (
        <TransformWrapper
          ref={transformRef}
          initialScale={1}
          minScale={0.5}
          maxScale={5}
          centerOnInit
          wheel={{ step: 0.008 }}
          panning={{
            disabled: false,
            velocityDisabled: false,
          }}
          doubleClick={{ mode: "reset" }}
          pinch={{ step: 5 }}
        >
          {({ zoomIn, zoomOut, resetTransform, centerView }) => (
            <>
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ width: "100%", height: "100%" }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={images[currentPage]}
                    alt={`${title || "PDF"} - صفحة ${currentPage + 1}`}
                    className="max-w-full max-h-full pointer-events-none"
                    draggable={false}
                    style={{
                      boxShadow: "0 10px 40px -12px rgba(0,0,0,0.3)",
                    }}
                  />
                </div>
              </TransformComponent>

              {/* Page indicator */}
              {numPages > 1 && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 z-10">
                  <span className="text-white text-xs font-medium">
                    {currentPage + 1} / {numPages}
                  </span>
                </div>
              )}

              {/* Navigation buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevPage();
                }}
                disabled={currentPage === 0 && !hasMultiple}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform z-20 disabled:opacity-30 hover:bg-black/40"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextPage();
                }}
                disabled={currentPage === numPages - 1 && !hasMultiple}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform z-20 disabled:opacity-30 hover:bg-black/40"
              >
                <ChevronRight size={22} />
              </button>

              {/* Zoom controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 z-20">
                <button
                  onClick={() => zoomOut()}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-white/30"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={() => zoomIn()}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-white/30"
                >
                  <ZoomIn size={16} />
                </button>
                <div className="w-px h-5 bg-white/20" />
                <button
                  onClick={() => resetTransform()}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-white/30"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* Hint text */}
              {!isMobile && (
                <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 z-10 pointer-events-none hidden sm:block">
                  <p className="text-white/80 text-[10px]">
                    🖱️ سكرول للزوم • اسحب للتنقل • نقر مزدوج للتصغير
                  </p>
                </div>
              )}
            </>
          )}
        </TransformWrapper>
      )}
    </div>
  );
}

// ============================================================
// عارض الصور المحسن باستخدام react-zoom-pan-pinch
// ============================================================
function ImageViewer({
  src,
  alt,
  onPrev,
  onNext,
  hasMultiple,
  isMobile,
}: {
  src: string;
  alt: string;
  onPrev: () => void;
  onNext: () => void;
  hasMultiple: boolean;
  isMobile: boolean;
}) {
  const transformRef = useRef<any>(null);

  return (
    <div className="w-full h-full overflow-hidden bg-gray-100 relative select-none">
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.5}
        maxScale={5}
        centerOnInit
        wheel={{ step: 0.0008 }}
        panning={{
          disabled: false,
          velocityDisabled: false,
        }}
        doubleClick={{ mode: "reset" }}
        pinch={{ step: 5 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={src}
                  alt={alt}
                  className="max-w-full max-h-full pointer-events-none"
                  draggable={false}
                  style={{
                    boxShadow: "0 10px 40px -12px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
            </TransformComponent>

            {/* Navigation buttons */}
            {hasMultiple && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform z-20 hover:bg-black/40"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white active:scale-90 transition-transform z-20 hover:bg-black/40"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* Zoom controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 z-20">
              <button
                onClick={() => zoomOut()}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-white/30"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => zoomIn()}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-white/30"
              >
                <ZoomIn size={16} />
              </button>
              <div className="w-px h-5 bg-white/20" />
              <button
                onClick={() => resetTransform()}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform hover:bg-white/30"
              >
                <Maximize2 size={16} />
              </button>
            </div>

            {/* Hint text */}
            {!isMobile && (
              <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 z-10 pointer-events-none hidden sm:block">
                <p className="text-white/80 text-[10px]">
                  🖱️ سكرول للزوم • اسحب للتنقل • نقر مزدوج للتصغير
                </p>
              </div>
            )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
}

// ============================================================
// مكون المودال الداخلي (يُركب فقط عند الفتح)
// ============================================================
function XRayModal({
  isOpen,
  onClose,
  patientName,
  primaryColor,
  isMobile,
  images,
  isLoading,
  isUploading,
  selectedImageIndex,
  selectedImage,
  error,
  isDeleting,
  navigateImage,
  handleUpload,
  handleDelete,
  setDeleteConfirmId,
  setIsFullscreen,
  isFullscreen,
  fileInputRef,
  setError,
}: any) {
  // ✅ سيتم استدعاء الهوك عند فتح المودال فقط
  useModalBackHandler(onClose);

  if (!isOpen) return null;

  const isPDF = (image: any): boolean => {
    if (!image?.localUrl) return false;
    const url = image.localUrl.toLowerCase();
    const title = (image.title || "").toLowerCase();
    return (
      url.endsWith(".pdf") || title.endsWith(".pdf") || url.includes(".pdf")
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`bg-white shadow-2xl w-full h-full flex flex-col overflow-hidden ${
          isFullscreen || isMobile
            ? "fixed inset-0 rounded-none"
            : "rounded-2xl max-w-[95vw] max-h-[95vh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-3 sm:px-6 py-2.5 sm:py-4 flex-shrink-0 flex items-center justify-between"
          style={{ background: primaryColor }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Camera size={20} className="text-white flex-shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                {selectedImage?.title || "صور الأشعة والملفات"}
              </h2>
              <p className="text-white/70 text-[10px] sm:text-xs">
                {patientName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {!isMobile && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              >
                {isFullscreen ? (
                  <Minimize2 size={14} />
                ) : (
                  <Maximize2 size={14} />
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar - RTL Layout */}
        <div className="px-2 sm:px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Delete button - Far Right */}
            {selectedImage && (
              <button
                onClick={() => setDeleteConfirmId(selectedImage.id)}
                disabled={isDeleting}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs sm:text-sm disabled:opacity-50 active:scale-95 transition-all"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span className="hidden sm:inline">حذف</span>
              </button>
            )}

            {/* Upload button - Next to Delete */}
            <label
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm cursor-pointer transition-all active:scale-95 ${
                isUploading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90"
              }`}
              style={{ background: primaryColor, color: "white" }}
            >
              {isUploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              <span className="hidden sm:inline">
                {isUploading ? "جاري الرفع..." : "رفع ملف"}
              </span>
              <span className="sm:hidden">{isUploading ? "..." : "رفع"}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {/* File counter - to the left of buttons */}
            {images.length > 0 && (
              <span className="text-xs sm:text-sm text-gray-500">
                {selectedImageIndex !== null
                  ? `${selectedImageIndex + 1} / ${images.length}`
                  : images.length}
              </span>
            )}

            {/* Spacer pushes everything to the right */}
            <div className="flex-1" />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-3 sm:mx-4 mt-2 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 flex-shrink-0">
            <AlertCircle
              size={16}
              className="text-red-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-red-700 text-xs sm:text-sm flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main viewer area */}
        <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
          <div className="flex-1 min-h-0 relative bg-gray-100">
            {isLoading ? (
              <ViewerSkeleton />
            ) : isUploading ? (
              <UploadSkeleton />
            ) : images.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3 border-2 border-dashed border-gray-300">
                  <Camera size={28} className="text-gray-400" />
                </div>
                <h3 className="text-gray-600 font-medium mb-1">
                  لا توجد ملفات
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  قم برفع صور الأشعة أو ملفات PDF للمريض
                </p>
              </div>
            ) : selectedImage ? (
              isPDF(selectedImage) ? (
                <PDFImageViewer
                  key={selectedImage.id}
                  url={selectedImage.localUrl}
                  title={selectedImage.title}
                  onPrev={() => navigateImage("prev")}
                  onNext={() => navigateImage("next")}
                  hasMultiple={images.length > 1}
                  isMobile={isMobile}
                />
              ) : (
                <ImageViewer
                  src={selectedImage.localUrl}
                  alt={selectedImage.title || ""}
                  onPrev={() => navigateImage("prev")}
                  onNext={() => navigateImage("next")}
                  hasMultiple={images.length > 1}
                  isMobile={isMobile}
                />
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                الرجاء اختيار ملف
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div
              className={`flex gap-1.5 bg-white border-gray-200 flex-shrink-0 ${
                isMobile
                  ? "flex-row h-16 overflow-x-auto border-t p-1.5"
                  : "flex-col w-20 overflow-y-auto border-l p-2"
              }`}
            >
              {images.map((img: any, index: number) => (
                <button
                  key={img.id}
                  onClick={() => navigateImage(index)}
                  className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all active:scale-95 relative ${
                    isMobile ? "w-12 h-12" : "w-full h-14"
                  } ${
                    selectedImageIndex === index
                      ? "border-blue-500 ring-2 ring-blue-500"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  {isPDF(img) ? (
                    <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center gap-0.5">
                      <FileText size={16} className="text-blue-500" />
                      <span className="text-[8px] text-blue-600 font-medium">
                        PDF
                      </span>
                    </div>
                  ) : (
                    <img
                      src={img.localUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `
                            <div class="w-full h-full bg-gray-100 flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21,15 16,10 5,21"/>
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  )}
                  <div className="absolute top-0 right-0 bg-black/60 text-white text-[8px] px-1 rounded-bl font-medium">
                    {index + 1}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// المكون الرئيسي XRayViewerButton
// ============================================================
export function XRayViewerButton({
  patientId,
  patientName,
  primaryColor,
  isMobile = false,
}: XRayViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<PatientImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) loadImages();
  }, [isOpen, patientId]);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.localUrl?.startsWith("blob:")) revokeLocalUrl(img.localUrl);
      });
    };
  }, [images]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const loadImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const patientImages = await getPatientImages(patientId);
      setImages(patientImages);
      if (patientImages.length > 0) setSelectedImageIndex(0);
    } catch (err: any) {
      setError(err.message || "فشل تحميل الصور");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError("حجم الملف كبير جداً. الحد الأقصى هو 50 ميجابايت");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const result = await addXRayImage({ patientId, file, title: file.name });
      setImages((prev) => {
        const updated = [...prev, result];
        setSelectedImageIndex(updated.length - 1);
        return updated;
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "فشل رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteXRayImage(imageId, patientId);
      setImages((prev) => {
        const newImages = prev.filter((img) => img.id !== imageId);
        if (
          selectedImageIndex !== null &&
          selectedImageIndex >= newImages.length
        ) {
          setSelectedImageIndex(
            newImages.length > 0 ? newImages.length - 1 : null,
          );
        }
        return newImages;
      });
      setDeleteConfirmId(null);
    } catch (err: any) {
      setError(err.message || "فشل حذف الملف");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFullscreen(false);
    setSelectedImageIndex(null);
    setDeleteConfirmId(null);
    setError(null);
  };

  const navigateImage = (direction: "prev" | "next" | number) => {
    if (typeof direction === "number") {
      setSelectedImageIndex(direction);
      return;
    }

    if (selectedImageIndex === null || images.length === 0) return;

    if (direction === "prev") {
      setSelectedImageIndex((prev) =>
        prev !== null ? (prev > 0 ? prev - 1 : images.length - 1) : 0,
      );
    } else {
      setSelectedImageIndex((prev) =>
        prev !== null ? (prev < images.length - 1 ? prev + 1 : 0) : 0,
      );
    }
  };

  const selectedImage =
    selectedImageIndex !== null ? images[selectedImageIndex] : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-white font-medium text-xs sm:text-sm transition-all hover:shadow-md active:scale-95"
        style={{ background: primaryColor }}
      >
        <Camera size={18} />
        <span className="hidden sm:inline">صور الأشعة</span>
        <span className="sm:hidden">أشعة</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <XRayModal
            isOpen={isOpen}
            onClose={handleClose}
            patientName={patientName}
            primaryColor={primaryColor}
            isMobile={isMobile}
            images={images}
            isLoading={isLoading}
            isUploading={isUploading}
            selectedImageIndex={selectedImageIndex}
            selectedImage={selectedImage}
            error={error}
            isDeleting={isDeleting}
            navigateImage={navigateImage}
            handleUpload={handleUpload}
            handleDelete={handleDelete}
            setDeleteConfirmId={setDeleteConfirmId}
            setIsFullscreen={setIsFullscreen}
            isFullscreen={isFullscreen}
            fileInputRef={fileInputRef}
            setError={setError}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 bg-red-500">
                <div className="flex items-center gap-3">
                  <Trash2 size={20} className="text-white" />
                  <h3 className="text-lg font-bold text-white">تأكيد الحذف</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 text-sm mb-6">
                  هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium text-sm disabled:opacity-50 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmId)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-1.5 disabled:opacity-70 transition-colors"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        جاري الحذف...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        نعم، احذف
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
