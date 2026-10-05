// components/TutorialOverlay.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

// ============================================================
// Hook مشترك: يقرأ tutorial_step من localStorage ويزامن التحديثات
// ============================================================
export function useTutorialStep() {
  const [step, setStep] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    if (localStorage.getItem("live_dent_update_v4_shown") === "true") {
      localStorage.setItem("tutorial_step", "-1");
      return null;
    }
    const stored = localStorage.getItem("tutorial_step");
    if (stored === null) return 1;
    const n = parseInt(stored);
    return n === -1 || isNaN(n) ? null : n;
  });

  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem("tutorial_step");
      if (stored === null) return;
      const n = parseInt(stored);
      setStep(n === -1 || isNaN(n) ? null : n);
    };
    window.addEventListener("tutorial-update", sync);
    return () => window.removeEventListener("tutorial-update", sync);
  }, []);

  const goToStep = useCallback((newStep: number) => {
    localStorage.setItem("tutorial_step", String(newStep));
    setStep(newStep);
    window.dispatchEvent(new Event("tutorial-update"));
  }, []);

  const endTutorial = useCallback(() => {
    localStorage.setItem("tutorial_step", "-1");
    setStep(null);
    window.dispatchEvent(new Event("tutorial-update"));
  }, []);

  return { step, goToStep, endTutorial };
}

// ============================================================
// إعدادات الخطوات (1-9)
// ============================================================
export const TUTORIAL_STEPS_CONFIG: Record<
  number,
  {
    selector: string;
    title: string;
    text: string;
    position: "top" | "bottom";
    optional?: boolean;
    skipIfMissing?: boolean;
  } | null
> = {
  1: null,
  2: {
    selector: '[data-tutorial="add-patient"]',
    title: "إضافة مريض جديد",
    text: "انقر على هذا الزر لبدء إضافة مريض تجريبي",
    position: "bottom",
  },
  3: {
    selector: '[data-tutorial="patient-name"]',
    title: "اسم المريض",
    text: 'أدخل اسم المريض، مثلاً: "أحمد تجريبي"',
    position: "bottom",
  },
  4: {
    selector: '[data-tutorial="patient-phone"]',
    title: "رقم الهاتف",
    text: "أدخل رقم هاتف المريض (اختياري)",
    position: "bottom",
    // optional: true,
  },
  5: {
    selector: '[data-tutorial="patient-age-gender"]',
    title: "العمر والجنس",
    text: "أدخل العمر واختر الجنس",
    position: "bottom",
  },
  6: {
    selector: '[data-tutorial="submit-patient"]',
    title: "حفظ المريض",
    text: "اضغط على هذا الزر لحفظ المريض",
    position: "top",
  },
  7: {
    selector: '[data-tutorial="tooth-svg"]',
    title: "الشارت السني",
    text: "انقر على أي سن في الشارت لعرض لوحة معلوماته وتعديل حالته.",
    position: "top",
  },
  8: {
    selector: '[data-tutorial="apply-template-btn"]',
    title: "طبّق قالباً علاجياً",
    text: "اختر قالباً لتطبيقه على هذا السن وإنشاء مواعيده تلقائياً. يمكنك تعديل القوالب لاحقاً من تبويب العلاجات.",
    position: "top",
    optional: true,
    skipIfMissing: true,
  },
  9: {
    selector: '[data-tutorial="save-tooth-chart"]',
    title: "احفظ الشارت",
    text: "اضغط هنا لحفظ التعديلات على الشارت السني.",
    position: "bottom",
  },
};

