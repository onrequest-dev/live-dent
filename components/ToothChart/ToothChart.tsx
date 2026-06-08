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


// components/ToothChart/ToothChart.tsx
// ... في بداية الملف، بعد التعريفات

// البيانات الافتراضية للشارت
const DEFAULT_TEETH_DATA: ToothData[] = [
  // الضواحك والقواطع العلوية اليمنى (1-8)
  { id: 1, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 2, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 3, procedure: "decayed", color: "#bcef44", treatments: ["إزالة التسوس", "حشوة مؤقتة", "", "", "", "", "", "", "", ""], notes: "يحتاج متابعة بعد أسبوع" },
  { id: 4, procedure: "filled", color: "#3B82F6", treatments: ["حشوة دائمة", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 5, procedure: "crown", color: "#F59E0B", treatments: ["تحضير السن", "طبعات", "تركيب تاج مؤقت", "تركيب تاج دائم", "", "", "", "", "", ""], notes: "تاج زركونيا" },
  { id: 6, procedure: "root-canal", color: "#8B4513", treatments: ["فتح اللب", "تنظيف القنوات", "حشو القنوات", "", "", "", "", "", "", ""], notes: "3 قنوات" },
  { id: 7, procedure: "implant", color: "#10B981", treatments: ["زرع", "انتظار الالتحام", "تركيب الدعامة", "تركيب التاج", "", "", "", "", "", ""], notes: "زرعة ألمانية" },
  { id: 8, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  
  // القواطع العلوية الأمامية (9-10)
  { id: 9, procedure: "custom", customProcedure: "تبييض بالليزر", color: "#DC2626", treatments: ["جلسة تبييض 1", "جلسة تبييض 2", "", "", "", "", "", "", "", ""], notes: "نتيجة ممتازة" },
  { id: 10, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  
  // القواطع العلوية الأمامية (11-12)
  { id: 11, procedure: "filled", color: "#3B82F6", treatments: ["حشوة تجميلية", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 12, procedure: "crown", color: "#F59E0B", treatments: ["تاج إيماكس", "", "", "", "", "", "", "", "", ""], notes: "تاج تجميلي" },
  
  // الضواحك والقواطع العلوية اليسرى (13-16)
  { id: 13, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 14, procedure: "decayed", color: "#bcef44", treatments: ["كشف تسوس", "", "", "", "", "", "", "", "", ""], notes: "تسوس بسيط" },
  { id: 15, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 16, procedure: "missing", color: "#9CA3AF", treatments: ["خلع", "", "", "", "", "", "", "", "", ""], notes: "تم الخلع منذ 3 أشهر" },
  
  // الضواحك والقواطع السفلية اليسرى (17-24)
  { id: 17, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 18, procedure: "filled", color: "#3B82F6", treatments: ["حشوة أملغم", "", "", "", "", "", "", "", "", ""], notes: "حشوة قديمة" },
  { id: 19, procedure: "root-canal", color: "#8B4513", treatments: ["معالجة لبية", "حشو قنوات", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 20, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 21, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 22, procedure: "decayed", color: "#bcef44", treatments: ["تسوس بين الأسنان", "", "", "", "", "", "", "", "", ""], notes: "يحتاج أشعة" },
  { id: 23, procedure: "crown", color: "#F59E0B", treatments: ["تاج معدني سيراميك", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 24, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  
  // القواطع السفلية الأمامية (25-26)
  { id: 25, procedure: "filled", color: "#3B82F6", treatments: ["حشوة", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 26, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  
  // القواطع السفلية الأمامية (27-28)
  { id: 27, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 28, procedure: "sound", color: "#FFFFFF", treatments: ["", "", "", "", "", "", "", "", "", ""], notes: "" },
  
  // الضواحك والقواطع السفلية اليمنى (29-32)
  { id: 29, procedure: "implant", color: "#10B981", treatments: ["زرعة", "تركيب تاج", "", "", "", "", "", "", "", ""], notes: "زرعة سويسرية" },
  { id: 30, procedure: "decayed", color: "#bcef44", treatments: ["تسوس عميق", "", "", "", "", "", "", "", "", ""], notes: "قد يحتاج معالجة لبية" },
  { id: 31, procedure: "filled", color: "#3B82F6", treatments: ["حشوة", "", "", "", "", "", "", "", "", ""], notes: "" },
  { id: 32, procedure: "crown", color: "#F59E0B", treatments: ["تاج", "", "", "", "", "", "", "", "", ""], notes: "" },
];




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
    initialTeethData || DEFAULT_TEETH_DATA
  );
  const [selectedToothId, setSelectedToothId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 👈 إضافة مرجع للوحة المعلومات
  const infoPanelRef = useRef<HTMLDivElement>(null);

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

  // 👈 إضافة تأثير للتمرير التلقائي عند اختيار سن في وضع الهاتف
  useEffect(() => {
    if (isMobile && selectedToothId && infoPanelRef.current) {
      // تأخير بسيط للتأكد من تحميل العنصر في DOM (خاصة مع AnimatePresence)
      const timer = setTimeout(() => {
        infoPanelRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 150); // تأخير قصير للسماح بـ AnimatePresence بالبدء
      
      return () => clearTimeout(timer);
    }
  }, [selectedToothId, isMobile]);

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

          {/* 👈 لوحة المعلومات - تمت إضافة ref للتمرير إليها */}
          <AnimatePresence>
            {selectedTooth && (
              <motion.div
                ref={infoPanelRef}  // 👈 إسناد المرجع هنا
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

          {/* رسالة عند عدم اختيار سن - تمت إضافة ref هنا أيضاً */}
          {!selectedTooth && (
            <div ref={infoPanelRef} className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
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