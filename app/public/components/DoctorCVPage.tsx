// app\public\components\DoctorCVPage.tsx

'use client';

import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Briefcase, 
  GraduationCap,
  Stethoscope,
  CheckCircle2,
  Sparkles,
  Share2,
} from 'lucide-react';
import { Clinic } from '@/types';

// مكون قسم متحرك
const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

// بطاقة متحركة
const AnimatedCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
};

// مكون زر المشاركة
// مكون زر المشاركة
const ShareButton = ({ clinicName, doctorName, primaryColor, secondaryColor }: { 
  clinicName: string; 
  doctorName: string;
  primaryColor: string;
  secondaryColor: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // يظهر الزر بعد تمرير 300px ويختفي عند العودة للأعلى
      setIsVisible(window.scrollY < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: `${doctorName} - طبيب في ${clinicName}`,
      text: `تعرف على الدكتور ${doctorName} في عيادة ${clinicName}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // للأجهزة المحمولة - استخدام Web Share API
        await navigator.share(shareData);
      } else {
        // للحاسوب - نسخ الرابط
        await navigator.clipboard.writeText(window.location.href);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ 
          opacity: isVisible ? 1 : 0, 
          scale: isVisible ? 1 : 0.8,
          y: isVisible ? 0 : -20,
          pointerEvents: isVisible ? 'auto' : 'none'
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={handleShare}
        className="fixed top-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center group"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          boxShadow: `0 4px 15px ${primaryColor}40`
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <Share2 size={24} className="text-white" />
        
        {/* تأثير تموج */}
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            border: `2px solid ${primaryColor}`,
            boxShadow: `0 0 0 2px ${primaryColor}20`
          }}
        />
      </motion.button>

      {/* رسالة تأكيد النسخ */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="fixed top-20 left-6 z-50 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              تم نسخ الرابط بنجاح!
            </div>
            {/* سهم صغير */}
            <div className="absolute -top-1 left-5 w-2 h-2 bg-gray-900 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// تعديل الـ props لاستقبال البيانات من السيرفر
interface DoctorCVPageProps {
  clinic: Clinic;
}

export default function DoctorCVPage({ clinic }: DoctorCVPageProps) {
  const primaryColor = clinic.settings.primaryColor;
  const secondaryColor = clinic.settings.secondaryColor;
  const doctor = clinic.doctorProfile;

  return (
    <div 
      className="min-h-screen relative" 
      dir="rtl"
      style={{ 
        background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}dd 50%, #ffffff 100%)` 
      }}
    >
      {/* إضاءات خلفية ناعمة */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.04, 0.06, 0.04],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: primaryColor }}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: secondaryColor }}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.02, 0.04, 0.02],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      <div className="relative z-10">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* القسم العلوي */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start mb-14">
            {/* صورة الطبيب مع إطار متحرك */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative"
            >
              {/* إطار خارجي يدور ببطء */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-full opacity-20"
                style={{ 
                  background: `conic-gradient(from 0deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})` 
                }}
              />
              
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-4 border-white shadow-xl">
                {doctor.photo ? (
                  <Image
                    src={doctor.photo}
                    alt={doctor.fullName}
                    width={208}
                    height={208}
                    className="object-cover w-full h-full"
                    priority
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
                    }}
                  >
                    <Stethoscope size={80} className="text-white" />
                  </div>
                )}
              </div>
              
              {/* نجمة صغيرة متحركة */}
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 10, 0, -10, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
                style={{ boxShadow: `0 4px 12px ${primaryColor}20` }}
              >
                <Sparkles size={20} style={{ color: primaryColor }} />
              </motion.div>
            </motion.div>

            {/* المعلومات الأساسية */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex-1 text-center md:text-right"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                  {doctor.fullName}
                </h1>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p 
                  className="text-xl mb-4 font-medium text-gray-900"
                >
                  {doctor.specialization}
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-gray-600 leading-relaxed max-w-2xl text-lg">
                  {doctor.about}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-gray-600 leading-relaxed max-w-2xl text-lg">
                   خريج جامعة : {doctor.university} 
                </p>
                <p className="text-gray-600 leading-relaxed max-w-2xl text-lg">
                    عام : {doctor.graduationYear}
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* بطاقات التواصل */}
          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
              <AnimatedCard delay={0.1}>
                <div 
                  className="group p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                  style={{ borderTop: `3px solid ${primaryColor}` }}
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <Phone size={22} style={{ color: primaryColor }} />
                    </motion.div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">اتصل بنا</p>
                      <p className="font-medium text-gray-800" dir="ltr">+966 11 234 5678</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.2}>
                <div 
                  className="group p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                  style={{ borderTop: `3px solid ${secondaryColor}` }}
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${secondaryColor}10` }}
                    >
                      <Mail size={22} style={{ color: secondaryColor }} />
                    </motion.div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                      <p className="font-medium text-gray-800">{doctor.contactEmail}</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={0.3}>
                <div 
                  className="group p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                  style={{ borderTop: `3px solid ${primaryColor}` }}
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      <MapPin size={22} style={{ color: primaryColor }} />
                    </motion.div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">يعمل حاليا في :{clinic.name}</p>
                      <p className="font-medium text-gray-800">{clinic.address}</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </AnimatedSection>

          {/* المؤهلات والخبرات */}
          <div className="grid md:grid-cols-2 gap-8 mb-14">
            {/* التعليم */}
            <AnimatedSection delay={0.3}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div 
                    whileHover={{ rotate: 5 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <GraduationCap size={22} style={{ color: primaryColor }} />
                  </motion.div>
                  <h2 className="text-xl font-bold text-gray-800">التعليم والمؤهلات</h2>
                </div>
                
                <ul className="space-y-4">
                  {doctor.education.map((edu, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckCircle2 size={20} style={{ color: secondaryColor }} className="mt-0.5 flex-shrink-0" />
                      </motion.div>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{edu}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* الخبرات */}
            <AnimatedSection delay={0.4}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div 
                    whileHover={{ rotate: 5 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${secondaryColor}15` }}
                  >
                    <Briefcase size={22} style={{ color: secondaryColor }} />
                  </motion.div>
                  <h2 className="text-xl font-bold text-gray-800">الخبرات العملية</h2>
                </div>
                
                <ul className="space-y-4">
                  {doctor.experience.map((exp, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 group"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckCircle2 size={20} style={{ color: primaryColor }} className="mt-0.5 flex-shrink-0" />
                      </motion.div>
                      <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{exp}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 mt-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center text-sm text-gray-500"
            >
              © {new Date().getFullYear()} {clinic.name}. جميع الحقوق محفوظة.
            </motion.p>
          </div>
        </footer>
      </div>

      {/* زر المشاركة */}
      <ShareButton 
        clinicName={clinic.name}
        doctorName={doctor.fullName}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
    </div>
  );
}