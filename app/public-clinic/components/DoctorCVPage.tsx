// app\public\components\DoctorCVPage.tsx

'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap,
  Briefcase,
  Share2,
  Award,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { Clinic } from '@/types';

// ============ أيقونات محسنة للأداء ============
const IconWrapper = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span style={{ color }} className="flex-shrink-0">
    {children}
  </span>
);

// ============ الخطوط المثالية للهاتف ============
const textStyles = {
  heading: "font-bold tracking-tight text-white",
  body: "text-gray-300/90 leading-relaxed",
  label: "text-gray-400 text-sm tracking-wide",
};

// ============ تأثيرات حركية خفيفة ============
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
};

// ============ مكون المثلث الزخرفي ============
const DecorativeTriangle = ({ position, color }: { position: 'top-right' | 'bottom-left'; color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 0.15, scale: 1 }}
    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
    className={`absolute ${position === 'top-right' ? 'top-0 right-0' : 'bottom-0 left-0'} pointer-events-none`}
  >
    <svg 
      width={position === 'top-right' ? "120" : "100"} 
      height={position === 'top-right' ? "120" : "100"} 
      viewBox="0 0 120 120"
      className="opacity-80"
    >
      {position === 'top-right' ? (
        <polygon points="120,0 120,120 0,0" fill={color} />
      ) : (
        <polygon points="0,120 120,120 0,0" fill={color} />
      )}
    </svg>
  </motion.div>
);

