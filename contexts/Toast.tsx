"use client";

import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  duration?: number;
  onClose?: () => void;
  position?: "top" | "bottom";
  type?: "android" | "ios" | "simple";
}

// كشف نوع النظام
const detectOS = (): "android" | "ios" | "other" => {
  if (typeof navigator === "undefined") return "other";
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  if (/android/i.test(userAgent)) return "android";
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return "ios";
  
  return "other";
};

const Toast: React.FC<ToastProps> = ({
  message,
  duration = 2000,
  onClose,
  position = "bottom",
  type = "android",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (message) {
      // ظهور التنبيه
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      // إخفاء التنبيه بعد المدة المحددة
      const hideTimer = setTimeout(() => {
        setIsLeaving(true);
        setTimeout(() => {
          setIsVisible(false);
          setIsLeaving(false);
          onClose?.();
        }, 300); // مدة أنيميشن الإخفاء
      }, duration);

      return () => clearTimeout(hideTimer);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  // تحديد الـ styles حسب النوع - كلها في الأسفل
 const getToastStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "fixed",
      left: "50%",
      bottom: "100px",
      transform: `translateX(-50%) translateY(${isVisible && !isLeaving ? "0" : "10px"})`,
      backgroundColor: "rgba(30, 30, 30, 0.92)",
      color: "white",
      padding: "6px 16px",
      borderRadius: "20px",
      zIndex: 9999,
      fontSize: "12px",
      fontWeight: "400",
      letterSpacing: "0.2px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      opacity: isVisible && !isLeaving ? 1 : 0,
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      minWidth: "auto",
      maxWidth: "80vw",
      textAlign: "center" as const,
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "0.5px solid rgba(255,255,255,0.12)",
      pointerEvents: "none" as const,
      userSelect: "none" as const,
      lineHeight: "1.2",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "4px",
    };

    switch (type) {
      case "ios":
        return {
          ...baseStyles,
          bottom: "120px",
          backgroundColor: "rgba(245, 245, 245, 0.9)",
          color: "#1c1c1e",
          borderRadius: "12px",
          padding: "5px 14px",
          fontSize: "11px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(0,0,0,0.06)",
          border: "none",
          fontWeight: "400",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        };
      case "simple":
        return {
          ...baseStyles,
          bottom: "100px",
          backgroundColor: "rgba(50, 50, 50, 0.95)",
          borderRadius: "16px",
          padding: "5px 14px",
          fontSize: "11px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
          border: "0.5px solid rgba(255,255,255,0.08)",
        };
      case "android":
      default:
        return {
          ...baseStyles,
          bottom: "100px",
          padding: "6px 16px",
          borderRadius: "18px",
          fontSize: "12px",
        };
    }
  };

  return (
    <div style={getToastStyles()}>
      {message}
    </div>
  );
};

// تصدير مكون مع إعدادات افتراضية
export default Toast;

// Hook مخصص لاستخدام التوست
export const useToast = () => {
  const [toastProps, setToastProps] = useState<ToastProps>({ message: "" });

  const showToast = (message: string, options?: Partial<ToastProps>) => {
    const detectedOS = detectOS();
    setToastProps({
      message,
      duration: options?.duration || 2000,
      position: "bottom", // دائماً في الأسفل
      type: options?.type || (detectedOS === "ios" ? "ios" : detectedOS === "android" ? "android" : "simple"),
      onClose: () => setToastProps(prev => ({ ...prev, message: "" })),
    });
  };

  const ToastComponent = <Toast {...toastProps} />;

  return { showToast, ToastComponent };
};