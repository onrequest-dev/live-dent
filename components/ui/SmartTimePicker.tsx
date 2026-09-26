// components/ui/SmartTimePicker.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  X,
  Check,
  AlertCircle,
  CalendarX,
  Info,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

// ============================================================
// الواجهات
// ============================================================

interface WorkingHour {
  day: number;
  start: string;
  end: string;
  isClosed: boolean;
}

interface BookedSlot {
  startTime: string;
  endTime: string;
}

interface SmartTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  primaryColor?: string;
  className?: string;
  error?: string;
  appointmentDate: Date;
  workingHours: any;
  appointmentDuration?: number;
  bookedSlots?: BookedSlot[];
  clinicTimezone?: string;
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

    if (values.length > 0 && values.every((v) => v && typeof v === "object")) {
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

function getDayLabel(dayKey: number): string {
  const days = [
    "السبت",
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
  ];
  return days[dayKey] || "";
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function formatTimeDisplay(time24: string): string {
  if (!time24) return "";

  const [hours, minutes] = time24.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time24;

  const period = hours >= 12 ? "م" : "ص";
  const hours12 = hours % 12 || 12;

  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

// ============================================================
// المكون الرئيسي
// ============================================================

export function SmartTimePicker({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  primaryColor = "#4F46E5",
  className = "",
  error,
  appointmentDate,
  workingHours,
  appointmentDuration = 30,
  bookedSlots = [],
}: SmartTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(value || null);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);

  // ✅ وضع المواعيد الذكية (ON افتراضياً)
  const [smartMode, setSmartMode] = useState(true);

  // ✅ قراءة التفضيل من localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("smart_time_picker_mode");
      // الافتراضي: true (ذكي) — فقط إذا كان محفوظاً بـ "false" نعطّله
      if (saved === "false") setSmartMode(false);
      else setSmartMode(true);
    } catch {}
  }, []);

  // ✅ حفظ التفضيل
  useEffect(() => {
    try {
      localStorage.setItem(
        "smart_time_picker_mode",
        smartMode ? "true" : "false"
      );
    } catch {}
  }, [smartMode]);

  // ✅ تطبيع workingHours
  const normalizedWorkingHours = useMemo(() => {
    return normalizeWorkingHours(workingHours);
  }, [workingHours]);

  // ✅ معلومات اليوم
  const dayInfo = useMemo(() => {
    if (!appointmentDate) return null;

    const jsDay = appointmentDate.getDay();
    const ourDayMap: { [key: number]: number } = {
      0: 1,
      1: 2,
      2: 3,
      3: 4,
      4: 5,
      5: 6,
      6: 0,
    };

    return {
      dayKey: ourDayMap[jsDay],
      dayLabel: getDayLabel(ourDayMap[jsDay]),
      isToday: isSameDay(appointmentDate, new Date()),
    };
  }, [appointmentDate]);

  // ✅ ساعات العمل لليوم المحدد
  const todaysWorkingHours = useMemo(() => {
    if (
      !dayInfo ||
      !normalizedWorkingHours ||
      normalizedWorkingHours.length === 0
    ) {
      return null;
    }

    const wh = normalizedWorkingHours.find((h) => h.day === dayInfo.dayKey);

    if (!wh || wh.isClosed) return null;

    return wh;
  }, [dayInfo, normalizedWorkingHours]);

  // ✅ توليد الأوقات المتاحة
  // ملاحظة مهمة: نولّد كل الأوقات دائماً، ونحتفظ بحالة كل وقت (متاح/محجوز/فائت)
  // ثم نعرضها للمستخدم حسب smartMode
  const availableTimeSlots = useMemo(() => {
    if (!todaysWorkingHours || !dayInfo) return [];

    const slots: {
      time: string;
      display: string;
      isAvailable: boolean;
      isPast: boolean;
      isBooked: boolean;
      conflictReason?: string;
    }[] = [];

    const [startHour, startMinute] = todaysWorkingHours.start
      .split(":")
      .map(Number);
    const [endHour, endMinute] = todaysWorkingHours.end.split(":").map(Number);

    if (
      isNaN(startHour) ||
      isNaN(startMinute) ||
      isNaN(endHour) ||
      isNaN(endMinute)
    ) {
      return [];
    }

    const startTime = new Date(appointmentDate);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(appointmentDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    const now = new Date();

    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const timeStr = `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}`;
      const slotEndTime = new Date(
        currentTime.getTime() + appointmentDuration * 60000
      );

      if (slotEndTime > endTime) break;

      // ✅ كشف التضارب مع المواعيد المحجوزة
      let isBooked = false;
      let conflictReason: string | undefined;

      if (bookedSlots && bookedSlots.length > 0) {
        for (const booked of bookedSlots) {
          const [bookedStartH, bookedStartM] = booked.startTime
            .split(":")
            .map(Number);
          const [bookedEndH, bookedEndM] = booked.endTime
            .split(":")
            .map(Number);

          if (
            isNaN(bookedStartH) ||
            isNaN(bookedStartM) ||
            isNaN(bookedEndH) ||
            isNaN(bookedEndM)
          ) {
            continue;
          }

          const bookedStart = new Date(appointmentDate);
          bookedStart.setHours(bookedStartH, bookedStartM, 0, 0);

          const bookedEnd = new Date(appointmentDate);
          bookedEnd.setHours(bookedEndH, bookedEndM, 0, 0);

          if (
            (currentTime >= bookedStart && currentTime < bookedEnd) ||
            (slotEndTime > bookedStart && slotEndTime <= bookedEnd) ||
            (currentTime <= bookedStart && slotEndTime >= bookedEnd)
          ) {
            isBooked = true;
            conflictReason = `محجوز (${booked.startTime} - ${booked.endTime})`;
            break;
          }
        }
      }

      // ✅ كشف الوقت الفائت
      const isPast = dayInfo.isToday && currentTime <= now;

      slots.push({
        time: timeStr,
        display: formatTimeDisplay(timeStr),
        isAvailable: !isBooked && !isPast,
        isPast,
        isBooked,
        conflictReason: isPast
          ? "وقت ماضي"
          : isBooked
            ? conflictReason
            : undefined,
      });

      currentTime = new Date(currentTime.getTime() + appointmentDuration * 60000);
    }

    return slots;
  }, [
    todaysWorkingHours,
    dayInfo,
    appointmentDate,
    appointmentDuration,
    bookedSlots,
  ]);

  // ✅ تحديث القيمة عند تغييرها من الخارج
  useEffect(() => {
    if (value !== selectedTime) {
      setSelectedTime(value || null);
    }
  }, [value]);

  // ✅ فتح المنتقي
  const openPicker = () => {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => setIsVisible(true), 10);
  };

  // ✅ إغلاق المنتقي
  const closePicker = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  // ✅ اختيار وقت (احترام smartMode)
  const handleSelectTime = (
    time: string,
    isAvailable: boolean,
    isPast: boolean,
    isBooked: boolean
  ) => {
    if (disabled) return;

    // ✅ في الوضع الذكي: نمنع المحجوز والفائت
    // ✅ في وضع التجاوز: نسمح بكل شيء
    if (smartMode && (!isAvailable || isPast || isBooked)) return;

    setSelectedTime(time);
    onChange(time);

    setTimeout(() => {
      closePicker();
    }, 200);
  };

  // ✅ عرض الوقت المحدد
  const getDisplayValue = () => {
    if (!selectedTime) return "اختر الوقت";
    return formatTimeDisplay(selectedTime);
  };

  // ✅ هل يوجد أي وقت محجوز أو فائت؟ (لإظهار الزر)
  const hasRestrictedSlots = useMemo(() => {
    return availableTimeSlots.some((s) => s.isBooked || s.isPast);
  }, [availableTimeSlots]);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* زر فتح المنتقي */}
      <button
        type="button"
        onClick={openPicker}
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
      >
        <Clock size={20} className={error ? "text-red-400" : "text-gray-400"} />
        <span className="flex-1 truncate text-sm text-gray-900 font-medium">
          {getDisplayValue()}
        </span>

        {/* مؤشر الوضع الذكي */}
        {!smartMode && (
          <span className="text-[10px] text-amber-500 flex items-center gap-1">
            <ShieldAlert size={11} />
            تجاوز
          </span>
        )}
      </button>

      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
          {error}
        </p>
      )}

      {/* المنتقي */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* خلفية معتمة */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              onClick={closePicker}
            />

            {/* محتوى المنتقي */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{
                  opacity: isVisible ? 1 : 0,
                  scale: isVisible ? 1 : 0.95,
                  y: isVisible ? 0 : 20,
                }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="pointer-events-auto bg-white rounded-3xl shadow-2xl w-full max-w-lg md:w-[480px] max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        اختر الوقت
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {dayInfo?.dayLabel || ""} • مدة الموعد{" "}
                        {appointmentDuration} دقيقة
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closePicker}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-500" />
                    </button>
                  </div>

{/* ✅ مفتاح المواعيد الذكية — نسخة محسّنة */}
{hasRestrictedSlots && (
  <div
    className={`
      mt-3 flex items-center justify-between gap-3 
      px-3.5 py-3 rounded-2xl border transition-all duration-300
      ${
        smartMode
          ? "bg-gradient-to-l from-emerald-50 to-emerald-50/40 border-emerald-200"
          : "bg-gradient-to-l from-amber-50 to-amber-50/40 border-amber-200"
      }
    `}
  >
    {/* النص والأيقونة على اليمين */}
    <div className="flex items-center gap-2.5 min-w-0 flex-1">
      <div
        className={`
          w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
          transition-all duration-300
          ${
            smartMode
              ? "bg-emerald-100 text-emerald-600"
              : "bg-amber-100 text-amber-600"
          }
        `}
      >
        {smartMode ? (
          <ShieldCheck size={18} strokeWidth={2.2} />
        ) : (
          <ShieldAlert size={18} strokeWidth={2.2} />
        )}
      </div>

      <div className="flex flex-col min-w-0 gap-0.5">
        <span
          className={`text-[13px] font-bold transition-colors duration-200 ${
            smartMode ? "text-emerald-700" : "text-amber-700"
          }`}
        >
          {smartMode ? "المواعيد الذكية" : "وضع تجاوز القيود"}
        </span>
        <span
          className={`text-[10.5px] leading-tight transition-colors duration-200 ${
            smartMode ? "text-emerald-600/80" : "text-amber-600/80"
          }`}
        >
          {smartMode
            ? "الأوقات المحجوزة والفائتة معطّلة"
            : "يمكنك حجز أي وقت — حتى المحجوز"}
        </span>
      </div>
    </div>

    {/* المفتاح — نسخة أوضح وأكبر */}
    <div
      className="flex flex-col items-center gap-0.5 cursor-pointer group/smart flex-shrink-0"
      onClick={() => setSmartMode((v) => !v)}
      title={
        smartMode
          ? "اضغط لإيقاف المواعيد الذكية"
          : "اضغط لتفعيل المواعيد الذكية"
      }
      role="switch"
      aria-checked={smartMode}
    >
      {/* المفتاح */}
      <div
        className={`
          relative w-14 h-8 rounded-full transition-all duration-300
          ${
            smartMode
              ? "bg-emerald-500"
              : "bg-amber-500"
          }
          group-hover/smart:shadow-lg group-hover/smart:scale-105
          flex items-center justify-between px-1.5
        `}
      >
        {/* أيقونة "مفعّل" (يمين) — ShieldCheck */}
        <span
          className={`
            transition-all duration-300 z-10
            ${
              smartMode
                ? "opacity-100 scale-100"
                : "opacity-0 scale-50"
            }
          `}
        >
          <ShieldCheck
            size={13}
            className="text-white"
            strokeWidth={2.5}
          />
        </span>

        {/* الدائرة المتحركة */}
        <div
          className={`
            absolute top-1 w-6 h-6 rounded-full bg-white shadow-md 
            transition-all duration-300 ease-in-out
            group-hover/smart:scale-110
            flex items-center justify-center
          `}
          style={{
            left: smartMode ? "calc(100% - 28px)" : "4px",
          }}
        >
          {smartMode ? (
            <ShieldCheck
              size={12}
              className="text-emerald-500"
              strokeWidth={3}
            />
          ) : (
            <ShieldAlert
              size={12}
              className="text-amber-500"
              strokeWidth={2.8}
            />
          )}
        </div>
      </div>
    </div>
  </div>
)}

                  {/* معلومات الدوام */}
                  {todaysWorkingHours ? (
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-white rounded-xl p-2.5 border border-gray-100">
                      <Clock size={14} className="text-gray-400" />
                      <span>
                        الدوام من {formatTimeDisplay(todaysWorkingHours.start)}{" "}
                        إلى {formatTimeDisplay(todaysWorkingHours.end)}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-xl p-2.5 border border-red-100">
                      <CalendarX size={14} />
                      <span>العيادة مغلقة في هذا اليوم</span>
                    </div>
                  )}
                </div>

                {/* قائمة الأوقات */}
                {todaysWorkingHours && availableTimeSlots.length > 0 ? (
                  <div className="p-4 overflow-y-auto max-h-[50vh]">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableTimeSlots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        const isBlocked = slot.isPast || slot.isBooked;

                        // ✅ منطق الألوان الجديد
                        // - الوضع الذكي: المعطّلة رمادية + شفافة
                        // - وضع التجاوز: المعطّلة ملوّنة بلون شفاف حسب النوع

                        let buttonStyles: React.CSSProperties = {};
                        let buttonClasses =
                          "relative p-3 rounded-xl text-sm font-medium transition-all duration-200 border";

                        if (isSelected) {
                          buttonClasses += " text-white shadow-lg scale-105";
                          buttonStyles = { backgroundColor: primaryColor };
                        } else if (smartMode) {
                          // الوضع الذكي: العادي رمادي، المعطّل رمادي شفاف
                          if (isBlocked) {
                            buttonClasses +=
                              " bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-60";
                          } else {
                            buttonClasses +=
                              " bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200";
                          }
                        } else {
                          // ✅ وضع التجاوز: ألوان شفافة حسب النوع
                          if (slot.isBooked) {
                            buttonClasses +=
                              " cursor-pointer hover:scale-105 border-red-200";
                            buttonStyles = {
                              backgroundColor: "#FEE2E220", // أحمر شفاف
                              color: "#B91C1C",
                            };
                          } else if (slot.isPast) {
                            buttonClasses +=
                              " cursor-pointer hover:scale-105 border-gray-300";
                            buttonStyles = {
                              backgroundColor: "#F3F4F620", // رمادي شفاف
                              color: "#6B7280",
                            };
                          } else {
                            buttonClasses +=
                              " cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200";
                          }
                        }

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() =>
                              handleSelectTime(
                                slot.time,
                                slot.isAvailable,
                                slot.isPast,
                                slot.isBooked
                              )
                            }
                            disabled={smartMode && isBlocked}
                            className={buttonClasses}
                            style={buttonStyles}
                            title={
                              slot.isBooked
                                ? `محجوز — ${slot.conflictReason || ""}`
                                : slot.isPast
                                  ? "وقت فائت"
                                  : slot.display
                            }
                          >
                            <span className="relative z-10">{slot.display}</span>

                            {/* ✅ أيقونة التوضيح */}
                            {slot.isBooked && (
                              <span
                                className={`
                                  absolute top-1 left-1 w-1.5 h-1.5 rounded-full
                                  ${smartMode ? "bg-red-200" : "bg-red-400"}
                                `}
                              />
                            )}
                            {slot.isPast && !slot.isBooked && (
                              <span
                                className={`
                                  absolute top-1 left-1 w-1.5 h-1.5 rounded-full
                                  ${smartMode ? "bg-gray-200" : "bg-gray-400"}
                                `}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* تلميح */}
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <Info size={14} className="text-gray-400" />
                      <span>
                        {smartMode
                          ? "المواعيد الذكية تمنع حجز الأوقات المحجوزة والفائتة"
                          : "وضع التجاوز: يمكنك حجز أي وقت — الأوقات الملوّنة شفافة للتذكير"}
                      </span>
                    </div>

                    {/* Legend في وضع التجاوز */}
                    {!smartMode && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          محجوز
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                          فائت
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-gray-100 border border-gray-300" />
                          متاح
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <CalendarX
                      size={48}
                      className="text-gray-300 mx-auto mb-3"
                    />
                    <p className="text-gray-500 font-medium">
                      {!todaysWorkingHours
                        ? "لا يوجد دوام في هذا اليوم"
                        : "لا توجد أوقات متاحة"}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <button
                    type="button"
                    onClick={closePicker}
                    className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all text-sm border border-gray-200"
                  >
                    إغلاق
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}