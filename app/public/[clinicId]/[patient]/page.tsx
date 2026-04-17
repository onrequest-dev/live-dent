// app\public\[clinicId]\[patient]\page.tsx

import PatientPage from '../../components/PatientPage';
import { notFound } from 'next/navigation';
import { Clinic, Patient, Session } from '@/types';

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

// بيانات العيادة
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
    about: 'خبرة أكثر من 15 عاماً في مجال طب الأسنان التجميلي والتركيبات.',
    education: [
      'بكالوريوس طب وجراحة الفم والأسنان - جامعة الملك سعود',
      'ماجستير علاج الجذور - جامعة القاهرة',
    ],
    experience: [
      'استشاري تركيبات الأسنان - مستشفى الملك فيصل التخصصي (2010-2015)',
      'مدير مركز الابتسامة لطب الأسنان (2015 - حتى الآن)',
    ],
    photo: '/img/image.png',
    contactEmail: 'dr.ahmed@ebtesama-clinic.com',
    graduationYear: 2004,
    university: 'جامعة الملك سعود'
  },
  
  settings: {
    defaultAppointmentDuration: 30,
    workingHours: [
      { day: 0, start: '09:00', end: '17:00', isClosed: false },
      { day: 1, start: '09:00', end: '17:00', isClosed: false },
      { day: 2, start: '09:00', end: '17:00', isClosed: false },
      { day: 3, start: '09:00', end: '17:00', isClosed: false },
      { day: 4, start: '09:00', end: '17:00', isClosed: false },
      { day: 5, start: '00:00', end: '00:00', isClosed: true },
      { day: 6, start: '09:00', end: '14:00', isClosed: false },
    ],
    primaryColor: '#8385da',
    secondaryColor: '#f8f8f8',
  },
};

// بيانات المريض المطلوب (patient-001)
const MOCK_PATIENT_DATA: Patient = {
  id: 'patient-001',
  clinicId: 'clinic-001',
  fullName: 'هادي قدور',
  phone: '352681523130',
  gender: 'female',
  age: 28,
  notes: 'تفضل مواعيد المساء - حساسية من البنسلين',
  createdAt: new Date('2023-04-01'),
};

// جلسات المريض المطلوب فقط
const MOCK_PATIENT_SESSIONS_DATA: Session[] = [
  // جلسة اليوم
  {
    id: 'session-001-1',
    clinicId: 'clinic-001',
    patientId: 'patient-001',
    startTime: new Date(`${todayStr}T09:00:00`),
    endTime: new Date(`${todayStr}T09:30:00`),
    status: 'scheduled',
    plannedProcedure: 'تنظيف أسنان',
    toothNumber: [],
    sessionCost: 300,
    isPaid: false,
    patientSnapshot: {
      name: 'هادي قدور',
      phone: '352681523130',
    },
  },
  
  // جلسات سابقة
  {
    id: 'session-001-2',
    clinicId: 'clinic-001',
    patientId: 'patient-001',
    startTime: getDate(-14, 10, 0),
    endTime: getDate(-14, 10, 30),
    status: 'completed',
    plannedProcedure: 'كشف أولي',
    performedProcedure: 'فحص شامل وتصوير أشعة',
    toothNumber: [],
    sessionCost: 200,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: getDate(-14, 10, 30),
    patientSnapshot: {
      name: 'هادي قدور',
      phone: '352681523130',
    },
  },
  {
    id: 'session-001-3',
    clinicId: 'clinic-001',
    patientId: 'patient-001',
    startTime: getDate(-7, 11, 0),
    endTime: getDate(-7, 11, 45),
    status: 'completed',
    plannedProcedure: 'حشوة',
    performedProcedure: 'حشوة تجميلية للضرس 16',
    toothNumber: ['16'],
    sessionCost: 450,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: getDate(-7, 11, 45),
    patientSnapshot: {
      name: 'هادي قدور',
      phone: '352681523130',
    },
  },
  {
    id: 'session-001-4',
    clinicId: 'clinic-001',
    patientId: 'patient-001',
    startTime: getDate(-21, 13, 0),
    endTime: getDate(-21, 13, 30),
    status: 'no-show',
    plannedProcedure: 'متابعة تنظيف',
    toothNumber: [],
    sessionCost: 150,
    isPaid: false,
    patientSnapshot: {
      name: 'هادي قدور',
      phone: '352681523130',
    },
  },
  
  // جلسة قادمة
  {
    id: 'session-001-5',
    clinicId: 'clinic-001',
    patientId: 'patient-001',
    startTime: getDate(7, 14, 0),
    endTime: getDate(7, 14, 30),
    status: 'scheduled',
    plannedProcedure: 'متابعة تنظيف',
    toothNumber: [],
    sessionCost: 300,
    isPaid: false,
    patientSnapshot: {
      name: 'هادي قدور',
      phone: '352681523130',
    },
  },
];

