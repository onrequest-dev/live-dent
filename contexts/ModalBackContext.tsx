// contexts/ModalBackContext.tsx
import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";

interface ModalItem {
  id: number;
  onClose: () => void;
}

interface ModalBackContextType {
  registerModal: (onClose: () => void) => () => void;
  setExitToast: (show: boolean, message?: string) => void;
}

const ModalBackContext = createContext<ModalBackContextType | null>(null);

// Toast component مدمج
const ExitToast = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
        {message}
      </div>
    </div>
  );
};

export function ModalBackProvider({ children }: { children: React.ReactNode }) {
  const stackRef = useRef<ModalItem[]>([]);
  const nextIdRef = useRef(0);
  const isPopstateHandlerSet = useRef(false);
  const isProcessingPopstate = useRef(false);

  // State للـ Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(
    "اضغط مرتين للخروج من التطبيق",
  );
  const backPressCountRef = useRef(0);
  const backPressTimerRef = useRef<NodeJS.Timeout>();

  const handlePopState = useCallback(() => {
    if (isProcessingPopstate.current) return;
    isProcessingPopstate.current = true;

    const stack = stackRef.current;

    // إذا كان هناك مودالات مفتوحة -> نغلق المودال الأعلى
    if (stack.length > 0) {
      const lastModal = stack[stack.length - 1];
      lastModal.onClose();

      setTimeout(() => {
        isProcessingPopstate.current = false;
        if (stackRef.current.length === 0) {
          window.history.replaceState(null, "", window.location.href);
        } else {
          window.history.replaceState(
            { modalOpen: true },
            "",
            window.location.href,
          );
        }
      }, 50);
      return;
    }

    // لا يوجد مودالات -> تطبيق "اضغط مرتين للخروج"
    backPressCountRef.current += 1;

    if (backPressCountRef.current === 1) {
      // أول ضغطة: عرض التوست
      setToastMessage("اضغط مرة أخرى للخروج من التطبيق");
      setShowToast(true);

      // إعادة تعيين العداد بعد 2 ثانية
      backPressTimerRef.current = setTimeout(() => {
        backPressCountRef.current = 0;
        setShowToast(false);
      }, 2000);

      isProcessingPopstate.current = false;

      // إضافة حالة جديدة في history لمنع الخروج الفوري
      window.history.pushState({ preventExit: true }, "", window.location.href);
    } else if (backPressCountRef.current >= 2) {
      // الضغطة الثانية: خروج حقيقي من التطبيق
      setShowToast(false);
      if (backPressTimerRef.current) {
        clearTimeout(backPressTimerRef.current);
      }

      // إزالة جميع حالات history والتوجه للخروج
      const currentUrl = window.location.href;
      window.history.go(-window.history.length);

      // محاولة إغلاق النافذة (يعمل في PWAs والتطبيقات المثبتة)
      setTimeout(() => {
        window.close();

        // بديل للمتصفحات العادية: الرجوع للصفحة السابقة أو الصفحة الرئيسية
        if (window.history.length <= 1) {
          window.location.href = "/";
        } else {
          window.location.href = "/";
        }
      }, 100);
    }

    isProcessingPopstate.current = false;
  }, []);

  // إعداد المستمع العام
  useEffect(() => {
    if (!isPopstateHandlerSet.current) {
      isPopstateHandlerSet.current = true;
      window.addEventListener("popstate", handlePopState);

      // إضافة حالة أولية في history
      if (window.history.length === 1) {
        window.history.pushState(null, "", window.location.href);
      }
    }

    return () => {
      // تنظيف المستمع عند إزالة الـ Provider (نادراً ما يحدث)
      if (stackRef.current.length === 0 && isPopstateHandlerSet.current) {
        window.removeEventListener("popstate", handlePopState);
        isPopstateHandlerSet.current = false;
      }

      // تنظيف التايمر
      if (backPressTimerRef.current) {
        clearTimeout(backPressTimerRef.current);
      }
    };
  }, [handlePopState]);

  const registerModal = useCallback((onClose: () => void) => {
    const id = ++nextIdRef.current;
    const modal = { id, onClose };
    stackRef.current.push(modal);

    window.history.pushState({ modalOpen: true }, "", window.location.href);

    // إعادة تعيين عداد الخروج عند فتح مودال
    backPressCountRef.current = 0;
    if (backPressTimerRef.current) {
      clearTimeout(backPressTimerRef.current);
      setShowToast(false);
    }

    return () => {
      const index = stackRef.current.findIndex((item) => item.id === id);
      if (index !== -1) {
        stackRef.current.splice(index, 1);
      }
    };
  }, []);

  const setExitToast = useCallback((show: boolean, message?: string) => {
    setShowToast(show);
    if (message) setToastMessage(message);
  }, []);

  return (
    <ModalBackContext.Provider value={{ registerModal, setExitToast }}>
      {children}
      {showToast && (
        <ExitToast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
    </ModalBackContext.Provider>
  );
}

export function useModalBackHandler(onClose: () => void) {
  const context = useContext(ModalBackContext);
  if (!context) {
    throw new Error(
      "useModalBackHandler must be used within ModalBackProvider",
    );
  }

  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const cleanup = context.registerModal(() => onCloseRef.current());
    return cleanup;
  }, [context]);
}

// Hook مخصص للتحكم في رسالة الخروج
export function useExitToast() {
  const context = useContext(ModalBackContext);
  if (!context) {
    throw new Error("useExitToast must be used within ModalBackProvider");
  }
  return context.setExitToast;
}
