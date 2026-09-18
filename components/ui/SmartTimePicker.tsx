// components/ui/SmartTimePicker.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, Check, AlertCircle, CalendarX, Info } from "lucide-react";

// ============================================================
// الواجهات
// ============================================================

interface WorkingHour {
  day: number; // 0 = السبت، 1 = الأحد، ...
  start: string; // "HH:MM"
  end: string; // "HH:MM"
  isClosed: boolean;
}

interface BookedSlot {
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

interface SmartTimePickerProps {
  value: string; // "HH:MM"
  onChange: (time: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  primaryColor?: string;
  className?: string;
  error?: string;
  
  // ✅ الخصائص الذكية الجديدة
  appointmentDate: Date; // تاريخ الموعد المحدد
  workingHours: any; // ✅ تغيير النوع إلى any ليقبل أي صيغة
  appointmentDuration?: number; // مدة الموعد بالدقائق (افتراضي 30)
  bookedSlots?: BookedSlot[]; // المواعيد المحجوزة في ذلك اليوم
  clinicTimezone?: string; // المنطقة الزمنية (اختياري)
}

// ============================================================
// دوال مساعدة
// ============================================================

/**
 * تطبيع workingHours ليقبل أي صيغة:
 * - مصفوفة: [{ day: 0, start: "09:00", end: "17:00", isClosed: false }, ...]
 * - كائن مفهرس: { 0: { start: "09:00", ... }, 1: { ... }, ... }
 * - كائن بأسماء الأيام: { saturday: { start: "09:00", ... }, ... }
 */
const normalizeWorkingHours = (workingHours: any): WorkingHour[] => {
  // إذا كانت null أو undefined
  if (!workingHours) return [];
  
  // إذا كانت مصفوفة بالفعل
  if (Array.isArray(workingHours)) {
    return workingHours.filter((wh) => wh && typeof wh === 'object');
  }
  
  // إذا كانت كائن (Object)
  if (typeof workingHours === 'object') {
    const values = Object.values(workingHours);
    
    // حالة: { 0: {...}, 1: {...}, ... }
    if (values.length > 0 && values.every((v) => v && typeof v === 'object')) {
      return values.map((v: any, index: number) => ({
        day: v.day !== undefined ? v.day : index,
        start: v.start || '09:00',
        end: v.end || '17:00',
        isClosed: v.isClosed || false,
      }));
    }
    
    // حالة: { saturday: {...}, sunday: {...}, ... }
    const dayMap: { [key: string]: number } = {
      'saturday': 0,
      'sunday': 1,
      'monday': 2,
      'tuesday': 3,
      'wednesday': 4,
      'thursday': 5,
      'friday': 6,
    };
    
    const result: WorkingHour[] = [];
    for (const [key, value] of Object.entries(workingHours)) {
      const dayKey = dayMap[key.toLowerCase()];
      if (dayKey !== undefined && value && typeof value === 'object') {
        result.push({
          day: dayKey,
          start: (value as any).start || '09:00',
          end: (value as any).end || '17:00',
          isClosed: (value as any).isClosed || false,
        });
      }
    }
    
    if (result.length > 0) return result;
  }
  
  // إذا لم نتمكن من التطبيع
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

  // ✅ تطبيع workingHours داخلياً
  const normalizedWorkingHours = useMemo(() => {
    const normalized = normalizeWorkingHours(workingHours);
    console.log('📋 normalizedWorkingHours:', normalized); // ✅ للتتبع
    return normalized;
  }, [workingHours]);

  // ✅ استخراج معلومات اليوم
  const dayInfo = useMemo(() => {
    if (!appointmentDate) return null;
    
    // تحويل تاريخ JS إلى يوم الأسبوع (0 = الأحد، 1 = الإثنين، ...)
    const jsDay = appointmentDate.getDay();
    
    // تحويل إلى نظامنا (0 = السبت، 1 = الأحد، ...)
    const ourDayMap: { [key: number]: number } = {
      0: 1, // الأحد
      1: 2, // الإثنين
      2: 3, // الثلاثاء
      3: 4, // الأربعاء
      4: 5, // الخميس
      5: 6, // الجمعة
      6: 0, // السبت
    };
    
    return {
      dayKey: ourDayMap[jsDay],
      dayLabel: getDayLabel(ourDayMap[jsDay]),
      isToday: isSameDay(appointmentDate, new Date()),
    };
  }, [appointmentDate]);

  // ✅ الحصول على ساعات العمل لليوم المحدد
  const todaysWorkingHours = useMemo(() => {
    if (!dayInfo || !normalizedWorkingHours || normalizedWorkingHours.length === 0) {
      console.log('⚠️ لا توجد ساعات عمل:', { dayInfo, normalizedWorkingHours });
      return null;
    }
    
    const wh = normalizedWorkingHours.find((h) => h.day === dayInfo.dayKey);
    
    console.log('🔍 يوم:', dayInfo.dayKey, 'ساعات العمل:', wh);
    
    if (!wh || wh.isClosed) return null;
    
    return wh;
  }, [dayInfo, normalizedWorkingHours]);

  // ✅ توليد جميع الأوقات المتاحة
  const availableTimeSlots = useMemo(() => {
    if (!todaysWorkingHours || !dayInfo) return [];
    
    const slots: {
      time: string;
      display: string;
      isAvailable: boolean;
      isPast: boolean;
      conflictReason?: string;
    }[] = [];
    
    const [startHour, startMinute] = todaysWorkingHours.start.split(":").map(Number);
    const [endHour, endMinute] = todaysWorkingHours.end.split(":").map(Number);
    
    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
      return [];
    }
    
    const startTime = new Date(appointmentDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(appointmentDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    const now = new Date();
    
    // توليد الأوقات بفاصل = مدة الموعد
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const timeStr = `${String(currentTime.getHours()).padStart(2, "0")}:${String(currentTime.getMinutes()).padStart(2, "0")}`;
      const slotEndTime = new Date(currentTime.getTime() + appointmentDuration * 60000);
      
      // التحقق من أن الموعد لا يتجاوز نهاية الدوام
      if (slotEndTime > endTime) break;
      
      // التحقق من عدم التضارب مع المواعيد المحجوزة
      let isAvailable = true;
      let conflictReason: string | undefined;
      
      if (bookedSlots && bookedSlots.length > 0) {
        for (const booked of bookedSlots) {
          const [bookedStartH, bookedStartM] = booked.startTime.split(":").map(Number);
          const [bookedEndH, bookedEndM] = booked.endTime.split(":").map(Number);
          
          if (isNaN(bookedStartH) || isNaN(bookedStartM) || isNaN(bookedEndH) || isNaN(bookedEndM)) {
            continue;
          }
          
          const bookedStart = new Date(appointmentDate);
          bookedStart.setHours(bookedStartH, bookedStartM, 0, 0);
          
          const bookedEnd = new Date(appointmentDate);
          bookedEnd.setHours(bookedEndH, bookedEndM, 0, 0);
          
          // التحقق من التداخل
          if (
            (currentTime >= bookedStart && currentTime < bookedEnd) ||
            (slotEndTime > bookedStart && slotEndTime <= bookedEnd) ||
            (currentTime <= bookedStart && slotEndTime >= bookedEnd)
          ) {
            isAvailable = false;
            conflictReason = `محجوز (${booked.startTime} - ${booked.endTime})`;
            break;
          }
        }
      }
      
      // التحقق من أن الوقت ليس في الماضي (فقط إذا كان اليوم هو اليوم الحالي)
      const isPast = dayInfo.isToday && currentTime <= now;
      
      slots.push({
        time: timeStr,
        display: formatTimeDisplay(timeStr),
        isAvailable: isAvailable && !isPast,
        isPast,
        conflictReason: isPast ? "وقت ماضي" : conflictReason,
      });
      
      // الانتقال للوقت التالي
      currentTime = new Date(currentTime.getTime() + appointmentDuration * 60000);
    }
    
    console.log('✅ الأوقات المتاحة:', slots.length);
    
    return slots;
  }, [todaysWorkingHours, dayInfo, appointmentDate, appointmentDuration, bookedSlots]);

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

  // ✅ اختيار وقت
  const handleSelectTime = (time: string, isAvailable: boolean) => {
    if (!isAvailable || disabled) return;
    
    setSelectedTime(time);
    onChange(time);
    
    // إغلاق بعد اختيار الوقت مباشرة
    setTimeout(() => {
      closePicker();
    }, 200);
  };

  // ✅ عرض الوقت المحدد
  const getDisplayValue = () => {
    if (!selectedTime) return "اختر الوقت";
    return formatTimeDisplay(selectedTime);
  };

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
          ${disabled
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
{/* حاوية التمركز */}
<div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ 
      opacity: isVisible ? 1 : 0, 
      scale: isVisible ? 1 : 0.95, 
      y: isVisible ? 0 : 20 
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
                    <h3 className="font-bold text-gray-900 text-lg">اختر الوقت</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {dayInfo?.dayLabel || ""} • مدة الموعد {appointmentDuration} دقيقة
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

                {/* معلومات الدوام */}
                {todaysWorkingHours ? (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-white rounded-xl p-2.5 border border-gray-100">
                    <Clock size={14} className="text-gray-400" />
                    <span>
                      الدوام من {formatTimeDisplay(todaysWorkingHours.start)} إلى {formatTimeDisplay(todaysWorkingHours.end)}
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
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleSelectTime(slot.time, slot.isAvailable)}
                        disabled={!slot.isAvailable}
                        className={`
                          relative p-3 rounded-xl text-sm font-medium transition-all duration-200
                          ${
                            selectedTime === slot.time
                              ? "text-white shadow-lg scale-105"
                              : slot.isAvailable
                              ? "bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200"
                              : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50"
                          }
                        `}
                        style={
                          selectedTime === slot.time
                            ? { backgroundColor: primaryColor }
                            : undefined
                        }
                        title={slot.conflictReason || slot.display}
                      >
                        {slot.display}
                        
                        {slot.isPast && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-gray-300 rounded-full" />
                        )}
                        
                        {!slot.isAvailable && !slot.isPast && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* تلميح */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                    <Info size={14} className="text-gray-400" />
                    <span>الأوقات المعطلة محجوزة أو غير متاحة</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CalendarX size={48} className="text-gray-300 mx-auto mb-3" />
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