// app\public\components\PublicClinicPage.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Stethoscope,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { Clinic, WorkingHours } from '@/types';

// ============================================================
// دالة مساعدة لتطبيع ساعات العمل (تتعامل مع الكائن والمصفوفة)
// ============================================================

const normalizeWorkingHours = (workingHours: any): WorkingHours[] => {
  if (!workingHours) return [];
  
  // إذا كانت مصفوفة بالفعل
  if (Array.isArray(workingHours)) {
    return workingHours;
  }
  
  // إذا كانت كائن (مثل القادم من Supabase)
  if (typeof workingHours === 'object' && workingHours !== null) {
    return Object.values(workingHours);
  }
  
  return [];
};

// ============================================================
// تحويل رقم اليوم من نظام JS (0=الأحد) إلى نظامنا (0=السبت)
// ============================================================

const getCurrentDayNumber = (): number => {
  const jsDay = new Date().getDay(); // 0=الأحد, 1=الإثنين, ..., 6=السبت
  // تحويل: الأحد (1) -> الإثنين (2) -> ... -> السبت (0)
  return jsDay === 0 ? 6 : jsDay - 1;
};

// ============================================================
// مكون الظهور المتدرج
// ============================================================

const FadeInSection = ({ children, delay = 0, className = '' }: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================
// أسماء الأيام حسب نظامنا (0=السبت, 1=الأحد, ..., 6=الجمعة)
// ============================================================

const DAY_NAMES: Record<number, string> = {
  0: 'السبت',
  1: 'الأحد',
  2: 'الإثنين',
  3: 'الثلاثاء',
  4: 'الأربعاء',
  5: 'الخميس',
  6: 'الجمعة',
};

// ============================================================
// تعديل الـ props لاستقبال البيانات من السيرفر
// ============================================================

interface PublicClinicPageProps {
  clinic: Clinic;
}

export default function PublicClinicPage({ clinic }: PublicClinicPageProps) {
  const primaryColor = clinic.settings.primaryColor || '#007bff';
  const doctor = clinic.doctorProfile;

  // تطبيع ساعات العمل
  const rawWorkingHours = clinic.settings.workingHours;
  const workingHoursList = normalizeWorkingHours(rawWorkingHours);

  // إنشاء خريطة للوصول السريع لساعات كل يوم
  const workingHoursMap = new Map<number, WorkingHours>();
  workingHoursList.forEach(wh => {
    workingHoursMap.set(wh.day, wh);
  });

  // الأيام من 0 إلى 6 مع بياناتها
  const daysData = [0, 1, 2, 3, 4, 5, 6].map(dayNum => {
    const wh = workingHoursMap.get(dayNum);
    return {
      day: dayNum,
      label: DAY_NAMES[dayNum],
      isClosed: wh?.isClosed ?? (dayNum === 6), // الجمعة مغلق افتراضياً
      start: wh?.start || (dayNum === 6 ? '00:00' : '09:00'),
      end: wh?.end || (dayNum === 6 ? '00:00' : '17:00'),
    };
  });
  const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) return '';
  
  const [hoursStr, minutes] = time24.split(':');
  let hours = parseInt(hoursStr, 10);
  
  if (isNaN(hours)) return time24;
  
  const period = hours >= 12 ? 'م' : 'ص';
  
  // تحويل إلى نظام 12 ساعة
  if (hours === 0) {
    hours = 12; // منتصف الليل
  } else if (hours > 12) {
    hours = hours - 12;
  }
  
  // إضافة صفر قبل الرقم إذا كان أقل من 10
  const hoursFormatted = hours < 10 ? `0${hours}` : `${hours}`;
  
  return `${hoursFormatted}:${minutes} ${period}`;
};
  // معلومات اليوم الحالي
  const currentDayNum = getCurrentDayNumber();
  const todayInfo = daysData.find(d => d.day === currentDayNum);

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}90 90%, #000000 100%)`,
      }}
      dir="rtl"
    >
      {/* المحتوى الرئيسي */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* الشعار والأيقونة */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8 sm:mb-12"
          >
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48">
              <div className="absolute inset-0 rounded-full shadow-2xl overflow-hidden border-4 border-white">
                {clinic.logo ? (
                  <Image
                    src={clinic.logo}
                    alt={clinic.name}
                    fill
                    className="object-contain p-6 bg-white"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white">
                    <Stethoscope size={60} style={{ color: primaryColor }} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* اسم العيادة والتخصص */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
              {clinic.name}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-4 sm:mb-6">
              {doctor?.specialization || "عيادة عامة"}
            </p>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              {doctor?.about || ""}
            </p>
          </motion.div>

          {/* بطاقات التواصل */}
          <FadeInSection delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8 sm:mb-12">
              {/* العنوان */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <MapPin size={24} style={{ color: primaryColor }} />
                  </div>
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-sm text-gray-500 mb-1">موقع العيادة</p>
                    <p className="text-sm text-gray-600 truncate">
                      {clinic.address || "غير محدد"}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* الهاتف */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Phone size={24} style={{ color: primaryColor }} />
                  </div>
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-sm text-gray-500 mb-1">اتصل بنا</p>
                    {/* <p className="font-bold text-gray-800 truncate" dir="ltr">
                      +966 11 234 5678
                    </p> */}
                    <p className="text-sm text-gray-600 truncate">
                      {doctor?.contactEmail || ""}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* البريد */}
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Globe size={24} style={{ color: primaryColor }} />
                  </div>
                  <div className="text-right flex-1 min-w-0">
                    <p className="text-sm text-gray-500 mb-1">راسلنا</p>
                    <p className="font-bold text-gray-800 truncate">
                      تواصل معنا
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      نرد خلال 24 ساعة
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeInSection>

          {/* أوقات العمل */}
          <FadeInSection delay={0.3}>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Clock size={20} className="text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    أوقات العمل
                  </h2>
                  <p className="text-sm text-gray-500">
                    نرحب بكم في الأوقات التالية
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {daysData.map((day) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: day.day * 0.03 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl"
                    style={{
                      backgroundColor: day.isClosed
                        ? "#f1f5f9"
                        : `${primaryColor}50`,
                    }}
                  >
                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                      {day.label}
                    </span>
                    <span
                      className="font-bold text-sm sm:text-base"
                      style={{ color: day.isClosed ? "#ef4444" : "#000000" }}
                    >
                      {day.isClosed
                        ? "مغلق"
                        : `${formatTimeTo12Hour(day.start)} - ${formatTimeTo12Hour(day.end)}`}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* مؤشر اليوم */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 justify-end">
                  <span className="relative flex h-2 w-2">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2 w-2"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </span>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">اليوم: </span>
                    {todayInfo?.isClosed
                      ? "مغلق"
                      : `مفتوح حتى ${formatTimeTo12Hour(todayInfo?.end || "")}`}
                  </p>
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* Footer */}
          <footer className="mt-8 sm:mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-white/70 text-center sm:text-right">
                © {new Date().getFullYear()} {clinic.name}. جميع الحقوق محفوظة.
              </p>
              <Link
                href={`/public-clinic/${clinic.id}/doctor-cv`}
                className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                <span>السيرة الذاتية للطبيب</span>
                <ArrowLeft size={16} />
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}