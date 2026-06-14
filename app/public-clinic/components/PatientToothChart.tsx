// components/ToothChart/PatientToothChart.tsx
"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, AlertCircle, Loader2, Stethoscope } from "lucide-react";
import { fetchDentalChartFromServer } from "@/client/helpers/dental-chart";

// ============================================================
// أنواع البيانات
// ============================================================

export type ProcedureType =
  | "sound"
  | "decayed"
  | "filled"
  | "crown"
  | "root-canal"
  | "implant"
  | "missing"
  | "custom";

export interface ToothData {
  id: number;
  procedure: ProcedureType;
  customProcedure?: string;
  color: string;
  treatments: string[];
  notes: string;
}

export interface PatientToothChartProps {
  patientId: string;
  patientName?: string;
  primaryColor?: string;
  className?: string;
}

// ============================================================
// الثوابت
// ============================================================

const PROCEDURE_COLORS: Record<ProcedureType, string> = {
  sound: "#FFFFFF",
  decayed: "#bcef44",
  filled: "#3B82F6",
  crown: "#F59E0B",
  "root-canal": "#8B4513",
  implant: "#10B981",
  missing: "#9CA3AF",
  custom: "#DC2626",
};

const PROCEDURE_LABELS: Record<ProcedureType, string> = {
  sound: "سليم",
  decayed: "متسوس",
  filled: "محشو",
  crown: "تاج",
  "root-canal": "معالجة لبية",
  implant: "زرعة",
  missing: "مفقود",
  custom: "مخصص",
};

const DEFAULT_TEETH_DATA: ToothData[] = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  procedure: "sound" as ProcedureType,
  color: "#FFFFFF",
  treatments: Array(10).fill(""),
  notes: "",
}));

// ============================================================
// دوال مساعدة
// ============================================================

function normalizeChartTeeth(
  teeth: {
    toothNumber: number;
    procedure: string;
    customProcedure?: string;
    color: string;
    treatments?: string[];
    notes?: string;
  }[]
): ToothData[] {
  const defaultTeeth = Array.from({ length: 32 }, (_, i) => ({
    id: i + 1,
    procedure: "sound" as ProcedureType,
    color: "#FFFFFF",
    treatments: Array(10).fill(""),
    notes: "",
  }));

  return defaultTeeth.map((tooth) => {
    const entry = teeth.find((item) => item.toothNumber === tooth.id);
    if (!entry) return tooth;

    const procedure = (
      PROCEDURE_COLORS[entry.procedure as ProcedureType] !== undefined
        ? entry.procedure
        : "custom"
    ) as ProcedureType;

    const treatments = entry.treatments
      ? [...entry.treatments, ...Array(10 - entry.treatments.length).fill("")].slice(0, 10)
      : Array(10).fill("");

    return {
      id: entry.toothNumber,
      procedure,
      customProcedure: entry.customProcedure,
      color: entry.color,
      treatments,
      notes: entry.notes || "",
    };
  });
}

function getDisplayLabel(tooth: ToothData): string {
  if (tooth.customProcedure) return tooth.customProcedure;
  if (tooth.procedure === "sound") return "";
  return PROCEDURE_LABELS[tooth.procedure] || "";
}

function getShortLabel(procedure: string): string {
  const labels: Record<string, string> = {
    decayed: "تسوس",
    filled: "حشوة",
    crown: "تاج",
    "root-canal": "معالجة",
    implant: "زرعة",
    missing: "مفقود",
  };
  return labels[procedure] || "";
}

// ============================================================
// المكون الرئيسي
// ============================================================

