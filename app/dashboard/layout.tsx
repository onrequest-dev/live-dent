'use client';

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ClinicProvider } from '@/contexts/ClinicContext';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { mockClinic } from '@/lib/mock/data';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const clinicId = params?.clinicId as string;
  
  // استخراج اللون الثانوي من البيانات الوهمية
  const secondaryColor = mockClinic.settings.secondaryColor; // #f83838

  return (
    <ClinicProvider clinicId={clinicId}>
      <div className="flex h-screen overflow-hidden" dir="rtl">
        <Suspense fallback={<div className="w-[280px] bg-white/80 backdrop-blur-xl" />}>
          <DashboardSidebar />
        </Suspense>
        
        {/* منطقة المحتوى بلون الخلفية الثانوي */}
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
    </ClinicProvider>
  );
}