import { cache } from 'react';
import PatientPage from '../../components/PatientPage';
import { notFound } from 'next/navigation';
import { getPatientData } from '@/server/helpers/get_patient_card';

// ✅ استدعاء واحد لكل طلب (حتى لو استُخدم في generateMetadata والصفحة)
const getCachedPatientData = cache(getPatientData);

// 🕒 caching قصير المدة (مثلاً 60 ثانية) – يزول بعدها ويُجلب من المصدر
export const revalidate = 60; // بدلاً من 0

// ❌ نزيل force-dynamic لأنه يلغي أي caching
// export const dynamic = 'force-dynamic';

// (اختياري) إذا أردت منع التخزين المؤقت على مستوى الـ router cache في Next.js
// export const fetchCache = 'default-cache'; // هذا هو السلوك الافتراضي

export async function generateMetadata({ params }: { params: { clinicId: string; patient: string } }) {
  const result = await getCachedPatientData(params.clinicId, params.patient);

  if (!result?.success || !result.data) {
    return {
      title: 'المريض غير موجود',
      description: 'عذراً، المريض المطلوب غير موجود',
    };
  }

  const { patient, clinic } = result.data;
  return {
    title: `${patient.fullName} - ${clinic.name}`,
    description: `ملف المريض ${patient.fullName} في ${clinic.name}`,
  };
}

export default async function PatientServerPage({
  params,
}: {
  params: { clinicId: string; patient: string };
}) {
  const result = await getCachedPatientData(params.clinicId, params.patient);

  if (!result?.success || !result.data) {
    notFound();
  }

  const { clinic, patient, sessions } = result.data;
  return <PatientPage clinic={clinic} patient={patient} sessions={sessions} />;
}