// ============ زر المشاركة المحسن ============
const ShareButton = ({ primaryColor }: { primaryColor: string }) => {
  const [showCheck, setShowCheck] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowCheck(true);
        setTimeout(() => setShowCheck(false), 2000);
      }
    } catch (error) {
      // تجاهل أخطاء المشاركة
      console.debug('Share cancelled or failed');
    }
  }, []);

  return (
    <motion.button
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      onClick={handleShare}
      whileTap={{ scale: 0.95 }}
      className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg active:scale-95 transition-colors"
      style={{ backgroundColor: `${primaryColor}30` }}
      aria-label="مشاركة"
    >
      <AnimatePresence mode="wait">
        {showCheck ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="text-white text-lg"
          >
            ✓
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Share2 size={20} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// ============ المكون الرئيسي ============
interface DoctorCVPageProps {
  clinic: Clinic;
}

export default function DoctorCVPage({ clinic }: DoctorCVPageProps) {
  const primaryColor = clinic.settings.primaryColor;
  const doctor = clinic.doctorProfile;
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // التحميل المسبق للصورة
  useEffect(() => {
    if (doctor.photo) {
      const img = new window.Image();
      img.src = doctor.photo;
      img.onload = () => setIsImageLoaded(true);
    } else {
      setIsImageLoaded(true);
    }
  }, [doctor.photo]);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      dir="rtl"
      style={{ background: '#0F172A' }} // لون كحلي داكن
    >
      {/* ============ الزخارف الهندسية ============ */}
      <DecorativeTriangle position="top-right" color={primaryColor} />
      <DecorativeTriangle position="bottom-left" color={primaryColor} />
      
      {/* ============ تأثير ضبابي خفيف ============ */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* ============ المحتوى الرئيسي ============ */}
      <div className="relative z-10">
        {/* ============ الحاوية المدورة ============ */}
        <div className="relative">
          {/* الحاوية العلوية مع التدوير السفلي */}
<motion.div 
  initial={{ y: -80, opacity: 0, borderRadius: '0 0 0 0' }}
  animate={{ y: 0, opacity: 1, borderRadius: '0 0 40% 40%' }}
  transition={{ 
    duration: 0.8, 
    ease: [0.34, 1.56, 0.64, 1],
    borderRadius: { delay: 0.3, duration: 0.6 }
  }}
  className="relative mx-4 sm:mx-8 md:mx-12 lg:mx-20 xl:mx-28"
  style={{ 
    background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
  }}
>
  <div className="px-4 sm:px-6 pt-6 sm:pt-8 md:pt-10 pb-16 sm:pb-20 md:pb-24">
    {/* العنوان الرئيسي - محسن للشاشات المختلفة */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="text-center mb-8 sm:mb-10 md:mb-12"
    >
      <h1 className={`
        text-2xl sm:text-3xl md:text-4xl lg:text-5xl
        ${textStyles.heading} 
        px-2 sm:px-4
        mb-2 sm:mb-3
      `}>
        {doctor.fullName}
      </h1>
    </motion.div>

    {/* صورة الطبيب - متجاوبة مع جميع الأحجام */}
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: 0.6, 
        type: "spring",
        stiffness: 150,
        damping: 15
      }}
      className="relative mx-auto 
        w-28 h-28 
        sm:w-32 sm:h-32 
        md:w-40 md:h-40 
        lg:w-48 lg:h-48 
        xl:w-52 xl:h-52"
    >
      {/* حلقة خارجية محسنة */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute 
          -inset-1.5 sm:-inset-2 md:-inset-3
          rounded-full opacity-40"
        style={{ 
          background: `conic-gradient(from 0deg, transparent 0%, ${primaryColor}50 50%, transparent 100%)` 
        }}
      />
      
      {/* حلقة داخلية زخرفية */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute 
          -inset-0.5 sm:-inset-1
          rounded-full opacity-30"
        style={{ 
          background: `conic-gradient(from 180deg, transparent, ${primaryColor}30, transparent)` 
        }}
      />

      {/* الصورة مع تحميل كسول */}
      <div className="relative w-full h-full rounded-full overflow-hidden ring-2 sm:ring-3 md:ring-4 ring-white/20 shadow-xl sm:shadow-2xl">
        {doctor.photo ? (
          <>
            {/* مؤشر التحميل */}
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 sm:w-10 sm:h-10 border-2 sm:border-3 border-white/30 border-t-white rounded-full"
                />
              </div>
            )}
            
            {/* الصورة الفعلية مع lazy loading */}
            <Image
              src={doctor.photo}
              alt={doctor.fullName}
              width={208}
              height={208}
              className={`
                object-cover w-full h-full
                transition-all duration-700
                ${isImageLoaded 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
                }
              `}
              priority={false}
              loading="lazy"
              sizes="
                (max-width: 640px) 112px,
                (max-width: 768px) 128px,
                (max-width: 1024px) 160px,
                (max-width: 1280px) 192px,
                208px
              "
              quality={90}
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%"><animate attributeName="fill" values="#1e293b;#334155;#1e293b" dur="2s" repeatCount="indefinite"/></rect></svg>')}`}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => setIsImageLoaded(false)}
            />
          </>
        ) : (
          /* Avatar افتراضي محسن */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full flex items-center justify-center text-white font-bold"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
          >
            <span className="
              text-3xl sm:text-4xl md:text-5xl lg:text-6xl
              drop-shadow-lg
            ">
              {doctor.fullName.charAt(0)}
            </span>
          </motion.div>
        )}

        {/* تأثير توهج حول الصورة */}
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{ 
            boxShadow: `0 0 20px 5px ${primaryColor}40, inset 0 0 20px 5px ${primaryColor}20` 
          }}
        />
      </div>
    </motion.div>

    {/* شارة أسفل الصورة */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="text-center mt-4 sm:mt-6"
    >
      <span className="
        inline-block
        px-3 sm:px-4 py-1.5 sm:py-2
        rounded-full
        text-xs sm:text-sm
        bg-white/10 backdrop-blur-sm
        text-white/90
        border border-white/20
      ">
        {doctor.specialization}
      </span>
    </motion.div>
  </div>

  {/* تدرج سفلي للانتقال السلس */}
  <div 
    className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 md:h-24"
    style={{
      background: `linear-gradient(to bottom, transparent, #0f172a2c)`
    }}
  />
</motion.div>

          {/* ============ المحتوى النصي - نص فقط بدون حاويات ============ */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="px-6 sm:px-8 max-w-2xl mx-auto mt-20"
          >
            {/* نبذة عن الطبيب */}
            <motion.p 
              {...fadeInUp}
              transition={{ delay: 0.9, duration: 0.5 }}
              className={`${textStyles.body} text-center text-base sm:text-lg mb-12 leading-loose`}
            >
              {doctor.about}
            </motion.p>

            {/* معلومات الجامعة */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <IconWrapper color={primaryColor}>
                  <GraduationCap size={20} />
                </IconWrapper>
                <span className={textStyles.body}>
                  خريج جامعة {doctor.university}  عام {doctor.graduationYear instanceof Date ? doctor.graduationYear.getFullYear() : doctor.graduationYear}
                </span>
              </div>
            </motion.div>

            {/* ============ قسم المؤهلات - قائمة بسيطة ============ */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" 
                      style={{ backgroundColor: `${primaryColor}20` }}>
                  <IconWrapper color={primaryColor}>
                    <Award size={18} />
                  </IconWrapper>
                </span>
                <h2 className={`text-xl sm:text-2xl ${textStyles.heading}`}>المؤهلات العلمية</h2>
              </div>
              
              <div className="space-y-3 pr-4">
                {doctor.education.map((edu, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" 
                          style={{ backgroundColor: primaryColor }} />
                    <span className={textStyles.body}>{edu}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ============ قسم الخبرات ============ */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" 
                      style={{ backgroundColor: `${primaryColor}20` }}>
                  <IconWrapper color={primaryColor}>
                    <Briefcase size={18} />
                  </IconWrapper>
                </span>
                <h2 className={`text-xl sm:text-2xl ${textStyles.heading}`}>الخبرات العملية</h2>
              </div>
              
              <div className="space-y-3 pr-4">
                {doctor.experience.map((exp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                    className="flex items-start gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" 
                          style={{ backgroundColor: primaryColor }} />
                    <span className={textStyles.body}>{exp}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ============ معلومات التواصل - تصميم بسيط ============ */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="border-t border-white/10 pt-8 mb-12"
            >
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* الهاتف */}
                {/* <motion.a
                  href={`tel:+966112345678`}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <IconWrapper color={primaryColor}>
                    <Phone size={18} />
                  </IconWrapper>
                  <div>
                    <p className={textStyles.label}>اتصل بنا</p>
                    <p className="text-white/80 text-sm" dir="ltr">011 234 5678</p>
                  </div>
                </motion.a> */}

                {/* البريد الإلكتروني */}
                <motion.a
                  href={`mailto:${doctor.contactEmail}`}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <IconWrapper color={primaryColor}>
                    <Mail size={18} />
                  </IconWrapper>
                  <div className="min-w-0">
                    <p className={textStyles.label}>البريد الإلكتروني</p>
                    <p className="text-white/80 text-sm truncate">{doctor.contactEmail}</p>
                  </div>
                </motion.a>

                {/* العنوان */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <IconWrapper color={primaryColor}>
                    <MapPin size={18} />
                  </IconWrapper>
                  <div className="min-w-0">
                    <p className={textStyles.label}>{clinic.name}</p>
                    <p className="text-white/80 text-sm truncate">{clinic.address}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* ============ Footer ============ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="text-center pb-10"
            >
              <p className="text-gray-600 text-xs">
                جميع الحقوق محفوظة © {new Date().getFullYear()}
              </p>
              <p className="text-gray-600 text-xs">
                BY LiveDent
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ============ زر المشاركة ============ */}
      <ShareButton primaryColor={primaryColor} />
    </div>
  );
}