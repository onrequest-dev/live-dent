// components/dashboard/tabs/TreatmentsTab.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  Stethoscope,
  Plus,
  Search,
  Trash2,
  Edit,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Wand2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import getCurrency from '@/client/helpers/getCurrency';

// ============================================================
// الواجهات
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
// الألوان
// ============================================================

const TEMPLATE_COLORS = [
  { color: "#EF4444", label: "أحمر - قلع" },
  { color: "#DC2626", label: "أحمر داكن - جراحة" },
  { color: "#3B82F6", label: "أزرق - حشوة" },
  { color: "#8B4513", label: "بني - عصب" },
  { color: "#F59E0B", label: "ذهبي - زيركون" },
  { color: "#9CA3AF", label: "رمادي - بورسلين" },
  { color: "#06B6D4", label: "سماوي - تنظيف" },
  { color: "#EC4899", label: "وردي - تبييض" },
  { color: "#7C3AED", label: "بنفسجي - تقويم" },
  { color: "#64748B", label: "رمادي داكن - طقم" },
  { color: "#F97316", label: "برتقالي - جسر" },
  { color: "#10B981", label: "أخضر - زراعة" },
];

const generateId = (): string => `tpl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// ============================================================
// تحويل العملة
// ============================================================

const USD_TO_SP_RATE = 135;

// ✅ تحويل من دولار إلى الليرة السورية
const usdToSp = (usd: number): number => Math.round(usd * USD_TO_SP_RATE);

// ✅ تحويل من الليرة إلى دولار
const spToUsd = (sp: number): number => Math.round((sp / USD_TO_SP_RATE) * 100) / 100;

// ✅ تنسيق العرض حسب العملة
const formatCost = (cost: number): string => {
  const currency = getCurrency();
  if (currency === "ل.س") {
    return `${usdToSp(cost)} ل.س`;
  }
  return `${cost}$`;
};

// ✅ تنسيق الإدخال - يعرض القيمة بالعملة الحالية
const getInputValue = (cost: number): string => {
  const currency = getCurrency();
  if (currency === "ل.س") {
    return usdToSp(cost).toString();
  }
  return cost.toString();
};

// ✅ تحويل الإدخال إلى دولار (التخزين دائماً بالدولار)
const parseInputToUsd = (value: string): number => {
  const cleaned = cleanNumberInput(value);
  const num = parseFloat(cleaned) || 0;
  const currency = getCurrency();
  if (currency === "ل.س") {
    return spToUsd(num);
  }
  return num;
};

// ============================================================
// القوالب الافتراضية - بالدولار
// ============================================================

const createDefaultTemplates = (): TreatmentTemplate[] => [
  {
    id: generateId(),
    name: "قلع سن عادي",
    description: "خلع سن بسيط بدون تعقيدات",
    totalCost: 5,
    autoSplitCost: false,
    color: "#EF4444",
    appointments: [
      { id: generateId(), name: "تخدير وقلع السن", daysFromPrevious: 1, cost: 5 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "قلع جراحي",
    description: "قلع أسنان مطمورة أو معقدة",
    totalCost: 15,
    autoSplitCost: true,
    color: "#DC2626",
    appointments: [
      { id: generateId(), name: "استشارة وتصوير", daysFromPrevious: 1, cost: 2.5 },
      { id: generateId(), name: "العملية الجراحية", daysFromPrevious: 3, cost: 10 },
      { id: generateId(), name: "إزالة الغرز", daysFromPrevious: 7, cost: 2.5 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "حشوة تجميلية (كمبوزيت)",
    description: "حشوة بلون السن",
    totalCost: 7.5,
    autoSplitCost: false,
    color: "#3B82F6",
    appointments: [
      { id: generateId(), name: "إزالة التسوس وحشوة بلون السن", daysFromPrevious: 1, cost: 7.5 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "معالجة لبية (عصب)",
    description: "علاج عصب الأسنان",
    totalCost: 15,
    autoSplitCost: true,
    color: "#8B4513",
    appointments: [
      { id: generateId(), name: "فتح العصب", daysFromPrevious: 1, cost: 5 },
      { id: generateId(), name: "تنظيف القنوات", daysFromPrevious: 3, cost: 5 },
      { id: generateId(), name: "الحشو النهائي", daysFromPrevious: 5, cost: 5 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "تلبيسة زيركون",
    description: "تاج زيركون تجميلي",
    totalCost: 35,
    autoSplitCost: true,
    color: "#F59E0B",
    appointments: [
      { id: generateId(), name: "تحضير السن وطبعة + مؤقت", daysFromPrevious: 1, cost: 17.5 },
      { id: generateId(), name: "تركيب التلبيسة النهائية", daysFromPrevious: 7, cost: 17.5 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "تلبيسة بورسلين (معدنية)",
    description: "تاج بورسلين",
    totalCost: 20,
    autoSplitCost: true,
    color: "#9CA3AF",
    appointments: [
      { id: generateId(), name: "تحضير السن وطبعة", daysFromPrevious: 1, cost: 10 },
      { id: generateId(), name: "تركيب التلبيسة النهائية", daysFromPrevious: 7, cost: 10 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "تنظيف أسنان (إزالة جير)",
    description: "إزالة الجير والتلميع",
    totalCost: 4,
    autoSplitCost: false,
    color: "#06B6D4",
    appointments: [
      { id: generateId(), name: "إزالة الجير والتلميع", daysFromPrevious: 1, cost: 4 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "تبييض أسنان",
    description: "تبييض بالليزر",
    totalCost: 25,
    autoSplitCost: true,
    color: "#EC4899",
    appointments: [
      { id: generateId(), name: "تبييض بالليزر", daysFromPrevious: 1, cost: 20 },
      { id: generateId(), name: "متابعة وتقييم", daysFromPrevious: 7, cost: 5 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "تقويم معدني",
    description: "تقويم أسنان",
    totalCost: 300,
    autoSplitCost: false,
    color: "#7C3AED",
    appointments: [
      { id: generateId(), name: "استشارة وتصوير", daysFromPrevious: 1, cost: 5 },
      { id: generateId(), name: "تركيب التقويم", daysFromPrevious: 7, cost: 150 },
      { id: generateId(), name: "متابعة شهرية", daysFromPrevious: 30, cost: 145, notes: "تتكرر شهرياً" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "طقم أسنان كامل (متحرك)",
    description: "طقم متحرك",
    totalCost: 40,
    autoSplitCost: true,
    color: "#64748B",
    appointments: [
      { id: generateId(), name: "طبعة أولية", daysFromPrevious: 1, cost: 10 },
      { id: generateId(), name: "تجربة الطقم", daysFromPrevious: 7, cost: 15 },
      { id: generateId(), name: "التسليم النهائي", daysFromPrevious: 7, cost: 15 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "جسر أسنان (3 وحدات)",
    description: "جسر ثابت",
    totalCost: 60,
    autoSplitCost: true,
    color: "#F97316",
    appointments: [
      { id: generateId(), name: "تحضير الأسنان الداعمة", daysFromPrevious: 1, cost: 30 },
      { id: generateId(), name: "تركيب الجسر", daysFromPrevious: 7, cost: 30 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: "زراعة سن",
    description: "زراعة كاملة مع التاج",
    totalCost: 250,
    autoSplitCost: false,
    color: "#10B981",
    appointments: [
      { id: generateId(), name: "استشارة وتصوير مقطعي", daysFromPrevious: 1, cost: 5 },
      { id: generateId(), name: "زراعة الغرسة", daysFromPrevious: 7, cost: 180 },
      { id: generateId(), name: "كشف الغرسة", daysFromPrevious: 90, cost: 15 },
      { id: generateId(), name: "تركيب التاج النهائي", daysFromPrevious: 14, cost: 50 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================
// تنظيف الأرقام
// ============================================================

const cleanNumberInput = (value: string): string => {
  const arabicToEnglish = value
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
  return arabicToEnglish.replace(/[^0-9.]/g, "");
};

// ============================================================
// المكون الرئيسي
// ============================================================

export function TreatmentsTab({ clinicData, sessions = [] }: TreatmentsTabProps) {
  const primaryColor = clinicData?.settings?.primaryColor || "#3B82F6";
  const currencySymbol = getCurrency();
  const isSP = currencySymbol === "ل.س";
  
  const [templates, setTemplates] = useState<TreatmentTemplate[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<TreatmentTemplate | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("treatment_templates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTemplates(parsed);
          return;
        }
      } catch {}
    }
    const defaults = createDefaultTemplates();
    setTemplates(defaults);
    localStorage.setItem("treatment_templates", JSON.stringify(defaults));
  }, []);

  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem("treatment_templates", JSON.stringify(templates));
      window.dispatchEvent(new CustomEvent("treatmentTemplatesChanged"));
    }
  }, [templates]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const filtered = useMemo(() => {
    if (!searchTerm) return templates;
    const q = searchTerm.toLowerCase();
    return templates.filter(t => t.name.toLowerCase().includes(q));
  }, [templates, searchTerm]);

  const applyAutoSplit = (tpl: TreatmentTemplate): TreatmentTemplate => {
    if (!tpl.autoSplitCost || tpl.appointments.length === 0) return tpl;
    const count = tpl.appointments.length;
    const base = Math.floor((tpl.totalCost / count) * 100) / 100;
    const remainder = Math.round((tpl.totalCost - base * (count - 1)) * 100) / 100;
    return {
      ...tpl,
      appointments: tpl.appointments.map((a, i) => ({
        ...a,
        cost: i === count - 1 ? remainder : base,
      })),
    };
  };

  const handleSave = () => {
    if (!editForm) return;
    if (!editForm.name.trim()) {
      setMessage({ type: 'error', text: 'أدخل اسم الإجراء' });
      return;
    }
    if (editForm.appointments.length === 0) {
      setMessage({ type: 'error', text: 'أضف موعداً واحداً على الأقل' });
      return;
    }

    let final = { ...editForm };
    if (final.autoSplitCost) {
      final = applyAutoSplit(final);
    } else {
      const sum = final.appointments.reduce((s, a) => s + a.cost, 0);
      if (Math.abs(sum - final.totalCost) > 0.01) {
        const sumDisplay = isSP ? usdToSp(sum) : sum;
        const totalDisplay = isSP ? usdToSp(final.totalCost) : final.totalCost;
        setMessage({ type: 'error', text: `مجموع الجلسات (${sumDisplay}${currencySymbol}) ≠ السعر الإجمالي (${totalDisplay}${currencySymbol})` });
        return;
      }
    }

    final.updatedAt = new Date().toISOString();

    if (isCreating) {
      setTemplates(prev => [...prev, final]);
      setMessage({ type: 'success', text: 'تم إنشاء القالب' });
    } else {
      setTemplates(prev => prev.map(t => t.id === final.id ? final : t));
      setMessage({ type: 'success', text: 'تم حفظ التعديلات' });
    }
    setIsEditing(false);
    setEditForm(null);
  };

  if (isEditing && editForm) {
    return (
      <TemplateEditor
        template={editForm}
        primaryColor={primaryColor}
        onSave={handleSave}
        onCancel={() => { setIsEditing(false); setEditForm(null); }}
        onUpdate={(updates) => setEditForm({ ...editForm, ...updates })}
        onAddAppt={() => {
          if (editForm.appointments.length >= 10) return;
          const last = editForm.appointments[editForm.appointments.length - 1];
          setEditForm({
            ...editForm,
            appointments: [...editForm.appointments, {
              id: generateId(),
              name: "",
              daysFromPrevious: last ? 2 : 1,
              cost: 0,
            }],
          });
        }}
        onRemoveAppt={(id) => setEditForm({ ...editForm, appointments: editForm.appointments.filter(a => a.id !== id) })}
        onUpdateAppt={(id, field, value) => setEditForm({
          ...editForm,
          appointments: editForm.appointments.map(a => a.id === id ? { ...a, [field]: value } : a),
        })}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto p-3 pb-20" dir="rtl">
      <div className="text-center mb-5">
        <h1 className="text-xl font-bold text-gray-900">قوالب العلاجات</h1>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-3 p-3 rounded-xl text-sm flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="ابحث عن قالب..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <button onClick={() => {
          const newTpl: TreatmentTemplate = {
            id: generateId(), name: "", description: "", totalCost: 0, autoSplitCost: false,
            color: TEMPLATE_COLORS[0].color, appointments: [],
            createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          };
          setEditForm(newTpl); setIsCreating(true); setIsEditing(true);
        }} className="px-4 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-1" style={{ backgroundColor: primaryColor }}>
          <Plus size={16} /> جديد
        </button>
      </div>

      <div className="space-y-2">
        {filtered.map((tpl, idx) => {
          const isOpen = expandedId === tpl.id;
          const sum = tpl.appointments.reduce((s, a) => s + a.cost, 0);
          const matches = Math.abs(sum - tpl.totalCost) < 0.01 || tpl.autoSplitCost;
          return (
            <motion.div key={tpl.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button onClick={() => setExpandedId(isOpen ? null : tpl.id)}
                className="w-full p-3.5 flex items-center gap-3 text-right hover:bg-gray-50">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tpl.color }} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900">{tpl.name}</p>
                  <p className="text-[11px] text-gray-500">{tpl.appointments.length} مواعيد</p>
                </div>
                <span className="font-bold text-sm text-gray-800">{formatCost(tpl.totalCost)}</span>
                {!matches && <AlertCircle size={14} className="text-red-400 flex-shrink-0" />}
                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-1.5">
                      {tpl.appointments.map((a, i) => (
                        <div key={a.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                          <span className="text-xs text-gray-700 flex-1 truncate">{a.name}</span>
                          <span className="text-[10px] text-gray-400">بعد {a.daysFromPrevious} يوم</span>
                          <span className="text-xs font-bold text-gray-700">{formatCost(a.cost)}</span>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => { setEditForm(JSON.parse(JSON.stringify(tpl))); setIsCreating(false); setIsEditing(true); }}
                          className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium flex items-center justify-center gap-1">
                          <Edit size={13} /> تعديل
                        </button>
                        <button onClick={() => setShowDelete(tpl.id)}
                          className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium flex items-center justify-center gap-1">
                          <Trash2 size={13} /> حذف
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDelete(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-5 max-w-xs w-full" onClick={e => e.stopPropagation()}>
              <p className="font-bold text-gray-900 mb-1">حذف القالب</p>
              <p className="text-sm text-gray-500 mb-4">هل أنت متأكد؟</p>
              <div className="flex gap-2">
                <button onClick={() => { setTemplates(prev => prev.filter(t => t.id !== showDelete)); setShowDelete(null); }}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm">حذف</button>
                <button onClick={() => setShowDelete(null)} className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm">إلغاء</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// محرر القالب
// ============================================================

interface TemplateEditorProps {
  template: TreatmentTemplate;
  primaryColor: string;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (updates: Partial<TreatmentTemplate>) => void;
  onAddAppt: () => void;
  onRemoveAppt: (id: string) => void;
  onUpdateAppt: (id: string, field: keyof TreatmentAppointment, value: any) => void;
}

function TemplateEditor({ template, primaryColor, onSave, onCancel, onUpdate, onAddAppt, onRemoveAppt, onUpdateAppt }: TemplateEditorProps) {
  const currencySymbol = getCurrency();
  const isSP = currencySymbol === "ل.س";
  const sum = template.appointments.reduce((s, a) => s + a.cost, 0);
  const matches = Math.abs(sum - template.totalCost) < 0.01 || template.autoSplitCost;
  const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white placeholder:text-gray-400";

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto p-3 pb-20" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">{template.name || "قالب جديد"}</h2>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100"><X size={18} className="text-gray-500" /></button>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">اسم الإجراء *</label>
            <input type="text" value={template.name} onChange={e => onUpdate({ name: e.target.value })} className={inputCls} placeholder="مثال: معالجة لبية" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">الوصف (اختياري)</label>
            <input type="text" value={template.description || ""} onChange={e => onUpdate({ description: e.target.value })} className={inputCls} placeholder="وصف مختصر" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1.5 block">اللون في الشارت</label>
            <div className="flex gap-1.5 flex-wrap">
              {TEMPLATE_COLORS.map(c => (
                <button key={c.color} onClick={() => onUpdate({ color: c.color })} title={c.label}
                  className={`w-8 h-8 rounded-full transition-all ${template.color === c.color ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c.color }} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">
                السعر الإجمالي ({isSP ? 'ل.س' : '$'})
              </label>
              <input
                type="text" inputMode="decimal" dir="ltr"
                value={getInputValue(template.totalCost)}
                onChange={e => onUpdate({ totalCost: parseInputToUsd(e.target.value) })}
                className={inputCls} placeholder={isSP ? "0" : "0.00"}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">تقسيم تلقائي للسعر</label>
              <button onClick={() => onUpdate({ autoSplitCost: !template.autoSplitCost })}
                className={`w-full py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                  template.autoSplitCost ? 'border-purple-400 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-400'
                }`}>
                {template.autoSplitCost ? '✓ مفعل' : 'غير مفعل'}
              </button>
            </div>
          </div>

          {!template.autoSplitCost && (
            <div className={`p-2.5 rounded-lg text-xs font-medium ${matches ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {matches
                ? '✓ مجموع الجلسات متوافق مع السعر الإجمالي'
                : `⚠ المجموع (${formatCost(sum)}) ≠ الإجمالي (${formatCost(template.totalCost)})`}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3">المواعيد ({template.appointments.length}/10)</h3>

          <div className="space-y-2.5">
            {template.appointments.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">موعد {i + 1}</span>
                  <button onClick={() => onRemoveAppt(a.id)} className="p-1 rounded-lg hover:bg-red-50">
                    <Trash2 size={13} className="text-red-400" />
                  </button>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 mb-0.5 block">اسم الموعد</label>
                  <input type="text" value={a.name} onChange={e => onUpdateAppt(a.id, 'name', e.target.value)}
                    className={inputCls} placeholder="مثال: فتح العصب" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500 mb-0.5 block">بعد كم يوم من الموعد السابق</label>
                    <input type="text" inputMode="numeric" dir="ltr" value={a.daysFromPrevious.toString()}
                      onChange={e => onUpdateAppt(a.id, 'daysFromPrevious', parseInt(cleanNumberInput(e.target.value)) || 1)}
                      className={inputCls} placeholder="1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 mb-0.5 block">
                      التكلفة ({isSP ? 'ل.س' : '$'})
                    </label>
                    <input
                      type="text" inputMode="decimal" dir="ltr"
                      value={getInputValue(a.cost)}
                      onChange={e => onUpdateAppt(a.id, 'cost', parseInputToUsd(e.target.value))}
                      className={inputCls} placeholder={isSP ? "0" : "0.00"}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {template.appointments.length < 10 && (
            <button onClick={onAddAppt}
              className="mt-3 w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all">
              <Plus size={16} />
              إضافة موعد جديد
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={onSave} className="flex-1 py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-1.5"
            style={{ backgroundColor: primaryColor }}>
            <Save size={16} /> حفظ القالب
          </button>
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium">إلغاء</button>
        </div>
      </div>
    </motion.div>
  );
}