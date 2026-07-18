import { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { arSA } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
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
  primaryColor = "#007bff",
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // تهيئة التاريخ المحدد
  useEffect(() => {
    if (value instanceof Date && isValid(value)) {
      setSelectedDate(value);
    } else if (typeof value === "string" && value) {
      const parsedDate = parseISO(value);
      if (isValid(parsedDate)) {
        setSelectedDate(parsedDate);
      }
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onChange(date);
      setIsOpen(false);
    }
  };

  const getDateDisplay = () => {
    if (!selectedDate) return placeholder;
    try {
      return format(selectedDate, "EEEE، d MMMM yyyy", { locale: arSA });
    } catch {
      return placeholder;
    }
  };

  // بناء خيارات التعطيل لـ DayPicker
  const getDisabledDays = () => {
    const disabledDays = [];
    
    if (minDate) {
      disabledDays.push({ before: minDate });
    }
    
    if (maxDate) {
      disabledDays.push({ after: maxDate });
    }
    
    return disabledDays.length > 0 ? disabledDays : undefined;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      {/* حقل الإدخال */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 bg-white border rounded-xl 
          text-right text-gray-900 shadow-sm 
          transition-all duration-200
          flex items-center justify-between
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400 cursor-pointer"}
          ${error ? "border-red-500" : "border-gray-300"}
          focus:ring-2 focus:ring-opacity-50 focus:border-transparent
        `}
        style={{ 
          "--tw-ring-color": primaryColor,
          borderColor: error ? "#ef4444" : undefined
        } as React.CSSProperties}
      >
        <span className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{getDateDisplay()}</span>
        </span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} 
        />
      </button>

      {/* رسالة الخطأ */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {/* الـ Popup - يظهر فوق كل شيء */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-full sm:w-auto sm:min-w-[320px]">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              locale={arSA}
              disabled={getDisabledDays()}
              className="rtl"
              modifiersStyles={{
                selected: {
                  backgroundColor: primaryColor,
                  color: "white",
                  fontWeight: "600",
                  borderRadius: "0.5rem",
                },
                today: {
                  border: `2px solid ${primaryColor}`,
                  fontWeight: "500",
                  borderRadius: "0.5rem",
                },
              }}
              style={
                {
                  "--primary-color": primaryColor,
                } as React.CSSProperties
              }
            />
            
            {/* زر إلغاء في الأسفل */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full mt-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors text-sm"
            >
              إلغاء
            </button>
          </div>
        </>
      )}
    </div>
  );
}