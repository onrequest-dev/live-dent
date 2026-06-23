//livedent/app/page.tsx
'use client';

import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Globe,
  Palette,
  Smartphone,
  IdCard,
  FileText,
  Layout,
  Sparkles,
  ArrowLeft,
  X,
  Database,      // للتخزين السحابي
  Calendar,      // للجدول والأجندة
  FileSpreadsheet, // للتصدير إلى Excel
  Search,        // للبحث المتطور
  Bell,          // للتنبيهات
  Activity,      // بدلاً من Tooth (لشارت الأسنان)
  Camera,       // للصور والأشعة
  Download,      // للتحميل
  Shield,        // للحماية
  BarChart,      // للتحليلات
  Clock,         // للمواعيد
  Users,         // للمرضى
} from 'lucide-react';
import { FaTelegramPlane, FaWhatsapp, FaYoutube, FaInstagram } from 'react-icons/fa';

// ==========================================
// نظام الألوان الموحد
// ==========================================
const COLORS = {
  primary: '#0043fa',
  primaryLight: '#0043fa15',
  primaryMedium: '#0043fa30',
  background: '#d2e9ff',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e8ecf1',
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

// ==========================================
// مكون SVG الأسنان مع أنيميشن متقدم
// ==========================================
const DentalSVG = ({ className = "", direction = "right", size = "normal" }: { 
  className?: string; 
  direction?: "left" | "right"; 
  size?: "small" | "normal" | "large" 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const sizeClasses = {
    small: "w-48 h-48 md:w-64 md:h-64",
    normal: "w-64 h-64 md:w-80 md:h-80",
    large: "w-80 h-80 md:w-96 md:h-96",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0,
        x: direction === "right" ? 150 : -150,
        rotate: direction === "right" ? 20 : -20,
        scale: 0.5,
        filter: "blur(10px)",
      }}
      animate={isInView ? { 
        opacity: 0.12,
        x: 0,
        rotate: 0,
        scale: 1,
        filter: "blur(0px)",
      } : {}}
      transition={{ 
        duration: 1.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        opacity: { duration: 1.2 },
        filter: { duration: 1.5 },
      }}
      className={`absolute ${sizeClasses[size]} ${className} pointer-events-none select-none`}
    >
      <svg
        viewBox="0 0 6000 6000"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <g transform="scale(1, -1) translate(0, -6000)">
          <path
            d="M1336 4749 c-65 -16 -153 -69 -202 -121 -117 -125 -139 -302 -59 -464 41 -83 97 -139 184 -181 51 -25 66 -28 166 -28 98 0 116 3 167 27 195 91 284 317 207 524 -31 83 -140 192 -224 224 -67 25 -179 35 -239 19z M3775 4749 c-99 -13 -234 -51 -377 -105 -115 -45 -129 -48 -218 -48 -85 0 -113 5 -271 52 -256 75 -306 85 -454 85 -155 1 -262 -22 -389 -82 -95 -44 -206 -125 -206 -149 0 -10 5 -46 10 -82 26 -183 -61 -370 -216 -462 -48 -29 -53 -36 -59 -77 -10 -67 -7 -316 5 -412 31 -250 96 -472 199 -678 l51 -101 0 -177 c0 -261 31 -449 115 -700 168 -506 458 -759 653 -570 75 73 121 171 177 382 77 285 88 322 116 384 61 134 148 201 263 201 77 0 129 -24 183 -83 72 -78 101 -153 177 -452 60 -239 89 -309 163 -402 40 -50 122 -93 177 -93 127 0 277 149 398 393 103 209 171 441 213 735 17 114 17 114 86 220 314 482 453 1125 334 1538 -89 305 -302 527 -604 630 -166 56 -352 75 -526 53z"
            fill={COLORS.primary}
          />
          <path
            d="M4808 2297 c-59 -23 -124 -64 -153 -99 -108 -128 -107 -307 1 -427 65 -72 129 -103 224 -109 131 -7 242 54 305 169 24 45 30 69 33 142 4 82 3 91 -27 152 -35 70 -87 122 -159 157 -56 27 -171 34 -224 15z"
            fill={COLORS.primary}
          />
        </g>
      </svg>
    </motion.div>
  );
};

