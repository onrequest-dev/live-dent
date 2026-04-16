// بيانات العيادات
export const clinics = [
  {
    id: 'clinic-001',
    name: 'مركز الابتسامة',
    doctorName: 'د. أحمد محمد',
    primaryColor: '#77ff94', // أزرق سماوي
    secondaryColor: '#42472d',
    logo: '/img/logo.png',
  },
  {
    id: 'clinic-002',
    name: 'عيادة اللؤلؤة',
    doctorName: 'د. سارة القحطاني',
    primaryColor: '#db2777', // وردي
    secondaryColor: '#f472b6',
    logo: '✨',
  },
  {
    id: 'clinic-003',
    name: 'مجمع الشفاء',
    doctorName: 'د. محمد عبدالله',
    primaryColor: '#059669', // أخضر
    secondaryColor: '#34d399',
    logo: '🌿',
  },
  {
    id: 'clinic-004',
    name: 'مركز الأسنان الذهبي',
    doctorName: 'د. فاطمة علي',
    primaryColor: '#d97706', // ذهبي
    secondaryColor: '#fbbf24',
    logo: '👑',
  },
];

export const currentClinic = clinics[0];

// مواعيد اليوم
export const todayAppointments = [
  {
    id: 'apt-1',
    patientName: 'هادي قدور',
    time: '09:00',
    procedure: 'علاج عصب',
    phone: '352 681 523 130⁩',
    status: 'waiting',
  },
  {
    id: 'apt-2',
    patientName: 'لطيفة العتيبي',
    time: '11:30',
    procedure: 'حشوة ضرس',
    phone: '0547788990',
    status: 'confirmed',
  },
  {
    id: 'apt-3',
    patientName: 'ريم الحربي',
    time: '14:00',
    procedure: 'كشف أولي',
    phone: '0534455667',
    status: 'waiting',
  },
  {
    id: 'apt-4',
    patientName: 'فهد الشمري',
    time: '16:30',
    procedure: 'خلع ضرس',
    phone: '0561122334',
    status: 'confirmed',
  },
];

// إحصائيات
export const stats = [
  { label: 'مرضى اليوم', value: '12', icon: '👥', trend: '+2' },
  { label: 'المواعيد', value: '18', icon: '📅', trend: '+5' },
  { label: 'الدخل', value: '4,850', icon: '💰', trend: '+12%' },
  { label: 'حالات نشطة', value: '32', icon: '🦷', trend: '+3' },
];