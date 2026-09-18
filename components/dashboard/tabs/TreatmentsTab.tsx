// components/dashboard/tabs/TreatmentsTab.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Search,
  Trash2,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  Palette,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import getCurrency from "@/client/helpers/getCurrency";
import { fetchTemplates, saveTemplates } from "@/client/helpers/templates";

// ============================================================
// الأنواع
// ============================================================

interface TreatmentAppointment {
  id: string;
  name: string;
  daysFromPrevious: number;
  cost: number;
  notes?: string;
}

interface TreatmentTemplate {
  id: string;
  name: string;
  description?: string;
  totalCost: number;
  appointments: TreatmentAppointment[];
  autoSplitCost: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface TreatmentsTabProps {
  clinicData: any;
  sessions?: any[];
}

// ============================================================
// الثوابت
// ============================================================

const TEMPLATE_COLORS = [
  "#EF4444", "#DC2626", "#3B82F6", "#8B4513",
  "#F59E0B", "#9CA3AF", "#06B6D4", "#EC4899",
  "#7C3AED", "#64748B", "#F97316", "#10B981",
];

const generateId = (): string =>
  `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const USD_TO_SP_RATE = 135;
const usdToSp = (usd: number): number => Math.round(usd * USD_TO_SP_RATE);
const spToUsd = (sp: number): number =>
  Math.round((sp / USD_TO_SP_RATE) * 100) / 100;

const isSP = () => getCurrency() === "ل.س";

const formatCost = (cost: number): string => {
  if (isSP()) return `${usdToSp(cost).toLocaleString()} ل.س`;
  return `${cost}$`;
};

// ============================================================
// إدخال الأرقام - بدون مساطر، بدعم تفريغ الحقل
// ============================================================

const toEnglishDigits = (value: string): string =>
  value
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

const keepDigitsOnly = (v: string) => toEnglishDigits(v).replace(/[^0-9]/g, "");
const keepDecimal = (v: string) => {
  let s = toEnglishDigits(v).replace(/[^0-9.]/g, "");
  const parts = s.split(".");
  if (parts.length > 2) s = parts[0] + "." + parts.slice(1).join("");
  return s;
};

// ============================================================
// خوارزمية تقسيم السعر — بدون فواصل عشرية
// ============================================================

const applyAutoSplit = (tpl: TreatmentTemplate): TreatmentTemplate => {
  if (!tpl.autoSplitCost || tpl.appointments.length === 0) return tpl;

  const sp = isSP();
  const total = sp ? usdToSp(tpl.totalCost) : Math.round(tpl.totalCost);
  const count = tpl.appointments.length;
  const base = Math.floor(total / count);
  const remainder = total - base * count;

  return {
    ...tpl,
    appointments: tpl.appointments.map((a, i) => {
      const currentCost = base + (i < remainder ? 1 : 0);
      return { ...a, cost: sp ? spToUsd(currentCost) : currentCost };
    }),
  };
};

// ============================================================
// قوالب افتراضية
// ============================================================

const createDefaultTemplates = (): TreatmentTemplate[] => [
  {
    id: generateId(), name: "قلع سن عادي", description: "خلع سن بسيط",
    totalCost: 5, autoSplitCost: false, color: "#EF4444",
    appointments: [{ id: generateId(), name: "تخدير وقلع السن", daysFromPrevious: 1, cost: 5 }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "قلع جراحي", description: "قلع أسنان مطمورة",
    totalCost: 15, autoSplitCost: true, color: "#DC2626",
    appointments: [
      { id: generateId(), name: "استشارة وتصوير", daysFromPrevious: 1, cost: 2.5 },
      { id: generateId(), name: "العملية الجراحية", daysFromPrevious: 3, cost: 10 },
      { id: generateId(), name: "إزالة الغرز", daysFromPrevious: 7, cost: 2.5 },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "حشوة تجميلية", description: "حشوة بلون السن",
    totalCost: 7.5, autoSplitCost: false, color: "#3B82F6",
    appointments: [{ id: generateId(), name: "إزالة التسوس والحشو", daysFromPrevious: 1, cost: 7.5 }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "معالجة لبية", description: "علاج عصب الأسنان",
    totalCost: 15, autoSplitCost: true, color: "#8B4513",
    appointments: [
      { id: generateId(), name: "فتح العصب", daysFromPrevious: 1, cost: 5 },
      { id: generateId(), name: "تنظيف القنوات", daysFromPrevious: 3, cost: 5 },
      { id: generateId(), name: "الحشو النهائي", daysFromPrevious: 5, cost: 5 },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "تلبيسة زيركون", description: "تاج زيركون",
    totalCost: 35, autoSplitCost: true, color: "#F59E0B",
    appointments: [
      { id: generateId(), name: "تحضير السن وطبعة", daysFromPrevious: 1, cost: 17.5 },
      { id: generateId(), name: "تركيب التلبيسة", daysFromPrevious: 7, cost: 17.5 },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "تلبيسة بورسلين", description: "تاج بورسلين",
    totalCost: 20, autoSplitCost: true, color: "#9CA3AF",
    appointments: [
      { id: generateId(), name: "تحضير السن وطبعة", daysFromPrevious: 1, cost: 10 },
      { id: generateId(), name: "تركيب التلبيسة", daysFromPrevious: 7, cost: 10 },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "تنظيف أسنان", description: "إزالة الجير",
    totalCost: 4, autoSplitCost: false, color: "#06B6D4",
    appointments: [{ id: generateId(), name: "إزالة الجير والتلميع", daysFromPrevious: 1, cost: 4 }],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "تبييض أسنان", description: "تبييض بالليزر",
    totalCost: 25, autoSplitCost: true, color: "#EC4899",
    appointments: [
      { id: generateId(), name: "تبييض بالليزر", daysFromPrevious: 1, cost: 20 },
      { id: generateId(), name: "متابعة وتقييم", daysFromPrevious: 7, cost: 5 },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "تقويم معدني", description: "تقويم أسنان",
    totalCost: 300, autoSplitCost: false, color: "#7C3AED",
    appointments: [
      { id: generateId(), name: "استشارة وتصوير", daysFromPrevious: 1, cost: 5 },
      { id: generateId(), name: "تركيب التقويم", daysFromPrevious: 7, cost: 150 },
      { id: generateId(), name: "متابعة شهرية", daysFromPrevious: 30, cost: 145 },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "طقم أسنان كامل", description: "طقم متحرك",
    totalCost: 40, autoSplitCost: true, color: "#64748B",
    appointments: [
      { id: generateId(), name: "طبعة أولية", daysFromPrevious: 1, cost: 10 },
      { id: generateId(), name: "تجربة الطقم", daysFromPrevious: 7, cost: 15 },
      { id: generateId(), name: "التسليم النهائي", daysFromPrevious: 7, cost: 15 },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "جسر أسنان", description: "جسر 3 وحدات",
    totalCost: 60, autoSplitCost: true, color: "#F97316",
    appointments: [
      { id: generateId(), name: "تحضير الأسنان", daysFromPrevious: 1, cost: 30 },
      { id: generateId(), name: "تركيب الجسر", daysFromPrevious: 7, cost: 30 },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(), name: "زراعة سن", description: "زراعة كاملة",
    totalCost: 250, autoSplitCost: false, color: "#10B981",
    appointments: [
      { id: generateId(), name: "استشارة وتصوير", daysFromPrevious: 1, cost: 5 },
      { id: generateId(), name: "زراعة الغرسة", daysFromPrevious: 7, cost: 180 },
      { id: generateId(), name: "كشف الغرسة", daysFromPrevious: 90, cost: 15 },
      { id: generateId(), name: "تركيب التاج", daysFromPrevious: 14, cost: 50 },
    ],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

// ============================================================
// مكوّن Toast — أنيق وغير مزعج
// ============================================================

function Toast({ message }: { message: { type: "success" | "error"; text: string } | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.96 }}
          transition={{ type: "spring", damping: 25, stiffness: 400 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.25)] border border-gray-100"
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={14} strokeWidth={2.5} />
            ) : (
              <AlertCircle size={14} strokeWidth={2.5} />
            )}
          </div>
          <span className="text-[13px] font-medium text-gray-800">{message.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// مكوّن الحقل النصي (مع دعم التفريغ)
// ============================================================

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  ltr,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  ltr?: boolean;
}) {
  const base =
    "w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-transparent text-[13px] text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 outline-none transition-all";
  return (
    <div>
      {label && (
        <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir={ltr ? "ltr" : "rtl"}
          className={base}
        />
      )}
    </div>
  );
}

// ============================================================
// حقل الأيام — يقبل التفريغ بدون تعليق
// ============================================================

function DaysField({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [local, setLocal] = useState(String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setLocal(String(value));
  }, [value]);

  return (
    <div>
      <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">
        بعد كم يوم من الموعد السابق
      </label>
      <input
        type="text"
        inputMode="numeric"
        dir="ltr"
        value={local}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          const n = parseInt(keepDigitsOnly(local)) || 1;
          setLocal(String(n));
          onChange(n);
        }}
        onChange={(e) => {
          const v = keepDigitsOnly(e.target.value);
          setLocal(v);
          if (v !== "") onChange(parseInt(v));
        }}
        placeholder="1"
        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-transparent text-[13px] text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 outline-none transition-all text-center"
      />
    </div>
  );
}

// ============================================================
// حقل السعر — يقبل التفريغ
// ============================================================

function CostField({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const sp = isSP();
  const display = sp ? String(usdToSp(value)) : value === 0 ? "" : String(value);
  const [local, setLocal] = useState(display);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) {
      setLocal(sp ? String(usdToSp(value)) : value === 0 ? "" : String(value));
    }
  }, [value, sp]);

  return (
    <div>
      <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">
        التكلفة ({sp ? "ل.س" : "$"})
      </label>
      <input
        type="text"
        inputMode="decimal"
        dir="ltr"
        value={local}
        onFocus={() => {
          focused.current = true;
        }}
        onBlur={() => {
          focused.current = false;
          const n = parseFloat(keepDecimal(local)) || 0;
          const usd = sp ? spToUsd(n) : n;
          onChange(usd);
          setLocal(sp ? String(usdToSp(usd)) : usd === 0 ? "" : String(usd));
        }}
        onChange={(e) => {
          const v = keepDecimal(e.target.value);
          setLocal(v);
          if (v !== "" && v !== ".") {
            const n = parseFloat(v);
            if (!isNaN(n)) onChange(sp ? spToUsd(n) : n);
          }
        }}
        placeholder="0"
        className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-transparent text-[13px] text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 outline-none transition-all text-center"
      />
    </div>
  );
}

// ============================================================
// نافذة التأكيد — تظهر في وسط الشاشة
// ============================================================

function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "حذف",
  cancelText = "إلغاء",
  onConfirm,
  onClose,
  danger,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}) {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 text-center">
              <div
                className={`w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center ${
                  danger ? "bg-red-50" : "bg-blue-50"
                }`}
              >
                <AlertCircle
                  size={22}
                  className={danger ? "text-red-500" : "text-blue-500"}
                  strokeWidth={2}
                />
              </div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-[12.5px] text-gray-500 leading-relaxed">{message}</p>
            </div>
            <div className="p-3 pt-0 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[13px] font-semibold hover:bg-gray-200 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-colors ${
                  danger
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// محرّر القالب (مشترك)
// ============================================================

function TemplateEditor({
  draft,
  isCreating,
  primaryColor,
  onUpdate,
  onAddAppt,
  onRemoveAppt,
  onUpdateAppt,
  onSave,
  onCancel,
  onDelete,
  isSaving,
  showSaveBar = true,
}: {
  draft: TreatmentTemplate;
  isCreating: boolean;
  primaryColor: string;
  onUpdate: (u: Partial<TreatmentTemplate>) => void;
  onAddAppt: () => void;
  onRemoveAppt: (id: string) => void;
  onUpdateAppt: (id: string, f: keyof TreatmentAppointment, v: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isSaving?: boolean;
  showSaveBar?: boolean;
}) {
  const sum = draft.appointments.reduce((s, a) => s + a.cost, 0);
  const matches = Math.abs(sum - draft.totalCost) < 0.01 || draft.autoSplitCost;

  return (
    <div className="flex flex-col h-full">
      {/* المحتوى */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-6 scrollbar-hide">
        {/* معلومات أساسية */}
        <section className="space-y-3.5">
          <TextField
            label="اسم الإجراء"
            value={draft.name}
            onChange={(v) => onUpdate({ name: v })}
            placeholder="مثال: معالجة لبية"
          />
          <TextField
            label="الوصف (اختياري)"
            value={draft.description || ""}
            onChange={(v) => onUpdate({ description: v })}
            placeholder="وصف مختصر"
          />
        </section>

        {/* اللون */}
        <section>
          <label className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center gap-1.5">
            <Palette size={11} strokeWidth={2.5} />
            لون الشارت السني
          </label>
          <div className="flex gap-2 flex-wrap">
            {TEMPLATE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onUpdate({ color: c })}
                className="relative w-7 h-7 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  boxShadow:
                    draft.color === c
                      ? `0 0 0 2px white, 0 0 0 4px ${c}`
                      : "0 1px 2px rgba(0,0,0,0.08)",
                }}
              >
                {draft.color === c && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12l5 5L20 7"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* السعر والتقسيم */}
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">
                السعر الإجمالي ({isSP() ? "ل.س" : "$"})
              </label>
              <input
                type="text"
                inputMode="decimal"
                dir="ltr"
                defaultValue={isSP() ? usdToSp(draft.totalCost) || "" : draft.totalCost || ""}
                key={`total-${draft.id}`}
                onBlur={(e) => {
                  const n = parseFloat(keepDecimal(e.target.value)) || 0;
                  onUpdate({ totalCost: isSP() ? spToUsd(n) : n });
                  e.target.value = isSP()
                    ? usdToSp(isSP() ? spToUsd(n) : n) === 0
                      ? ""
                      : String(usdToSp(spToUsd(n)))
                    : n === 0
                    ? ""
                    : String(n);
                }}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-transparent text-[13px] text-gray-900 placeholder:text-gray-300 focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 outline-none transition-all text-center"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block">
                تقسيم تلقائي
              </label>
              <button
                onClick={() => onUpdate({ autoSplitCost: !draft.autoSplitCost })}
                className={`w-full py-2.5 rounded-xl text-[12px] font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  draft.autoSplitCost
                    ? "bg-gray-900 text-white"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >
                {draft.autoSplitCost && <Sparkles size={12} />}
                {draft.autoSplitCost ? "مفعّل" : "معطّل"}
              </button>
            </div>
          </div>

