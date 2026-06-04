"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * إدارة فتح / إغلاق المودال مع الحفاظ على نظافة History API
 * @param onClose - دالة الإغلاق (تغيير الحالة لإخفاء المودال)
 * @returns دالة closeModal التي يجب استدعاؤها عند إغلاق المودال
 */
export function useModalBackHandler(onClose: () => void) {
  const onCloseRef = useRef(onClose);
  const pushedRef = useRef(false); // هل أضفنا pushState؟
  const ignorePopRef = useRef(false); // لتجاهل popState عند الإغلاق اليدوي

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // عند فتح المودال: أضف إدخالاً واحداً بنفس الرابط
    history.pushState({ modalOpen: true }, "", location.href);
    pushedRef.current = true;

    const handlePopState = (event: PopStateEvent) => {
      if (ignorePopRef.current) {
        // تم استدعاء history.back() يدوياً، تجاهل
        ignorePopRef.current = false;
        return;
      }

      if (event.state?.modalOpen) {
        // ضغط المستخدم زر الرجوع => نغلق المودال فقط، وسيتم حذف الإدخال تلقائياً
        onCloseRef.current();
        pushedRef.current = false; // نظفنا
      }
      // إذا كانت الحالة فارغة (عادي) اسمح بالرجوع الطبيعي
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const closeModal = useCallback(() => {
    if (pushedRef.current) {
      // إزالة الإدخال الذي أضفناه من history بطريقة آمنة
      ignorePopRef.current = true; // منع popstate من استدعاء onClose
      window.history.back(); // الرجوع للوراء (يحذف الإدخال)
      pushedRef.current = false;
    }
    // استدعاء الإغلاق من الخارج (يخفي المودال)
    onCloseRef.current();
  }, []);

  return { closeModal };
}