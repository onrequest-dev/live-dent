// components/ToothChart/ToothChart.tsx
"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToothChartSVG } from "./ToothChartSVG";
import { ToothInfoPanel } from "./ToothInfoPanel";
import {
  Stethoscope,
  Save,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { fetchDentalChart, saveDentalChart } from "@/client/helpers/dental-chart";
import { ToothChartSkeleton } from "./ToothChartSkeleton";

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

export interface ToothChartProps {
  patientId?: string;
  patientName?: string;
  clinicId?: string;
  initialTeethData?: ToothData[];
  onSave?: (teethData: ToothData[]) => Promise<void>;
  editable?: boolean;
  className?: string;
  primaryColor?: string;
  onDirtyChange?: (isDirty: boolean) => void;
}

// نوع المرجع الذي سيتم تعريضه للمكون الأب
export interface ToothChartRef {
  save: () => Promise<void>;
}

// ============================================================
// بيانات الإجراءات والألوان
// ============================================================

export const PROCEDURES: {
  type: ProcedureType;
  label: string;
  color: string;
}[] = [
  { type: "sound", label: "سليم", color: "#FFFFFF" },
  { type: "decayed", label: "متسوس", color: "#bcef44" },
  { type: "filled", label: "محشو", color: "#3B82F6" },
  { type: "crown", label: "تاج", color: "#F59E0B" },
  { type: "root-canal", label: "معالجة لبية", color: "#8B4513" },
  { type: "implant", label: "زرعة", color: "#10B981" },
  { type: "missing", label: "مفقود", color: "#9CA3AF" },
  { type: "custom", label: "مخصص", color: "#DC2626" },
];

export const PROCEDURE_COLORS: Record<ProcedureType, string> = {
  sound: "#FFFFFF",
  decayed: "#bcef44",
  filled: "#3B82F6",
  crown: "#F59E0B",
  "root-canal": "#8B4513",
  implant: "#10B981",
  missing: "#9CA3AF",
  custom: "#DC2626",
};

export const PROCEDURE_LABELS: Record<ProcedureType, string> = {
  sound: "سليم",
  decayed: "متسوس",
  filled: "محشو",
  crown: "تاج",
  "root-canal": "معالجة لبية",
  implant: "زرعة",
  missing: "مفقود",
  custom: "مخصص",
};

// ============================================================
// البيانات الافتراضية للشارت
// ============================================================

const DEFAULT_TEETH_DATA: ToothData[] = [
  // الضواحك والقواطع العلوية اليمنى (1-8)
  {
    id: 1,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 2,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 3,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 4,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 5,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 6,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 7,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 8,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  // القواطع العلوية الأمامية (9-12)
  {
    id: 9,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 10,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 11,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 12,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  // الضواحك والقواطع العلوية اليسرى (13-16)
  {
    id: 13,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 14,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 15,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 16,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  // الضواحك والقواطع السفلية اليسرى (17-24)
  {
    id: 17,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 18,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 19,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 20,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 21,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 22,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 23,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 24,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  // القواطع السفلية الأمامية (25-28)
  {
    id: 25,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 26,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 27,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 28,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  // الضواحك والقواطع السفلية اليمنى (29-32)
  {
    id: 29,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 30,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 31,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
  {
    id: 32,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  },
];

// ============================================================
// دوال مساعدة
// ============================================================

function createDefaultToothData(id: number): ToothData {
  return {
    id,
    procedure: "sound",
    color: "#FFFFFF",
    treatments: ["", "", "", "", "", "", "", "", "", ""],
    notes: "",
  };
}

function createAllTeethData(): ToothData[] {
  return Array.from({ length: 32 }, (_, i) => createDefaultToothData(i + 1));
}

function normalizeChartTeeth(
  teeth: {
    toothNumber: number;
    procedure: string;
    customProcedure?: string;
    color: string;
    treatments?: string[];
    notes?: string;
  }[],
): ToothData[] {
  const defaultTeeth = createAllTeethData();

  return defaultTeeth.map((tooth) => {
    const entry = teeth.find((item) => item.toothNumber === tooth.id);
    if (!entry) return tooth;

    const procedure =
      PROCEDURE_COLORS[entry.procedure as ProcedureType] !== undefined
        ? (entry.procedure as ProcedureType)
        : "custom";

    const treatments = entry.treatments
      ? [
          ...entry.treatments,
          ...Array(10 - entry.treatments.length).fill(""),
        ].slice(0, 10)
      : ["", "", "", "", "", "", "", "", "", ""];

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

// ============================================================
// المكون الرئيسي مع forwardRef
// ============================================================

export const ToothChart = forwardRef<ToothChartRef, ToothChartProps>(
  function ToothChart(
    {
      patientId,
      patientName,
      initialTeethData,
      onSave,
      editable = true,
      className = "",
      primaryColor = "#007bff",
      onDirtyChange,
      clinicId, 
    },
    ref,
  ) {
    const [teethData, setTeethData] = useState<ToothData[]>(
      initialTeethData || DEFAULT_TEETH_DATA,
    );
    const originalDataRef = useRef<ToothData[]>(
      initialTeethData || DEFAULT_TEETH_DATA,
    );
    const [isDirty, setIsDirty] = useState(false);
    const [selectedToothId, setSelectedToothId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{
      type: "success" | "error";
      text: string;
    } | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const infoPanelRef = useRef<HTMLDivElement>(null);

    // كشف حجم الشاشة
useEffect(() => {
  const checkMobile = () => {
    const width = window.innerWidth;
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 1200); // كشف التابلت
  };
  checkMobile();
  window.addEventListener("resize", checkMobile);
  return () => window.removeEventListener("resize", checkMobile);
}, []);

    // جلب البيانات من API عند عدم وجود initialTeethData
    useEffect(() => {
      if (!initialTeethData && patientId) {
        const loadDentalChart = async () => {
          setIsLoading(true);
          setFetchError(null);

          try {
            const chartData = await fetchDentalChart(patientId);

            if (chartData && chartData.teeth) {
              const normalized = normalizeChartTeeth(chartData.teeth);
              setTeethData(normalized);
              originalDataRef.current = normalized;
            } else {
              setTeethData(DEFAULT_TEETH_DATA);
              originalDataRef.current = DEFAULT_TEETH_DATA;
            }
          } catch (error: any) {
            setFetchError(error.message || "فشل تحميل بيانات الأسنان");
            setTeethData(DEFAULT_TEETH_DATA);
            originalDataRef.current = DEFAULT_TEETH_DATA;
          } finally {
            setIsLoading(false);
          }
        };

        loadDentalChart();
      }
    }, [patientId, initialTeethData]);

    // تحديث البيانات الأولية عند تغيرها من الخارج
    useEffect(() => {
      if (initialTeethData) {
        setTeethData(initialTeethData);
        originalDataRef.current = initialTeethData;
      }
    }, [initialTeethData]);

    // مقارنة البيانات الحالية مع الأصلية لاكتشاف التغيير
    useEffect(() => {
      const dirty =
        JSON.stringify(teethData) !== JSON.stringify(originalDataRef.current);
      setIsDirty(dirty);
      onDirtyChange?.(dirty);
    }, [teethData, onDirtyChange]);

    // تأثير للتمرير التلقائي عند اختيار سن في وضع الهاتف
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

    // الحصول على بيانات السن المحدد
    const selectedTooth = selectedToothId
      ? teethData.find((t) => t.id === selectedToothId) || null
      : null;

    // معالج النقر على السن
    const handleToothClick = useCallback(
      (toothNumber: number) => {
        if (!editable) return;
        setSelectedToothId((prev) =>
          prev === toothNumber ? null : toothNumber,
        );
      },
      [editable],
    );

    // تحديث بيانات السن
    const handleUpdateTooth = useCallback((updatedTooth: ToothData) => {
      setTeethData((prev) =>
        prev.map((t) => (t.id === updatedTooth.id ? updatedTooth : t)),
      );
    }, []);

    // حفظ البيانات
    const handleSave = useCallback(async () => {
      if (isSaving) return;
      setIsSaving(true);
      setSaveMessage(null);
      try {
        if (onSave) {
          // السلوك القديم: استدعاء الدالة الممررة من الأب
          await onSave(teethData);
        } else if (patientId && clinicId) {
          // ✅ السلوك الداخلي الجديد
          const teethForApi = teethData.map(({ id, ...rest }) => ({
            toothNumber: id, // نحول id إلى toothNumber
            ...rest,
          }));
          await saveDentalChart({
            patientId,
            clinicId,
            teeth: teethForApi, // المفتاح teeth كما يتوقعه الـ API
          });
        } else {
          throw new Error("معرّف المريض أو العيادة غير متوفر");
        }

        // بعد الحفظ الناجح نحدّث المرجع الأصلي
        originalDataRef.current = JSON.parse(JSON.stringify(teethData));
        setIsDirty(false);
        onDirtyChange?.(false);
        setSaveMessage({ type: "success", text: "تم حفظ الشارت بنجاح!" });
      } catch (error: any) {
        setSaveMessage({
          type: "error",
          text:  "فشل حفظ الشارت",
        });
        throw error;
      } finally {
        setIsSaving(false);
      }
    }, [onSave, teethData, isSaving, onDirtyChange, patientId, clinicId]);

    // تعريض دالة الحفظ للمكون الأب
    useImperativeHandle(
      ref,
      () => ({
        save: handleSave,
      }),
      [handleSave],
    );

    // سكيليتون التحميل
    const renderSkeleton = () => (
    <div ref={containerRef} className={`tooth-chart-wrapper ${className}`}>
      <ToothChartSkeleton isMobile={isMobile} />
    </div>
    );

    // رسالة الخطأ
    const renderError = () => (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="text-red-700 font-medium mb-2">خطأ في تحميل البيانات</p>
        <p className="text-red-600 text-sm mb-4">{fetchError}</p>
        <button
          onClick={() => {
            if (!patientId) {
              setFetchError("معرّف المريض غير متوفر");
              return;
            }

            setIsLoading(true);
            setFetchError(null);
            fetchDentalChart(patientId)
              .then((data) => {
                if (data && data.teeth) {
                  const normalized = normalizeChartTeeth(data.teeth);
                  setTeethData(normalized);
                  originalDataRef.current = normalized;
                }
              })
              .catch((err) => setFetchError(err.message))
              .finally(() => setIsLoading(false));
          }}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
        >
          إعادة المحاولة
        </button>
      </div>
    );

    // عرض السكيليتون أو الخطأ أو المحتوى الرئيسي
    if (isLoading && !initialTeethData) {
      return (
        <div ref={containerRef} className={`tooth-chart-wrapper ${className}`}>
          {renderSkeleton()}
        </div>
      );
    }

    if (fetchError && !isLoading) {
      return (
        <div ref={containerRef} className={`tooth-chart-wrapper ${className}`}>
          {renderError()}
        </div>
      );
    }

    return (
      <div ref={containerRef} className={`tooth-chart-wrapper ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Stethoscope
                size={18}
                className="sm:w-5 sm:h-5"
                style={{ color: primaryColor }}
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                الشارت السني
              </h3>
              {patientName && (
                <p className="text-xs text-gray-500">{patientName}</p>
              )}
            </div>
          </div>

          {editable && (onSave || (patientId && clinicId)) && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition-all hover:shadow-md active:scale-95 disabled:opacity-70"
              style={{ background: primaryColor }}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span className="hidden sm:inline">
                {isSaving ? "جاري الحفظ..." : "حفظ"}
              </span>
            </button>
          )}
        </div>

        {/* رسالة الحفظ */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-3 p-3 rounded-xl flex items-center gap-2 text-sm ${
                saveMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <AlertCircle size={16} />
              {saveMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* المحتوى الرئيسي - تخطيط متجاوب */}
        {isMobile ? (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-2">
              <ToothChartSVG
                teethData={teethData}
                selectedToothId={selectedToothId}
                onToothClick={handleToothClick}
                editable={editable}
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
                  <ToothInfoPanel
                    tooth={selectedTooth}
                    onUpdate={handleUpdateTooth}
                    primaryColor={primaryColor}
                    editable={editable}
                    isMobile={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!selectedTooth && (
              <div
                ref={infoPanelRef}
                className="bg-white rounded-2xl border border-gray-100 p-8 text-center"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <ChevronRight size={20} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">
                  اختر سناً من الرسم لعرض معلوماته
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-3 items-start">
<div
  className="bg-white rounded-2xl border border-gray-100 p-2"
  style={{ 
    width: isTablet ? "320px" : "380px", // أصغر في التابلت
    flexShrink: 0 
  }}
>
  <ToothChartSVG
    teethData={teethData}
    selectedToothId={selectedToothId}
    onToothClick={handleToothClick}
    editable={editable}
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
                    <ToothInfoPanel
                      tooth={selectedTooth}
                      onUpdate={handleUpdateTooth}
                      primaryColor={primaryColor}
                      editable={editable}
                      isMobile={false}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl border border-gray-100 p-8 text-center flex flex-col items-center justify-center min-h-[400px]"
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                      <Stethoscope size={28} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">
                      لوحة معلومات السن
                    </p>
                    <p className="text-sm text-gray-400">
                      اختر سناً من الرسم لعرض وتعديل معلوماته
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    );
  },
);
