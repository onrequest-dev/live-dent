// components/ToothChart/ToothInfoPanel.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check,
  X,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { 
  ToothData, 
  ProcedureType, 
  PROCEDURES, 
  PROCEDURE_LABELS,
  PROCEDURE_COLORS,
} from "./ToothChart";

interface ToothInfoPanelProps {
  tooth: ToothData;
  onUpdate: (updatedTooth: ToothData) => void;
  primaryColor: string;
  editable: boolean;
  isMobile: boolean;
}

export function ToothInfoPanel({
  tooth,
  onUpdate,
  primaryColor,
  editable,
  isMobile,
}: ToothInfoPanelProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customProcedureName, setCustomProcedureName] = useState("");

  const handleProcedureChange = (procedure: ProcedureType) => {
    if (procedure === "custom") {
      setShowCustomInput(true);
      return;
    }
    
    const procedureData = PROCEDURES.find(p => p.type === procedure);
    onUpdate({
      ...tooth,
      procedure,
      color: procedureData?.color || "#FFFFFF",
      customProcedure: undefined,
    });
    setShowCustomInput(false);
  };

  const handleCustomProcedureSave = () => {
    if (!customProcedureName.trim()) return;
    
    onUpdate({
      ...tooth,
      procedure: "custom",
      color: PROCEDURE_COLORS.custom,
      customProcedure: customProcedureName.trim(),
    });
    setShowCustomInput(false);
    setCustomProcedureName("");
  };

  const handleTreatmentChange = (index: number, value: string) => {
    const newTreatments = [...tooth.treatments];
    newTreatments[index] = value;
    onUpdate({ ...tooth, treatments: newTreatments });
  };

  const addTreatment = () => {
    const emptyIndex = tooth.treatments.findIndex(t => t.trim() === "");
    if (emptyIndex !== -1) return; // يوجد حقل فارغ، لا تضف جديد
    
    if (tooth.treatments.length >= 10) return;
    onUpdate({ ...tooth, treatments: [...tooth.treatments, ""] });
  };

  const removeTreatment = (index: number) => {
    const newTreatments = tooth.treatments.filter((_, i) => i !== index);
    // تأكد من وجود 10 عناصر على الأقل
    while (newTreatments.length < 10) {
      newTreatments.push("");
    }
    onUpdate({ ...tooth, treatments: newTreatments });
  };

  const handleNotesChange = (notes: string) => {
    onUpdate({ ...tooth, notes });
  };

  const isSelected = (type: ProcedureType) => tooth.procedure === type;

  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      {/* Header بسيط */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-900">
            السن {tooth.id}
          </span>
          <div className="flex items-center gap-1.5">
            <span 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tooth.color }}
            />
            <span className="text-sm text-gray-500">
              {tooth.customProcedure || PROCEDURE_LABELS[tooth.procedure]}
            </span>
          </div>
        </div>
        <button
          onClick={() => onUpdate({ 
            ...tooth, 
            procedure: "sound", 
            color: "#FFFFFF", 
            customProcedure: undefined,
            treatments: ["", "", "", "", "", "", "", "", "", ""],
            notes: "",
          })}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          إعادة تعيين
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* الإجراءات */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            الإجراء
          </p>
          
          <div className="space-y-1">
            {PROCEDURES.map((proc) => (
              <button
                key={proc.type}
                onClick={() => handleProcedureChange(proc.type)}
                disabled={!editable}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
                  ${isSelected(proc.type) 
                    ? "bg-gray-50" 
                    : "hover:bg-gray-50/50"
                  }
                  ${!editable ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: proc.color }}
                />
                <span className="text-gray-700 flex-1 text-right">
                  {proc.label}
                </span>
                {isSelected(proc.type) && (
                  <Check size={15} style={{ color: primaryColor }} />
                )}
              </button>
            ))}
          </div>

          {/* إدخال مخصص */}
          <AnimatePresence>
            {showCustomInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 pr-8 pt-1">
                  <input
                    type="text"
                    value={customProcedureName}
                    onChange={(e) => setCustomProcedureName(e.target.value)}
                    placeholder="اسم الإجراء..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-300"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCustomProcedureSave();
                      if (e.key === "Escape") {
                        setShowCustomInput(false);
                        setCustomProcedureName("");
                      }
                    }}
                  />
                  <button
                    onClick={handleCustomProcedureSave}
                    className="px-3 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 transition-colors"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomProcedureName("");
                    }}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* فاصل */}
        <div className="h-px bg-gray-100" />

        {/* الأعمال المنفذة */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              الأعمال المنفذة
            </p>
            {editable && tooth.treatments.filter(t => t.trim()).length < 10 && (
              <button
                onClick={addTreatment}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus size={14} />
                إضافة
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {tooth.treatments.map((treatment, index) => (
              treatment.trim() || (index === tooth.treatments.findIndex(t => t.trim() === "")) ? (
                <div key={index} className="flex items-center gap-2 group">
                  <span className="text-[10px] text-gray-300 w-4 text-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={treatment}
                    onChange={(e) => handleTreatmentChange(index, e.target.value)}
                    disabled={!editable}
                    placeholder="أضف عملاً..."
                    className="flex-1 px-3 py-2 bg-transparent border-b border-gray-100 text-sm focus:border-gray-300 focus:outline-none disabled:opacity-50 placeholder:text-gray-300 transition-colors"
                  />
                  {treatment.trim() && editable && (
                    <button
                      onClick={() => removeTreatment(index)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ) : null
            ))}
            
            {tooth.treatments.every(t => t.trim() === "") && (
              <p className="text-sm text-gray-300 py-3 text-center">
                لا توجد أعمال مسجلة
              </p>
            )}
          </div>
        </div>

        {/* فاصل */}
        <div className="h-px bg-gray-100" />

        {/* الملاحظات */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            ملاحظات
          </p>
          <textarea
            value={tooth.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            disabled={!editable}
            rows={2}
            placeholder="ملاحظات عن هذا السن..."
            className="w-full px-0 py-2 bg-transparent border-b border-gray-100 text-sm focus:border-gray-300 focus:outline-none resize-none disabled:opacity-50 placeholder:text-gray-300 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}