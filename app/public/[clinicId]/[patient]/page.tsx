// app/public/[clinicId]/[patient]/page.tsx

'use client';

import { mockClinic, mockPatients, mockAllSessions } from '@/lib/mock/data';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { 
  Phone, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Download,
  Building2,
  Stethoscope,
  ArrowRight,
  CreditCard,
  MapPin,
  Share2,
} from 'lucide-react';

// تنسيق التاريخ مع اسم اليوم
const formatDateWithDay = (date: Date) => {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = days[new Date(date).getDay()];
  const formattedDate = new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  return { dayName, formattedDate };
};

// تنسيق الوقت
const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// بطاقة الحالة
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    completed: { icon: CheckCircle2, text: 'مكتمل', color: '#10b981', bg: '#d1fae5' },
    scheduled: { icon: Calendar, text: 'مجدول', color: '#3b82f6', bg: '#dbeafe' },
    'no-show': { icon: XCircle, text: 'لم يحضر', color: '#ef4444', bg: '#fee2e2' },
    cancelled: { icon: XCircle, text: 'ملغي', color: '#ef4444', bg: '#fee2e2' },
  };
  
  const { icon: Icon, text, color, bg } = config[status as keyof typeof config] || config.scheduled;
  
  return (
    <div 
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: bg, color }}
    >
      <Icon size={12} />
      <span>{text}</span>
    </div>
  );
};

// بطاقة الدفع
const PaymentBadge = ({ isPaid }: { isPaid: boolean }) => {
  if (isPaid) {
    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
        <CheckCircle2 size={12} />
        <span>مدفوع</span>
      </div>
    );
  }
  
  return (
    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
      <AlertCircle size={12} />
      <span>غير مدفوع</span>
    </div>
  );
};

// SVG تموجات للخلفية
const WaveBackground = ({ color }: { color: string }) => (
  <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 120" preserveAspectRatio="none">
    <path 
      d="M0,64 C80,96 160,32 240,64 C320,96 360,48 400,64 L400,120 L0,120 Z" 
      fill={color} 
      fillOpacity="0.05"
    />
    <path 
      d="M0,80 C100,104 200,56 300,80 C350,92 380,72 400,80 L400,120 L0,120 Z" 
      fill={color} 
      fillOpacity="0.08"
    />
  </svg>
);

// دوائر زخرفية
const DecorativeCircles = ({ color }: { color: string }) => (
  <>
    <div 
      className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
      style={{ backgroundColor: color }}
    />
    <div 
      className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-5"
      style={{ backgroundColor: color }}
    />
    <div 
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border opacity-5"
      style={{ borderColor: color, borderWidth: '2px' }}
    />
  </>
);

