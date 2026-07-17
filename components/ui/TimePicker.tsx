import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown } from "lucide-react";

interface TimePickerProps {
  value: string; // تنسيق "HH:MM"
  onChange: (time: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  primaryColor?: string;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "اختر الوقت",
  label,
  required = false,
  error,
  disabled = false,
  primaryColor = "#007bff",
  className = "",
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const inputRef = useRef<HTMLInputElement>(null);

  // تهيئة القيم من النص المدخل
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const hour12 = h % 12 || 12;
        setHours(String(hour12).padStart(2, "0"));
        setMinutes(String(m).padStart(2, "0"));
        setPeriod(h >= 12 ? "PM" : "AM");
      }
    }
  }, [value]);

  // تحويل الوقت إلى تنسيق 24 ساعة
  const convertTo24Hour = (hour12: number, period: "AM" | "PM"): number => {
    if (period === "AM") {
      return hour12 === 12 ? 0 : hour12;
    } else {
      return hour12 === 12 ? 12 : hour12 + 12;
    }
  };

  const handleConfirm = () => {
    const hour24 = convertTo24Hour(parseInt(hours), period);
    const timeStr = `${String(hour24).padStart(2, "0")}:${minutes}`;
    onChange(timeStr);
    setIsOpen(false);
  };

  const getTimeDisplay = () => {
    if (!value) return placeholder;
    try {
      const [h, m] = value.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return placeholder;
      const hour12 = h % 12 || 12;
      const period = h >= 12 ? "م" : "ص";
      return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
    } catch {
      return placeholder;
    }
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
          <Clock size={18} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{getTimeDisplay()}</span>
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

      {/* الـ Popup لاختيار الوقت */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-full sm:min-w-[280px]">
            <div className="space-y-4">
              {/* اختيار الساعات والدقائق */}
              <div className="flex items-center justify-center gap-4">
                {/* الساعات */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">ساعة</span>
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setHours(prev => {
                        const num = parseInt(prev);
                        const next = num + 1 > 12 ? 1 : num + 1;
                        return String(next).padStart(2, "0");
                      })}
                      className="w-12 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      ▲
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={hours}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 2) {
                          const num = parseInt(val);
                          if (num >= 1 && num <= 12) {
                            setHours(val.padStart(2, "0"));
                          } else if (val === "") {
                            setHours("00");
                          }
                        }
                      }}
                      className="w-14 text-center text-xl font-bold py-2 border border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-opacity-50"
                      style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                    />
                    <button
                      type="button"
                      onClick={() => setHours(prev => {
                        const num = parseInt(prev);
                        const next = num - 1 < 1 ? 12 : num - 1;
                        return String(next).padStart(2, "0");
                      })}
                      className="w-12 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      ▼
                    </button>
                  </div>
                </div>

                <span className="text-2xl font-bold text-gray-400">:</span>

                {/* الدقائق */}
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 mb-1">دقيقة</span>
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setMinutes(prev => {
                        const num = parseInt(prev);
                        const next = num + 5 > 55 ? 0 : num + 5;
                        return String(next).padStart(2, "0");
                      })}
                      className="w-12 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      ▲
                    </button>
                    <input
                      type="text"
                      value={minutes}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 2) {
                          const num = parseInt(val);
                          if (num >= 0 && num <= 59) {
                            setMinutes(val.padStart(2, "0"));
                          } else if (val === "") {
                            setMinutes("00");
                          }
                        }
                      }}
                      className="w-14 text-center text-xl font-bold py-2 border border-gray-200 rounded-xl focus:border-transparent focus:ring-2 focus:ring-opacity-50"
                      style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                    />
                    <button
                      type="button"
                      onClick={() => setMinutes(prev => {
                        const num = parseInt(prev);
                        const next = num - 5 < 0 ? 55 : num - 5;
                        return String(next).padStart(2, "0");
                      })}
                      className="w-12 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* اختيار صباحاً / مساءاً */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPeriod("AM")}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    period === "AM"
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={{ 
                    backgroundColor: period === "AM" ? primaryColor : undefined 
                  }}
                >
                  صباحاً
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod("PM")}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    period === "PM"
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={{ 
                    backgroundColor: period === "PM" ? primaryColor : undefined 
                  }}
                >
                  مساءاً
                </button>
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-2 rounded-xl text-white font-medium transition-colors text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}