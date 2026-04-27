// app/dashboard/layout.tsx
"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ClinicProvider, useClinic } from "@/contexts/ClinicContext";
import { RotateDevicePrompt } from "@/components/dashboard/RotateDevicePrompt";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { clinicData, isLoading, secondaryColor, refetch } = useClinic();
  const [isRefetching, setIsRefetching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [orientationLocked, setOrientationLocked] = useState(false);

  // كشف الهاتف
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // التعامل مع اتجاه الشاشة
  useEffect(() => {
    if (!isMobile) return;

    const handleOrientation = async () => {
      const isCurrentlyPortrait = window.innerHeight > window.innerWidth;
      setIsPortrait(isCurrentlyPortrait);

      if (isCurrentlyPortrait && !orientationLocked) {
        try {
          if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape');
            setOrientationLocked(true);
            setIsPortrait(false);
          }
        } catch (error) {
          console.log("لا يمكن قفل الاتجاه تلقائياً:", error);
        }
      }
    };

    handleOrientation();

    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);

    return () => {
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
      
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    };
  }, [isMobile, orientationLocked]);

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
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
        setOrientationLocked(true);
        setIsPortrait(false);
      }
    } catch (error) {
      console.error("فشل قفل الاتجاه:", error);
    }
  };

  // شاشة تحميل
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
  if (isMobile && isPortrait && !orientationLocked) {
    return <RotateDevicePrompt onTryAutoRotate={tryLockOrientation} />;
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
          className="p-3 md:p-6"
        >
          {isMobile && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <p className="text-blue-700 font-medium text-center text-sm md:text-base">
                📱 للاستخدام على الهاتف، يُنصح بالوضع الأفقي لعرض أفضل
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

  return (
    <ClinicProvider clinicId={clinicId}>
      <DashboardContent>{children}</DashboardContent>
    </ClinicProvider>
  );
}