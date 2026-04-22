// app\public\[clinicId]\[patient]\page.tsx

import PatientPage from '../../components/PatientPage';
import { notFound } from 'next/navigation';
import { getPatientData } from '@/server/helpers/get_patient_card';



// needs attintion
export const dynamic = 'force-dynamic';
export const revalidate = 0;


// ============================================================
// بيانات وهمية لمريض واحد - لتوضيح هيكل البيانات لمطور الباك إند
// ============================================================

const getDate = (daysFromNow: number, hours: number = 9, minutes: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const today = new Date();
const todayStr = today.toISOString().split('T')[0];








export async function generateMetadata({ params }: { params: { clinicId: string; patient: string } }) {
  const result = await getPatientData(params.clinicId, params.patient);
  
  if (!result.success) {
    return {
      title: 'المريض غير موجود',
      description: 'عذراً، المريض المطلوب غير موجود'
    };
  }
  const data = result.data;
  if(!data){
    return {
      title: 'المريض غير موجود',
      description: 'عذراً، المريض المطلوب غير موجود'
    };
  }
  
  return {
    title: `${data.patient.fullName} - ${data.clinic.name}`,
    description: `ملف المريض ${data.patient.fullName} في ${data.clinic.name}`,
  };
}

// الصفحة الرئيسية - Server Component
export default async function PatientServerPage({ 
  params 
}: { 
  params: { clinicId: string; patient: string } 
}) {
  const result = await getPatientData(params.clinicId, params.patient);
  
  if (!result.success) {
    notFound();
  }
  
  const data = result.data;
  if(!data){
    notFound();
  }
  // تمرير البيانات للمكون
  return (
    <PatientPage 
      clinic={data.clinic}
      patient={data.patient}
      sessions={data.sessions}
    />
  );
}