interface TutorialOverlayProps {
  step: number;
  primaryColor: string;
  onStart: () => void;
  onEnd: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function TutorialOverlay({
  step,
  primaryColor,
  onStart,
  onEnd,
  onNext,
  onPrev,
}: TutorialOverlayProps) {
  const [rect, setRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const config = TUTORIAL_STEPS_CONFIG[step] ?? null;

  const allStepNumbers = useMemo(
    () =>
      Object.keys(TUTORIAL_STEPS_CONFIG)
        .map(Number)
        .filter((n) => n > 1)
        .sort((a, b) => a - b),
    [],
  );
  const totalSteps = allStepNumbers.length;
  const maxStep = allStepNumbers.length ? Math.max(...allStepNumbers) : 1;

  useEffect(() => {
    if (!config) {
      setRect(null);
      return;
    }

    let cancelled = false;

    const findTarget = () => {
      if (cancelled) return false;
      const els = document.querySelectorAll(config.selector);
      for (const el of Array.from(els)) {
        const r = (el as HTMLElement).getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          setRect({
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
          });
          return true;
        }
      }
      setRect(null);
      return false;
    };

    findTarget();

    let skipTimer: ReturnType<typeof setTimeout> | null = null;
    if (config.skipIfMissing) {
      skipTimer = setTimeout(() => {
        const els = document.querySelectorAll(config.selector);
        let found = false;
        for (const el of Array.from(els)) {
          const r = (el as HTMLElement).getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            found = true;
            break;
          }
        }
        if (!found) {
          console.log(`⏭️ تخطي الخطوة ${step} (العنصر غير موجود)`);
          onNext();
        }
      }, 2500);
    }

    const timers = [
      setTimeout(findTarget, 100),
      setTimeout(findTarget, 300),
      setTimeout(findTarget, 600),
      setTimeout(findTarget, 1000),
      setTimeout(findTarget, 1500),
      setTimeout(findTarget, 2000),
      setTimeout(findTarget, 3000),
      setTimeout(findTarget, 4000),
    ];

    // ✅ MutationObserver — يلتقط العنصر فور ظهوره (بعد تحميل ToothChart)
    const observer = new MutationObserver(() => {
      findTarget();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("resize", findTarget);
    window.addEventListener("scroll", findTarget, true);

    return () => {
      cancelled = true;
      if (skipTimer) clearTimeout(skipTimer);
      timers.forEach(clearTimeout);
      observer.disconnect();
      window.removeEventListener("resize", findTarget);
      window.removeEventListener("scroll", findTarget, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, step]);

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center"
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Sparkles size={28} style={{ color: primaryColor }} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">مرحباً بك!</h3>
          <p className="text-sm text-gray-500 mb-1 leading-relaxed">
            هل ترغب في رؤية شرح تجريبي لإضافة أول مريض؟
          </p>
          <p className="text-xs text-gray-400 mb-6">
            (لن يستغرق أكثر من دقيقة)
          </p>
          <div className="flex gap-2">
            <button
              onClick={onStart}
              className="flex-1 py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: primaryColor }}
            >
              ابدأ الشرح
            </button>
            <button
              onClick={onEnd}
              className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium transition-all hover:bg-gray-200 active:scale-[0.98]"
            >
              تخطي
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!config || !rect) return null;

  const padding = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tooltipW = Math.min(288, vw - 32);
  const tooltipH = 165;
  const gap = 12;
  const spaceAbove = rect.top - gap;
  const spaceBelow = vh - rect.top - rect.height - gap;
  const preferredSpace = config.position === "bottom" ? spaceBelow : spaceAbove;
  const alternateSpace = config.position === "bottom" ? spaceAbove : spaceBelow;
  const placeBelow =
    preferredSpace >= tooltipH
      ? config.position === "bottom"
      : alternateSpace >= tooltipH
        ? config.position !== "bottom"
        : spaceBelow >= spaceAbove;
  const desiredTop = placeBelow
    ? rect.top + rect.height + gap
    : rect.top - tooltipH - gap;
  const tooltipTop = Math.max(12, Math.min(vh - tooltipH - 12, desiredTop));
  const centerX = rect.left + rect.width / 2 - tooltipW / 2;
  const clampedLeft = Math.max(16, Math.min(vw - tooltipW - 16, centerX));

  const isLastStep = step === maxStep;
  const showPrev = step > 2;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          borderRadius: 12,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
          zIndex: 150,
          pointerEvents: "none",
          transition: "all 0.25s ease-out",
        }}
      />

      <button
        onClick={onEnd}
        className="fixed z-[160] top-4 left-4 px-3 py-1.5 rounded-full bg-gray-900/85 text-white text-xs font-medium shadow-lg backdrop-blur-sm hover:bg-gray-800 transition-colors"
      >
        تخطي الشرح <span aria-hidden="true">×</span>
      </button>

      <div
        className="fixed z-[152] bg-white rounded-xl shadow-xl border border-gray-100 p-3"
        style={{
          top: tooltipTop,
          left: clampedLeft,
          width: tooltipW,
          maxHeight: "calc(100vh - 24px)",
        }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${primaryColor}15`,
              color: primaryColor,
            }}
          >
            الخطوة {step - 1} من {totalSteps}
          </span>
          <div className="flex gap-1">
            {allStepNumbers.map((stepNum, idx) => (
              <span
                key={stepNum}
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor: idx === step - 1 ? primaryColor : "#e5e7eb",
                }}
              />
            ))}
          </div>
        </div>

        <h4 className="text-[13px] font-bold text-gray-900 mb-0.5">
          {config.title}
        </h4>
        <p className="text-[11px] text-gray-500 mb-2 leading-snug">
          {config.text}
        </p>

        {isLastStep ? (
          <div className="text-center text-[10px] text-gray-500 py-1.5 px-2 bg-gray-50 rounded-lg mb-2">
            أكمل النموذج ثم اضغط الزر المُبرز أعلاه
          </div>
        ) : (
          <div className="flex gap-1.5">
            {showPrev && (
              <button
                onClick={onPrev}
                className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium text-xs transition-all hover:bg-gray-200 active:scale-[0.98] flex items-center gap-1"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>السابق</span>
              </button>
            )}
            <button
              onClick={onNext}
              className="flex-1 py-1.5 rounded-lg text-white font-medium text-xs transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: primaryColor }}
            >
              {config.optional
                ? "تخطي"
                : step === 2
                  ? "افتح نموذج المريض"
                  : "التالي"}
            </button>
          </div>
        )}

        {isLastStep && showPrev && (
          <button
            onClick={onPrev}
            className="w-full mt-1.5 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 font-medium text-xs transition-all hover:bg-gray-200 active:scale-[0.98] flex items-center justify-center gap-1"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>السابق</span>
          </button>
        )}

        <button
          onClick={onEnd}
          className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600 transition-colors pt-1.5"
        >
          تخطي الشرح بالكامل
        </button>
      </div>
    </>
  );
}