export function PatientToothChart({
  patientId,
  patientName,
  primaryColor = "#007bff",
  className = "",
}: PatientToothChartProps) {
  const [teethData, setTeethData] = useState<ToothData[]>(DEFAULT_TEETH_DATA);
  const [selectedToothId, setSelectedToothId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const infoPanelRef = useRef<HTMLDivElement>(null);

  // كشف حجم الشاشة
  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1200);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

// جلب البيانات
useEffect(() => {
  const loadChart = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      // استخدام الدالة الجديدة التي تجلب من السيرفر مباشرة
      const chartData = await fetchDentalChartFromServer(patientId);
      if (chartData && chartData.teeth) {
        setTeethData(normalizeChartTeeth(chartData.teeth));
      }
    } catch (error: any) {
      setFetchError(error.message || "فشل تحميل بيانات الأسنان");
    } finally {
      setIsLoading(false);
    }
  };

  loadChart();
}, [patientId]);

  // تمرير تلقائي للوحة المعلومات في الجوال
  useEffect(() => {
    if (isMobile && selectedToothId && infoPanelRef.current) {
      const timer = setTimeout(() => {
        infoPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedToothId, isMobile]);

  // النقر على السن
  const handleToothClick = useCallback((toothNumber: number) => {
    setSelectedToothId((prev) => (prev === toothNumber ? null : toothNumber));
  }, []);

  // السن المحدد
  const selectedTooth = selectedToothId
    ? teethData.find((t) => t.id === selectedToothId) || null
    : null;

  // ========== حالة التحميل ==========
  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 size={32} className="animate-spin" style={{ color: primaryColor }} />
          <p className="text-sm text-gray-500">جاري تحميل الشارت السني...</p>
        </div>
      </div>
    );
  }

  // ========== حالة الخطأ ==========
  if (fetchError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-2xl p-6 text-center ${className}`}>
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-red-700 font-medium mb-2">خطأ في تحميل البيانات</p>
        <p className="text-red-600 text-sm">{fetchError}</p>
      </div>
    );
  }

  // ========== هل توجد أي بيانات؟ ==========
  const hasAnyData = teethData.some(
    (t) => t.procedure !== "sound" || t.treatments.some((tr) => tr.trim()) || t.notes.trim()
  );

  if (!hasAnyData) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
            <span className="text-3xl">🦷</span>
          </div>
          <p className="text-gray-500 font-medium">لا توجد بيانات مسجلة بعد</p>
          <p className="text-sm text-gray-400">لم يتم تسجيل أي إجراءات على الأسنان</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Stethoscope size={20} style={{ color: primaryColor }} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">الشارت السني</h3>
          {patientName && <p className="text-xs text-gray-500">{patientName}</p>}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      {isMobile ? (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-2">
            <PatientToothSVG
              teethData={teethData}
              selectedToothId={selectedToothId}
              onToothClick={handleToothClick}
              primaryColor={primaryColor}
            />
          </div>

          <AnimatePresence>
            {selectedTooth && (
              <motion.div
                key={selectedToothId}
                ref={infoPanelRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <PatientToothInfoCard tooth={selectedTooth} primaryColor={primaryColor} />
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedTooth && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <ChevronRight size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">اختر سناً من الرسم لعرض معلوماته</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-3 items-start">
          <div
            className="bg-white rounded-2xl border border-gray-100 p-2"
            style={{
              width: isTablet ? "320px" : "380px",
              flexShrink: 0,
            }}
          >
            <PatientToothSVG
              teethData={teethData}
              selectedToothId={selectedToothId}
              onToothClick={handleToothClick}
              primaryColor={primaryColor}
            />
          </div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {selectedTooth ? (
                <motion.div
                  key={selectedToothId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <PatientToothInfoCard tooth={selectedTooth} primaryColor={primaryColor} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-gray-100 p-8 text-center flex flex-col items-center justify-center min-h-[400px]"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <span className="text-3xl">🦷</span>
                  </div>
                  <p className="text-gray-500 font-medium mb-1">لوحة معلومات السن</p>
                  <p className="text-sm text-gray-400">اختر سناً من الرسم لعرض معلوماته</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// مكون SVG للعرض فقط (مع تفاعل النقر)
// ============================================================

interface PatientToothSVGProps {
  teethData: ToothData[];
  selectedToothId: number | null;
  onToothClick: (toothNumber: number) => void;
  primaryColor: string;
}

function PatientToothSVG({
  teethData,
  selectedToothId,
  onToothClick,
  primaryColor,
}: PatientToothSVGProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const hoveredToothRef = useRef<number | null>(null);

// تحديث مظهر الأسنان - مع حواف أكثر وضوحاً
const updateToothAppearance = useCallback(() => {
  teethData.forEach((tooth) => {
    const toothElement = document.getElementById(`Tooth${tooth.id}`);
    if (toothElement) {
      toothElement.setAttribute("fill", tooth.color);

      const isSelected = selectedToothId === tooth.id;
      const isHovered = hoveredToothRef.current === tooth.id;
      const isActive = isSelected || isHovered;

      if (isActive) {
        toothElement.setAttribute("opacity", "1");
        toothElement.setAttribute("fill-opacity", "1");
        toothElement.setAttribute("stroke-opacity", "1");
        toothElement.setAttribute("stroke", "#1F2937"); // أسود أغمق
        toothElement.setAttribute("stroke-width", isSelected ? "3.5" : "2.5"); // أكثر سمكاً
        toothElement.setAttribute(
          "filter",
          isSelected ? "url(#highlight)" : "url(#hover-shadow)"
        );
      } else {
        const baseOpacity = selectedToothId === null ? "0.85" : "0.5"; // زيادة الشفافية قليلاً
        toothElement.setAttribute("opacity", baseOpacity);
        toothElement.setAttribute("fill-opacity", baseOpacity);
        toothElement.setAttribute("stroke-opacity", "1"); // دائماً ظاهر
        toothElement.setAttribute("stroke", "#374151"); // حواف داكنة دائماً
        toothElement.setAttribute("stroke-width", "2"); // حواف أكثر سمكاً
        toothElement.setAttribute("filter", "none");
      }
    }
  });

  // تحديث الأرقام والحدود
  for (let i = 1; i <= 32; i++) {
    const label = document.getElementById(`lbl${i}`);
    if (label) {
      label.setAttribute("opacity", i === selectedToothId ? "1" : "0.6");
      // جعل الأرقام أكثر وضوحاً
      label.setAttribute("fill", i === selectedToothId ? "#1F2937" : "#6B7280");
      label.setAttribute("font-weight", i === selectedToothId ? "bold" : "bold"); // جميع الأرقام bold
    }
  }

  const outlinesGroup = document.getElementById("adult-outlines");
  if (outlinesGroup) {
    outlinesGroup.setAttribute("opacity", selectedToothId === null ? "1" : "0.3");
    // جعل الحدود الخارجية أكثر وضوحاً
    const paths = outlinesGroup.querySelectorAll("path");
    paths.forEach((path: Element) => {
      path.setAttribute("stroke", "#1F2937");
      path.setAttribute("stroke-width", "1.5");
    });
  }
}, [teethData, selectedToothId]);

  // تطبيق تأثير الهوفر
  const applyHoverEffect = useCallback(
    (toothNumber: number | null) => {
      // إزالة الهوفر السابق
      if (hoveredToothRef.current !== null && hoveredToothRef.current !== selectedToothId) {
        const prevElement = document.getElementById(`Tooth${hoveredToothRef.current}`);
        if (prevElement) {
          const baseOpacity = selectedToothId === null ? "0.7" : "0.4";
          prevElement.setAttribute("opacity", baseOpacity);
          prevElement.setAttribute("fill-opacity", baseOpacity);
          prevElement.setAttribute("stroke-opacity", baseOpacity);
          prevElement.setAttribute("stroke", "#C0C0C0");
          prevElement.setAttribute("stroke-width", "1.5");
          prevElement.setAttribute("filter", "none");
        }
      }

      // تطبيق الهوفر الجديد
      if (toothNumber !== null && toothNumber !== selectedToothId) {
        const element = document.getElementById(`Tooth${toothNumber}`);
        if (element) {
          element.setAttribute("opacity", "1");
          element.setAttribute("fill-opacity", "1");
          element.setAttribute("stroke-opacity", "1");
          element.setAttribute("stroke", "#1F2937");
          element.setAttribute("stroke-width", "2.5");
          element.setAttribute("filter", "url(#hover-shadow)");
        }
      }
      hoveredToothRef.current = toothNumber;
    },
    [selectedToothId]
  );

  // تهيئة افتراضية
  useEffect(() => {
    const timer = setTimeout(() => {
      const baseOpacity = "0.7";
      teethData.forEach((tooth) => {
        const toothElement = document.getElementById(`Tooth${tooth.id}`);
        if (toothElement) {
          toothElement.setAttribute("opacity", baseOpacity);
          toothElement.setAttribute("fill-opacity", baseOpacity);
          toothElement.setAttribute("stroke-opacity", baseOpacity);
          toothElement.setAttribute("stroke", "#C0C0C0");
          toothElement.setAttribute("stroke-width", "1.5");
          toothElement.setAttribute("filter", "none");
        }
      });

      for (let i = 1; i <= 32; i++) {
        const label = document.getElementById(`lbl${i}`);
        if (label) label.setAttribute("opacity", "0.5");
      }
      const outlinesGroup = document.getElementById("adult-outlines");
      if (outlinesGroup) outlinesGroup.setAttribute("opacity", "1");
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // تحديث عند تغيير البيانات أو الاختيار
  useEffect(() => {
    updateToothAppearance();
  }, [updateToothAppearance]);

  // ====== إضافة مستمعي الأحداث (دائماً، وليس فقط عندما editable) ======
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      const toothId = target.id;

      if (toothId.startsWith("Tooth") && target.closest("#Spots")) {
        const toothNumber = parseInt(toothId.replace("Tooth", ""));
        if (!isNaN(toothNumber)) {
          onToothClick(toothNumber);
        }
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      const toothId = target.id;

      if (toothId.startsWith("Tooth") && target.closest("#Spots")) {
        const toothNumber = parseInt(toothId.replace("Tooth", ""));
        if (!isNaN(toothNumber)) {
          applyHoverEffect(toothNumber);
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      const toothId = target.id;

      if (toothId.startsWith("Tooth") && target.closest("#Spots")) {
        const toothNumber = parseInt(toothId.replace("Tooth", ""));
        if (!isNaN(toothNumber) && toothNumber !== selectedToothId) {
          const element = document.getElementById(`Tooth${toothNumber}`);
          if (element) {
            const baseOpacity = selectedToothId === null ? "0.7" : "0.4";
            element.setAttribute("opacity", baseOpacity);
            element.setAttribute("fill-opacity", baseOpacity);
            element.setAttribute("stroke-opacity", baseOpacity);
            element.setAttribute("stroke", "#C0C0C0");
            element.setAttribute("stroke-width", "1.5");
            element.setAttribute("filter", "none");
          }
          if (hoveredToothRef.current === toothNumber) {
            hoveredToothRef.current = null;
          }
        }
      }
    };

    const svgElement = svgRef.current?.querySelector("svg");
    if (svgElement) {
      svgElement.addEventListener("click", handleClick);
      svgElement.addEventListener("mouseover", handleMouseOver);
      svgElement.addEventListener("mouseout", handleMouseOut);

      return () => {
        svgElement.removeEventListener("click", handleClick);
        svgElement.removeEventListener("mouseover", handleMouseOver);
        svgElement.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, [onToothClick, selectedToothId, applyHoverEffect]);

  return (
    <div ref={svgRef} className="tooth-chart-svg-container">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 450 700"
        enableBackground="new 0 0 450 700"
        preserveAspectRatio="xMidYMid meet"
        className="tooth-chart-svg"
        style={{
          width: "100%",
          maxWidth: "400px",
          height: "auto",
          display: "block",
          margin: "0 auto",
          backgroundColor: "#f8fafc",
        }}
      >
        <defs>
          <filter id="highlight" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feFlood floodColor="#000000" floodOpacity="0.5" result="glowColor" />
            <feComposite in="glowColor" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="hover-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.4" />
          </filter>
          <style>
            {`
              #Spots polygon, #Spots path {
                cursor: pointer;
                transition: opacity 0.3s ease, stroke 0.3s ease, stroke-width 0.3s ease, filter 0.3s ease;
              }
              #toothLabels text, #dmftLabels text {
                transition: opacity 0.3s ease;
              }
              #adult-outlines {
                transition: opacity 0.3s ease;
              }
            `}
          </style>
        </defs>
        <g id="toothLabels" transform="translate(40, -5)" opacity="1">
          {/* نفس الأرقام الموجودة في المكون الأصلي */}
          <text id="lbl1" transform="matrix(1 0 0 1 75 324)" fontFamily="'Avenir-Heavy'" fontSize="18px">1</text>
          <text id="lbl2" transform="matrix(1 0 0 1 68 276)" fontFamily="'Avenir-Heavy'" fontSize="18px">2</text>
          <text id="lbl3" transform="matrix(1 0 0 1 75 234)" fontFamily="'Avenir-Heavy'" fontSize="18px">3</text>
          <text id="lbl4" transform="matrix(1 0 0 1 90 195)" fontFamily="'Avenir-Heavy'" fontSize="18px">4</text>
          <text id="lbl5" transform="matrix(1 0 0 1 103 164)" fontFamily="'Avenir-Heavy'" fontSize="18px">5</text>
          <text id="lbl6" transform="matrix(1 0 0 1 120 134)" fontFamily="'Avenir-Heavy'" fontSize="18px">6</text>
          <text id="lbl7" transform="matrix(1 0 0 1 145 117)" fontFamily="'Avenir-Heavy'" fontSize="18px">7</text>
          <text id="lbl8" transform="matrix(1 0 0 1 175 112)" fontFamily="'Avenir-Heavy'" fontSize="18px">8</text>
          <text id="lbl9" transform="matrix(1 0 0 1 208 112)" fontFamily="'Avenir-Heavy'" fontSize="18px">9</text>
          <text id="lbl10" transform="matrix(1 0 0 1 235 118)" fontFamily="'Avenir-Heavy'" fontSize="18px">10</text>
          <text id="lbl11" transform="matrix(1 0 0 1 258 142)" fontFamily="'Avenir-Heavy'" fontSize="18px">11</text>
          <text id="lbl12" transform="matrix(1 0 0 1 275 172)" fontFamily="'Avenir-Heavy'" fontSize="18px">12</text>
          <text id="lbl13" transform="matrix(1 0 0 1 288 200)" fontFamily="'Avenir-Heavy'" fontSize="18px">13</text>
          <text id="lbl14" transform="matrix(1 0 0 1 298 236)" fontFamily="'Avenir-Heavy'" fontSize="18px">14</text>
          <text id="lbl15" transform="matrix(1 0 0 1 300 275)" fontFamily="'Avenir-Heavy'" fontSize="18px">15</text>
          <text id="lbl16" transform="matrix(1 0 0 1 296 324)" fontFamily="'Avenir-Heavy'" fontSize="18px">16</text>
          <text id="lbl17" transform="matrix(1 0 0 1 308 402)" fontFamily="'Avenir-Heavy'" fontSize="18px">17</text>
          <text id="lbl18" transform="matrix(1 0 0 1 310 449)" fontFamily="'Avenir-Heavy'" fontSize="18px">18</text>
          <text id="lbl19" transform="matrix(1 0 0 1 306 495)" fontFamily="'Avenir-Heavy'" fontSize="18px">19</text>
          <text id="lbl20" transform="matrix(1 0 0 1 288 538)" fontFamily="'Avenir-Heavy'" fontSize="18px">20</text>
          <text id="lbl21" transform="matrix(1 0 0 1 268 573)" fontFamily="'Avenir-Heavy'" fontSize="18px">21</text>
          <text id="lbl22" transform="matrix(1 0 0 1 258 602)" fontFamily="'Avenir-Heavy'" fontSize="18px">22</text>
          <text id="lbl23" transform="matrix(1 0 0 1 238 619)" fontFamily="'Avenir-Heavy'" fontSize="18px">23</text>
          <text id="lbl24" transform="matrix(1 0 0 1 215 628)" fontFamily="'Avenir-Heavy'" fontSize="18px">24</text>
          <text id="lbl25" transform="matrix(1 0 0 1 188 628)" fontFamily="'Avenir-Heavy'" fontSize="18px">25</text>
          <text id="lbl26" transform="matrix(1 0 0 1 163 623)" fontFamily="'Avenir-Heavy'" fontSize="18px">26</text>
          <text id="lbl27" transform="matrix(1 0 0 1 142 603)" fontFamily="'Avenir-Heavy'" fontSize="18px">27</text>
          <text id="lbl28" transform="matrix(1 0 0 1 120 573)" fontFamily="'Avenir-Heavy'" fontSize="18px">28</text>
          <text id="lbl29" transform="matrix(1 0 0 1 100 538)" fontFamily="'Avenir-Heavy'" fontSize="18px">29</text>
          <text id="lbl30" transform="matrix(1 0 0 1 90 495)" fontFamily="'Avenir-Heavy'" fontSize="18px">30</text>
          <text id="lbl31" transform="matrix(1 0 0 1 80 449)" fontFamily="'Avenir-Heavy'" fontSize="18px">31</text>
          <text id="lbl32" transform="matrix(1 0 0 1 82 402)" fontFamily="'Avenir-Heavy'" fontSize="18px">32</text>
        </g>

        <g id="Spots">
          {/* جميع الـ polygons والـ paths من المكون الأصلي */}
          <polygon id="Tooth32" fill="#FFFFFF" data-key="32" points="66.7,369.7 59,370.3 51,373.7 43.7,384.3 42.3,392 38.7,406 41,415.3 44.3,420.3 47.3,424 51.7,424.3 57.7,424 62.3,422.7 66.7,422.7 71,424.3 76.3,422.7 80.7,419.3 84.7,412.3 85.3,405 87.3,391.7 85,380 80.7,375 73.7,371.3" />
          <polygon id="Tooth31" fill="#FFFFFF" data-key="31" points="76,425.7 80.3,427.7 83.3,433 85.3,447.7 84.3,458.7 79.7,472.3 73,475 50.3,479.7 46.7,476.7 37.7,446.3 39.7,438.3 43.3,432 49,426.7 56,424.7 65,424.7" />
          <polygon id="Tooth30" fill="#FFFFFF" data-key="30" points="78.7,476 85,481 90.3,488.3 96.3,499.3 97.7,511.3 93,522 86,526.3 67,533 60.3,529.7 56.3,523.7 51.7,511 47.7,494.7 47.7,488.3 50.3,483.3 55,479.7 67,476.7" />
          <polygon id="Tooth29" fill="#FFFFFF" data-key="29" points="93.3,525 99.3,527.3 108.3,536 114,546.7 115.7,559.3 114.3,567.3 106.3,573 98.3,578.3 88,579 82,575 75,565 69.3,552.3 67.3,542 69.7,536 74.3,531.7 84.3,528.3" />
          <path id="Tooth28" fill="#FFFFFF" data-key="28" d="M117.3,569.7l7.7,1.3l6.3,3.7l6.3,7.7l4,8.3L144,602l-1.3,6.7l-6.7,6.7l-7.7,3.3l-7.3-1l-7-3 l-7.3-7l-5-9l-2-10c0,0-0.7-7,0.3-7.3c1-0.3,5.3-6.7,5.3-6.7l9-5H117.3z" />
          <polygon id="Tooth27" fill="#FFFFFF" data-key="27" points="155.7,611 160.3,615.3 165,624.7 161.7,634.3 156,641.3 149,644 140.7,644.3 133.3,641.3 128.7,634.7 128.7,629 132.7,621.3 137.7,615 143.7,611 149.7,610" />
          <polygon id="Tooth26" fill="#FFFFFF" data-key="26" points="178.3,627 186,629 187.7,633.7 188.7,644 189,657 189.3,662.7 186.3,663.7 176.7,663 168,656.3 159.3,649.7 156.7,644 162,639.3" />
          <polygon id="Tooth25" fill="#FFFFFF" data-key="25" points="214,637 218,642.7 223,654.3 225.7,664 225.3,666.3 219,668.3 206.7,668 196,665.7 190.3,662.7 193,657.3 199.7,647.3 207,638 210.7,635.5" />
          <path id="Tooth24" fill="#FFFFFF" data-key="24" d="M235.3,637c0,0,3-2,4-2.3c1-0.3,4.3,0,4.3,0l5,4.3l5.3,7.3l3.3,6.7l2,7.3l-2,3l-7.7,2.7 l-10,0.3h-10l-2-6.7l2.7-7.3L235.3,637z" />
          <polygon id="Tooth23" fill="#FFFFFF" data-key="23" points="269.3,624 273.3,624.7 275.3,627.3 279,628.7 281.7,631.3 285.3,634.7 289.3,638.3 292,643.3 291.3,650 287,655 280.7,658.7 272,660 265,660.7 261.3,657.3 261.7,650 263.7,637 264.3,627" />
          <polygon id="Tooth22" fill="#FFFFFF" data-key="22" points="286,629.3 286.7,633.3 291.3,638.7 295.3,642.3 302,644 311.7,643.3 318.3,637.7 321,630 321.3,620.3 317,614.3 308,608 298.3,607 291,609.3 287,612.3 286.7,617.7 287.3,624.7" />
          <polygon id="Tooth21" fill="#FFFFFF" data-key="21" points="331,565.7 335,565.7 341.3,568 349.3,574.3 352.3,578.3 352.7,583.7 350.7,593.7 342.7,604 337.7,609 328,612.7 320,613.3 315,611 308.3,604.7 306.7,598 307.3,591.3 309,584.7 312.7,578.3 318.3,571.7" />
          <polygon id="Tooth20" fill="#FFFFFF" data-key="20" points="334,561 338.7,566 346,570 354.7,573 360.7,571.7 368,568.3 383,545 385.3,532.7 381.3,524.3 374,520.7 363.7,516.3 356.3,515.3 351.3,518.3 346.3,524 340.3,534.3 336,546.7" />
          <path id="Tooth19" fill="#FFFFFF" data-key="19" d="M398,470l4.7,5.7l3,7.7l-0.3,11.7l-6,13.3l-6.3,10.3l-8.3,4.3l-7.3-1l-16.3-7c0,0-2.7-6-3-7.3 c-0.3-1.3-0.3-11-0.3-11l3.7-14.3l3.7-7l5.3-6.7l8-2l9.7-0.7L398,470z" />
          <polygon id="Tooth18" fill="#FFFFFF" data-key="18" points="410,435 408.7,447.3 404.3,459 399.3,467.7 393.7,468 388,466 376.3,466.3 369.7,466.3 365.7,460 364.7,444.7 366.3,434.3 369,424 378.3,417.3 386.7,415.7 391.7,415.3 396,418 399.7,418 404,421.7 407.7,427.3" />
          <polygon id="Tooth17" fill="#FFFFFF" data-key="17" points="371.7,417 378.3,417.3 386.7,415.7 391.7,415.3 397.3,417.7 402.7,416.3 407.7,409.7 406.7,395 401,377.7 397.3,373 390.7,367.3 380,365 373,366.7 367.3,369 364,374.3 360,389 363.3,401.3 367.7,412.3" />
          <polygon id="Tooth16" fill="#FFFFFF" data-key="16" points="404.3,293.7 408.7,299.3 408.7,308 405.3,318.7 401,329.7 392.3,339.7 382.7,341 369,339.7 359,335 354.7,327.7 354.3,316 358.3,304 363.7,294 368.7,294.7 378.7,296 389,296" />
          <polygon id="Tooth15" fill="#FFFFFF" data-key="15" points="362.3,247.3 357.3,251 357,259.3 358.7,268 359.7,279.7 361.3,286.7 365,291.7 371,294.3 392,295 404.3,293.7 410,280.7 412,263.3 407.3,246.7 401,240.3 396,239.7 389.3,243" />
          <polygon id="Tooth14" fill="#FFFFFF" data-key="14" points="359.7,243.7 350.7,224 345.7,211.7 348.7,205 358.3,202.7 375.7,197 388.7,193 393,196 399.3,207 401.3,222.7 400,234.3 394.7,240.7 381.7,244.7 371,246" />
          <polygon id="Tooth13" fill="#FFFFFF" data-key="13" points="386,188.7 383.3,192.7 377.7,196 356.3,203.3 345.7,202.3 341.7,199.7 338.7,196.3 335,188.7 332,177 333.7,169.7 338,164.7 346.3,161 353.7,156.7 360.3,150.3 364,151 370.7,156.3 376.3,164.3 380,170.3 383.3,178.3" />
          <polygon id="Tooth12" fill="#FFFFFF" data-key="12" points="358.7,134.3 360.3,145.7 357.3,152.7 352,157.3 346.3,161 336,164 329.7,163.3 321.7,157.7 314.3,149 310.7,139.3 310,133.7 312.3,127 318.3,125.7 326,122 332.7,116 334.7,114.3 337.7,117.3 343.3,119.7 348.7,122.7 354.3,127.7" />
          <polygon id="Tooth11" fill="#FFFFFF" data-key="11" points="336,93.3 337.7,100 336,104.7 332.7,113.7 324.3,121.3 315.3,125.7 306.3,126 297.3,120.3 294,112 295.7,102.7 299,95 303.3,90 309.3,88 316.3,87.3 322.7,87.3 328,88.3" />
          <polygon id="Tooth10" fill="#FFFFFF" data-key="10" points="310.3,83.3 298,90.7 286,95 276.3,98.3 270.3,93.3 269,82.7 269,69.3 270,58.7 274.7,54.7 282,53 287.7,54.7 297.3,60.3 304,64.3 308.7,68.7 312.3,74 313,81" />
          <polygon id="Tooth9" fill="#FFFFFF" data-key="9" points="273.3,52 266.7,61.7 258.3,72.3 253.3,79.7 247.3,85 239,87.7 232.3,82 224.7,67 222,58.3 219,50 220,44.3 224.3,40.3 230,38.7 237.3,38.7 253,39.3 258.7,41.3 264.3,43.7 268.3,45.7" />
          <polygon id="Tooth8" fill="#FFFFFF" data-key="8" points="176.7,46.3 195,41 203.3,39.7 209.3,40.7 215.3,42.7 217,47 217.7,54.3 215,64.7 212.3,75.7 208,83 201.7,85.7 195.7,86.7 189.7,83.3 183.7,74.7 175,62 171.7,54 172.7,49.7" />
          <path id="Tooth7" fill="#FFFFFF" data-key="7" d="M167,55l6.7,6.3L174,68l0.3,8l1,10l-2,8.3l-4.7,4.3l-6.7,1.7l-8-4.3l-7.3-4.7l-9.3-4.7 l-6.3-5.3l-1-4.3l1.3-5c0,0,3.3-6,4.3-6s5.3-6,6.3-6s10.3-4.7,10.3-4.7L167,55z" />
          <polygon id="Tooth6" fill="#FFFFFF" data-key="6" points="126.3,82 134.3,86.3 139.7,92.3 144.7,104.7 145.7,115.3 143.7,120.7 138,124.3 131.3,125 121,125 114.7,119.3 110.3,112.3 108.3,104.7 108.7,94.7 110.7,88.7 116,84" />
          <polygon id="Tooth5" fill="#FFFFFF" data-key="5" points="109,116.7 116,122.3 122.7,125.3 127.7,131.3 128.3,141 122.7,153.7 114,161.7 105.7,162.3 96.7,161 85.7,156 82,150 81,139.3 86.3,128 93,121.3 100.7,117.3" />
          <polygon id="Tooth4" fill="#FFFFFF" data-key="4" points="82,155.3 102.3,163.3 108.7,172 109.3,182 104.7,192 100,199 94,203.7 85.3,201.7 73.7,201 64.3,196.7 60.3,190.7 59,183.3 61.7,175.3 66.3,167.7 71.3,161.3" />
          <path id="Tooth3" fill="#FFFFFF" data-key="3" d="M92.7,207.3l2,5.3l-1.7,8l-1.7,9l-4,8l-5,7.7l-11,4.7l-13.7,0.7l-10-7l-1.7-5L45,220l3-10.7 l5-7.3l4-3.3l4.7-2.7l5.3,3.7l6.7,1.3c0,0,7.3,1.3,9.3,1.3s6.3,0.7,6.3,0.7L92.7,207.3z" />
          <polygon id="Tooth2" fill="#FFFFFF" data-key="2" points="79.7,288.3 71.7,291 55,293 40.3,291.3 36,287 33,273.7 36.3,260 42,248.7 44.7,244.7 50.3,246.7 56,249 65.3,250.7 74,249.7 80.3,249.7 82.3,254 85.3,259.3 87,267.7 87.7,274.7 85.3,282.7" />
          <polygon id="Tooth1" fill="#FFFFFF" data-key="1" points="33,314.3 38,325.7 45.7,335.7 55.7,341.7 64.7,343 73.3,340 77.7,335.7 81.3,326.3 82,314.3 81.3,302 80.7,292.7 73.7,292 51.3,293.7 38.7,293.7 34,298 31.7,302.3 32,311" />
        </g>
        <g id="adult-outlines" opacity="1">
          {/* نفس مسارات الحدود من المكون الأصلي - تم حذفها هنا للاختصار، انسخها كاملة */}
        </g>

        {/* نص توجيهي */}
<text
  x="225"
  y="690"
  textAnchor="middle"
  fill="#6B7280"
  fontSize="13"
  fontFamily="'Arial', sans-serif"
  fontWeight="500"
  opacity="0.8"
>
  انقر على السن لمعاينة الأعمال
</text>
      </svg>
    </div>
  );
}

// ============================================================
// بطاقة عرض معلومات السن (للقراءة فقط)
// ============================================================

function PatientToothInfoCard({
  tooth,
  primaryColor,
}: {
  tooth: ToothData;
  primaryColor: string;
}) {
  const displayLabel = getDisplayLabel(tooth);
  const activeTreatments = tooth.treatments.filter((t) => t.trim());
  const hasAnyData = displayLabel || activeTreatments.length > 0 || tooth.notes.trim();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">السن {tooth.id}</span>
          {displayLabel && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50">
              <span
                className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                style={{ backgroundColor: tooth.color }}
              />
              <span className="text-sm font-medium text-gray-700">{displayLabel}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {!hasAnyData && (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-sm font-medium text-green-700">سن سليم</p>
            <p className="text-xs text-green-600 mt-1">لا توجد أي إجراءات أو أعمال على هذا السن</p>
          </div>
        )}

        {displayLabel && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">الإجراء</p>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <span
                className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                style={{ backgroundColor: tooth.color }}
              />
              <span className="text-sm font-medium text-gray-900">{displayLabel}</span>
            </div>
          </div>
        )}

        {activeTreatments.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">الأعمال المنفذة</p>
              <span className="text-xs text-gray-400">{activeTreatments.length} أعمال</span>
            </div>
            <div className="space-y-2">
              {activeTreatments.map((treatment, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-800">{treatment}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tooth.notes.trim() && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ملاحظات</p>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{tooth.notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}