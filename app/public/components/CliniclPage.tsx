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
import { Clinic } from '@/types';

// مكون الظهور المتدرج
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

// تعديل الـ props لاستقبال البيانات من السيرفر
interface PublicClinicPageProps {
  clinic: Clinic;
}

export default function PublicClinicPage({ clinic }: PublicClinicPageProps) {
  const primaryColor = clinic.settings.primaryColor;
  const doctor = clinic.doctorProfile;

  const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div 
      className="min-h-screen relative" 
      style={{ 
        background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}90 90%, #000000 100%)` 
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
                    priority // تحسين الأداء للصورة الرئيسية
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
              {doctor.specialization}
            </p>
            <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              {doctor.about}
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
                    <p className="text-sm text-gray-600 truncate">{clinic.address}</p>
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
                    <p className="font-bold text-gray-800 truncate" dir="ltr">+966 11 234 5678</p>
                    <p className="text-sm text-gray-600 truncate">{doctor.contactEmail}</p>
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
                    <p className="font-bold text-gray-800 truncate">تواصل معنا</p>
                    <p className="text-sm text-gray-600 truncate">نرد خلال 24 ساعة</p>
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
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">أوقات العمل</h2>
                  <p className="text-sm text-gray-500">نرحب بكم في الأوقات التالية</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {clinic.settings.workingHours.map((wh, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    viewport={{ once: true }}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl"
                    style={{ 
                      backgroundColor: wh.isClosed ? '#f1f5f9' : `${primaryColor}50`,
                    }}
                  >
                    <span className="font-medium text-gray-900 text-sm sm:text-base">
                      {weekDays[wh.day]}
                    </span>
                    <span 
                      className="font-bold text-sm sm:text-base"
                      style={{ color: wh.isClosed ? '#ef4444' : '#000000' }}
                    >
                      {wh.isClosed ? 'مغلق' : `${wh.start} - ${wh.end}`}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* مؤشر اليوم */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 justify-end">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primaryColor }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primaryColor }} />
                  </span>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">اليوم: </span>
                    {(() => {
                      const today = new Date().getDay();
                      const todayHours = clinic.settings.workingHours.find(wh => wh.day === today);
                      return todayHours?.isClosed ? 'مغلق' : `مفتوح حتى ${todayHours?.end}`;
                    })()}
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
                href={`/public/${clinic.id}/doctor-cv`}
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