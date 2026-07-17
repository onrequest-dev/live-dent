// components/ui/Toast.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

// ============================================================
// SVG الأسنان - يطفو في الزاوية العلوية اليمنى
// ============================================================
function FloatingTooth({ type }: { type: ToastData["type"] }) {
  const colors = {
    success: {
      main: "#10b981",
      glow: "rgba(16, 185, 129, 0.6)",
    },
    error: {
      main: "#ef4444",
      glow: "rgba(239, 68, 68, 0.6)",
    },
    info: {
      main: "#3b82f6",
      glow: "rgba(59, 130, 246, 0.6)",
    },
  };

  const style = colors[type];

  return (
    <motion.div
      // ✅ تعديل الموضع ليكون داخل التوست أكثر
      className="absolute -right-3 -top-3 sm:-right-4 sm:-top-4 z-20 pointer-events-none"
      initial={{ scale: 0, rotate: 20, x: -20, y: 10 }}
      animate={{ scale: 1, rotate: 0, x: 0, y: 0 }}
      exit={{ scale: 0, rotate: 10, x: -10, y: -10 }}
      transition={{ 
        type: "spring", 
        damping: 14, 
        stiffness: 160,
        delay: 0.05,
        mass: 0.7,
      }}
    >
      {/* توهج خلف SVG */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ 
          background: style.glow,
          transform: "scale(2.2)",
        }}
      />
      
      {/* حاوية SVG - تصغير الحجم قليلاً */}
      <div className="relative w-8 h-8 sm:w-10 sm:h-10">
        <svg viewBox="0 0 6000 6000" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
          <g transform="scale(1, -1) translate(0, -6000)">
            <path
              d="M1336 4749 c-65 -16 -153 -69 -202 -121 -117 -125 -139 -302 -59 -464 41 -83 97 -139 184 -181 51 -25 66 -28 166 -28 98 0 116 3 167 27 195 91 284 317 207 524 -31 83 -140 192 -224 224 -67 25 -179 35 -239 19z M3775 4749 c-99 -13 -234 -51 -377 -105 -115 -45 -129 -48 -218 -48 -85 0 -113 5 -271 52 -256 75 -306 85 -454 85 -155 1 -262 -22 -389 -82 -95 -44 -206 -125 -206 -149 0 -10 5 -46 10 -82 26 -183 -61 -370 -216 -462 -48 -29 -53 -36 -59 -77 -10 -67 -7 -316 5 -412 31 -250 96 -472 199 -678 l51 -101 0 -177 c0 -261 31 -449 115 -700 168 -506 458 -759 653 -570 75 73 121 171 177 382 77 285 88 322 116 384 61 134 148 201 263 201 77 0 129 -24 183 -83 72 -78 101 -153 177 -452 60 -239 89 -309 163 -402 40 -50 122 -93 177 -93 127 0 277 149 398 393 103 209 171 441 213 735 17 114 17 114 86 220 314 482 453 1125 334 1538 -89 305 -302 527 -604 630 -166 56 -352 75 -526 53z"
              fill={style.main}
              opacity="0.95"
            />
            <path
              d="M4808 2297 c-59 -23 -124 -64 -153 -99 -108 -128 -107 -307 1 -427 65 -72 129 -103 224 -109 131 -7 242 54 305 169 24 45 30 69 33 142 4 82 3 91 -27 152 -35 70 -87 122 -159 157 -56 27 -171 34 -224 15z"
              fill={style.main}
              opacity="0.5"
            />
            <circle cx="2650" cy="3820" r="350" fill="rgba(255,255,255,0.85)" />
            <circle cx="3650" cy="3820" r="350" fill="rgba(255,255,255,0.85)" />
          </g>
        </svg>
      </div>
    </motion.div>
  );
}

// ============================================================
// مكون التوست الفردي
// ============================================================
function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 2800);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const config = {
    success: {
      border: "border-emerald-400/30",
      shadow: "shadow-emerald-400/10",
      glow: "rgba(16, 185, 129, 0.08)",
      accent: "#10b981",
    },
    error: {
      border: "border-rose-400/30",
      shadow: "shadow-rose-400/10",
      glow: "rgba(239, 68, 68, 0.08)",
      accent: "#ef4444",
    },
    info: {
      border: "border-sky-400/30",
      shadow: "shadow-sky-400/10",
      glow: "rgba(59, 130, 246, 0.08)",
      accent: "#3b82f6",
    },
  };

  const styles = config[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.34, 1.56, 0.64, 1],
      }}
      className={`
        relative overflow-visible
        flex items-center gap-1.5
        px-3 py-1 sm:px-3.5 sm:py-1.5
        rounded-xl sm:rounded-2xl
        border ${styles.border}
        shadow-lg ${styles.shadow}
        max-w-[85vw] sm:max-w-sm
        min-h-[28px] sm:min-h-[34px]
        transition-all duration-200
        hover:shadow-xl hover:scale-[1.02]
      `}
      style={{
        background: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
      dir="rtl"
    >
      {/* توهج خلفي عميق */}
      <div 
        className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
        style={{ 
          background: `radial-gradient(ellipse at 75% 50%, ${styles.glow}, transparent 70%)`,
        }}
      />

      {/* طبقة بلور إضافية داخلية */}
      <div 
        className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)",
        }}
      />

      {/* SVG في الزاوية العلوية اليمنى */}
      <FloatingTooth type={toast.type} />

      {/* النص */}
      <span className={`
        flex-1 text-[11px] sm:text-sm font-medium text-gray-800 leading-relaxed relative z-10
        ${toast.type === "success" ? "font-semibold" : ""}
        line-clamp-2
        py-0.5
        min-w-0
        w-auto
        pr-2 sm:pr-3
      `}>
        {toast.message}
      </span>

      {/* زر الإغلاق */}
      <motion.button
        onClick={() => onRemove(toast.id)}
        className="opacity-20 hover:opacity-80 transition-all duration-200 flex-shrink-0 relative z-10 p-0.5"
        whileHover={{ scale: 1.2, rotate: 90 }}
        whileTap={{ scale: 0.85 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <X size={12} className="text-gray-500 sm:w-[14px] sm:h-[14px]" />
      </motion.button>

      {/* خط سفلي ملون رفيع */}
      <motion.div 
        className="absolute bottom-0 left-3 right-3 sm:left-4 sm:right-4 h-0.5 rounded-full opacity-30"
        style={{ background: styles.accent }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.3 }}
        transition={{ 
          delay: 0.15, 
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1],
        }}
      />
    </motion.div>
  );
}

// ============================================================
// هوك إدارة التوست
// ============================================================
export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addToast = useCallback((toast: Omit<ToastData, "id">) => {
    if (toasts.length > 0 || timeoutRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setToasts([]);
    }

    setTimeout(() => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts([{ ...toast, id }]);

      timeoutRef.current = setTimeout(() => {
        setToasts([]);
        timeoutRef.current = null;
      }, toast.duration || 2800);
    }, 60);
  }, [toasts.length]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { toasts, addToast, removeToast };
}

// ============================================================
// حاوية التوست
// ============================================================
export function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastData[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    // ✅ زيادة المسافة من الأعلى مع إضافة safe-area للهواتف الحديثة
    <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center pointer-events-none w-full px-4 sm:px-6 max-w-lg pt-safe">
      <AnimatePresence mode="wait">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto w-full">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}