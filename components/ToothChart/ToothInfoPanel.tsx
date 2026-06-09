// components/ToothChart/ToothInfoPanel.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Plus } from "lucide-react";
import { ToothData } from "./ToothChart";

interface ToothInfoPanelProps {
  tooth: ToothData;
  onUpdate: (updatedTooth: ToothData) => void;
  primaryColor: string;
  editable: boolean;
  isMobile: boolean;
}

// قائمة الإجراءات المقترحة للتنبؤ التلقائي
const PROCEDURE_SUGGESTIONS = [
  "معالجة لبية",
  "معالجة لبية مكتملة",
  "معالجة لبية جزئية",
  "معالجة لبية عصب واحد",
  "تنظيف",
  "تنظيف عميق",
  "تنظيف وتلميع",
  "حشوة",
  "حشوة تجميلية",
  "حشوة مؤقتة",
  "حشوة أملغم",
  "حشوة وقائية",
  "تاج",
  "تاج زيركون",
  "تاج بورسلين",
  "تاج إيماكس",
  "تاج مؤقت",
  "زرعة",
  "زرعة مكتملة",
  "زرعة جزئية",
  "قلع",
  "قلع جراحي",
  "قلع بسيط",
  "جسر",
  "جسر ثابت",
  "جسر متحرك",
  "تقويم",
  "تبييض",
  "تبييض بالليزر",
  "فلورايد",
  "فحص",
  "أشعة",
  "خياطة",
  "قص لثة",
  "رفع جيب لثوي",
  "تركيبة",
  "تركيبة متحركة",
  "طقم كامل",
  "طقم جزئي",
  "تبديل حشوة",
  "إعادة معالجة لبية",
  "وتد",
  "بناء تاج",
  "تعديل إطباق",
  "واقي ليلي",
  "علاج لثة",
  "كشف تسوس",
  "إزالة التسوس",
];

// الألوان المتاحة
const AVAILABLE_COLORS = [
  { color: "#EF4444", label: "أحمر" },
  { color: "#3B82F6", label: "أزرق" },
  { color: "#F59E0B", label: "ذهبي" },
  { color: "#8B4513", label: "بني" },
  { color: "#10B981", label: "أخضر" },
  { color: "#9CA3AF", label: "رمادي" },
  { color: "#DC2626", label: "أحمر داكن" },
  { color: "#7C3AED", label: "بنفسجي" },
];

