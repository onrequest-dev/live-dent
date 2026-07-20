import { useState, useEffect, useRef } from "react";
import { Clock, X, Check, Sun, Moon } from "lucide-react";

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
  primaryColor = "#4F46E5",
  className = "",
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // للتحكم في الأنيميشن
  const [step, setStep] = useState<1 | 2>(1);
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [manualPeriod, setManualPeriod] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false); // حالة الانتقال
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const hour12 = h % 12 || 12;
        setHours(hour12);
        setMinutes(m);
        const autoPeriod = h >= 12 ? "PM" : "AM";
        setPeriod(autoPeriod as "AM" | "PM");
        setManualPeriod(false);
      }
    } else {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const hour12 = currentHour % 12 || 12;
      setHours(hour12);
      setMinutes(currentMinute);
      const autoPeriod = currentHour >= 12 ? "PM" : "AM";
      setPeriod(autoPeriod as "AM" | "PM");
      setManualPeriod(false);
      
      const timeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMinute).padStart(2, "0")}`;
      onChange(timeStr);
    }
  }, [value]);

  // فتح مع أنيميشن
  const openPicker = () => {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => setIsVisible(true), 10);
  };

  // إغلاق مع أنيميشن
  const closePicker = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      setStep(1);
    }, 300); // نفس مدة الأنيميشن
  };

  const convertTo24Hour = (hour12: number, period: "AM" | "PM"): number => {
    if (period === "AM") {
      return hour12 === 12 ? 0 : hour12;
    } else {
      return hour12 === 12 ? 12 : hour12 + 12;
    }
  };

  // تحديد الفترة حسب الموقع على الساعة (وليس الرقم)
  const getAutoPeriodByPosition = (angle: number): "AM" | "PM" => {
    // الزاوية 0 = 12 (أعلى)، 90 = 3 (يمين)، 180 = 6 (أسفل)، 270 = 9 (يسار)
    // قبل 12 (النصف الأيمن من الساعة) = AM
    // بعد 12 (النصف الأيسر من الساعة) = PM
    if (angle > 0 && angle <= 180) {
      return "PM"; // النصف الأيمن: 1 إلى 6 -> بعد الظهر
    } else {
      return "AM"; // النصف الأيسر: 7 إلى 12 -> قبل الظهر
    }
  };

  const updateHour = (newHour: number) => {
    setHours(newHour);
    
    if (!manualPeriod) {
      // تحديد الفترة حسب موقع الساعة على القرص
      const angle = (newHour % 12) * 30;
      const autoPeriod = getAutoPeriodByPosition(angle);
      setPeriod(autoPeriod);
    }
  };

  const handleConfirm = () => {
    const hour24 = convertTo24Hour(hours, period);
    const timeStr = `${String(hour24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    onChange(timeStr);
    closePicker();
  };

  const getTimeDisplay = () => {
    if (!value) return placeholder;
    try {
      const [h, m] = value.split(":").map(Number);
      if (isNaN(h) || isNaN(m)) return placeholder;
      const hour12 = h % 12 || 12;
      const periodLetter = h >= 12 ? "م" : "ص";
      return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${periodLetter}`;
    } catch {
      return placeholder;
    }
  };

  const getCurrentTimeDisplay = () => {
    const hour12 = hours || 12;
    const minuteStr = String(minutes).padStart(2, "0");
    return `${String(hour12).padStart(2, "0")}:${minuteStr}`;
  };

  const getHourAngle = (hour: number) => {
    return (hour % 12) * 30;
  };

  const getMinuteAngle = (minute: number) => {
    return minute * 6;
  };

  const handleClockInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!clockRef.current || isTransitioning) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    let angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    if (step === 1) {
      let hour = Math.round(angle / 30);
      if (hour === 0 || hour === 12) hour = 12;
      else if (hour > 12) hour = hour - 12;
      setHours(hour);
      
      if (!manualPeriod) {
        const autoPeriod = getAutoPeriodByPosition(angle);
        setPeriod(autoPeriod);
      }
    } else {
      let minute = Math.round(angle / 6);
      if (minute === 60) minute = 0;
      setMinutes(minute);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTransitioning) return;
    setIsDragging(true);
    handleClockInteraction(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isTransitioning) handleClockInteraction(e);
  };

  const handleMouseUp = () => {
    if (isDragging && step === 1) {
      goToMinutesStep();
    }
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    setIsDragging(true);
    handleClockInteraction(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && !isTransitioning) {
      e.preventDefault();
      handleClockInteraction(e);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && step === 1) {
      goToMinutesStep();
    }
    setIsDragging(false);
  };

  const handleHourClick = (value: number) => {
    if (isTransitioning) return;
    const angle = (value % 12) * 30;
    setHours(value);
    
    if (!manualPeriod) {
      const autoPeriod = getAutoPeriodByPosition(angle);
      setPeriod(autoPeriod);
    }
    
    goToMinutesStep();
  };

  // الانتقال إلى خطوة الدقائق مع تأخير
  const goToMinutesStep = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // تأخير لمدة ثانية واحدة قبل الانتقال للدقائق
    setTimeout(() => {
      setStep(2);
      setMinutes(0); // إعادة العقرب إلى 00
      
      // تأخير إضافي لإظهار الأنيميشن
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 200);
  };

  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // حساب زاوية عقرب الدقائق (يبدأ من 00)
  const displayMinuteAngle = step === 2 ? getMinuteAngle(minutes) : getMinuteAngle(0);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

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
          {getTimeDisplay()}
        </span>
      </button>

      {error && (
        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
          {error}
        </p>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* خلفية معتمة مع أنيميشن */}
          <div
            className={`
              absolute inset-0 bg-black/40 backdrop-blur-sm
              transition-all duration-300 ease-out
              ${isVisible ? "opacity-100" : "opacity-0"}
            `}
            onClick={closePicker}
          />

          {/* محتوى المنتقي مع أنيميشن */}
          <div
            className={`
              relative bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden
              transition-all duration-300 ease-out
              ${isVisible 
                ? "opacity-100 scale-100 translate-y-0" 
                : "opacity-0 scale-95 translate-y-4"
              }
            `}
          >
            {/* Header مع أزرار ص/م */}
            <div className="px-6 pt-5 pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPeriod("AM");
                        setManualPeriod(true);
                      }}
                      className={`
                        px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 flex items-center gap-1.5
                        ${period === "AM"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                        }
                      `}
                    >
                      <Sun size={12} />
                      <span>ص</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPeriod("PM");
                        setManualPeriod(true);
                      }}
                      className={`
                        px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 flex items-center gap-1.5
                        ${period === "PM"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                        }
                      `}
                    >
                      <Moon size={12} />
                      <span>م</span>
                    </button>
                  </div>

                  {manualPeriod && (
                    <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                      يدوي
                    </span>
                  )}
                </div>
              </div>

              <div className="text-center mt-2">
                <div className="text-5xl font-bold text-gray-900 tracking-wider tabular-nums">
                  {getCurrentTimeDisplay()}
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {isTransitioning 
                    ? "..." 
                    : step === 1 
                      ? "اختر الساعة" 
                      : "اختر الدقائق"
                  }
                </div>
              </div>
            </div>

            {/* الساعة التناظرية */}
            <div className="px-4 pb-4 flex justify-center">
              <div 
                className={`
                  relative w-72 h-72
                  transition-all duration-500 ease-out
                  ${isTransitioning ? "scale-95 opacity-50" : "scale-100 opacity-100"}
                `}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-50 to-white border-2 border-gray-100 shadow-lg" />

                {step === 2 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {Array.from({ length: 60 }, (_, i) => {
                      const angle = (i * 6 - 90) * (Math.PI / 180);
                      const radius = 115;
                      const x = Math.cos(angle) * radius;
                      const y = Math.sin(angle) * radius;
                      const isMainMark = i % 5 === 0;
                      
                      return (
                        <div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            left: `calc(50% + ${x}px)`,
                            top: `calc(50% + ${y}px)`,
                            width: isMainMark ? "4px" : "2px",
                            height: isMainMark ? "4px" : "2px",
                            transform: "translate(-50%, -50%)",
                            backgroundColor: isMainMark ? "#D1D5DB" : "#F3F4F6",
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                <div className="absolute inset-4 rounded-full border border-dashed border-gray-200" />

                {(step === 1 ? hourNumbers : minuteNumbers).map((value, index) => {
                  const angle = (index * 30 - 90) * (Math.PI / 180);
                  const radius = 100;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  const isSelected = step === 1 ? hours === value : minutes === value;
                  
                  return (
                    <button
                      key={`${step}-${value}`}
                      onClick={() => {
                        if (isTransitioning) return;
                        if (step === 1) {
                          handleHourClick(value);
                        } else {
                          setMinutes(value);
                        }
                      }}
                      className={`
                        absolute w-10 h-10 rounded-full flex items-center justify-center
                        text-sm font-bold transition-all duration-200
                        ${isTransitioning ? "pointer-events-none" : ""}
                        ${isSelected
                          ? "text-white shadow-xl scale-110 z-10"
                          : "text-gray-600 hover:bg-gray-100 hover:scale-105"
                        }
                      `}
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.15)' : 'scale(1)'}`,
                        backgroundColor: isSelected ? primaryColor : "transparent",
                        boxShadow: isSelected ? `0 4px 15px ${primaryColor}40` : undefined,
                      }}
                    >
                      {value === 0 ? "00" : value}
                    </button>
                  );
                })}

                <div
                  ref={clockRef}
                  className={`
                    absolute inset-0 rounded-full z-20
                    ${isTransitioning ? "pointer-events-none" : "cursor-pointer"}
                  `}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div 
                    className="w-4 h-4 rounded-full shadow-lg z-20 border-2 border-white"
                    style={{ backgroundColor: primaryColor }}
                  />
                  
                  <div
                    className="absolute rounded-full origin-bottom transition-all duration-300 ease-out"
                    style={{
                      width: step === 1 ? "4px" : "3px",
                      height: step === 1 ? "75px" : "100px",
                      backgroundColor: primaryColor,
                      transform: `rotate(${step === 1 ? getHourAngle(hours) : displayMinuteAngle}deg)`,
                      bottom: "50%",
                      boxShadow: `0 2px 8px rgba(0,0,0,0.15)`,
                      borderRadius: "999px",
                      transitionDuration: isTransitioning ? "500ms" : "300ms",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 bg-gray-50/50 border-t border-gray-100">
              <button
                type="button"
                onClick={closePicker}
                className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all text-sm border border-gray-200 hover:border-gray-300"
              >
                إلغاء
              </button>
              {step === 1 ? (
                <button
                  type="button"
                  onClick={goToMinutesStep}
                  disabled={isTransitioning}
                  className={`
                    flex-1 py-3 px-4 text-white font-medium rounded-xl transition-all text-sm shadow-lg hover:shadow-xl
                    ${isTransitioning ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                  style={{ backgroundColor: primaryColor }}
                >
                  {isTransitioning ? "جاري الانتقال..." : "التالي: الدقائق"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setIsTransitioning(false);
                    }}
                    disabled={isTransitioning}
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all text-sm"
                  >
                    رجوع
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 py-3 px-4 text-white font-medium rounded-xl transition-all text-sm shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Check size={18} />
                    <span>تأكيد</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}