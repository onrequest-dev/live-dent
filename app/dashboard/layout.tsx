// app/dashboard/layout.tsx
'use client';

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ClinicProvider, useClinic } from '@/contexts/ClinicContext';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

// ✅ مكون داخلي يستخدم الـ Context
function DashboardContent({ children }: { children: React.ReactNode }) {
  const { clinicData, isLoading, secondaryColor } = useClinic();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
               style={{ borderColor: '#007bff', borderTopColor: 'transparent' }} />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" dir="rtl">
      <Suspense fallback={<div className="w-[280px] bg-white/80 backdrop-blur-xl" />}>
        <DashboardSidebar clinicData={clinicData} />
      </Suspense>
      
      <main 
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{ 
          background: `linear-gradient(135deg, ${secondaryColor} 0%, ${secondaryColor}90 0%, #ffffff 100%)`
        }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="p-3"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

// ✅ المكون الرئيسي - مبسط جداً
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