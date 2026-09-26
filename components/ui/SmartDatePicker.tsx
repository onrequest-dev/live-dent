// components/ui/SmartDatePicker.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { format, parseISO, isValid } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  X,
  ChevronUp,
  ChevronDown,
  CalendarX,
  Info,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// ============================================================
// الواجهات
// ============================================================

interface WorkingHour {
  day: number; // 0 = السبت، 1 = الأحد، ...
  start: string;
  end: string;
  isClosed: boolean;
}

interface SmartDatePickerProps {
  value: Date | string;
  onChange: (date: Date) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  primaryColor?: string;
  className?: string;
  workingHours?: any;
}

// ============================================================
// دوال مساعدة
// ============================================================

const normalizeWorkingHours = (workingHours: any): WorkingHour[] => {
  if (!workingHours) return [];

  if (Array.isArray(workingHours)) {
    return workingHours.filter((wh) => wh && typeof wh === "object");
  }

  if (typeof workingHours === "object") {
    const values = Object.values(workingHours);

    if (
      values.length > 0 &&
      values.every((v) => v && typeof v === "object")
    ) {
      return values.map((v: any, index: number) => ({
        day: v.day !== undefined ? v.day : index,
        start: v.start || "09:00",
        end: v.end || "17:00",
        isClosed: v.isClosed || false,
      }));
    }

    const dayMap: { [key: string]: number } = {
      saturday: 0,
      sunday: 1,
      monday: 2,
      tuesday: 3,
      wednesday: 4,
      thursday: 5,
      friday: 6,
    };

    const result: WorkingHour[] = [];
    for (const [key, value] of Object.entries(workingHours)) {
      const dayKey = dayMap[key.toLowerCase()];
      if (dayKey !== undefined && value && typeof value === "object") {
        result.push({
          day: dayKey,
          start: (value as any).start || "09:00",
          end: (value as any).end || "17:00",
          isClosed: (value as any).isClosed || false,
        });
      }
    }

    if (result.length > 0) return result;
  }

  return [];
};

const convertJsDayToOurDay = (jsDay: number): number => {
  const map: { [key: number]: number } = {
    0: 1,
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 0,
  };
  return map[jsDay];
};

// ============================================================
// المكون الرئيسي
// ============================================================