          {!draft.autoSplitCost && (
            <motion.div
              layout
              className={`p-2.5 rounded-xl text-[11.5px] font-medium flex items-center gap-2 ${
                matches
                  ? "bg-emerald-50/70 text-emerald-700"
                  : "bg-amber-50/70 text-amber-700"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  matches ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {matches
                ? "مجموع الجلسات متوافق ✓"
                : `المجموع ${formatCost(sum)} بينما الإجمالي ${formatCost(draft.totalCost)}`}
            </motion.div>
          )}
        </section>

        {/* المواعيد */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
              <CalendarDays size={11} strokeWidth={2.5} />
              المواعيد ({draft.appointments.length}/10)
            </label>
          </div>

          <div className="space-y-2">
            {draft.appointments.map((a, i) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="p-3 rounded-2xl bg-gray-50/60 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: draft.color }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-600">
                      الموعد {i + 1}
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveAppt(a.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>

                <input
                  type="text"
                  value={a.name}
                  onChange={(e) => onUpdateAppt(a.id, "name", e.target.value)}
                  placeholder="اسم الموعد"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-transparent text-[12.5px] text-gray-900 placeholder:text-gray-300 focus:border-gray-200 focus:ring-4 focus:ring-gray-100 outline-none transition-all"
                />

                <div className="grid grid-cols-2 gap-2">
                  <DaysField
                    value={a.daysFromPrevious}
                    onChange={(v) => onUpdateAppt(a.id, "daysFromPrevious", v)}
                  />
                  <CostField
                    value={a.cost}
                    onChange={(v) => onUpdateAppt(a.id, "cost", v)}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {draft.appointments.length < 10 && (
            <button
              onClick={onAddAppt}
              className="w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-400 text-[12px] font-medium flex items-center justify-center gap-1.5 hover:border-gray-300 hover:text-gray-600 hover:bg-gray-50/50 transition-all"
            >
              <Plus size={13} strokeWidth={2.5} />
              إضافة موعد
            </button>
          )}
        </section>
      </div>

      {/* أزرار الحفظ */}
      {showSaveBar && (
      <div className="flex-shrink-0 px-5 py-3.5 border-t border-gray-100 bg-white flex gap-2">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex-1 py-3 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg disabled:opacity-60"
          style={{
            backgroundColor: primaryColor,
            boxShadow: `0 4px 14px ${primaryColor}25`,
          }}
        >
          <Save size={14} strokeWidth={2.5} />
          {isCreating ? "إنشاء القالب" : "حفظ"}
        </button>
        {!isCreating && (
          <button
            onClick={onDelete}
            className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
            title="حذف"
          >
            <Trash2 size={15} strokeWidth={2.5} />
          </button>
        )}
      </div>
      )}
    </div>
  );
}

// ============================================================
// المكوّن الرئيسي
// ============================================================

export function TreatmentsTab({ clinicData }: TreatmentsTabProps) {
  const primaryColor = clinicData?.settings?.primaryColor || "#3B82F6";

  const [templates, setTemplates] = useState<TreatmentTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TreatmentTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // تحميل من localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("treatment_templates");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setTemplates(parsed);
      }
    } catch {}
  }, []);

  // مزامنة مع السيرفر
  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      if (!mounted) return;
      setIsSyncing(true);
      try {
        const result = await fetchTemplates();
        if (!mounted) return;
        if (result.success && Array.isArray(result.data)) {
          const serverTemplates = result.data;
          if (serverTemplates.length > 0) {
            setTemplates(serverTemplates);
            localStorage.setItem("treatment_templates", JSON.stringify(serverTemplates));
            window.dispatchEvent(new CustomEvent("treatmentTemplatesChanged"));
          } else {
            const saved = localStorage.getItem("treatment_templates");
            let hasLocal = false;
            try {
              const parsed = saved ? JSON.parse(saved) : [];
              hasLocal = Array.isArray(parsed) && parsed.length > 0;
            } catch {}
            if (!hasLocal) {
              const defaults = createDefaultTemplates();
              setTemplates(defaults);
              localStorage.setItem("treatment_templates", JSON.stringify(defaults));
            }
          }
        }
      } catch {} finally {
        if (mounted) setIsSyncing(false);
      }
    };
    sync();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem("treatment_templates", JSON.stringify(templates));
      window.dispatchEvent(new CustomEvent("treatmentTemplatesChanged"));
    }
  }, [templates]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 2800);
      return () => clearTimeout(t);
    }
  }, [message]);

  const filtered = useMemo(() => {
    if (!searchTerm) return templates;
    const q = searchTerm.toLowerCase();
    return templates.filter((t) => t.name.toLowerCase().includes(q));
  }, [templates, searchTerm]);

  const openTemplate = (tpl: TreatmentTemplate) => {
    setSelectedId(tpl.id);
    setDraft(JSON.parse(JSON.stringify(tpl)));
    setIsCreating(false);
  };

  const openNew = () => {
    const newTpl: TreatmentTemplate = {
      id: generateId(),
      name: "",
      description: "",
      totalCost: 0,
      autoSplitCost: false,
      color: primaryColor,
      appointments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSelectedId(newTpl.id);
    setDraft(newTpl);
    setIsCreating(true);
  };

  const closeEditor = () => {
    setSelectedId(null);
    setDraft(null);
    setIsCreating(false);
  };

  const updateDraft = (updates: Partial<TreatmentTemplate>) => {
    if (!draft) return;
    let updated = { ...draft, ...updates };
    if (updated.autoSplitCost) updated = applyAutoSplit(updated);
    setDraft(updated);
  };

  const addAppointment = () => {
    if (!draft || draft.appointments.length >= 10) return;
    const last = draft.appointments[draft.appointments.length - 1];
    const newAppt: TreatmentAppointment = {
      id: generateId(),
      name: "",
      daysFromPrevious: last ? 2 : 1,
      cost: 0,
    };
    let updated = { ...draft, appointments: [...draft.appointments, newAppt] };
    if (updated.autoSplitCost) updated = applyAutoSplit(updated);
    setDraft(updated);
  };

  const removeAppointment = (id: string) => {
    if (!draft) return;
    let updated = { ...draft, appointments: draft.appointments.filter((a) => a.id !== id) };
    if (updated.autoSplitCost) updated = applyAutoSplit(updated);
    setDraft(updated);
  };

  const updateAppointment = (id: string, field: keyof TreatmentAppointment, value: any) => {
    if (!draft) return;
    const updated = {
      ...draft,
      appointments: draft.appointments.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    };
    setDraft(updated);
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setMessage({ type: "error", text: "أدخل اسم الإجراء" });
      return;
    }
    if (draft.appointments.length === 0) {
      setMessage({ type: "error", text: "أضف موعداً واحداً على الأقل" });
      return;
    }

    let final = { ...draft };
    if (final.autoSplitCost) {
      final = applyAutoSplit(final);
    } else {
      const sum = final.appointments.reduce((s, a) => s + a.cost, 0);
      if (Math.abs(sum - final.totalCost) > 0.01) {
        setMessage({
          type: "error",
          text: `المجموع ${formatCost(sum)} لا يطابق الإجمالي ${formatCost(final.totalCost)}`,
        });
        return;
      }
    }

    final.updatedAt = new Date().toISOString();

    const newTemplates = isCreating
      ? [...templates, final]
      : templates.map((t) => (t.id === final.id ? final : t));

    setTemplates(newTemplates);
    localStorage.setItem("treatment_templates", JSON.stringify(newTemplates));
    window.dispatchEvent(new CustomEvent("treatmentTemplatesChanged"));

    setMessage({ type: "success", text: isCreating ? "تم إنشاء القالب" : "تم الحفظ" });
    closeEditor();

    setIsSaving(true);
    try {
      await saveTemplates(newTemplates);
    } catch {} finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);

    const newTemplates = templates.filter((t) => t.id !== id);
    setTemplates(newTemplates);
    localStorage.setItem("treatment_templates", JSON.stringify(newTemplates));
    window.dispatchEvent(new CustomEvent("treatmentTemplatesChanged"));
    setMessage({ type: "success", text: "تم الحذف" });
    if (selectedId === id) closeEditor();

    try {
      await saveTemplates(newTemplates);
    } catch {}
  };

  // ============================================================
  // Desktop
  // ============================================================
  if (!isMobile) {
    return (
      <div className="h-[calc(100vh-100px)] flex gap-3 p-4" dir="rtl">
        <Toast message={message} />

        {/* القائمة - عمود يمين */}
        <aside className="w-[300px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* الرأس */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold text-gray-900">العلاجات</h2>
              <div className="flex items-center gap-2">
                {isSyncing && (
                  <RefreshCw size={11} className="animate-spin text-gray-300" />
                )}
                <span className="text-[10px] text-gray-400 font-medium">
                  {templates.length}
                </span>
              </div>
            </div>
            <div className="relative">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-8 pl-3 py-2 rounded-lg bg-gray-50 border border-transparent text-[12px] placeholder:text-gray-300 focus:bg-white focus:border-gray-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* القائمة */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 scrollbar-hide">
            {filtered.map((tpl) => {
              const active = selectedId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => openTemplate(tpl)}
                  className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-right transition-all ${
                    active ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tpl.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] truncate ${
                        active ? "font-bold text-gray-900" : "font-medium text-gray-700"
                      }`}
                    >
                      {tpl.name || "بدون اسم"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {tpl.appointments.length} مواعيد · {formatCost(tpl.totalCost)}
                    </p>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[11px] text-gray-300">لا توجد قوالب</p>
              </div>
            )}
          </div>

          {/* زر الإضافة */}
          <div className="p-3 border-t border-gray-50">
            <button
              onClick={openNew}
              className="w-full py-2.5 rounded-xl text-white text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all hover:shadow-md"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 4px 12px ${primaryColor}20`,
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              قالب جديد
            </button>
          </div>
        </aside>

        {/* المحرر - المنطقة اليسرى */}
        <main className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {draft ? (
            <TemplateEditor
              draft={draft}
              isCreating={isCreating}
              primaryColor={primaryColor}
              onUpdate={updateDraft}
              onAddAppt={addAppointment}
              onRemoveAppt={removeAppointment}
              onUpdateAppt={updateAppointment}
              onSave={handleSave}
              onCancel={closeEditor}
              onDelete={() => setConfirmDeleteId(draft.id)}
              isSaving={isSaving}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ backgroundColor: `${primaryColor}0F` }}
              >
                <Sparkles size={22} style={{ color: primaryColor }} strokeWidth={1.8} />
              </div>
              <p className="text-[13px] font-semibold text-gray-700">
                اختر قالباً أو أنشئ واحداً
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                ستظهر تفاصيل القالب هنا
              </p>
            </div>
          )}
        </main>

        <ConfirmDialog
          open={!!confirmDeleteId}
          title="حذف القالب"
          message="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء. ستتم ازالة هذا القالب ايضا من الشارت للمرضى الذين خضعوا لهذا العلاج , لكن المواعيد ستبقى دون حذف"
          onConfirm={handleDelete}
          onClose={() => setConfirmDeleteId(null)}
          danger
        />
      </div>
    );
  }

  // ============================================================
  // Mobile
  // ============================================================
  return (
    <div className="min-h-screen" dir="rtl">
      <Toast message={message} />

      <div className="p-4 pb-28">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[16px] font-bold text-gray-900">العلاجات</h1>
          {isSyncing && <RefreshCw size={12} className="animate-spin text-gray-300" />}
        </div>

        <div className="relative mb-4">
          <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="ابحث عن قالب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-3 rounded-2xl bg-white border border-gray-100 text-[13px] text-gray-900 placeholder:text-gray-300 focus:border-gray-200 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((tpl) => (
            <motion.button
              key={tpl.id}
              whileTap={{ scale: 0.985 }}
              onClick={() => openTemplate(tpl)}
              className="w-full bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 text-right shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
            >
              <span
                className="w-9 h-9 rounded-xl flex-shrink-0"
                style={{ backgroundColor: `${tpl.color}15` }}
              >
                <span className="w-full h-full flex items-center justify-center">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: tpl.color }}
                  />
                </span>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-bold text-gray-900 truncate">
                  {tpl.name || "بدون اسم"}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {tpl.appointments.length} مواعيد · {formatCost(tpl.totalCost)}
                </p>
              </div>
              <ChevronLeft size={16} className="text-gray-300 flex-shrink-0" />
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-[12px] text-gray-400">لا توجد قوالب</p>
            </div>
          )}
        </div>
      </div>

      {/* زر عائم */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={openNew}
        className="fixed bottom-24 left-4 w-14 h-14 rounded-2xl text-white flex items-center justify-center z-30"
        style={{
          backgroundColor: primaryColor,
          boxShadow: `0 10px 30px ${primaryColor}50, 0 4px 12px rgba(0,0,0,0.1)`,
        }}
      >
        <Plus size={22} strokeWidth={2.5} />
      </motion.button>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {draft && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/30 backdrop-blur-[2px] z-[100]"
              onClick={closeEditor}
            />
           <motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 32, stiffness: 320 }}
  className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[28px] flex flex-col"
  style={{
    maxHeight: "94vh",
    height: "94vh", // ✅ ارتفاع ثابت
  }}
>
              {/* مقبض */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-9 h-1 bg-gray-200 rounded-full" />
              </div>

              {/* الرأس */}
              <motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 32, stiffness: 320 }}
  className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[28px] flex flex-col"
  style={{ maxHeight: "94vh", height: "94vh" }}  // ✅ تعديل
>
  {/* مقبض */}
  <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
    <div className="w-9 h-1 bg-gray-200 rounded-full" />
  </div>

{/* الرأس */}
<div className="flex-shrink-0 px-5 py-3 flex items-center justify-between border-b border-gray-50">
  <div className="flex items-center gap-2.5">
    <span
      className="w-2.5 h-2.5 rounded-full"
      style={{ backgroundColor: draft.color }}
    />
    <h2 className="text-[14px] font-bold text-gray-900">
      {draft.name || (isCreating ? "قالب جديد" : "تعديل القالب")}
    </h2>
  </div>
  <button
    onClick={closeEditor}
    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
  >
    <X size={16} strokeWidth={2.5} />
  </button>
</div>

  {/* المحرر - بدون شريط حفظ داخلي */}
  <div className="flex-1 min-h-0">
    <TemplateEditor
      draft={draft}
      isCreating={isCreating}
      primaryColor={primaryColor}
      onUpdate={updateDraft}
      onAddAppt={addAppointment}
      onRemoveAppt={removeAppointment}
      onUpdateAppt={updateAppointment}
      onSave={handleSave}
      onCancel={closeEditor}
      onDelete={() => setConfirmDeleteId(draft.id)}
      isSaving={isSaving}
      showSaveBar={false}  // ✅ جديد - أخفِ الشريط الداخلي
    />
  </div>

  {/* ✅ شريط الأزرار الثابت خارج المحرر */}
  <div className="flex-shrink-0 px-5 py-3.5 border-t border-gray-100 bg-white flex gap-2">
    <button
      onClick={handleSave}
      disabled={isSaving}
      className="flex-1 py-3 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-60"
      style={{
        backgroundColor: primaryColor,
        boxShadow: `0 4px 14px ${primaryColor}25`,
      }}
    >
      <Save size={14} strokeWidth={2.5} />
      {isCreating ? "إنشاء القالب" : "حفظ"}
    </button>
    {!isCreating && (
      <button
        onClick={() => setConfirmDeleteId(draft.id)}
        className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
      >
        <Trash2 size={15} strokeWidth={2.5} />
      </button>
    )}
  </div>
</motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="حذف القالب"
        message="هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء. ستتم ازالة هذا القالب ايضا من الشارت للمرضى الذين خضعوا لهذا العلاج , لكن المواعيد ستبقى دون حذف"
        onConfirm={handleDelete}
        onClose={() => setConfirmDeleteId(null)}
        danger
      />
    </div>
  );
}