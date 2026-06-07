// components/ToothChart/ToothChart.tsx
"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
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

// ============================================================
// أنواع البيانات
// ============================================================

// 6 إجراءات رئيسية + إجراء مخصص
export type ProcedureType = 
  | "sound"           // سليم - أبيض
  | "decayed"         // متسوس - أحمر
  | "filled"          // محشو - أزرق
  | "crown"           // تاج - ذهبي
  | "root-canal"      // معالجة لبية - بني
  | "implant"
  | "missing"         // زرعة - أخضر
  | "custom";         // مخصص - أحمر غامق

export interface ToothData {
  id: number;
  procedure: ProcedureType;
  customProcedure?: string;        // اسم الإجراء المخصص
  color: string;                   // اللون الحالي
  treatments: string[];            // مصفوفة من 10 عناصر للأعمال
  notes: string;                   // ملاحظات عامة
}

export interface ToothChartProps {
  patientId?: string;
  patientName?: string;
  initialTeethData?: ToothData[];
  onSave?: (teethData: ToothData[]) => Promise<void>;
  editable?: boolean;
  className?: string;
  primaryColor?: string;
}

// ============================================================
// بيانات الإجراءات والألوان
// ============================================================

export const PROCEDURES: { type: ProcedureType; label: string; color: string }[] = [
  { type: "sound", label: "سليم", color: "#FFFFFF" },
  { type: "decayed", label: "متسوس", color: "#EF4444" },
  { type: "filled", label: "محشو", color: "#3B82F6" },
  { type: "crown", label: "تاج", color: "#F59E0B" },
  { type: "root-canal", label: "معالجة لبية", color: "#8B4513" },
  { type: "implant", label: "زرعة", color: "#10B981" },
  { type: "missing", label: "مفقود", color: "#9CA3AF" },
  { type: "custom", label: "مخصص", color: "#DC2626" },
];

export const PROCEDURE_COLORS: Record<ProcedureType, string> = {
  sound: "#FFFFFF",
  decayed: "#EF4444",
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
// إنشاء بيانات افتراضية للأسنان
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

// ============================================================
// المكون الرئيسي
// ============================================================
export function ToothChart({
  patientId,
  patientName,
  initialTeethData,
  onSave,
  editable = true,
  className = "",
  primaryColor = "#007bff",
}: ToothChartProps) {
  const [teethData, setTeethData] = useState<ToothData[]>(
    initialTeethData || createAllTeethData()
  );
  const [selectedToothId, setSelectedToothId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // كشف حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // تحديث البيانات الأولية
  useEffect(() => {
    if (initialTeethData) {
      setTeethData(initialTeethData);
    }
  }, [initialTeethData]);

  // الحصول على بيانات السن المحدد
  const selectedTooth = selectedToothId 
    ? teethData.find(t => t.id === selectedToothId) || null
    : null;

  // معالج النقر على السن
  const handleToothClick = useCallback((toothNumber: number) => {
    if (!editable) return;
    setSelectedToothId(prev => prev === toothNumber ? null : toothNumber);
  }, [editable]);

  // تحديث بيانات السن
  const handleUpdateTooth = useCallback((updatedTooth: ToothData) => {
    setTeethData(prev => 
      prev.map(t => t.id === updatedTooth.id ? updatedTooth : t)
    );
  }, []);

  // حفظ البيانات
  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      await onSave(teethData);
      setSaveMessage({ type: "success", text: "تم حفظ البيانات بنجاح" });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      setSaveMessage({ type: "error", text: error?.message || "فشل حفظ البيانات" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={containerRef} className={`tooth-chart-wrapper ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Stethoscope size={18} className="sm:w-5 sm:h-5" style={{ color: primaryColor }} />
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

        {editable && onSave && (
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

      {/* ============================================================ */}
      {/* المحتوى الرئيسي - تخطيط متجاوب */}
      {/* ============================================================ */}
      
      {/* تخطيط الجوال: الرسم في الأعلى، المعلومات في الأسفل */}
      {isMobile ? (
        <div className="flex flex-col gap-4">
          {/* الرسم */}
          <div className="bg-white rounded-2xl border border-gray-100 p-2">
            <ToothChartSVG
              teethData={teethData}
              selectedToothId={selectedToothId}
              onToothClick={handleToothClick}
              editable={editable}
              primaryColor={primaryColor}
            />
          </div>

          {/* لوحة المعلومات */}
          <AnimatePresence>
            {selectedTooth && (
              <motion.div
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

          {/* رسالة عند عدم اختيار سن */}
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
  /* تخطيط سطح المكتب: الشارت على اليسار، المعلومات على اليمين */
  <div className="flex gap-6 items-start">
    {/* الشارت - يسار (أصغر) */}
    <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ width: "420px", flexShrink: 0 }}>
      <ToothChartSVG
        teethData={teethData}
        selectedToothId={selectedToothId}
        onToothClick={handleToothClick}
        editable={editable}
        primaryColor={primaryColor}
      />
    </div>

    {/* لوحة المعلومات - يمين */}
    <div className="flex-1 min-w-0">
      <AnimatePresence mode="wait">
        {selectedTooth ? (
          <motion.div
            key="panel"
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
            <p className="text-gray-500 font-medium mb-1">لوحة معلومات السن</p>
            <p className="text-sm text-gray-400">اختر سناً من الرسم لعرض وتعديل معلوماته</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
)}
    </div>
  );
}