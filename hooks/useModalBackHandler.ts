// hooks/useModalBackHandler.ts
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    __modalStack?: Array<{ id: number; onClose: () => void }>;
    __popstateLock?: boolean;
    __nextModalId?: number;
  }
}

function getModalStack() {
  if (!window.__modalStack) window.__modalStack = [];
  return window.__modalStack;
}

function getNextId() {
  if (!window.__nextModalId) window.__nextModalId = 0;
  return ++window.__nextModalId;
}

// معالج واحد عام لحدث popstate
function handlePopState() {
  // قفل لمنع التنفيذ المتكرر أثناء نفس الحدث
  if (window.__popstateLock) return;
  window.__popstateLock = true;

  const stack = getModalStack();
  if (stack.length === 0) {
    window.__popstateLock = false;
    return;
  }

  // نأخذ آخر مودال (الأحدث) ولكن لا نزيله من المكدس الآن
  const lastModal = stack[stack.length - 1];
  // نغلق المودال
  lastModal.onClose();

  // نعطي فرصة للمودال أن ينظف نفسه من المكدس (في useEffect cleanup)
  // ثم نحرر القفل بعد فترة قصيرة
  setTimeout(() => {
    window.__popstateLock = false;
    // نتأكد أن المكدس لم يعد يحتوي على نفس المودال (تم حذفه)
    // ونستبدل الحالة الحالية للحفاظ على الرابط
    if (getModalStack().length === 0) {
      // إذا أصبح المكدس فارغاً، نزيل أي علامة modalOpen
      window.history.replaceState(null, "", window.location.href);
    } else {
      window.history.replaceState({ modalOpen: true }, "", window.location.href);
    }
  }, 50);
}

export function useModalBackHandler(onClose: () => void) {
  console.log("🔔 useModalBackHandler initialized");
  const onCloseRef = useRef(onClose);
  const idRef = useRef<number>(-1);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // إضافة هذا المودال إلى المكدس
    const id = getNextId();
    idRef.current = id;
    const stack = getModalStack();
    stack.push({ id, onClose: () => onCloseRef.current() });

    // إضافة المستمع العالمي لحدث popstate مرة واحدة فقط
    if (!window.__popstateLock && !window.hasOwnProperty("__popstateListenerAdded")) {
      window.addEventListener("popstate", handlePopState);
      (window as any).__popstateListenerAdded = true;

      // إذا كان الـ history فارغاً تقريباً (طول 1) نضيف حالة أولية
      if (window.history.length === 1) {
        window.history.pushState(null, "", window.location.href);
      }
    }

    // إضافة حالة جديدة للمودال الحالي في history
    window.history.pushState({ modalOpen: true }, "", window.location.href);

    // عند إلغاء تركيب المودال (إغلاقه)
    return () => {
      // إزالة هذا المودال من المكدس
      const stack = getModalStack();
      const index = stack.findIndex((item) => item.id === idRef.current);
      if (index !== -1) stack.splice(index, 1);

      // إذا أصبح المكدس فارغاً، نزيل المستمع العام
      if (stack.length === 0 && (window as any).__popstateListenerAdded) {
        window.removeEventListener("popstate", handlePopState);
        delete (window as any).__popstateListenerAdded;
      }
    };
  }, []); // يعتمد فقط على [] – لا حاجة لإعادة التشغيل
}