export function ToothInfoPanel({
  tooth,
  onUpdate,
  primaryColor,
  editable,
  isMobile,
}: ToothInfoPanelProps) {
  // حالة الإجراء
  const [procedureInput, setProcedureInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");

  // حالة الأعمال - نتتبع الحقول المضافة محلياً
  const [localTreatments, setLocalTreatments] = useState<string[]>([]);

  // المراجع
  const procedureInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const newTreatmentRef = useRef<HTMLInputElement>(null);

  // تحديث الحالة المحلية عند تغيير السن المحدد
  useEffect(() => {
    const procedureName =
      tooth.customProcedure ||
      (tooth.procedure !== "sound" && tooth.procedure !== "custom"
        ? getProcedureLabel(tooth.procedure)
        : "") ||
      "";

    setProcedureInput(procedureName);
    setSelectedColor(tooth.color || "#FFFFFF");
    setShowSuggestions(false);
    
    // تحميل الأعمال المملوءة فقط
    setLocalTreatments(tooth.treatments.filter(t => t.trim()));
  }, [tooth.id]);

  // إغلاق الاقتراحات عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // الحصول على تسمية الإجراء
  function getProcedureLabel(procedure: string): string {
    const labels: Record<string, string> = {
      sound: "",
      decayed: "تسوس",
      filled: "حشوة",
      crown: "تاج",
      "root-canal": "معالجة لبية",
      implant: "زرعة",
      missing: "مفقود",
    };
    return labels[procedure] || "";
  }

  // حفظ الأعمال للمكون الأب
  const saveTreatmentsToParent = (newTreatments: string[]) => {
    const padded = [...newTreatments];
    while (padded.length < 10) {
      padded.push("");
    }
    onUpdate({ ...tooth, treatments: padded });
  };

  // ========== التنبؤ التلقائي ==========

  const handleProcedureInputChange = (value: string) => {
    setProcedureInput(value);

    if (value.trim().length > 0) {
      const searchTerm = value.trim().toLowerCase();
      const filtered = PROCEDURE_SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(searchTerm)
      ).slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setProcedureInput(suggestion);
    setShowSuggestions(false);
    saveProcedure(suggestion, selectedColor);
  };

  // ========== اختيار اللون ==========

const handleColorSelect = (color: string) => {
  setSelectedColor(color);
  
  // حفظ اللون دائماً، حتى لو لم يكن هناك إجراء مكتوب
  onUpdate({
    ...tooth,
    color,
    // نحتفظ بالإجراء الحالي إذا كان موجوداً، وإلا نبقيه كما هو
  });
};

  // ========== حفظ الإجراء ==========

  const saveProcedure = (name: string, color: string) => {
    if (!name.trim()) return;

    onUpdate({
      ...tooth,
      procedure: "custom",
      color,
      customProcedure: name.trim(),
    });
  };

  const handleProcedureKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (showSuggestions && filteredSuggestions.length > 0) {
        handleSuggestionSelect(filteredSuggestions[0]);
      } else if (procedureInput.trim()) {
        saveProcedure(procedureInput, selectedColor);
        setShowSuggestions(false);
      }
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // إعادة تعيين الإجراء
  const handleResetProcedure = () => {
    setProcedureInput("");
    setSelectedColor("#FFFFFF");
    onUpdate({
      ...tooth,
      procedure: "sound",
      color: "#FFFFFF",
      customProcedure: undefined,
    });
  };

  const hasTreatments = localTreatments.length > 0;
  const hasProcedure = procedureInput.trim() !== "";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">السن {tooth.id}</span>
          {hasProcedure && (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: tooth.color }}
              />
            </div>
          )}
        </div>
        {hasProcedure && editable && (
          <button
            onClick={handleResetProcedure}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            إعادة تعيين
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* ========== قسم الإجراء ========== */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            الإجراء
          </p>

          {/* حقل إدخال الإجراء */}
          <div className="relative" ref={suggestionsRef}>
<input
  ref={procedureInputRef}
  type="search"
  value={procedureInput}
  onChange={(e) => handleProcedureInputChange(e.target.value)}
  onKeyDown={handleProcedureKeyDown}
  onFocus={() => {
    if (procedureInput.trim()) {
      handleProcedureInputChange(procedureInput);
    }
  }}
  onBlur={() => {
    // عند الخروج من الحقل، احفظ الإجراء إذا كان مكتوباً
    if (procedureInput.trim()) {
      saveProcedure(procedureInput, selectedColor);
    }
    setShowSuggestions(false);
  }}
  disabled={!editable}
  placeholder="اكتب اسم الإجراء..."
  // ===== أضف هذه الخصائص لمنع اقتراحات النظام =====
  autoComplete="off"
  autoCorrect="off"
  spellCheck={false}
  // هذه هي المفاتيح الأساسية لمنع شريط الاقتراحات
  enterKeyHint="done"

  // =============================================
  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
/>

           {/* اقتراحات التنبؤ */}
<AnimatePresence>
  {showSuggestions && editable && (
    <motion.div
      initial={{ opacity: 0, y: isMobile ? 5 : -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: isMobile ? 5 : -5 }}
      className={`
        absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50
        ${isMobile ? 'bottom-full mb-1' : 'top-full mt-1'}
      `}
    >
      {(isMobile ? [...filteredSuggestions].reverse() : filteredSuggestions)
        .map((suggestion, i) => (
          <button
            key={i}
            onClick={() => handleSuggestionSelect(suggestion)}
            className="w-full px-4 py-2.5 text-right text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border-b border-gray-50 last:border-0"
          >
            <span className="text-gray-300 text-xs w-5">
              {isMobile ? filteredSuggestions.length - i : i + 1}
            </span>
            {suggestion}
          </button>
        ))}
    </motion.div>
  )}
</AnimatePresence>
          </div>
<div className="flex items-center gap-2 mt-1 px-0 py-2 overflow-x-auto scrollbar-hide">
  <div className="flex items-center gap-0.5 flex-nowrap">
    {AVAILABLE_COLORS.map((c, i) => (
<button
  key={i}
  onClick={() => handleColorSelect(c.color)}
  disabled={!editable}
  title={c.label}
  className={`
    relative h-5 w-7 rounded-md transition-all duration-200 flex-shrink-0
    active:scale-90 touch-manipulation
    disabled:opacity-40 disabled:cursor-not-allowed
    ${
      selectedColor === c.color
        ? "shadow-md"
        : "ring-1 ring-gray-200 active:ring-gray-400"
    }
  `}
  style={{
    backgroundColor: c.color,
    border: "none",
    padding: 0,
    cursor: editable ? "pointer" : "not-allowed",
  }}
>
  {selectedColor === c.color && (
    <span className="absolute inset-0 flex items-center justify-center">
      <Check className="text-white drop-shadow-sm w-3 h-3" strokeWidth={3} />
    </span>
  )}
</button>
    ))}

    {/* خيار بدون لون */}
    <button
      onClick={() => handleColorSelect("#FFFFFF")}
      disabled={!editable}
      title="إزالة اللون"
      className={`
        relative h-5 w-7 rounded-md transition-all duration-200 flex-shrink-0
        active:scale-90 touch-manipulation
        disabled:opacity-40 disabled:cursor-not-allowed
        bg-white border border-dashed
        ${
          selectedColor === "#FFFFFF"
        ? "shadow-md"  
        : "ring-1 ring-gray-200 active:ring-gray-400"
        }
      `}
      style={{
        padding: 0,
        cursor: editable ? "pointer" : "not-allowed",
      }}
    >
      <X
        className={`absolute inset-0 m-auto w-3 h-3 ${
          selectedColor === "#FFFFFF" ? "text-gray-800" : "text-gray-400"
        }`}
        strokeWidth={2.5}
      />
    </button>
  </div>
</div>
        </div>

        {/* فاصل */}
        <div className="h-px bg-gray-100" />

        {/* ========== قسم الأعمال المنفذة ========== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              الأعمال المنفذة
            </p>
          </div>

          <div className="space-y-2">
            {/* عرض الأعمال الحالية */}
            {localTreatments.map((treatment, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <span className="text-[10px] text-gray-300 w-5 text-center flex-shrink-0 font-medium">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={treatment}
                  onChange={(e) => {
                    const newTreatments = [...localTreatments];
                    newTreatments[index] = e.target.value;
                    setLocalTreatments(newTreatments);
                    saveTreatmentsToParent(newTreatments);
                  }}
                  disabled={!editable}
                  placeholder={`عمل ${index + 1}...`}
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 disabled:opacity-50 transition-all"
                />
                {editable && (
<button
  onClick={() => {
    const newTreatments = localTreatments.filter((_, i) => i !== index);
    setLocalTreatments(newTreatments);
    saveTreatmentsToParent(newTreatments);
  }}
  className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center active:bg-red-200 text-gray-400 active:text-red-600 transition-all flex-shrink-0 touch-manipulation"
>
  <X size={10} />
</button>
                )}
              </div>
            ))}

            {/* رسالة إذا لا توجد أعمال */}
            {!hasTreatments && (
              <p className="text-sm text-gray-300 py-4 text-center">
                لا توجد أعمال مسجلة
              </p>
            )}

            {/* زر إضافة عمل جديد */}
            {editable && localTreatments.length < 10 && (
              <button
                onClick={() => {
                  const newTreatments = [...localTreatments, ""];
                  setLocalTreatments(newTreatments);
                  saveTreatmentsToParent(newTreatments);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
              >
                <Plus size={16} />
                <span>إضافة عمل</span>
              </button>
            )}
          </div>
        </div>

        {/* فاصل */}
        <div className="h-px bg-gray-100" />

        {/* ========== قسم الملاحظات ========== */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            ملاحظات
          </p>
          <textarea
            value={tooth.notes}
            onChange={(e) => onUpdate({ ...tooth, notes: e.target.value })}
            disabled={!editable}
            rows={2}
            placeholder="ملاحظات عن هذا السن..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>
    </div>
  );
}