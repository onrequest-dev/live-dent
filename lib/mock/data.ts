// lib/mock/data.ts

import { Clinic, Patient, Session, PatientCase } from '@/types';

// ============================================================
// عيادة وهمية
// ============================================================

export const mockClinic: Clinic = {
  id: 'clinic-001',
  name: 'مركز الابتسامة لطب الأسنان',
  logo: '/img/logo.png',
  subscriptionStatus: 'active',
  createdAt: new Date('2023-01-01'),
  address:'دوار الشيخ تلت عإيدك التالتة بتمد راسك بين اجريك بتشوف العيادة',

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
    university:'جامعة الجنق'
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
// مرضى وهميين
// ============================================================

export const mockPatients: Patient[] = [
  {
    id: 'patient-001',
    clinicId: 'clinic-001',
    fullName: 'هادي قدور',
    phone: '352681523130',
    gender: 'female',
    age: 20,
    notes: 'تفضل مواعيد المساء - حساسية من البنسلين',
    createdAt: new Date('2023-04-01'),
  },
  {
    id: 'patient-002',
    clinicId: 'clinic-001',
    fullName: 'محمد عبدالله الحربي',
    phone: '966502345678',
    gender: 'male',
    age: 20,
    notes: 'مريض ضغط - يأخذ أدوية مميعة',
    createdAt: new Date('2023-07-15'),
  },
  {
    id: 'patient-003',
    clinicId: 'clinic-001',
    fullName: 'نورة سعد القحطاني',
    phone: '966503456789',
    gender: 'female',
    age: 20,
    createdAt: new Date('2023-08-20'),
  },
  {
    id: 'patient-004',
    clinicId: 'clinic-001',
    fullName: 'فهد ناصر الشمري',
    phone: '966504567890',
    gender: 'male',
    age: 20,
    notes: 'مدخن - يحتاج جلسات توعية',
    createdAt: new Date('2023-09-05'),
  },
  {
    id: 'patient-005',
    clinicId: 'clinic-001',
    fullName: 'لطيفة علي المطيري',
    phone: '966505678901',
    gender: 'female',
    age: 20,
    createdAt: new Date('2023-10-10'),
  },
];

// ============================================================
// دوال مساعدة لإنشاء التواريخ
// ============================================================

const getDate = (daysFromNow: number, hours: number = 9, minutes: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

// ============================================================
// جميع الجلسات (مواعيد اليوم + جلسات سابقة + جلسات قادمة)
// ============================================================

export const mockAllSessions: Session[] = [
  // ==========================================================
  // المريض 001 - هادي قدور
  // ==========================================================
  
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
  
  // جلسة قادمة
  {
    id: 'session-001-4',
    clinicId: 'clinic-001',
    patientId: 'patient-001',
    startTime: getDate(7, 14, 0),
    endTime: getDate(7, 14, 30),
    status: 'completed',
    plannedProcedure: 'متابعة تنظيف',
    toothNumber: [],
    sessionCost: 300,
    isPaid: false,
    patientSnapshot: {
      name: 'هادي قدور',
      phone: '352681523130',
    },
  },

  // ==========================================================
  // المريض 002 - محمد عبدالله الحربي
  // ==========================================================
  
  // جلسة اليوم
  {
    id: 'session-002-1',
    clinicId: 'clinic-001',
    patientId: 'patient-002',
    caseId: 'case-002',
    startTime: new Date(`${todayStr}T10:00:00`),
    endTime: new Date(`${todayStr}T10:45:00`),
    status: 'scheduled',
    plannedProcedure: 'حشوة ضرس',
    toothNumber: ['46'],
    sessionCost: 500,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: new Date(),
    patientSnapshot: {
      name: 'محمد عبدالله الحربي',
      phone: '966502345678',
    },
  },
  
  // جلسات سابقة
  {
    id: 'session-002-2',
    clinicId: 'clinic-001',
    patientId: 'patient-002',
    startTime: getDate(-21, 9, 0),
    endTime: getDate(-21, 9, 30),
    status: 'completed',
    plannedProcedure: 'كشف أولي',
    performedProcedure: 'فحص شامل',
    toothNumber: [],
    sessionCost: 200,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: getDate(-21, 9, 30),
    patientSnapshot: {
      name: 'محمد عبدالله الحربي',
      phone: '966502345678',
    },
  },
  {
    id: 'session-002-3',
    clinicId: 'clinic-001',
    patientId: 'patient-002',
    startTime: getDate(-10, 11, 0),
    endTime: getDate(-10, 12, 0),
    status: 'completed',
    plannedProcedure: 'علاج عصب',
    performedProcedure: 'علاج عصب - الجلسة الأولى',
    toothNumber: ['36'],
    sessionCost: 600,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: getDate(-10, 12, 0),
    patientSnapshot: {
      name: 'محمد عبدالله الحربي',
      phone: '966502345678',
    },
  },
  {
    id: 'session-002-4',
    clinicId: 'clinic-001',
    patientId: 'patient-002',
    startTime: getDate(-3, 10, 0),
    endTime: getDate(-3, 11, 0),
    status: 'completed',
    plannedProcedure: 'علاج عصب - الجلسة الثانية',
    performedProcedure: 'تنظيف القنوات وتعبئتها',
    toothNumber: ['36'],
    sessionCost: 600,
    isPaid: false,
    patientSnapshot: {
      name: 'محمد عبدالله الحربي',
      phone: '966502345678',
    },
  },
  
  // جلسة قادمة
  {
    id: 'session-002-5',
    clinicId: 'clinic-001',
    patientId: 'patient-002',
    startTime: getDate(14, 10, 0),
    endTime: getDate(14, 11, 0),
    status: 'scheduled',
    plannedProcedure: 'تلبيسة',
    toothNumber: ['36'],
    sessionCost: 1200,
    isPaid: false,
    patientSnapshot: {
      name: 'محمد عبدالله الحربي',
      phone: '966502345678',
    },
  },

  // ==========================================================
  // المريض 003 - نورة سعد القحطاني
  // ==========================================================
  
  // جلسة اليوم
  {
    id: 'session-003-1',
    clinicId: 'clinic-001',
    patientId: 'patient-003',
    startTime: new Date(`${todayStr}T11:30:00`),
    endTime: new Date(`${todayStr}T12:00:00`),
    status: 'scheduled',
    plannedProcedure: 'كشف أولي',
    toothNumber: [],
    sessionCost: 200,
    isPaid: false,
    patientSnapshot: {
      name: 'نورة سعد القحطاني',
      phone: '966503456789',
    },
  },
  
  // جلسات سابقة
  {
    id: 'session-003-2',
    clinicId: 'clinic-001',
    patientId: 'patient-003',
    startTime: getDate(-30, 10, 0),
    endTime: getDate(-30, 10, 30),
    status: 'completed',
    plannedProcedure: 'تنظيف أسنان',
    performedProcedure: 'إزالة الجير وتلميع',
    toothNumber: [],
    sessionCost: 350,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: getDate(-30, 10, 30),
    patientSnapshot: {
      name: 'نورة سعد القحطاني',
      phone: '966503456789',
    },
  },

  // ==========================================================
  // المريض 004 - فهد ناصر الشمري
  // ==========================================================
  
  // جلسة اليوم
  {
    id: 'session-004-1',
    clinicId: 'clinic-001',
    patientId: 'patient-004',
    caseId: 'case-001',
    startTime: new Date(`${todayStr}T14:00:00`),
    endTime: new Date(`${todayStr}T15:00:00`),
    status: 'scheduled',
    plannedProcedure: 'علاج عصب - الجلسة الثالثة',
    toothNumber: ['36'],
    sessionCost: 800,
    isPaid: false,
    patientSnapshot: {
      name: 'فهد ناصر الشمري',
      phone: '966504567890',
    },
  },
  
  // جلسات سابقة
  {
    id: 'session-004-2',
    clinicId: 'clinic-001',
    patientId: 'patient-004',
    startTime: getDate(-20, 14, 0),
    endTime: getDate(-20, 14, 30),
    status: 'completed',
    plannedProcedure: 'كشف أولي',
    performedProcedure: 'فحص شامل وتصوير',
    toothNumber: [],
    sessionCost: 200,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: getDate(-20, 14, 30),
    patientSnapshot: {
      name: 'فهد ناصر الشمري',
      phone: '966504567890',
    },
  },
  {
    id: 'session-004-3',
    clinicId: 'clinic-001',
    patientId: 'patient-004',
    caseId: 'case-001',
    startTime: getDate(-14, 14, 0),
    endTime: getDate(-14, 15, 0),
    status: 'completed',
    plannedProcedure: 'علاج عصب - الجلسة الأولى',
    performedProcedure: 'تم فتح العصب ووضع الدواء',
    toothNumber: ['36'],
    sessionCost: 800,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: getDate(-14, 15, 0),
    patientSnapshot: {
      name: 'فهد ناصر الشمري',
      phone: '966504567890',
    },
  },
  {
    id: 'session-004-4',
    clinicId: 'clinic-001',
    patientId: 'patient-004',
    caseId: 'case-001',
    startTime: getDate(-7, 14, 0),
    endTime: getDate(-7, 15, 0),
    status: 'completed',
    plannedProcedure: 'علاج عصب - الجلسة الثانية',
    performedProcedure: 'تنظيف القنوات وتعبئتها',
    toothNumber: ['36'],
    sessionCost: 800,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: getDate(-7, 15, 0),
    patientSnapshot: {
      name: 'فهد ناصر الشمري',
      phone: '966504567890',
    },
  },
  
  // جلسة قادمة
  {
    id: 'session-004-5',
    clinicId: 'clinic-001',
    patientId: 'patient-004',
    caseId: 'case-001',
    startTime: getDate(7, 14, 0),
    endTime: getDate(7, 15, 0),
    status: 'scheduled',
    plannedProcedure: 'علاج عصب - الجلسة الرابعة',
    toothNumber: ['36'],
    sessionCost: 800,
    isPaid: false,
    patientSnapshot: {
      name: 'فهد ناصر الشمري',
      phone: '966504567890',
    },
  },
  {
    id: 'session-004-6',
    clinicId: 'clinic-001',
    patientId: 'patient-004',
    caseId: 'case-001',
    startTime: getDate(14, 14, 0),
    endTime: getDate(14, 15, 30),
    status: 'scheduled',
    plannedProcedure: 'تلبيسة نهائية',
    toothNumber: ['36'],
    sessionCost: 1500,
    isPaid: false,
    patientSnapshot: {
      name: 'فهد ناصر الشمري',
      phone: '966504567890',
    },
  },

  // ==========================================================
  // المريض 005 - لطيفة علي المطيري
  // ==========================================================
  
  // جلسة اليوم
  {
    id: 'session-005-1',
    clinicId: 'clinic-001',
    patientId: 'patient-005',
    startTime: new Date(`${todayStr}T16:00:00`),
    endTime: new Date(`${todayStr}T16:30:00`),
    status: 'scheduled',
    plannedProcedure: 'تبييض أسنان',
    toothNumber: [],
    sessionCost: 1200,
    isPaid: true,
    paymentMethod: 'transfer',
    paidAt: new Date(),
    patientSnapshot: {
      name: 'لطيفة علي المطيري',
      phone: '966505678901',
    },
  },
  
  // جلسات سابقة
  {
    id: 'session-005-2',
    clinicId: 'clinic-001',
    patientId: 'patient-005',
    startTime: getDate(-14, 9, 0),
    endTime: getDate(-14, 9, 30),
    status: 'completed',
    plannedProcedure: 'كشف أولي',
    performedProcedure: 'فحص شامل',
    toothNumber: [],
    sessionCost: 200,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: getDate(-14, 9, 30),
    patientSnapshot: {
      name: 'لطيفة علي المطيري',
      phone: '966505678901',
    },
  },
  {
    id: 'session-005-3',
    clinicId: 'clinic-001',
    patientId: 'patient-005',
    startTime: getDate(-7, 10, 0),
    endTime: getDate(-7, 11, 0),
    status: 'completed',
    plannedProcedure: 'تقويم - تركيب',
    performedProcedure: 'تركيب تقويم شفاف',
    toothNumber: [],
    sessionCost: 3500,
    isPaid: true,
    paymentMethod: 'cash',
    paidAt: getDate(-7, 11, 0),
    patientSnapshot: {
      name: 'لطيفة علي المطيري',
      phone: '966505678901',
    },
  },
  {
    id: 'session-005-4',
    clinicId: 'clinic-001',
    patientId: 'patient-005',
    startTime: getDate(-2, 11, 0),
    endTime: getDate(-2, 11, 30),
    status: 'no-show',
    plannedProcedure: 'متابعة تقويم',
    toothNumber: [],
    sessionCost: 200,
    isPaid: false,
    patientSnapshot: {
      name: 'لطيفة علي المطيري',
      phone: '966505678901',
    },
  },
  
  // جلسات قادمة
  {
    id: 'session-005-5',
    clinicId: 'clinic-001',
    patientId: 'patient-005',
    startTime: getDate(30, 10, 0),
    endTime: getDate(30, 10, 30),
    status: 'scheduled',
    plannedProcedure: 'متابعة تقويم',
    toothNumber: [],
    sessionCost: 200,
    isPaid: false,
    patientSnapshot: {
      name: 'لطيفة علي المطيري',
      phone: '966505678901',
    },
  },
  {
    id: 'session-005-6',
    clinicId: 'clinic-001',
    patientId: 'patient-005',
    startTime: getDate(60, 10, 0),
    endTime: getDate(60, 10, 30),
    status: 'scheduled',
    plannedProcedure: 'متابعة تقويم',
    toothNumber: [],
    sessionCost: 200,
    isPaid: false,
    patientSnapshot: {
      name: 'لطيفة علي المطيري',
      phone: '966505678901',
    },
  },
];

// ==========================================================
// تصدير جلسات اليوم فقط (للتوافق مع الكود القديم)
// ==========================================================

export const mockTodaySessions: Session[] = mockAllSessions.filter(session => {
  const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
  return sessionDate === todayStr && session.status === 'scheduled';
});

// ============================================================
// حالات علاجية
// ============================================================

export const mockPatientCases: PatientCase[] = [
  // الحالة 001 - فهد ناصر الشمري (علاج عصب)
  {
    id: 'case-001',
    patientId: 'patient-004',
    clinicId: 'clinic-001',
    status: 'active',
    chiefComplaint: 'ألم شديد في الضرس عند الأكل',
    diagnosis: 'التهاب عصب حاد في الضرس 36',
    toothNumber: ['36'],
    startDate: getDate(-20, 0, 0),
    totalCost: 4100, // 200 كشف + 800+800+800 علاج عصب + 1500 تلبيسة
    totalPaid: 1800, // 200 + 800 + 800
    sessions: mockAllSessions.filter(s => s.caseId === 'case-001' || (s.patientId === 'patient-004' && s.id === 'session-004-2')),
  },
  
  // الحالة 002 - محمد عبدالله الحربي (حشوة)
  {
    id: 'case-002',
    patientId: 'patient-002',
    clinicId: 'clinic-001',
    status: 'active',
    chiefComplaint: 'تسوس في الضرس',
    diagnosis: 'تسوس عميق في الضرس 46',
    toothNumber: ['46'],
    startDate: getDate(-21, 0, 0),
    totalCost: 500,
    totalPaid: 500,
    sessions: mockAllSessions.filter(s => s.caseId === 'case-002'),
  },
];

// ============================================================
// تصدير جميع البيانات
// ============================================================

export const mockData = {
  clinic: mockClinic,
  patients: mockPatients,
  sessions: mockAllSessions,
  todaySessions: mockTodaySessions,
  cases: mockPatientCases,
};