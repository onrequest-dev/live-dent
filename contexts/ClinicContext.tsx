// contexts/ClinicContext.tsx
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Clinic } from '@/types';
import { getClinic } from '@/client/helpers/clinic';

// ✅ توسيع النوع ليشمل بيانات العيادة
type ClinicContextType = {
  clinicId: string;
  clinicData: Clinic | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  primaryColor: string;
  secondaryColor: string;
};

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({
  children,
  clinicId,
}: {
  children: ReactNode;
  clinicId: string;
}) {
  const [clinicData, setClinicData] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ استخراج الألوان من البيانات
  const primaryColor = clinicData?.settings?.primaryColor || '#007bff';
  const secondaryColor = clinicData?.settings?.secondaryColor || '#6c757d';

  const fetchClinicData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await getClinic();
      
      if (result.success && result.data) {
        setClinicData(result.data);
      } else {
        setError(result.error || 'فشل جلب بيانات العيادة');
        console.warn('⚠️ فشل جلب بيانات العيادة:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
      console.error('💥 خطأ في جلب بيانات العيادة:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ جلب البيانات عند تحميل المكون
  useEffect(() => {
    if (clinicId) {
      fetchClinicData();
    }
  }, [clinicId]);

  return (
    <ClinicContext.Provider value={{ 
      clinicId, 
      clinicData, 
      isLoading, 
      error, 
      refetch: fetchClinicData,
      primaryColor,
      secondaryColor,
    }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within ClinicProvider');
  }
  return context;
}