// ==========================================
// مكون القسم مع أنيميشن متقدم
// ==========================================
const AnimatedSection = ({ 
  children, 
  delay = 0, 
  className = "",
  direction = "up" 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string;
  direction?: "up" | "left" | "right";
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  
  const directionVariants = {
    up: { y: 40, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0,
        ...directionVariants[direction],
        filter: "blur(4px)",
      }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        x: 0,
        filter: "blur(0px)",
      } : {}}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94],
        filter: { duration: 0.6 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==========================================
// بطاقة الخدمة بتصميم زجاجي
// ==========================================
const ServiceCard = ({ icon: Icon, title, description, index }: { 
  icon: any; 
  title: string; 
  description: string;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative group"
    >
      <div 
        className="relative p-8 rounded-3xl transition-all duration-500 overflow-hidden"
        style={{ 
          // تأثير البلور (Glassmorphism)
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* أيقونة الخلفية الكبيرة - في الزاوية اليمنى السفلى */}
        <div 
          className="absolute pointer-events-none"
          style={{ 
            bottom: '-20px',   // جزء منها خارج الكرت
            right: '-20px',    // جزء منها خارج الكرت
            opacity: 0.06,     // غير ظاهرة بشكل كامل (جداً شفافة)
            zIndex: 0,
            transform: 'rotate(5deg)', // ميلان بسيط للجمالية
          }}
        >
          <Icon size={140} strokeWidth={1} style={{ color: COLORS.primary }} />
        </div>

        {/* المحتوى الرئيسي - ترتيب أفقي (النص والأيقونة بجانب بعض) */}
        <div className="relative z-10 flex items-start gap-4">
          {/* أيقونة البطاقة الصغيرة */}
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.primary}15, ${COLORS.primary}05)`,
              border: `1px solid ${COLORS.primary}20`,
            }}
          >
            <Icon size={24} style={{ color: COLORS.primary }} strokeWidth={1.5} />
          </div>

          {/* النص */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.text }}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
              {description}
            </p>
          </div>
        </div>

        {/* خط سفلي أنيق */}
        <div 
          className="absolute bottom-0 left-8 right-8 h-px transition-all duration-500"
          style={{ 
            background: `linear-gradient(to right, transparent, ${COLORS.primary}20, transparent)`,
          }}
        />
      </div>
    </motion.div>
  );
};

// ==========================================
// مكون عرض الصورة الموسعة
// ==========================================
const ImageModal = ({ image, onClose }: { image: { src: string; alt: string; title: string } | null; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {image && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative max-w-5xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
            >
              <X size={28} />
            </button>
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-contain"
                priority
              />
            </div>
            <p className="text-white/90 text-center mt-4 text-lg font-medium">{image.title}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// شريط التقدم عند التمرير
// ==========================================
const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = (window.scrollY / totalScroll) * 100;
      setProgress(currentProgress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: progress / 100 }}
      className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
      style={{ backgroundColor: COLORS.primary }}
    />
  );
};

// ==========================================
// مكون التواصل الاجتماعي
// ==========================================
const SocialContact = () => {
  const socialLinks = [
    { icon: FaTelegramPlane, href: "https://t.me/OnRequest_dev", label: "تلغرام" },
    { icon: FaWhatsapp, href: "https://wa.me/+963982719525", label: "واتساب" },
    { icon: FaYoutube, href: "https://youtube.com/@OnRequest_dev", label: "يوتيوب" },
    { icon: FaInstagram, href: "https://www.instagram.com/livedent.official", label: "انستغرام" },
  ];

  return (
    <div className="py-8">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="h-px w-8" style={{ backgroundColor: COLORS.primary }} />
          <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
            تواصل معنا
          </span>
          <div className="h-px w-8" style={{ backgroundColor: COLORS.primary }} />
        </motion.div>

        <div className="flex justify-center items-center gap-3">
          {socialLinks.map((social, index) => (
            <motion.a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.08,
                type: "spring",
                stiffness: 200 
              }}
              className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{ 
                backgroundColor: `${COLORS.primary}08`,
                border: `1px solid ${COLORS.primary}15`,
                color: COLORS.primary 
              }}
              title={social.label}
            >
              <social.icon size={18} />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// الصفحة الرئيسية
// ==========================================
export default function Home() {
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; title: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

const services = [
  { 
    icon: Globe, 
    title: "نركز على البساطة", 
    description: "واجهة مستخدم نظيفة وبديهية، صُممت بعناية لتجعل إدارة عيادتك سلسة وممتعة دون أي تعقيد" 
  },
  { 
    icon: Palette, 
    title: "ظهورك الإلكتروني", 
    description: "نعزز حضورك الرقمي بصفحة تعريفية احترافية تعكس هوية عيادتك وتجذب المرضى المحتملين" 
  },
  { 
    icon: Layout, 
    title: "لوحة تحكم ذكية", 
    description: "تحكم كامل ومرن بجميع جوانب عيادتك من خلال واجهة واحدة منظمة وسهلة الاستخدام" 
  },
  { 
    icon: Smartphone, 
    title: "تجربة متكاملة", 
    description: "متوافق مع جميع الأجهزة والمنصات، يعمل بسلاسة على هاتفك وحاسوبك وجهازك اللوحي" 
  },
  { 
    icon: IdCard, 
    title: "ملف مريض شامل", 
    description: "بطاقة رقمية متكاملة لكل مريض تحتوي على التاريخ الطبي والمواعيد والمدفوعات" 
  },
  { 
    icon: FileText, 
    title: "سيرة ذاتية متميزة", 
    description: "صفحة CV احترافية للطبيب تعرض مؤهلاته وخبراته بأسلوب عصري وجذاب" 
  },
  // الخدمات الجديدة
  { 
    icon: Database, 
    title: "تخزين سحابي آمن", 
    description: "بيانات مخزنة سحابياً ومحمية من الضباع، مع تشفير متقدم وأمان على مستوى المؤسسات" 
  },
  { 
    icon: Calendar, 
    title: "جدول مواعيد ذكي", 
    description: "جدول وأجندة ومخطط أسبوعي لمواعيد المرضى، مع عرض تقويمي متكامل وسهل الاستخدام" 
  },
  { 
    icon:  Activity, 
    title: "ملف طبي متكامل", 
    description: "كافة تفاصيل المرضى بين يديك، من صور المواعيد إلى شارت الأسنان وصور الأشعة" 
  },
  { 
    icon: FileSpreadsheet, 
    title: "تقارير احترافية", 
    description: "تصدير إلى Excel بنقرة واحدة، مع تقارير مفصلة عن المرضى والمواعيد والمدفوعات" 
  },
  { 
    icon: Search, 
    title: "بحث متطور", 
    description: "نظام بحث ذكي ومتقدم للوصول السريع لأي مريض أو موعد أو وثيقة طبية" 
  },
  { 
    icon: Bell, 
    title: "تنبيهات ذكية", 
    description: "مساعد تنبئ تلقائي ذكي وتنبيه تلقائي للمرضى عبر واتساب" 
  },
  { 
    icon: Download, 
    title: "دعم متعدد المنصات", 
    description: "نعمل على جميع الأنظمة: Android و iOS و Windows، يمكنك التحميل بنقرة واحدة" 
  },
  { 
    icon: Shield, 
    title: "مزامنة و حماية متقدمة", 
    description: "من حساب واحد قم بعرض معلوماتك على لا بتوب عيادتك و هاتفك في نفس الوقت مع حماية متقدمة لبياناتك" 
  },
];

  const images = [
    { src: "/imglan/i6.webp", alt: "لوحة التحكم الرئيسية", title: "لوحة تحكم متكاملة غاية في البساطة لعرض المرضى و المواعيد وكافة التفاصيل" },
    { src: "/imglan/i7.webp", alt: "شارت سني لكل مريض", title: "شارت سني ديناميكي يعرض اعمال كل سن " },
    { src: "/imglan/i5.webp", alt: "صور الاشعة", title: "ارفع صور الاشعة وعاينها واجعل كل ارشيف مريضك بمكان واحد" },
    { src: "/imglan/i8.webp", alt: "جدول الجلسات ", title: "راجع كل جلسات عيادتك وابحث عن المريض لتعرض كافة جلساته ومدفوعاته" },
    { src: "/imglan/i9.webp", alt: "الاجندة ", title: "اعرض مرضى كل يوم بشكل منفصل وادرس جدولك الزمني" },
    { src: "/imglan/i10.webp", alt: "الجدول الاسبوعي", title: "كن على دراية بمتى سيكون لديك ضغط في العمل ومتى ستكون متفرغا" },
    { src: "/imglan/i11.webp", alt: "سيرة ثاتية لك وصفحة لجدول عيادتك", title: "تمييز عن البقية وشارك برستيجك الخاص مع مرضاك" },
  ];

  return (
    <div 
      className="min-h-screen relative" 
      style={{ 
        backgroundColor: COLORS.background,
        fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif",
      }}
      dir="rtl"
    >
      {/* شريط التقدم */}
      <ScrollProgress />

      {/* صورة موسعة */}
      <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* SVG Background - يظهر في جميع الأجهزة */}
        <DentalSVG direction="left" size="large" className="top-10 -right-32 md:-right-48 opacity-[0.08]" />
        <DentalSVG direction="right" size="small" className="bottom-20 -left-16 md:-left-32 opacity-[0.06]" />

        {/* أنيميشن الدخول للصفحة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 relative z-10">
            {/* شعار */}
            <AnimatedSection delay={0.2} direction="up">
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.3,
                  type: "spring",
                  stiffness: 150,
                }}
                className="relative w-24 h-24 mx-auto mb-10"
              >
                <div 
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{ 
                    background: `radial-gradient(circle, ${COLORS.primary}, transparent)`,
                    filter: 'blur(20px)',
                  }}
                />
                <Image
                  src="/logo.png"
                  alt="LiveDent"
                  fill
                  className="object-contain relative z-10"
                  priority
                />
              </motion.div>
            </AnimatedSection>

{/* العنوان الرئيسي */}
<motion.h1 
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
  className="font-bold text-center leading-tight text-xl sm:text-2xl md:text-3xl lg:text-5xl mb-4 md:mb-6"
  style={{ color: COLORS.text }}
>
  <span style={{ color: COLORS.text }}>نظـام </span>
  <span style={{ color: COLORS.text }}>إدارة مدفوعـات </span>
  <span style={{ color: COLORS.text }}>ومواعــيد</span>
  <br />
  <span style={{ color: COLORS.text }}>عيــــــــــــــــــــادات</span>
  <br />
  <span className="inline-flex items-center gap-0 flex-wrap justify-center">
    <span style={{ color: COLORS.text }}>الأسنـــــــــــــ</span>
    <motion.div 
      whileHover={{ scale: 1.15, rotate: 5 }} 
      transition={{ type: "spring", stiffness: 300 }} 
      className="relative mx-0 inline-flex items-center justify-center pointer-events-none w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 lg:w-20 lg:h-20"
    >
      <img 
        src="/icon-192x192.png" 
        alt="LiveDent" 
        className="w-full h-full object-contain pointer-events-none"
        style={{ filter: `drop-shadow(0 0 15px ${COLORS.primary}80)` }}
      />
    </motion.div>
    <span style={{ color: COLORS.text }}>ــــــــــــــــــــان</span>
  </span>
</motion.h1>
            {/* الوصف */}
            <AnimatedSection delay={0.8} direction="up">
              <motion.p 
                className="text-lg md:text-xl text-center mb-10 max-w-2xl mx-auto leading-relaxed"
                style={{ color: COLORS.textSecondary }}
              >
                حل رقمي متكامل ومبتكر لإدارة عيادتك بكل احترافية، يجمع بين البساطة والقوة في منصة واحدة
              </motion.p>
            </AnimatedSection>

            {/* زر البداية */}
            <AnimatedSection delay={1.1} direction="up">
  <motion.div className="flex justify-center">
    <motion.a
      href="/Requestcopy"
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="relative group"
    >
      {/* تأثير التوهج خلف الزر */}
      <div 
        style={{ backgroundColor: COLORS.primary }}
      />
      
      {/* الزر الرئيسي - قلب مفرغ (شفاف) مع إطار */}
      <div 
        className="relative px-10 py-4 rounded-2xl font-semibold text-lg inline-flex items-center gap-3 transition-all duration-300 backdrop-blur-sm"
        style={{ 
          backgroundColor: 'transparent',
          border: `2px solid ${COLORS.primary}`,
          color: COLORS.primary,
        }}
      >
        <span>أطلب نسختك الآن</span>
        <motion.div
          animate={{ x: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ArrowLeft size={20} style={{ color: COLORS.primary }} />
        </motion.div>
      </div>
    </motion.a>
  </motion.div>
</AnimatedSection>
          </div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="relative py-24 overflow-hidden">
        <DentalSVG direction="right" size="large" className="top-20 -left-32 md:-left-48 opacity-[0.06]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <AnimatedSection className="text-center mb-16" direction="up">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6"
              style={{ backgroundColor: COLORS.primaryLight, border: `1px solid ${COLORS.primary}15` }}
            >
              <Sparkles size={16} style={{ color: COLORS.primary }} />
              <span className="text-sm font-medium" style={{ color: COLORS.primary }}>مميزاتنا</span>
            </motion.div>
            
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: COLORS.text }}
            >
              أدوات متكاملة لعيادتك
            </motion.h2>
            
            <motion.p 
              className="text-lg max-w-xl mx-auto"
              style={{ color: COLORS.textSecondary }}
            >
              كل ما تحتاجه لإدارة عيادتك بكفاءة عالية في منصة واحدة
            </motion.p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                index={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: COLORS.surface }}>
  <DentalSVG direction="left" size="normal" className="top-16 -right-24 md:-right-40 opacity-[0.05]" />

  <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
    <AnimatedSection className="text-center mb-16" direction="up">
      <motion.h2 
        className="text-3xl md:text-4xl font-bold mb-4"
        style={{ color: COLORS.text }}
      >
        لمحة من النظام
      </motion.h2>
      <motion.p 
        className="text-lg"
        style={{ color: COLORS.textSecondary }}
      >
        اضغط على الصورة للمعاينة الكاملة
      </motion.p>
    </AnimatedSection>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {images.map((image, index) => (
        <AnimatedSection key={index} delay={index * 0.1} direction="up">
          <motion.div
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="cursor-pointer group"
            onClick={() => setSelectedImage(image)}
          >
            <div 
              className="rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:shadow-xl hover:-translate-y-1"
              style={{ 
                backgroundColor: COLORS.background,
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {/* Label مع تحسينات */}
              <div className="px-5 pt-5 pb-0">
                <h3 
                  className="font-semibold text-base mb-3 transition-all duration-300 group-hover:text-primary"
                  style={{ color: COLORS.text }}
                >
                  {image.title}
                </h3>
              </div>
              
              {/* حاوية الصورة - بدون hover مزعج */}
              <div className="relative aspect-[4/3] overflow-hidden mx-5 mb-5 rounded-xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {/* Overlay بسيط وأنيق */}
                <div 
                  className="absolute inset-0 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100"
                  style={{ 
                    background: `linear-gradient(to top, ${COLORS.primary}30, transparent)`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </AnimatedSection>
      ))}
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="py-10" style={{ borderTop: `1px solid ${COLORS.border}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="relative w-8 h-8">
                <Image src="/logo.png" alt="LiveDent" fill className="object-contain" />
              </div>
              <span className="text-lg font-bold" style={{ color: COLORS.text }}>LiveDent</span>
            </motion.div>
            
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              © 2026 LiveDent. جميع الحقوق محفوظة
            </p>
            
            <div className="flex gap-6">
              <motion.a 
                href="#" 
                whileHover={{ color: COLORS.primary }}
                className="text-sm transition-colors"
                style={{ color: COLORS.textSecondary }}
              >
                سياسة الخصوصية
              </motion.a>
              <motion.a 
                href="#" 
                whileHover={{ color: COLORS.primary }}
                className="text-sm transition-colors"
                style={{ color: COLORS.textSecondary }}
              >
                الشروط والأحكام
              </motion.a>
            </div>
          </div>
          
          <SocialContact />
        </div>
      </footer>
    </div>
  );
}