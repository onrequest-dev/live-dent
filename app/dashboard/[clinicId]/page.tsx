// app/dashboard/[clinicId]/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MainTab } from '../../../components/dashboard/tabs/MainTab';
import { PatientsTab } from '../../../components/dashboard/tabs/PatientsTab';
import { ClinicInfoTab } from '../../../components/dashboard/tabs/ClinicInfoTab';
import { DoctorCVTab } from '../../../components/dashboard/tabs/DoctorCVTab';
import { MessagesTab } from '../../../components/dashboard/tabs/MessagesTab';
import { SettingsTab } from '../../../components/dashboard/tabs/SettingsTab';
import { getClinic, getClinicData } from '@/client/helpers/clinic';
import { Clinic, Patient, PatientCase, Session } from '@/types';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'main';
  
  // ✅ حالات البيانات
  const [isLoading, setIsLoading] = useState(true);
  const [clinicData, setClinicData] = useState<Clinic | null>(null);
  const [dashboardData, setDashboardData] = useState<{
    patients: Patient[];
    patientCases: PatientCase[];
    sessions: Session[];
  }>({
    patients: [],
    patientCases: [],
    sessions: []
  });
  const [error, setError] = useState<string | null>(null);
  
  // ✅ جلب جميع البيانات عند تحميل الصفحة
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // جلب البيانات بالتوازي
        const [clinicResult, clinicDataResult] = await Promise.all([
          getClinic(),
          getClinicData()
        ]);
        
        // معالجة بيانات العيادة
        if (clinicResult.success && clinicResult.data) {
          setClinicData(clinicResult.data);
        } else {
          console.error('فشل جلب بيانات العيادة:', clinicResult.error);
          setError(clinicResult.error || 'فشل جلب بيانات العيادة');
        }
        
        // معالجة بيانات المرضى والحالات والجلسات
        if (clinicDataResult.success && clinicDataResult.data) {
          setDashboardData({
            patients: clinicDataResult.data.patients || [],
            patientCases: clinicDataResult.data.patientCases || [],
            sessions: clinicDataResult.data.sessions || []
          });
        } else {
          console.error('فشل جلب بيانات العيادة الإضافية:', clinicDataResult.error);
        }
        
      } catch (err) {
        console.error('خطأ في جلب البيانات:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  // ✅ عرض شاشة التحميل
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // ✅ عرض رسالة خطأ
  if (error && !clinicData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // ✅ عرض التبويب المناسب مع تمرير البيانات
  const renderTab = () => {
    switch (tab) {
      case 'main':
        return (
          <MainTab 
            clinicData={clinicData}
            patients={dashboardData.patients}
            patientCases={dashboardData.patientCases}
            sessions={dashboardData.sessions}
          />
        );
        
        case 'patients':
          return (
            <PatientsTab 
              clinicData={clinicData}
              patients={dashboardData.patients}
              patientCases={dashboardData.patientCases}
              sessions={dashboardData.sessions}
            />
          );
        
      case 'clinic':
        return (
          <ClinicInfoTab 
            clinicData={clinicData}
          />
        );
        
      case 'cv':
        return (
        <DoctorCVTab clinicData={clinicData} />
        );
        
      case 'messages':
        return (
          <MessagesTab />
        );

      case 'settings': 
        return (
          <SettingsTab clinicData={clinicData} />
      );
        
      default:
        return (
          <MainTab 
            clinicData={clinicData}
            patients={dashboardData.patients}
            patientCases={dashboardData.patientCases}
            sessions={dashboardData.sessions}
          />
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className='mt-8'
      >
        {renderTab()}
      </motion.div>
    </AnimatePresence>
  );
}