export function SmartDatePicker({
  value,
  onChange,
  placeholder = "اختر التاريخ",
  label,
  required = false,
  error,
  disabled = false,
  minDate,
  maxDate,
  primaryColor = "#4F46E5",
  className = "",
  workingHours,
}: SmartDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [animation, setAnimation] = useState<"slide-up" | "slide-down" | "">("");
  const [isClosing, setIsClosing] = useState(false);
  const [hoveredClosedDay, setHoveredClosedDay] = useState<Date | null>(null);

  // ✅ زر واحد لتجاوز كل القيود
  const [bypassRestrictions, setBypassRestrictions] = useState(false);

  // ✅ قراءة التفضيل من localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("smart_date_picker_bypass");
      if (saved === "true") setBypassRestrictions(true);
    } catch {}
  }, []);

  // ✅ حفظ التفضيل
  useEffect(() => {
    try {
      localStorage.setItem(
        "smart_date_picker_bypass",
        bypassRestrictions ? "true" : "false"
      );
    } catch {}
  }, [bypassRestrictions]);

  // ✅ تطبيع workingHours
  const normalizedWorkingHours = useMemo(
    () => normalizeWorkingHours(workingHours),
    [workingHours]
  );

  // ✅ أيام العطل
  const closedDays = useMemo(
    () =>
      normalizedWorkingHours.filter((wh) => wh.isClosed).map((wh) => wh.day),
    [normalizedWorkingHours]
  );

  // ✅ التحقق إذا كان يوم معين عطلة
  const isDayClosed = useCallback(
    (date: Date): boolean => {
      const jsDay = date.getDay();
      const ourDay = convertJsDayToOurDay(jsDay);
      return closedDays.includes(ourDay);
    },
    [closedDays]
  );

  // تهيئة التاريخ
  useEffect(() => {
    let date: Date;

    if (value instanceof Date && isValid(value)) {
      date = value;
    } else if (typeof value === "string" && value) {
      const parsedDate = parseISO(value);
      date = isValid(parsedDate) ? parsedDate : new Date();
    } else {
      date = new Date();
    }

    setSelectedDate(date);
    setTempSelectedDate(date);
    setCurrentMonth(date);
  }, [value]);

  // ✅ دالة التحقق من تعطيل اليوم
  const isDayDisabled = useCallback(
    (date: Date): boolean => {
      // ✅ إذا كان "تجاوز القيود" مفعّلاً، نسمح بكل شيء
      if (bypassRestrictions) return false;

      // ✅ الوضع الافتراضي: كل القيود مفعّلة
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      // منع الأيام الماضية (اليوم الحالي مسموح)
      if (checkDate < today) return true;

      // احترام minDate (إن وُجد)
      if (minDate) {
        const min = new Date(minDate);
        min.setHours(0, 0, 0, 0);
        if (checkDate < min) return true;
      }

      // احترام maxDate (إن وُجد)
      if (maxDate) {
        const max = new Date(maxDate);
        max.setHours(0, 0, 0, 0);
        if (checkDate > max) return true;
      }

      // منع أيام العطلة
      if (isDayClosed(date)) return true;

      return false;
    },
    [minDate, maxDate, isDayClosed, bypassRestrictions]
  );

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      if (isDayDisabled(date)) return;

      const correctedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12,
        0,
        0
      );

      setTempSelectedDate(correctedDate);
    }
  };

  const handleConfirm = () => {
    if (tempSelectedDate && !isDayDisabled(tempSelectedDate)) {
      setSelectedDate(tempSelectedDate);
      onChange(tempSelectedDate);
      handleClose();
    }
  };

  const handleCancel = () => {
    setTempSelectedDate(selectedDate);
    handleClose();
  };

  const handleToday = () => {
    const today = new Date();
    const normalizedToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
      0,
      0
    );

    if (isDayDisabled(normalizedToday)) return;

    setTempSelectedDate(normalizedToday);
    setCurrentMonth(normalizedToday);
  };

  const handleOpen = () => {
    if (!disabled) {
      setCurrentMonth(selectedDate);
      setTempSelectedDate(selectedDate);
      setIsClosing(false);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setHoveredClosedDay(null);
    }, 250);
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setAnimation(direction === "prev" ? "slide-down" : "slide-up");

    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }

    setTimeout(() => {
      setCurrentMonth(newMonth);
      setAnimation("");
    }, 150);
  };

  const getDateDisplay = () => {
    if (!selectedDate) return placeholder;
    try {
      return format(selectedDate, "dd/MM/yyyy");
    } catch {
      return placeholder;
    }
  };

  const getMonthYearWithNumber = () => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "إبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    const monthNumber = currentMonth.getMonth() + 1;
    const monthName = months[currentMonth.getMonth()];
    const year = currentMonth.getFullYear();
    return `${monthName} (${monthNumber.toString().padStart(2, "0")}) ${year}`;
  };

  const getDayOfWeek = () => {
    return tempSelectedDate.getDay();
  };

  const weekDays = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  // ✅ معلومات عن اليوم المحدد
  const selectedDayInfo = useMemo(() => {
    if (!tempSelectedDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(tempSelectedDate);
    checkDate.setHours(0, 0, 0, 0);

    const isPast = checkDate < today;
    const jsDay = tempSelectedDate.getDay();
    const ourDay = convertJsDayToOurDay(jsDay);
    const wh = normalizedWorkingHours.find((h) => h.day === ourDay);
    const isClosed = !wh || wh.isClosed;

    if (isPast) {
      return {
        isPast: true,
        isClosed,
        label: "تاريخ في الماضي",
      };
    }

    if (isClosed) {
      return {
        isPast: false,
        isClosed: true,
        label: "عطلة - العيادة مغلقة",
      };
    }

    return {
      isPast: false,
      isClosed: false,
      label: `دوام من ${wh!.start} إلى ${wh!.end}`,
    };
  }, [tempSelectedDate, normalizedWorkingHours]);

  // ✅ هل يوجد أي قيد فعّال؟
  const hasRestrictions = useMemo(() => {
    return (
      closedDays.length > 0 ||
      minDate !== undefined ||
      maxDate !== undefined ||
      true // دائماً يوجد منع للأيام الماضية افتراضياً
    );
  }, [closedDays, minDate, maxDate]);

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* Input Button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`
          w-full px-4 py-3 text-right rounded-xl
          border-2 transition-all duration-200
          flex items-center gap-3
          ${
            disabled
              ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
              : "bg-white hover:shadow-md cursor-pointer"
          }
          ${error ? "border-red-400" : "border-gray-200 hover:border-gray-300"}
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${error ? "focus:ring-red-200" : "focus:ring-indigo-200"}
        `}
        style={{
          boxShadow: isOpen ? `0 0 0 3px ${primaryColor}20` : undefined,
        }}
      >
        <CalendarIcon
          size={20}
          className={error ? "text-red-400" : "text-gray-400"}
        />
        <span className="flex-1 truncate text-sm text-gray-900 font-medium">
          {getDateDisplay()}
        </span>

        {/* علامة "عطلة" */}
        {selectedDayInfo?.isClosed && !bypassRestrictions && (
          <span className="text-xs text-amber-500 flex items-center gap-1">
            <AlertTriangle size={12} />
            عطلة
          </span>
        )}

        {/* علامة "ماضي" */}
        {selectedDayInfo?.isPast && !bypassRestrictions && (
          <span className="text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle size={12} />
            ماضي
          </span>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
          {error}
        </p>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 ${
              isClosing ? "opacity-0" : "opacity-100"
            }`}
            onClick={handleClose}
          />

          {/* Calendar Modal */}
          <div
            className={`
              relative bg-white rounded-2xl shadow-2xl w-full max-w-[380px] overflow-hidden
              transition-all duration-300 ease-out
              ${
                isClosing
                  ? "opacity-0 scale-90 translate-y-4"
                  : "opacity-100 scale-100 translate-y-0"
              }
            `}
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  اختر التاريخ
                </h3>

                {/* ✅ زر تجاوز القيود */}
                {/* ✅ مفتاح المواعيد الذكية — بنفس نمط SmartTimePicker */}
{hasRestrictions && (
  <div
    className={`
      flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300
      ${
        !bypassRestrictions
          ? "bg-gradient-to-l from-emerald-50 to-emerald-50/40 border-emerald-200"
          : "bg-gradient-to-l from-amber-50 to-amber-50/40 border-amber-200"
      }
    `}
  >
    {/* النص المصغّر على اليمين */}
    <div className="flex flex-col min-w-0">
      <span
        className={`
          text-[10px] font-bold leading-tight transition-colors duration-200
          ${!bypassRestrictions ? "text-emerald-700" : "text-amber-700"}
        `}
      >
        {!bypassRestrictions ? "المواعيد الذكية" : "تجاوز القيود"}
      </span>
      <span
        className={`
          text-[8.5px] leading-tight transition-colors duration-200 whitespace-nowrap
          ${!bypassRestrictions ? "text-emerald-600/70" : "text-amber-600/70"}
        `}
      >
        {!bypassRestrictions ? "القيود مفعّلة" : "كل الأيام متاحة"}
      </span>
    </div>

    {/* المفتاح */}
    <div
      className="cursor-pointer group/date flex-shrink-0"
      onClick={() => setBypassRestrictions((v) => !v)}
      title={
        !bypassRestrictions
          ? "اضغط لتجاوز القيود (السماح بالماضي والعطل)"
          : "اضغط لإعادة تفعيل القيود"
      }
      role="switch"
      aria-checked={!bypassRestrictions}
    >
      <div
        className={`
          relative w-11 h-6 rounded-full transition-all duration-300
          ${!bypassRestrictions ? "bg-emerald-500" : "bg-amber-500"}
          group-hover/date:shadow-lg group-hover/date:scale-105
          flex items-center justify-between px-1
        `}
      >

        {/* أيقونة مفعّل (يمين) — ShieldCheck */}
        <span
          className={`
            transition-all duration-300 z-10
            ${!bypassRestrictions ? "opacity-100 scale-100" : "opacity-0 scale-50"}
          `}
        >
          <ShieldCheck size={11} className="text-white" strokeWidth={2.5} />
        </span>

        {/* الدائرة المتحركة */}
        <div
          className={`
            absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md 
            transition-all duration-300 ease-in-out
            group-hover/date:scale-110
            flex items-center justify-center
          `}
          style={{
            left: !bypassRestrictions ? "calc(100% - 22px)" : "2px",
          }}
        >
          {!bypassRestrictions ? (
            <ShieldCheck size={10} className="text-emerald-500" strokeWidth={3} />
          ) : (
            <ShieldAlert size={10} className="text-amber-500" strokeWidth={2.8} />
          )}
        </div>
      </div>
    </div>
  </div>
)}
              </div>

              {/* عرض الشهر */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-800">
                    {getMonthYearWithNumber()}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleMonthChange("prev")}
                    className="p-2 hover:bg-white rounded-lg transition-all hover:shadow-sm border border-transparent hover:border-gray-200"
                    title="الشهر السابق"
                  >
                    <ChevronUp size={20} className="text-gray-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMonthChange("next")}
                    className="p-2 hover:bg-white rounded-lg transition-all hover:shadow-sm border border-transparent hover:border-gray-200"
                    title="الشهر التالي"
                  >
                    <ChevronDown size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* أيام الأسبوع */}
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                {weekDays.map((day, index) => {
                  const ourDay = convertJsDayToOurDay(index);
                  const isClosedDay = closedDays.includes(ourDay);

                  return (
                    <div
                      key={day}
                      className="flex flex-col items-center gap-1"
                    >
                      <span
                        className={`
                          text-xs font-medium transition-all duration-200
                          ${
                            index === getDayOfWeek()
                              ? "text-white px-2 py-0.5 rounded-full"
                              : isClosedDay
                                ? bypassRestrictions
                                  ? "text-amber-500"
                                  : "text-red-400"
                                : "text-gray-500"
                          }
                        `}
                        style={
                          index === getDayOfWeek()
                            ? {
                                backgroundColor: primaryColor,
                                boxShadow: `0 2px 8px ${primaryColor}40`,
                              }
                            : undefined
                        }
                        title={
                          isClosedDay
                            ? bypassRestrictions
                              ? "يوم عطلة — مسموح حالياً"
                              : "يوم عطلة"
                            : undefined
                        }
                      >
                        {day}
                      </span>
                      {index === getDayOfWeek() && (
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ backgroundColor: primaryColor }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ✅ شريط تحذير عند التفعيل */}
            {bypassRestrictions && (
              <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-[11px] text-amber-700">
                <ShieldAlert size={12} className="flex-shrink-0" />
                <span>
                  وضع تجاوز القيود: يمكنك اختيار أي يوم (ماضٍ، عطلة، أو خارج
                  النطاق)
                </span>
              </div>
            )}

            {/* Calendar Body */}
            <div className="p-4 flex justify-center overflow-hidden">
              <div
                className={`transition-all duration-200 ${
                  animation === "slide-up"
                    ? "transform -translate-y-4 opacity-0"
                    : animation === "slide-down"
                      ? "transform translate-y-4 opacity-0"
                      : "transform translate-y-0 opacity-100"
                }`}
              >
                <style>{`
                  .rdp {
                    --rdp-cell-size: 42px;
                    --rdp-accent-color: ${primaryColor};
                    --rdp-background-color: ${primaryColor}15;
                    margin: 0;
                  }
                  .rdp-months {
                    justify-content: center;
                  }
                  .rdp-month_caption {
                    display: none;
                  }
                  .rdp-nav {
                    display: none;
                  }
                  .rdp-month_grid {
                    width: 100%;
                  }
                  .rdp-weekdays {
                    display: none;
                  }
                  .rdp-day {
                    width: 42px;
                    height: 42px;
                    font-size: 0.9rem;
                    color: #111827;
                    border-radius: 12px;
                    transition: all 0.2s;
                    font-weight: 500;
                    position: relative;
                  }
                  .rdp-day:hover:not([disabled]):not(.rdp-selected) {
                    background-color: ${primaryColor}10;
                    transform: scale(1.05);
                  }
                  .rdp-day_button {
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    font-weight: 500;
                  }
                  .rdp-selected .rdp-day_button {
                    background-color: ${primaryColor};
                    color: white;
                    font-weight: 700;
                    box-shadow: 0 4px 12px ${primaryColor}40;
                    transform: scale(1.05);
                  }
                  .rdp-today .rdp-day_button {
                    border: 2px solid ${primaryColor};
                    font-weight: 700;
                    color: ${primaryColor};
                  }
                  .rdp-today.rdp-selected .rdp-day_button {
                    color: white;
                    border: 2px solid ${primaryColor};
                  }
                  .rdp-disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                    position: relative;
                  }
                  .rdp-disabled .rdp-day_button {
                    text-decoration: line-through;
                    text-decoration-color: #ef4444;
                    color: #9ca3af;
                  }
                  .rdp-disabled:hover {
                    background-color: transparent !important;
                    transform: none !important;
                  }
                  .rdp-outside {
                    opacity: 0.2;
                  }
                `}</style>
                <DayPicker
                  mode="single"
                  month={currentMonth}
                  selected={tempSelectedDate}
                  onSelect={handleSelect}
                  locale={arSA}
                  disabled={isDayDisabled}
                  showOutsideDays={true}
                  onDayMouseEnter={(date) => {
                    if (isDayClosed(date)) {
                      setHoveredClosedDay(date);
                    } else {
                      setHoveredClosedDay(null);
                    }
                  }}
                  onDayMouseLeave={() => setHoveredClosedDay(null)}
                />
              </div>
            </div>

            {/* معلومات اليوم المحدد */}
            {selectedDayInfo && (
              <div
                className={`px-6 pb-3 ${
                  (selectedDayInfo.isPast || selectedDayInfo.isClosed) &&
                  !bypassRestrictions
                    ? "bg-amber-50"
                    : "bg-gray-50"
                }`}
              >
                <div
                  className={`flex items-center gap-2 text-xs p-2.5 rounded-xl border ${
                    (selectedDayInfo.isPast || selectedDayInfo.isClosed) &&
                    !bypassRestrictions
                      ? "text-amber-600 border-amber-100 bg-white"
                      : "text-gray-600 border-gray-100 bg-white"
                  }`}
                >
                  {selectedDayInfo.isPast || selectedDayInfo.isClosed ? (
                    <ShieldAlert size={14} className="text-amber-500" />
                  ) : (
                    <Info size={14} className="text-gray-400" />
                  )}
                  <span>
                    {selectedDayInfo.isPast
                      ? `تاريخ في الماضي — ${
                          bypassRestrictions ? "مسموح حالياً" : "غير مسموح"
                        }`
                      : selectedDayInfo.isClosed
                        ? `عطلة — ${
                            bypassRestrictions ? "مسموح حالياً" : "غير مسموح"
                          }`
                        : selectedDayInfo.label}
                  </span>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={handleToday}
                disabled={
                  !bypassRestrictions &&
                  isDayDisabled(new Date())
                }
                className="flex-1 py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all text-sm border border-gray-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                اليوم
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-xl transition-all text-sm"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={
                  !bypassRestrictions &&
                  (selectedDayInfo?.isClosed || selectedDayInfo?.isPast)
                }
                className="flex-1 py-2.5 px-4 text-white font-medium rounded-xl transition-all text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ backgroundColor: primaryColor }}
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}