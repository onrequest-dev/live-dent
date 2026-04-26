// app/dashboard/layout.tsx
"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ClinicProvider, useClinic } from "@/contexts/ClinicContext";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { clinicData, isLoading, secondaryColor, refetch } = useClinic();
  const [isRefetching, setIsRefetching] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // ✅ كشف الهاتف
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          style={
            isMobile
              ? {
                  transform: 'scale(0.5)',
                  transformOrigin: 'top right',
                  width: '200%',
                  height: '200%',
                }
              : {}
          }
        >
          {isMobile && (
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-xl text-blue-700 font-medium text-center">
                 الواجهة محسّنة للشاشات الكبيرة. يُنصح باستخدام كمبيوتر أو تابلت
              </p>
              <p className="text-xl text-blue-700 font-medium text-center">
                يمكنك من هنا العمل في الحالات الضرورية
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