import { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { arSA } from "date-fns/locale";
import { Calendar as CalendarIcon, X, ChevronUp, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
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
}

export function DatePicker({
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
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [animation, setAnimation] = useState<"slide-up" | "slide-down" | "">("");
  const [isClosing, setIsClosing] = useState(false);

  // تهيئة التاريخ - دائماً يكون هناك قيمة افتراضية (تاريخ اليوم)
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

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // استخدام التاريخ مباشرة بدون تعديل المنطقة الزمنية
      const correctedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, // نحدد وقت الظهر لتجنب مشاكل المنطقة الزمنية
        0,
        0
      );
      
      // تحديث التاريخ المؤقت فقط دون إغلاق النافذة
      setTempSelectedDate(correctedDate);
    }
  };

  const handleConfirm = () => {
    if (tempSelectedDate) {
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

  const getDisabledDays = () => {
    const disabledDays = [];
    if (minDate) disabledDays.push({ before: minDate });
    if (maxDate) disabledDays.push({ after: maxDate });
    return disabledDays.length > 0 ? disabledDays : undefined;
  };

  const getMonthYearWithNumber = () => {
    const months = [
      "يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    const monthNumber = currentMonth.getMonth() + 1;
    const monthName = months[currentMonth.getMonth()];
    const year = currentMonth.getFullYear();
    return `${monthName} (${monthNumber.toString().padStart(2, '0')}) ${year}`;
  };

  // الحصول على رقم اليوم في الأسبوع (0 = الأحد, 6 = السبت)
  const getDayOfWeek = () => {
    return tempSelectedDate.getDay();
  };

  // أسماء الأيام بالأحرف المختصرة
  const weekDays = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

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
          {/* Backdrop with smooth animation */}
          <div
            className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 ${
              isClosing ? 'opacity-0' : 'opacity-100 animate-in fade-in'
            }`}
            onClick={handleClose}
          />

          {/* Calendar Modal with smooth animation */}
          <div 
            className={`
              relative bg-white rounded-2xl shadow-2xl w-full max-w-[380px] overflow-hidden
              transition-all duration-300 ease-out
              ${isClosing 
                ? 'opacity-0 scale-90 translate-y-4' 
                : 'opacity-100 scale-100 translate-y-0 animate-in zoom-in-95'
              }
            `}
            dir="rtl"
          >
            {/* Header مع أزرار التنقل ورقم الشهر */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  اختر التاريخ
                </h3>
              </div>
              
              {/* عرض الشهر مع رقمه */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-gray-800">
                    {getMonthYearWithNumber()}
                  </span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                    {currentMonth.getMonth() + 1}
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

              {/* عرض أيام الأسبوع مع تمييز اليوم المحدد */}
              <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                {weekDays.map((day, index) => (
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
                    >
                      {day}
                    </span>
                    {/* نقطة صغيرة تحت اليوم المحدد */}
                    {index === getDayOfWeek() && (
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Body مع أنيميشن */}
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
                    opacity: 0.25;
                    cursor: not-allowed;
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
                  disabled={getDisabledDays()}
                  showOutsideDays={true}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-4 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={handleToday}
                className="flex-1 py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-all text-sm border border-gray-200 hover:border-gray-300"
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
                className="flex-1 py-2.5 px-4 text-white font-medium rounded-xl transition-all text-sm shadow-lg hover:shadow-xl hover:scale-[1.02]"
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