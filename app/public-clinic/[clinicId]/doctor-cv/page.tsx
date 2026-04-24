// app/public/[clinicId]/doctor-cv/page.tsx
import { cache } from 'react';
import DoctorCVPage from '../../components/DoctorCVPage';
import { notFound } from 'next/navigation';
import { getClinicData } from '@/server/helpers/get_clinic_data';

// ✅ تخزين مؤقت على مستوى الطلب الواحد (يمنع الاستدعاء المزدوج)
const getCachedClinicData = cache(getClinicData);

// 🕒 كاش طويل نسبياً - مثلاً 24 ساعة (86400 ثانية) أو أسبوع (604800 ثانية)
export const revalidate = 86400; // 24 ساعة
// export const revalidate = 604800; // أسبوع
// export const revalidate = 2592000; // شهر

// لتوليد metadata ديناميكية للـ SEO
export async function generateMetadata({ params }: { params: { clinicId: string } }) {
  const result = await getCachedClinicData(params.clinicId);
  
  if (!result?.success) {
    return {
      title: 'السيرة الذاتية - العيادة غير موجودة',
      description: 'عذراً، العيادة المطلوبة غير موجودة'
    };
  }
  
  const clinic = result.data;
  
  return {
    title: `السيرة الذاتية - ${clinic.doctorProfile.fullName}`,
    description: `${clinic.doctorProfile.specialization} - ${clinic.doctorProfile.about.substring(0, 150)}...`,
    openGraph: {
      title: `السيرة الذاتية - ${clinic.doctorProfile.fullName}`,
      description: clinic.doctorProfile.about,
      images: clinic.doctorProfile.photo ? [clinic.doctorProfile.photo] : clinic.logo ? [clinic.logo] : [],
    },
  };
}

// الصفحة الرئيسية - Server Component
export default async function DoctorCVServerPage({ 
  params 
}: { 
  params: { clinicId: string } 
}) {
  const result = await getCachedClinicData(params.clinicId);
  
  if (!result?.success) {
    notFound();
  }
  
  const clinic = result.data;
  return <DoctorCVPage clinic={clinic} />;
}