// app/dashboard/layout.tsx
"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ClinicProvider, useClinic } from "@/contexts/ClinicContext";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState, lazy } from "react";
import { motion } from "framer-motion";

// استيراد ديناميكي للمكون الذي يستخدم screen API
const RotateDevicePrompt = lazy(() => 
  import("@/components/dashboard/RotateDevicePrompt").then(mod => ({ default: mod.RotateDevicePrompt }))
);

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { clinicData, isLoading, secondaryColor, refetch } = useClinic();
  const [isRefetching, setIsRefetching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [orientationLocked, setOrientationLocked] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  // تأكد من أننا في جانب العميل
  useEffect(() => {
    setIsClient(true);
  }, []);

  // كشف الهاتف - آمن لـ SSR
  useEffect(() => {
    if (!isClient) return;
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [isClient]);

  // التعامل مع اتجاه الشاشة - آمن لـ SSR
  useEffect(() => {
    if (!isMobile || !isClient) return;

    const handleOrientation = async () => {
      const isCurrentlyPortrait = window.innerHeight > window.innerWidth;
      setIsPortrait(isCurrentlyPortrait);
      
      if (!isCurrentlyPortrait) {
        setHasShownPrompt(false);
      }

      if (isCurrentlyPortrait && !orientationLocked && !hasShownPrompt) {
        try {
          // استخدام 'as any' لتجاوز مشكلة TypeScript
          const screenOrientation = (screen as any).orientation;
          if (screenOrientation && typeof screenOrientation.lock === 'function') {
            await screenOrientation.lock('landscape');
            setOrientationLocked(true);
            setIsPortrait(false);
            setHasShownPrompt(true);
          } else {
            setHasShownPrompt(true);
          }
        } catch (error) {
          console.log("لا يمكن قفل الاتجاه تلقائياً:", error);
          setHasShownPrompt(true);
        }
      }
    };

    handleOrientation();

    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);

    return () => {
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
      
      const screenOrientation = (screen as any).orientation;
      if (screenOrientation && typeof screenOrientation.unlock === 'function') {
        screenOrientation.unlock();
      }
    };
  }, [isMobile, orientationLocked, isClient, hasShownPrompt]);

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

  const tryLockOrientation = async () => {
    try {
      const screenOrientation = (screen as any).orientation;
      if (screenOrientation && typeof screenOrientation.lock === 'function') {
        await screenOrientation.lock('landscape');
        setOrientationLocked(true);
        setIsPortrait(false);
        setHasShownPrompt(true);
      }
    } catch (error) {
      console.error("فشل قفل الاتجاه:", error);
    }
  };

  // شاشة تحميل للـ SSR
  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "#007bff", borderTopColor: "transparent" }}
          />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // شاشة تحميل البيانات
  if (isLoading || isRefetching) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "#007bff", borderTopColor: "transparent" }}
          />
          <p className="text-gray-600">
            {isRefetching ? "جاري تحديث البيانات..." : "جاري تحميل البيانات..."}
          </p>
        </div>
      </div>
    );
  }

  // تنبيه تدوير الشاشة
  if (isMobile && isPortrait && orientationLocked) {
    return (
      <Suspense fallback={<div className="fixed inset-0 bg-white" />}>
        <RotateDevicePrompt onTryAutoRotate={tryLockOrientation} />
      </Suspense>
    );
  }

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-3"
          // ✅ نفس التنسيق القديم تماماً
          style={
            isMobile
              ? {
                  transform: 'scale(0.5)',
                  transformOrigin: 'top right',
                  width: '200%',
                  height: '200%',
                  zoom:'25%'
                }
              : {}
          }
        >
          {isMobile && !isPortrait && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <p className="text-blue-700 font-medium text-center text-sm md:text-base">
                📱 تم التدوير بنجاح | للاستخدام الأمثل، حافظ على الوضع الأفقي
              </p>
            </div>
          )}
          
          {children}
        </motion.div>
      </main>
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

  // إذا لم يوجد clinicId نعرض رسالة خطأ
  if (!clinicId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">خطأ: لم يتم العثور على معرف العيادة</p>
      </div>
    );
  }

  return (
    <ClinicProvider clinicId={clinicId}>
      <DashboardContent>{children}</DashboardContent>
    </ClinicProvider>
  );
}