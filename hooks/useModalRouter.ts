"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

/**
 * Hook لإدارة فتح/إغلاق المودال عبر URL query param ?modal=...
 *
 * @param modalKey - مفتاح مميز للمودال (مثلاً: "newPatient")
 * @param onClose  - دالة تُستدعى عند إغلاق المودال (اختياري)
 * @returns { isOpen, openModal, closeModal }
 */
export function useModalRouter(
  modalKey: string,
  onClose?: () => void
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // هل المودال مفتوح حالياً؟
  const isOpen = searchParams.get("modal") === modalKey;

  // مرجع لتجنب استدعاء onClose عند التهيئة الأولية
  const mountedRef = useRef(false);

  useEffect(() => {
    // نتجاهل أول مرة يتم فيها التركيب (mount)
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    // إذا تغيرت قيمة الـ query param ولم تعد تساوي modalKey، فهذا يعني أن المستخدم ضغط "رجوع"
    if (!isOpen && onClose) {
      onClose();
    }
  }, [isOpen, onClose]);

  const openModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", modalKey);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [modalKey, pathname, router, searchParams]);

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    onClose?.();
  }, [modalKey, pathname, router, searchParams, onClose]);

  return { isOpen, openModal, closeModal };
}