export default function PatientPage({ params }: { params: { clinicId: string; patient: string } }) {
  const { clinicId, patient: patientId } = params;
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // جلب البيانات
  const clinic = mockClinic;
  const patient = mockPatients.find(p => p.id === patientId);
  const patientSessions = mockAllSessions
    .filter(s => s.patientId === patientId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  
  const primaryColor = clinic.settings.primaryColor;
  const secondaryColor = clinic.settings.secondaryColor;
  
  // الجلسة القادمة
  const upcomingSession = patientSessions
    .filter(s => s.status === 'scheduled' && new Date(s.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
  
  // الجلسات السابقة (آخر 5)
  const pastSessions = patientSessions
    .filter(s => s.status === 'completed' || s.status === 'no-show')
    .slice(0, 5);
  
  // الملخص المالي
  const totalAmount = patientSessions
    .filter(s => s.status !== 'cancelled')
    .reduce((sum, s) => sum + (s.sessionCost || 0), 0);
  const totalPaid = patientSessions
    .filter(s => s.isPaid)
    .reduce((sum, s) => sum + (s.sessionCost || 0), 0);
  const remainingAmount = totalAmount - totalPaid;

  // تحميل الكرت كصورة (بدون الأزرار العلوية)
  const downloadCard = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#ffffff',
      });
      
      const link = document.createElement('a');
      link.download = `${patient?.fullName || 'patient'}-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading card:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">المريض غير موجود</p>
        </div>
      </div>
    );
  }

  // بيانات الجلسة القادمة مع اليوم
  const upcomingDate = upcomingSession ? formatDateWithDay(upcomingSession.startTime) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4" dir="rtl">
      <div className="max-w-md mx-auto">
        {/* أزرار التحكم - لن تظهر في الصورة المحملة */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={downloadCard}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-medium text-white shadow-lg transition-all disabled:opacity-50 hover:shadow-xl transform hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
          >
            <Download size={20} className="animate-pulse" />
            <span>{isDownloading ? 'جاري التحميل...' : 'تحميل الكرت'}</span>
          </button>
          
          <Link
            href={`/public/${clinicId}`}
            className="p-3.5 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <Building2 size={20} style={{ color: primaryColor }} />
          </Link>
          
          <Link
            href={`/public/${clinicId}/doctor-cv`}
            className="p-3.5 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <Stethoscope size={20} style={{ color: primaryColor }} />
          </Link>
        </motion.div>

        {/* الكرت - هذا ما سيتم تحميله كصورة */}
        <div 
          ref={cardRef}
          className="relative bg-white rounded-3xl overflow-hidden shadow-2xl"
          style={{ 
            boxShadow: `0 25px 50px -12px ${primaryColor}20`
          }}
        >
          {/* عناصر زخرفية SVG */}
          <DecorativeCircles color={primaryColor} />
          <WaveBackground color={primaryColor} />
          
          {/* المحتوى الرئيسي */}
          <div className="relative z-10">
            {/* Header - العيادة مع تصميم محسن */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-4">
                {clinic.logo ? (
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-100">
                    <Image
                      src={clinic.logo}
                      alt={clinic.name}
                      fill
                      className="object-contain p-3"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                  >
                    <Building2 size={32} className="text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">{clinic.name}</h2>
                </div>
              </div>
            </div>

            {/* معلومات المريض - تصميم بطاقة مميزة */}
            <div className="px-6 pb-4">
              <div 
                className="relative p-5 rounded-2xl overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}05 100%)`,
                  border: `1px solid ${primaryColor}15`
                }}
              >
                {/* شريط جانبي ملون */}
                <div 
                  className="absolute right-0 top-0 bottom-0 w-1.5"
                  style={{ background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
                />
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{patient.fullName}</h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-2 min-w-[120px]">
                          <Phone size={15} style={{ color: primaryColor }} />
                          <span className="text-gray-600">رقم الهاتف:</span>
                        </span>
                        <span className="font-medium text-gray-900" dir="ltr">{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-2 min-w-[120px]">
                          <User size={15} style={{ color: primaryColor }} />
                          <span className="text-gray-600">المعلومات الشخصية:</span>
                        </span>
                        <span className="font-medium text-gray-900">
                          {patient.gender === 'male' ? 'ذكر' : 'أنثى'} · {patient.age} سنة
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* صورة رمزية للمريض */}
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}20 100%)` }}
                  >
                    <User size={28} style={{ color: primaryColor }} />
                  </div>
                </div>
              </div>
            </div>

            {/* الجلسة القادمة - تصميم محسن */}
            <div className="px-6 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Calendar size={18} style={{ color: primaryColor }} />
                </div>
                <h4 className="text-base font-bold text-gray-800">الموعد القادم</h4>
              </div>
              
              {upcomingSession && upcomingDate ? (
                <div 
                  className="relative p-5 rounded-2xl overflow-hidden transition-all"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}05 100%)`,
                    border: `1px solid ${primaryColor}20`
                  }}
                >
                  {/* خلفية زخرفية */}
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full opacity-10" 
                       style={{ backgroundColor: primaryColor }} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-lg font-bold text-gray-900">{upcomingSession.plannedProcedure}</p>
                      <StatusBadge status={upcomingSession.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <Calendar size={14} style={{ color: primaryColor }} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">التاريخ</p>
                          <p className="text-sm font-medium text-gray-900">
                            {upcomingDate.dayName} {upcomingDate.formattedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                          <Clock size={14} style={{ color: primaryColor }} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">الوقت</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatTime(upcomingSession.startTime)} - {formatTime(upcomingSession.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {upcomingSession.toothNumber && upcomingSession.toothNumber.length > 0 && (
                      <div className="mb-3 p-3 bg-white/50 rounded-xl">
                        <p className="text-xs text-gray-600 mb-1">الأسنان المعالجة:</p>
                        <div className="flex gap-2">
                          {upcomingSession.toothNumber.map((tooth) => (
                            <span 
                              key={tooth}
                              className="px-3 py-1 rounded-lg text-sm font-medium"
                              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                            >
                              {tooth}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200/50">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">تكلفة الجلسة</p>
                        <p className="text-xl font-bold" style={{ color: primaryColor }}>
                          {upcomingSession.sessionCost} <span className="text-sm font-normal text-gray-600">ل.س</span>
                        </p>
                      </div>
                      <PaymentBadge isPaid={upcomingSession.isPaid} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 text-center">
                  <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-500">لا توجد مواعيد قادمة</p>
                </div>
              )}
            </div>

            {/* الجلسات السابقة */}
            {pastSessions.length > 0 && (
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <CheckCircle2 size={18} style={{ color: primaryColor }} />
                  </div>
                  <h4 className="text-base font-bold text-gray-800">الجلسات السابقة</h4>
                </div>
                
                <div className="space-y-2">
                  {pastSessions.map((session, index) => {
                    const sessionDate = formatDateWithDay(session.startTime);
                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{session.plannedProcedure}</span>
                              <StatusBadge status={session.status} />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {sessionDate.dayName} {sessionDate.formattedDate}
                              </span>
                              {session.toothNumber && session.toothNumber.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <span>🦷</span>
                                  {session.toothNumber.join('، ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-base font-bold text-gray-900">{session.sessionCost} ل.س</p>
                            <PaymentBadge isPaid={session.isPaid} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* الملخص المالي - تصميم بطاقة احترافية */}
            <div className="px-6 pb-6">
              <div 
                className="p-5 rounded-2xl"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}05 100%)`,
                  border: `1px solid ${primaryColor}20`
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={20} style={{ color: primaryColor }} />
                  <h4 className="font-bold text-gray-800">الملخص المالي</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">إجمالي التكاليف</span>
                    <span className="font-bold text-gray-900 text-lg">{totalAmount} ل.س</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">المبلغ المدفوع</span>
                    <span className="font-bold text-emerald-600 text-lg">{totalPaid} ل.س</span>
                  </div>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dashed border-gray-300"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-medium text-gray-800">المبلغ المتبقي</span>
                    <span className={`font-bold text-xl ${remainingAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {remainingAmount} ل.س
                    </span>
                  </div>
                  
                  {/* شريط تقدم الدفع */}
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0}%`,
                          background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      تم دفع {totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0}% من المبلغ الإجمالي
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* تذييل */}
            <div className="px-6 pb-5 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                <p className="text-xs text-gray-500">
                  {clinic.name} © {new Date().getFullYear()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* رسالة تلميح */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-gray-400 mt-4"
        >
          يمكنك تحميل الكرت كصورة ومشاركته
        </motion.p>
      </div>
    </div>
  );
}