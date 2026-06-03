// hooks/useModalBackHandler.ts
import { useEffect, useRef } from "react";

/**
 * منع الرجوع أثناء فتح المودال - آمن مع Next.js App Router
 * @param onClose - دالة إغلاق المودال
 */
export function useModalBackHandler(onClose: () => void) {
  const onCloseRef = useRef(onClose);
  const originalUrlRef = useRef<string | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // حفظ الرابط الأصلي
    originalUrlRef.current = window.location.href;

    // استبدال الحالة الحالية (بدلاً من push) لإضافة علامة المودال
    window.history.replaceState({ modalOpen: true }, "", originalUrlRef.current);

    const handlePopState = (event: PopStateEvent) => {
      // إذا كان الرجوع بسبب علامتنا، نغلق المودال ونستعيد الحالة
      if (event.state?.modalOpen) {
        onCloseRef.current();
        // استعادة الحالة الأصلية بدون إضافة إدخال جديد
        // window.history.replaceState(null, "", originalUrlRef.current!);
      } else {
        // في حالة عدم وجود علامتنا (مثلاً رجوع طبيعي من صفحة سابقة)
        // نغلق المودال ونمنع الرجوع الفعلي
        onCloseRef.current();
        window.history.replaceState({ modalOpen: true }, "", originalUrlRef.current!);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      // تنظيف: إزالة العلامة إذا بقيت
      if (window.history.state?.modalOpen) {
        window.history.replaceState(null, "", originalUrlRef.current!);
      }
    };
  }, []); // يعتمد فقط على [] لأنه لا يحتاج لتغيير onClose (يستخدم ref)
}
