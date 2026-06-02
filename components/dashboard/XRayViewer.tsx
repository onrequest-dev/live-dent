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
  ExternalLink,
  Maximize2,
  Minimize2,
  Camera,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  addXRayImage,
  getPatientImages,
  deleteXRayImage,
  revokeLocalUrl,
  type PatientImage,
} from "@/lib/xrayStorage";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface XRayViewerProps {
  patientId: string;
  patientName: string;
  primaryColor: string;
  isMobile?: boolean;
}

// ============================================================
// ✅ عارض PDF باستخدام object tag (أكثر توافقاً)
// ============================================================

interface PDFImageViewerProps {
  url: string;
  title?: string;
  onPrev: () => void;
  onNext: () => void;
  hasMultiple: boolean;
  isMobile: boolean;
}

// PDFImageViewer.tsx

interface PDFImageViewerProps {
  url: string;
  title?: string;
  onPrev: () => void;
  onNext: () => void;
  hasMultiple: boolean;
  isMobile: boolean;
}

// دالة مساعدة لتقريب مسافة اللمس
const getTouchDistance = (touches: React.TouchList | TouchList) => {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export default function PDFImageViewer({
  url,
  title,
  onPrev,
  onNext,
  hasMultiple = false,
  isMobile = false,
}: PDFImageViewerProps) {
  // -------- State للصور (نسختين لكل صفحة) --------
  // lowResImages: صور معاينة منخفضة الدقة (تظهر أولاً)
  // highResImages: صور عالية الدقة (تحل محل المنخفضة بعد تحميلها)
  const [lowResImages, setLowResImages] = useState<string[]>([]);
  const [highResImages, setHighResImages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [isLoadingLow, setIsLoadingLow] = useState(true); // تحميل المعاينة
  const [isUpgrading, setIsUpgrading] = useState(false); // جاري تحسين الجودة
  const [error, setError] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // عناصر التحكم (تكبير، تدوير، سحب)
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentUrlRef = useRef<string>("");

  // -------- Touch / drag references (نفس الأصلي) --------
  const lastTapRef = useRef(0);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const swipeStartRef = useRef({ x: 0, y: 0, time: 0 });

  // -------- تحميل مكتبة pdf.js --------
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

  // -------- إعادة تعيين الحالة عند تغير URL --------
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLowResImages([]);
    setHighResImages([]);
    setNumPages(0);
    setCurrentPage(0);
    setIsLoadingLow(true);
    setIsUpgrading(false);
    setError(false);
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    currentUrlRef.current = url;
  }, [url]);

  // -------- دالة تحويل صفحة معينة إلى صورة بدقة معينة (scale) وجودة --------
  const renderPageToImage = useCallback(
    async (
      pdf: any,
      pageNum: number,
      scale: number,
      quality: number = 0.92,
    ): Promise<string> => {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      const imageUrl = canvas.toDataURL("image/jpeg", quality);
      canvas.remove();
      return imageUrl;
    },
    [],
  );

  // -------- تحويل جميع الصفحات إلى low-res أولاً، ثم high-res للصفحة الحالية --------
  const loadPDF = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentUrl = url;

    try {
      const pdfjsLib = (window as any).pdfjsLib;
      const loadingTask = pdfjsLib.getDocument({ url: currentUrl });
      const pdf = await loadingTask.promise;

      if (controller.signal.aborted || currentUrlRef.current !== currentUrl)
        return;

      const totalPages = pdf.numPages;
      setNumPages(totalPages);
      setCurrentPage(0);

      // --- الخطوة 1: تحويل جميع الصفحات بجودة منخفضة (scale 0.4) ---
      const lowResPromises = [];
      for (let i = 1; i <= totalPages; i++) {
        lowResPromises.push(renderPageToImage(pdf, i, 0.4, 0.7));
      }
      const lowResArray = await Promise.all(lowResPromises);

      if (controller.signal.aborted || currentUrlRef.current !== currentUrl)
        return;
      setLowResImages(lowResArray);
      setIsLoadingLow(false);

      // --- الخطوة 2: تحويل الصفحة الحالية (الصفحة 0) إلى high-res ---
      setIsUpgrading(true);
      const highResCurrent = await renderPageToImage(pdf, 1, 1.5, 0.95);
      if (controller.signal.aborted || currentUrlRef.current !== currentUrl)
        return;

      // بناء مصفوفة highResImages: نضع الصورة العالية للصفحة 0 والباقي فارغ مؤقتاً
      const newHighRes = new Array(totalPages).fill("");
      newHighRes[0] = highResCurrent;
      setHighResImages(newHighRes);
      setIsUpgrading(false);

      // (اختياري) تحميل باقي الصفحات بجودة عالية في الخلفية إذا كان هناك أكثر من صفحة
      if (totalPages > 1) {
        // تحميل الصفحات التالية بالترتيب دون انتظار، مع تجاهل الأخطاء
        for (let i = 2; i <= totalPages; i++) {
          if (controller.signal.aborted || currentUrlRef.current !== currentUrl)
            break;
          try {
            const highImg = await renderPageToImage(pdf, i, 1.5, 0.95);
            if (
              !controller.signal.aborted &&
              currentUrlRef.current === currentUrl
            ) {
              setHighResImages((prev) => {
                const updated = [...prev];
                updated[i - 1] = highImg;
                return updated;
              });
            }
          } catch (err) {
            console.warn(`فشل تحميل high-res للصفحة ${i}`);
          }
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError" || err?.message?.includes("abort")) return;
      console.error("Error loading PDF:", err);
      if (currentUrlRef.current === currentUrl) {
        setError(true);
        setIsLoadingLow(false);
        setIsUpgrading(false);
      }
    }
  }, [url, renderPageToImage]);

  // -------- تشغيل التحميل عند توفر script ووجود url --------
  useEffect(() => {
    if (!scriptLoaded || !url) return;
    loadPDF();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [scriptLoaded, url, loadPDF]);

  // -------- التنقل بين الصفحات --------
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      resetView();
    } else if (hasMultiple && onPrev) {
      onPrev();
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages - 1) {
      setCurrentPage(currentPage + 1);
      resetView();
    } else if (hasMultiple && onNext) {
      onNext();
    }
  };

  const resetView = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  // -------- دوال معالجة اللمس والفأرة (نفس الكود الأصلي مع الاحتفاظ بالوظائف) --------
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: posStartRef.current.x + dx,
      y: posStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();
    if (e.touches.length === 2) {
      pinchStartRef.current = {
        dist: getTouchDistance(e.touches),
        scale: scale,
      };
      return;
    }
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };
      if (now - lastTapRef.current < 300) {
        if (scale > 1) resetView();
        else setScale(2.5);
      }
      lastTapRef.current = now;
      if (scale > 1) {
        setIsDragging(true);
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        posStartRef.current = { ...position };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      e.preventDefault();
      const newDist = getTouchDistance(e.touches);
      const newScale =
        (newDist / pinchStartRef.current.dist) * pinchStartRef.current.scale;
      setScale(Math.max(0.5, Math.min(5, newScale)));
      return;
    }
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPosition({
        x: posStartRef.current.x + dx,
        y: posStartRef.current.y + dy,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    pinchStartRef.current = null;
    if (scale <= 1 && hasMultiple && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - swipeStartRef.current.x;
      const dy = touch.clientY - swipeStartRef.current.y;
      const dt = Date.now() - swipeStartRef.current.time;
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) > 80 || (Math.abs(dx) > 30 && dt < 300)) {
        if (dx > 0) goToPrevPage();
        else goToNextPage();
      }
    }
  };

  // منع التمرير أثناء pinch
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const preventDefault = (e: Event) => {
      const touchEvent = e as TouchEvent;
      if (touchEvent.touches && touchEvent.touches.length > 1) {
        e.preventDefault();
      }
    };
    container.addEventListener("touchmove", preventDefault, { passive: false });
    return () => container.removeEventListener("touchmove", preventDefault);
  }, []);

  // -------- عرض الخطأ --------
  if (error || (!isLoadingLow && lowResImages.length === 0)) {
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

  // -------- تحديد الصورة التي نعرضها حالياً (أولوية: high-res إن وجدت، وإلا low-res) --------
  const currentImage =
    highResImages[currentPage] || lowResImages[currentPage] || "";
  const showUpgradingBadge =
    isUpgrading && !highResImages[currentPage] && lowResImages[currentPage];

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-gray-100 touch-none relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* تحميل المعاينة الأولية */}
      {isLoadingLow && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-20">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-500" size={36} />
            <p className="text-gray-600 text-sm">جاري تحضير المعاينة...</p>
          </div>
        </div>
      )}

      {/* عرض الصورة الحالية */}
      {!isLoadingLow && currentImage && (
        <>
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
            }}
          >
            <img
              src={currentImage}
              alt={`${title || "PDF"} - صفحة ${currentPage + 1}`}
              className="max-w-full max-h-full select-none pointer-events-none"
              draggable={false}
              style={{
                boxShadow:
                  scale > 1 ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
              }}
            />
          </div>

          {/* شارة تحسين الجودة (تظهر فقط أثناء تحميل النسخة العالية) */}
          {showUpgradingBadge && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 z-10 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-white" />
              <span className="text-white text-xs">جاري تحسين الجودة...</span>
            </div>
          )}

          {/* عداد الصفحات */}
          {numPages > 1 && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 z-10">
              <span className="text-white text-xs font-medium">
                {currentPage + 1} / {numPages}
              </span>
            </div>
          )}

          {/* أيامات التمرير للأجهزة المحمولة (كما في الأصل) */}
          {isMobile && numPages > 1 && scale <= 1 && (
            <>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
                >
                  <ChevronLeft size={20} className="text-white" />
                </motion.div>
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
                >
                  <ChevronRight size={20} className="text-white" />
                </motion.div>
              </div>
            </>
          )}

          {/* أزرار التنقل للحواسيب */}
          {!isMobile && numPages > 1 && (
            <>
              <button
                onClick={goToPrevPage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-lg flex items-center justify-center hover:bg-white transition-all text-gray-700 z-10"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={goToNextPage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-lg flex items-center justify-center hover:bg-white transition-all text-gray-700 z-10"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* شريط التحكم المحمول */}
          {isMobile && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 z-20">
              <button
                onClick={() => setScale((prev) => Math.max(prev - 0.3, 0.5))}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-white text-xs min-w-[45px] text-center font-medium">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((prev) => Math.min(prev + 0.3, 5))}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
              >
                <ZoomIn size={16} />
              </button>
              <div className="w-px h-5 bg-white/20" />
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
              >
                <RotateCw size={16} />
              </button>
              <button
                onClick={resetView}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// عارض الصور مع دعم كامل للمس
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const lastTapRef = useRef(0);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const posStartRef = useRef({ x: 0, y: 0 });
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const swipeStartRef = useRef({ x: 0, y: 0, time: 0 });

  const resetView = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  const getTouchDistance = (touches: React.TouchList | TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    posStartRef.current = { ...position };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: posStartRef.current.x + dx,
      y: posStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const now = Date.now();

    if (e.touches.length === 2) {
      pinchStartRef.current = {
        dist: getTouchDistance(e.touches),
        scale: scale,
      };
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };

      if (now - lastTapRef.current < 300) {
        if (scale > 1) {
          resetView();
        } else {
          setScale(2.5);
        }
      }
      lastTapRef.current = now;

      if (scale > 1) {
        setIsDragging(true);
        dragStartRef.current = { x: touch.clientX, y: touch.clientY };
        posStartRef.current = { ...position };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current) {
      e.preventDefault();
      const newDist = getTouchDistance(e.touches);
      const newScale =
        (newDist / pinchStartRef.current.dist) * pinchStartRef.current.scale;
      setScale(Math.max(0.5, Math.min(5, newScale)));
      return;
    }

    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPosition({
        x: posStartRef.current.x + dx,
        y: posStartRef.current.y + dy,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    pinchStartRef.current = null;

    if (scale <= 1 && hasMultiple && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - swipeStartRef.current.x;
      const dy = touch.clientY - swipeStartRef.current.y;
      const dt = Date.now() - swipeStartRef.current.time;

      if (Math.abs(dy) > Math.abs(dx)) return;

      if (Math.abs(dx) > 80 || (Math.abs(dx) > 30 && dt < 300)) {
        if (dx > 0) onPrev();
        else onNext();
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventDefault = (e: Event) => {
      const touchEvent = e as TouchEvent;
      if (touchEvent.touches && touchEvent.touches.length > 1) {
        e.preventDefault();
      }
    };

    container.addEventListener("touchmove", preventDefault, { passive: false });
    return () => container.removeEventListener("touchmove", preventDefault);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-gray-100 touch-none relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-full select-none pointer-events-none"
          draggable={false}
          style={{
            boxShadow:
              scale > 1 ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
          }}
        />
      </div>

      {/* مؤشرات التنقل للموبايل */}
      {isMobile && hasMultiple && scale <= 1 && (
        <>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
            >
              <ChevronLeft size={20} className="text-white" />
            </motion.div>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
            >
              <ChevronRight size={20} className="text-white" />
            </motion.div>
          </div>
        </>
      )}

      {/* أزرار التنقل للديسكتوب */}
      {!isMobile && hasMultiple && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-lg flex items-center justify-center hover:bg-white transition-all text-gray-700 z-10"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow-lg flex items-center justify-center hover:bg-white transition-all text-gray-700 z-10"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* شريط التحكم للصور */}
      {isMobile && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 z-20">
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.3, 0.5))}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-white text-xs min-w-[45px] text-center font-medium">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.3, 5))}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <ZoomIn size={16} />
          </button>
          <div className="w-px h-5 bg-white/20" />
          <button
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <RotateCw size={16} />
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// المكون الرئيسي
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

  const navigateImage = (direction: "prev" | "next") => {
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

  const isPDF = (image: PatientImage): boolean => {
    if (!image?.localUrl) return false;
    const url = image.localUrl.toLowerCase();
    const title = (image.title || "").toLowerCase();
    return (
      url.endsWith(".pdf") || title.endsWith(".pdf") || url.includes(".pdf")
    );
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center"
            onClick={handleClose}
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
              {/* الهيدر */}
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
                      {patientName} • {images.length} ملف
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
                    onClick={handleClose}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* شريط الأدوات */}
              <div className="px-2 sm:px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
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
                    <span className="sm:hidden">
                      {isUploading ? "..." : "رفع"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>

                  {images.length > 0 && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      {selectedImageIndex !== null
                        ? `${selectedImageIndex + 1} / ${images.length}`
                        : images.length}
                    </span>
                  )}

                  <div className="flex-1" />

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
                </div>
              </div>

              {/* رسالة الخطأ */}
              {error && (
                <div className="mx-3 sm:mx-4 mt-2 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 flex-shrink-0">
                  <AlertCircle
                    size={16}
                    className="text-red-500 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-red-700 text-xs sm:text-sm flex-1">
                    {error}
                  </p>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* منطقة العرض الرئيسية */}
              <div className="flex-1 min-h-0 flex flex-col sm:flex-row">
                <div className="flex-1 min-h-0 relative bg-gray-100">
                  {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Loader2
                        size={36}
                        className="animate-spin mb-3"
                        style={{ color: primaryColor }}
                      />
                      <p className="text-gray-500 text-sm">
                        جاري تحميل الملفات...
                      </p>
                    </div>
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
                    /* ✅ عرض PDF أو صورة */
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

                {/* المصغرات */}
                {images.length > 1 && (
                  <div
                    className={`flex gap-1.5 bg-white border-gray-200 flex-shrink-0 ${
                      isMobile
                        ? "flex-row h-16 overflow-x-auto border-t p-1.5"
                        : "flex-col w-20 overflow-y-auto border-l p-2"
                    }`}
                  >
                    {images.map((img, index) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImageIndex(index)}
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
        )}
      </AnimatePresence>

      {/* تأكيد الحذف */}
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
