// app/dashboard/layout.tsx
"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ClinicProvider, useClinic } from "@/contexts/ClinicContext";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PWAInstallPrompt } from "@/components/dashboard/PWAInstallPrompt";
function DashboardContent({ children }: { children: React.ReactNode }) {
  const { clinicData, isLoading, secondaryColor, refetch } = useClinic();
  const [isRefetching, setIsRefetching] = useState(false);
  const [isClient, setIsClient] = useState(false);

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
          className="p-3 md:p-6 dashboard-mobile-scale"
        >
          {children}
        </motion.div>
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
    <ClinicProvider clinicId={clinicId}>
      <DashboardContent>{children}</DashboardContent>
    </ClinicProvider>
  );
}
