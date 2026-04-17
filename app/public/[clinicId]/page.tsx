// app\public\[clinicId]\page.tsx

import PublicClinicPage from '../components/CliniclPage';
import { notFound } from 'next/navigation';
import { Clinic } from '@/types';

// ============================================================
// بيانات وهمية للعرض - لتوضيح هيكل البيانات لمطور الباك إند
// ============================================================

const MOCK_CLINIC_DATA: Clinic = {
  id: 'clinic-001',
  name: 'مركز الابتسامة لطب الأسنان',
  logo: '/img/logo.png',
  subscriptionStatus: 'active',
  createdAt: new Date('2023-01-01'),
  address: 'دوار الشيخ تلت عإيدك التالتة بتمد راسك بين اجريك بتشوف العيادة',
  
  doctorProfile: {
    fullName: 'د. أحمد محمد العنزي',
    specialization: 'دكتوراه في تركيبات وتجميل الأسنان',
    about: 'خبرة أكثر من 15 عاماً في مجال طب الأسنان التجميلي والتركيبات. نقدم أحدث التقنيات العالمية لضمان ابتسامة مثالية لمرضانا.',
    education: [
      'بكالوريوس طب وجراحة الفم والأسنان - جامعة الملك سعود',
      'ماجستير علاج الجذور - جامعة القاهرة',
      'دكتوراه في تركيبات الأسنان - جامعة مانشستر',
    ],
    experience: [
      'استشاري تركيبات الأسنان - مستشفى الملك فيصل التخصصي (2010-2015)',
      'مدير مركز الابتسامة لطب الأسنان (2015 - حتى الآن)',
      'عضو الجمعية السعودية لطب الأسنان',
    ],
    photo: '/img/image.png',
    contactEmail: 'dr.ahmed@ebtesama-clinic.com',
    graduationYear: 2004,
    university: 'جامعة الملك سعود'
  },
  
  settings: {
    defaultAppointmentDuration: 30,
    workingHours: [
      { day: 0, start: '09:00', end: '17:00', isClosed: false }, // الأحد
      { day: 1, start: '09:00', end: '17:00', isClosed: false }, // الإثنين
      { day: 2, start: '09:00', end: '17:00', isClosed: false }, // الثلاثاء
      { day: 3, start: '09:00', end: '17:00', isClosed: false }, // الأربعاء
      { day: 4, start: '09:00', end: '17:00', isClosed: false }, // الخميس
      { day: 5, start: '00:00', end: '00:00', isClosed: true },  // الجمعة
      { day: 6, start: '09:00', end: '14:00', isClosed: false }, // السبت
    ],
    primaryColor: '#8385da',
    secondaryColor: '#f8f8f8',
  },
};

// ============================================================
// دوال جلب البيانات
// ============================================================

async function getClinicData(clinicId: string): Promise<Clinic | null> {
  // محاكاة async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // TODO: استبدل هذا بالاتصال الفعلي بقاعدة البيانات
  // مثال للـ API call:
  // const response = await fetch(`${process.env.API_URL}/clinics/${clinicId}`);
  // if (!response.ok) return null;
  // return response.json();
  
  // حالياً: التحقق من وجود العيادة في البيانات الوهمية
  if (clinicId !== MOCK_CLINIC_DATA.id) {
    return null;
  }
  
  return MOCK_CLINIC_DATA;
}

// ============================================================
// Next.js Functions
// ============================================================

// لتوليد الصفحات الثابتة في وقت البناء (SSG)
export async function generateStaticParams() {
  // TODO: استبدل هذا بجلب جميع clinicIds من قاعدة البيانات
  // مثال:
  // const clinics = await fetch(`${process.env.API_URL}/clinics`).then(res => res.json());
  // return clinics.map(clinic => ({ clinicId: clinic.id }));
  
  return [
    { clinicId: 'clinic-001' },
    // أضف المزيد من العيادات هنا
  ];
}

// لتوليد metadata ديناميكية للـ SEO
export async function generateMetadata({ params }: { params: { clinicId: string } }) {
  const clinic = await getClinicData(params.clinicId);
  
  if (!clinic) {
    return {
      title: 'العيادة غير موجودة',
      description: 'عذراً، العيادة المطلوبة غير موجودة'
    };
  }
  
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

// الصفحة الرئيسية - Server Component
export default async function PublicClinicServerPage({ 
  params 
}: { 
  params: { clinicId: string } 
}) {
  const clinic = await getClinicData(params.clinicId);
  
  if (!clinic) {
    notFound();
  }
  
  // تمرير البيانات للمكون
  return <PublicClinicPage clinic={clinic} />;
}

/*
 * ============================================================
 * ملاحظات لمطور الباك إند:
 * ============================================================
 * 
 * هيكل البيانات المطلوب من الـ API:
 * 
 * GET /api/clinics/:clinicId
 * 
 * Response Structure (JSON):
 * {
 *   "id": string,
 *   "name": string,
 *   "logo": string | null,
 *   "subscriptionStatus": "active" | "inactive" | "trial" | "expired",
 *   "createdAt": Date,
 *   "address": string,
 *   "doctorProfile": {
 *     "fullName": string,
 *     "specialization": string,
 *     "about": string,
 *     "education": string[],
 *     "experience": string[],
 *     "photo": string | null,
 *     "contactEmail": string,
 *     "graduationYear": number,
 *     "university": string
 *   },
 *   "settings": {
 *     "defaultAppointmentDuration": number, // بالدقائق
 *     "workingHours": Array<{
 *       "day": number,        // 0 = الأحد، 1 = الإثنين، ... 6 = السبت
 *       "start": string,      // تنسيق 24 ساعة "HH:mm"
 *       "end": string,        // تنسيق 24 ساعة "HH:mm"
 *       "isClosed": boolean
 *     }>,
 *     "primaryColor": string,  // hex color code
 *     "secondaryColor": string // hex color code
 *   }
 * }
 * 
 * ============================================================
 */