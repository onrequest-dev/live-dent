// app/dashboard/layout.tsx
"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ClinicProvider, useClinic } from "@/contexts/ClinicContext";
import { useParams, usePathname } from "next/navigation";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { PWAInstallPrompt } from "@/components/dashboard/PWAInstallPrompt";
import DoubleClickToExit from "@/contexts/DoubleClickToExit";
import ToothLoader from "../../components/loding";

// أقصى عدد من الصفحات للاحتفاظ بها في الذاكرة
const MAX_CACHED_PAGES = 6;

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { clinicData, isLoading, secondaryColor, refetch } = useClinic();
  const [isRefetching, setIsRefetching] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  // كاش الصفحات: مفتاح = المسار، قيمة = عنصر React المخزن
  const pagesCache = useRef<Map<string, React.ReactNode>>(new Map());

  // قائمة المسارات بالترتيب (لإدارة سقف الذاكرة - نمسح الأقدم)
  const cachedKeysOrder = useRef<string[]>([]);

  // حالة إضافية لإجبار إعادة render عند إضافة صفحة للكاش
  const [, forceRender] = useState(0);

  // دالة تخزين الصفحة في الكاش مع إدارة السقف
  const cachePage = useCallback(
    (path: string, pageContent: React.ReactNode) => {
      if (!path) return;

      // إذا كانت الصفحة غير موجودة في الكاش، نخزنها
      if (!pagesCache.current.has(path)) {
        // إدارة سقف الذاكرة: إذا تجاوزنا الحد، نحذف أقدم صفحة
        if (cachedKeysOrder.current.length >= MAX_CACHED_PAGES) {
          const oldestKey = cachedKeysOrder.current.shift();
          if (oldestKey) {
            pagesCache.current.delete(oldestKey);
          }
        }
        pagesCache.current.set(path, pageContent);
        cachedKeysOrder.current.push(path);
        forceRender((prev) => prev + 1);
      } else {
        // إذا كانت موجودة، نحدث ترتيبها فقط (ننقلها للنهاية كأحدث استخدام)
        cachedKeysOrder.current = cachedKeysOrder.current.filter(
          (k) => k !== path,
        );
        cachedKeysOrder.current.push(path);
      }
    },
    [],
  );

  // تخزين الصفحة الحالية عند تغير المسار
  useEffect(() => {
    if (pathname && children) {
      cachePage(pathname, children);
    }
  }, [pathname, children, cachePage]);

  // تأكد من أننا في جانب العميل
  useEffect(() => {
    setIsClient(true);
  }, []);

  // مستمع تحديث البيانات
  useEffect(() => {
    const handleRefreshRequest = async () => {
      if (refetch && !isRefetching) {
        setIsRefetching(true);
        try {
          await refetch();
        } catch (error) {
          console.error("فشل إعادة تحميل بيانات المرضى:", error);
        } finally {
          setIsRefetching(false);
        }
      }
    };

    window.addEventListener("refreshPatientsData", handleRefreshRequest);
    return () =>
      window.removeEventListener("refreshPatientsData", handleRefreshRequest);
  }, [refetch, isRefetching]);

  // شاشة تحميل للـ SSR
  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <ToothLoader />
        </div>
      </div>
    );
  }

  // شاشة تحميل البيانات
  if (isLoading || isRefetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <ToothLoader />
        </div>
      </div>
    );
  }

  // بناء مصفوفة الصفحات المخزنة
  const cachedEntries = Array.from(pagesCache.current.entries());

  // الواجهة الرئيسية
  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <Suspense
        fallback={<div className="w-[280px] bg-white/80 backdrop-blur-xl" />}
      >
        <DashboardSidebar clinicData={clinicData} />
      </Suspense>

      <main
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{
          background: `linear-gradient(135deg, ${secondaryColor} 0%, ${secondaryColor}90 0%, #ffffff 100%)`,
        }}
      >
        {/* عرض كل الصفحات المخزنة، الصفحة النشطة فقط هي الظاهرة */}
        {cachedEntries.length > 0 ? (
          cachedEntries.map(([path, pageContent]) => {
            const isActive = path === pathname;
            return (
              <div key={path} style={{ display: isActive ? "block" : "none" }}>
                <motion.div
                  initial={isActive ? { opacity: 0 } : false}
                  animate={isActive ? { opacity: 1 } : false}
                  transition={{ duration: 0.3 }}
                  className="p-3 md:p-6 dashboard-mobile-scale"
                >
                  {pageContent}
                </motion.div>
              </div>
            );
          })
        ) : (
          // لا توجد صفحات مخزنة بعد (أول تحميل) - عرض الأطفال مباشرة
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-3 md:p-6 dashboard-mobile-scale"
          >
            {children}
          </motion.div>
        )}
      </main>
      <PWAInstallPrompt />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const clinicId = params?.clinicId as string;

  useEffect(() => {
    const refreshpage = sessionStorage.getItem("refresh_from_switch_account");
    if (refreshpage && refreshpage === "true") {
      setTimeout(() => {
        sessionStorage.removeItem("refresh_from_switch_account");
        window.location.reload();
      }, 600);
    }
  }, []);

  if (!clinicId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">خطأ: لم يتم العثور على معرف العيادة</p>
      </div>
    );
  }

  return (
    <DoubleClickToExit message="اضغط مرتين للخروج من التطبيق" timeout={2000}>
      <ClinicProvider clinicId={clinicId}>
        <DashboardContent>{children}</DashboardContent>
      </ClinicProvider>
    </DoubleClickToExit>
  );
}
