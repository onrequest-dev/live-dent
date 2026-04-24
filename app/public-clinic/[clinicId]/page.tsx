// app/public/[clinicId]/page.tsx
import { cache } from 'react';
import PublicClinicPage from '../components/CliniclPage';
import { notFound } from 'next/navigation';
import { getClinicData } from '@/server/helpers/get_clinic_data';


const getCachedClinicData = cache(getClinicData);
export const revalidate = 86400; // 24 ساعة

export async function generateMetadata({ params }: { params: { clinicId: string } }) {
  const result = await getCachedClinicData(params.clinicId);

  if (!result?.success) {
    return {
      title: 'العيادة غير موجودة',
      description: 'عذراً، العيادة المطلوبة غير موجودة'
    };
  }

  const clinic = result.data;
  return {
    title: clinic.name,
    description: clinic.doctorProfile.about,
    openGraph: {
      title: clinic.name,
      description: clinic.doctorProfile.about,
      images: clinic.logo ? [clinic.logo] : [],
    },
  };
}

export default async function PublicClinicServerPage({
  params
}: {
  params: { clinicId: string }
}) {
  const result = await getCachedClinicData(params.clinicId);

  if (!result?.success) {
    notFound();
  }

  return <PublicClinicPage clinic={result.data} />;
}