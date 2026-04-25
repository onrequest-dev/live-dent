// app\public\components\PatientPage.tsx

'use client';

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
  CreditCard,
} from 'lucide-react';
import { Clinic, Patient, Session } from '@/types';

// تنسيق التاريخ مع اسم اليوم
const formatDateWithDay = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayName = days[d.getDay()];
  
  // استخدام تنسيق موحد للسيرفر والعميل
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const formattedDate = `${year}/${month}/${day}`;
  
  return { dayName, formattedDate };
};

// تنسيق الوقت
const formatTime = (date: Date | string | null | undefined) => {
  if (!date) return 'غير محدد';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'غير محدد';
  return d.toLocaleTimeString('ar-SA', {
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

// تعديل الـ Props لاستقبال البيانات من السيرفر
interface PatientPageProps {
  clinic: Clinic;
  patient: Patient;
  sessions: Session[];
}

export default function PatientPage({ clinic, patient, sessions }: PatientPageProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const primaryColor = clinic.settings.primaryColor;
  const secondaryColor = clinic.settings.secondaryColor;
  
  // ترتيب الجلسات من الأحدث إلى الأقدم
  const patientSessions = [...sessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  // فصل الجلسات المجدولة
  const now = new Date();
  const scheduledSessions = patientSessions
    .filter(s => s.status === 'scheduled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  // الجلسات المجدولة المستقبلية
  const upcomingSessions = scheduledSessions.filter(s => new Date(s.startTime) >= now);
  
  // الجلسات المكتملة أو التي لم يحضرها المريض (آخر 5)
  const completedSessions = patientSessions
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

  // تحميل الكرت كصورة
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
      link.download = `${patient.fullName}-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading card:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-6 px-4"
      dir="rtl"
    >
      <div className="max-w-md mx-auto">
        {/* أزرار التحكم */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={downloadCard}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-medium text-white shadow-lg transition-all disabled:opacity-50 hover:shadow-xl transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%)`,
            }}
          >
            <Download size={20} className="animate-pulse" />
            <span>{isDownloading ? "جاري التحميل..." : "تحميل الكرت"}</span>
          </button>

          <Link
            href={`/public-clinic/${clinic.id}`}
            className="p-3.5 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <Building2 size={20} style={{ color: primaryColor }} />
          </Link>

          <Link
            href={`/public-clinic/${clinic.id}/doctor-cv`}
            className="p-3.5 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <Stethoscope size={20} style={{ color: primaryColor }} />
          </Link>
        </motion.div>

        {/* الكرت */}
        <div
          ref={cardRef}
          className="relative bg-white rounded-3xl overflow-hidden shadow-2xl"
          style={{
            boxShadow: `0 25px 50px -12px ${primaryColor}20`,
          }}
        >
          <WaveBackground color={primaryColor} />

          <div className="relative z-10">
            {/* Header - العيادة */}
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
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <Building2 size={32} className="text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {clinic.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* معلومات المريض */}
            <div className="px-6 pb-4">
              <div
                className="relative p-5 rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}05 100%)`,
                  border: `1px solid ${primaryColor}15`,
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {patient.fullName}
                    </h3>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-2 min-w-[120px]">
                          <Phone size={15} style={{ color: primaryColor }} />
                          <span className="text-gray-600">رقم الهاتف:</span>
                        </span>
                        <span className="font-medium text-gray-900" dir="ltr">
                          {patient.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-2 min-w-[120px]">
                          <User size={15} style={{ color: primaryColor }} />
                          <span className="text-gray-600">
                            المعلومات الشخصية:
                          </span>
                        </span>
                        <span className="font-medium text-gray-900">
                          {patient.gender === "male" ? "ذكر" : "أنثى"} ·{" "}
                          {patient.age} سنة
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* جميع المواعيد المجدولة */}
            {scheduledSessions.length > 0 && (
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Calendar size={18} style={{ color: primaryColor }} />
                  </div>
                  <h4 className="text-base font-bold text-gray-800">
                    المواعيد المجدولة ({scheduledSessions.length})
                  </h4>
                </div>

                <div className="space-y-3">
                  {scheduledSessions.map((session, index) => {
                    const sessionDate = formatDateWithDay(session.startTime);
                    const isPast = new Date(session.startTime) < now;

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border transition-all ${
                          isPast
                            ? "bg-gray-50/50 border-gray-200 opacity-75"
                            : "bg-white shadow-md border-gray-100"
                        }`}
                        style={{
                          borderRight: `3px solid ${primaryColor}`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-medium text-gray-900">
                                {session.plannedProcedure}
                              </span>
                              <StatusBadge status={session.status} />
                              {/* {isPast && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                                  موعد فائت
                                </span>
                              )} */}
                            </div>

{/* ============ التاريخ والوقت - سطرين منفصلين ============ */}
<div className="mt-3 space-y-2">
  {/* سطر التاريخ */}
  <div className="flex items-center gap-1.5 text-sm">
    <Calendar size={14} style={{ color: primaryColor }} />
    <span className="text-gray-500">{sessionDate.dayName}</span>
    <span className="text-gray-300">•</span>
    <span className="font-medium text-gray-700">{sessionDate.formattedDate}</span>
  </div>

  {/* سطر الوقت */}
  <div className="flex items-center gap-1.5 text-sm">
    <Clock size={14} style={{ color: primaryColor }} />
    <span className="font-medium text-gray-700">{formatTime(session.startTime)}</span>
  </div>
</div>

                            {session.toothNumber &&
                              session.toothNumber.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1">
                                  {session.toothNumber.map((tooth) => (
                                    <span
                                      key={tooth}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                                      style={{
                                        backgroundColor: `${primaryColor}10`,
                                        color: primaryColor,
                                      }}
                                    >
                                      🦷 {tooth}
                                    </span>
                                  ))}
                                </div>
                              )}

                            {session.notes && (
                              <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                                📝 {session.notes}
                              </p>
                            )}
                          </div>

                          <div className="text-left mr-3">
                            <p
                              className="text-lg font-bold"
                              style={{ color: primaryColor }}
                            >
                              {session.sessionCost.toLocaleString()}{" "}
                              <span className="text-xs font-normal text-gray-600">
                                ل.س
                              </span>
                            </p>
                            <div className="mt-1">
                              <PaymentBadge isPaid={session.isPaid} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {upcomingSessions.length === 0 &&
                  scheduledSessions.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-center">
                      <p className="text-sm text-amber-700">
                        ⚠️ جميع المواعيد المجدولة قد فاتت، يرجى التواصل مع
                        العيادة لتحديد موعد جديد
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* الجلسات السابقة (المكتملة) */}
            {completedSessions.length > 0 && (
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <CheckCircle2 size={18} style={{ color: primaryColor }} />
                  </div>
                  <h4 className="text-base font-bold text-gray-800">
                    الجلسات السابقة ({completedSessions.length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {completedSessions.map((session, index) => {
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
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-gray-900">
                                {session.plannedProcedure}
                              </span>
                              <StatusBadge status={session.status} />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {sessionDate.dayName}{" "}
                                {sessionDate.formattedDate}
                              </span>
                              {session.toothNumber &&
                                session.toothNumber.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <span>🦷</span>
                                    {session.toothNumber.join("، ")}
                                  </span>
                                )}
                            </div>
                            {session.performedProcedure && (
                              <p className="mt-2 text-xs text-gray-600">
                                ✅ {session.performedProcedure}
                              </p>
                            )}
                          </div>
                          <div className="text-left mr-3">
                            <p className="text-base font-bold text-gray-900">
                              {session.sessionCost.toLocaleString()} ل.س
                            </p>
                            <div className="mt-1">
                              <PaymentBadge isPaid={session.isPaid} />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* الملخص المالي */}
            <div className="px-6 pb-6">
              <div
                className="p-5 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}05 100%)`,
                  border: `1px solid ${primaryColor}20`,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard size={20} style={{ color: primaryColor }} />
                  <h4 className="font-bold text-gray-800">الملخص المالي</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">إجمالي التكاليف</span>
                    <span className="font-bold text-gray-900 text-lg">
                      {totalAmount.toLocaleString()} ل.س
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-600">المبلغ المدفوع</span>
                    <span className="font-bold text-emerald-600 text-lg">
                      {totalPaid.toLocaleString()} ل.س
                    </span>
                  </div>
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dashed border-gray-300"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-medium text-gray-800">
                      المبلغ المتبقي
                    </span>
                    <span
                      className={`font-bold text-xl ${remainingAmount > 0 ? "text-amber-600" : "text-emerald-600"}`}
                    >
                      {remainingAmount.toLocaleString()} ل.س
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* تذييل */}
            <div className="px-6 pb-5 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50">
                <p className="text-xs text-gray-500">
                  LiveDent نتمنى لكم الشفاء العاجل
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {clinic.name} © {new Date().getFullYear()}
              </p>
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