// ============================================================
// دوال جلب البيانات
// ============================================================

async function getPatientData(clinicId: string, patientId: string) {
  // محاكاة async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // TODO: استبدل هذا بالاتصال الفعلي بقاعدة البيانات
  // مثال للـ API call:
  // const response = await fetch(`${process.env.API_URL}/clinics/${clinicId}/patients/${patientId}`);
  // if (!response.ok) return null;
  // return response.json();
  
  // حالياً: التحقق من وجود العيادة والمريض في البيانات الوهمية
  if (clinicId !== MOCK_CLINIC_DATA.id) {
    return null;
  }
  
  if (patientId !== MOCK_PATIENT_DATA.id) {
    return null;
  }
  
  // تجميع البيانات كما ستكون في الـ API الحقيقي
  return {
    clinic: MOCK_CLINIC_DATA,
    patient: MOCK_PATIENT_DATA,
    sessions: MOCK_PATIENT_SESSIONS_DATA,
  };
}

// ============================================================
// Next.js Functions
// ============================================================

// لتوليد metadata ديناميكية للـ SEO
export async function generateMetadata({ params }: { params: { clinicId: string; patient: string } }) {
  const data = await getPatientData(params.clinicId, params.patient);
  
  if (!data) {
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
  const data = await getPatientData(params.clinicId, params.patient);
  
  if (!data) {
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

/*
 * ============================================================
 * ملاحظات لمطور الباك إند:
 * ============================================================
 * 
 * هذه الصفحة تستقبل clinicId و patientId من الرابط
 * مثال: /public/clinic-001/patient-001
 * 
 * API Endpoint المطلوب:
 * GET /api/clinics/:clinicId/patients/:patientId
 * 
 * Response Structure (JSON):
 * {
 *   "clinic": {
 *     "id": string,
 *     "name": string,
 *     "logo": string | null,
 *     "address": string,
 *     "doctorProfile": {
 *       "fullName": string,
 *       "specialization": string,
 *       // ... باقي بيانات الطبيب
 *     },
 *     "settings": {
 *       "primaryColor": string,
 *       "secondaryColor": string,
 *       // ... باقي الإعدادات
 *     }
 *   },
 *   "patient": {
 *     "id": string,
 *     "clinicId": string,
 *     "fullName": string,
 *     "phone": string,
 *     "gender": "male" | "female",
 *     "age": number,
 *     "notes": string | null,
 *     "createdAt": Date
 *   },
 *   "sessions": Array<{
 *     "id": string,
 *     "clinicId": string,
 *     "patientId": string,
 *     "startTime": Date,
 *     "endTime": Date,
 *     "status": "scheduled" | "completed" | "no-show" | "cancelled",
 *     "plannedProcedure": string,
 *     "performedProcedure"?: string,
 *     "toothNumber": string[],
 *     "sessionCost": number,
 *     "isPaid": boolean,
 *     "paymentMethod"?: "cash" | "card" | "transfer",
 *     "paidAt"?: Date,
 *     "patientSnapshot": {
 *       "name": string,
 *       "phone": string
 *     }
 *   }>
 * }
 * 
 * ============================================================
 */