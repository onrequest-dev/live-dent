// components/ui/PullToRefreshBlocker.tsx
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PullToRefreshBlockerProps {
  children: React.ReactNode;
  enabled?: boolean;
  isMobile?: boolean;
  showIndicator?: boolean;
  indicatorColor?: string;
}

export function PullToRefreshBlocker({
  children,
  enabled = true,
  isMobile = true,
  showIndicator = true,
  indicatorColor = "#3B82F6",
}: PullToRefreshBlockerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const pullDistance = useRef(0);
  const [showPullIndicator, setShowPullIndicator] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    pullDistance.current = 0;
    isPulling.current = false;
    setShowPullIndicator(false);
    setPullProgress(0);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !isMobile) return;

      const touchY = e.touches[0].clientY;
      const touchX = e.touches[0].clientX;
      const deltaY = touchY - touchStartY.current;
      const deltaX = touchX - touchStartX.current;

      // ✅ تجاهل التمرير الأفقي
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return;
      }

      // ✅ منع التحديث عند السحب للأسفل والصفحة في الأعلى
      if (deltaY > 0 && window.scrollY <= 1) {
        e.preventDefault();
        isPulling.current = true;
        pullDistance.current = deltaY;

        // تحديث مؤشر السحب
        if (showIndicator) {
          const progress = Math.min(deltaY / 100, 1);
          setPullProgress(progress);
          setShowPullIndicator(deltaY > 20);
        }
        return;
      }

      // ✅ منع السحب الزائد في أسفل الصفحة
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY;

      if (deltaY < 0 && scrollTop + clientHeight >= scrollHeight - 1) {
        e.preventDefault();
        return;
      }

      isPulling.current = false;
    },
    [enabled, isMobile, showIndicator],
  );

  const handleTouchEnd = useCallback(() => {
    if (isPulling.current && pullDistance.current > 50) {
      // إظهار رسالة أو اهتزاز خفيف لتنبيه المستخدم
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    }

    isPulling.current = false;
    pullDistance.current = 0;
    setShowPullIndicator(false);
    setPullProgress(0);
  }, []);

  useEffect(() => {
    if (!enabled || !isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    // ✅ إعدادات CSS لمنع التحديث
    container.style.overscrollBehavior = "none";
    // style.webkitOverflowScrolling is not part of the standard TS defs; set via setProperty or cast
    (container.style as any).webkitOverflowScrolling = "auto";

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.style.overscrollBehavior = "";
      (container.style as any).webkitOverflowScrolling = "";
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      style={{
        overscrollBehavior: enabled && isMobile ? "none" : "auto",
        WebkitOverflowScrolling: enabled && isMobile ? "auto" : "touch",
        touchAction: enabled && isMobile ? "pan-x pan-y pinch-zoom" : "auto",
        position: "relative",
      }}
    >
      {/* مؤشر السحب البصري */}
      <AnimatePresence>
        {showPullIndicator && enabled && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
            style={{
              backgroundColor: "white",
              border: `1px solid ${indicatorColor}30`,
            }}
          >
            <motion.div
              animate={{ rotate: pullProgress * 180 }}
              className="w-4 h-4 border-2 border-t-transparent rounded-full"
              style={{
                borderColor: `${indicatorColor}40`,
                borderTopColor: indicatorColor,
              }}
            />
            <span className="text-xs font-medium text-gray-600">
              اسحب للتحديث
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* شريط تقدم السحب */}
      <AnimatePresence>
        {showPullIndicator && enabled && isMobile && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: pullProgress }}
            exit={{ scaleX: 0 }}
            className="fixed top-0 left-0 right-0 h-0.5 z-50 origin-left"
            style={{ backgroundColor: indicatorColor }}
          />
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}
