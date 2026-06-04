"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import {
  Users,
  Calendar,
  CreditCard,
  Clock,
  FileText,
  IdCard,
  FileSpreadsheet,
  MessageCircle,
  BarChart3,
  Stethoscope,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GripHorizontal,
} from 'lucide-react';

// ==========================================
// دالة cn مساعدة
// ==========================================
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ==========================================
// بيانات كروت LiveDent
// ==========================================
const FEATURES = [
  {
    id: 1,
    icon: Users,
    title: "إدارة المرضى",
    description: "سجل طبي إلكتروني متكامل لكل مريض يتضمن التاريخ المرضي والزيارات السابقة",
    color: "blue",
    stats: "1000+ مريض",
  },
  {
    id: 2,
    icon: Calendar,
    title: "جدولة المواعيد",
    description: "نظام ذكي لجدولة مواعيد المرضى مع تذكيرات تلقائية وإدارة أوقات الانتظار",
    color: "green",
    stats: "تذكير تلقائي",
  },
  {
    id: 3,
    icon: CreditCard,
    title: "إدارة المدفوعات",
    description: "تتبع دقيق للمدفوعات مع تقارير مالية يومية وشهرية وسجل كامل للمعاملات",
    color: "yellow",
    stats: "تقارير فورية",
  },
  {
    id: 4,
    icon: Clock,
    title: "تنظيم الدوام",
    description: "إدارة أوقات العمل والإجازات والعطل الرسمية بمرونة تامة مع نظام مناوبات ذكي",
    color: "purple",
    stats: "مرونة كاملة",
  },
  {
    id: 5,
    icon: FileText,
    title: "صفحة تعريفية",
    description: "صفحة ويب احترافية تعرض خدمات عيادتك والأطباء والتخصصات لتعزيز ظهورك",
    color: "pink",
    stats: "تواجد إلكتروني",
  },
  {
    id: 6,
    icon: IdCard,
    title: "كرت المريض الرقمي",
    description: "بطاقة رقمية ذكية لكل مريض مع رمز QR فريد للمشاركة السهلة",
    color: "orange",
    stats: "QR Code",
  },
  {
    id: 7,
    icon: FileSpreadsheet,
    title: "تصدير البيانات",
    description: "تحويل بيانات المرضى والمدفوعات إلى Excel و PDF بشكل مباشر وسهل",
    color: "teal",
    stats: "Excel & PDF",
  },
  {
    id: 8,
    icon: MessageCircle,
    title: "تقليل الاستفسارات",
    description: "نظام إشعارات وتذكيرات ذكية لتقليل استفسارات المرضى المتكررة",
    color: "indigo",
    stats: "توفير 70% وقت",
  },
  {
    id: 9,
    icon: BarChart3,
    title: "لوحة تحكم",
    description: "لوحة شاملة مع رسوم بيانية تفاعلية لمتابعة أداء العيادة بشكل فوري",
    color: "red",
    stats: "إحصائيات فورية",
  },
  {
    id: 10,
    icon: Stethoscope,
    title: "CV مخصص للطبيب",
    description: "صفحة سيرة ذاتية احترافية لكل طبيب تعرض خبراته وشهاداته ومهاراته",
    color: "emerald",
    stats: "ملف احترافي",
  },
];

// ==========================================
// ألوان Tailwind لكل لون
// ==========================================
const colorMap = {
  blue: {
    gradient: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/30",
    iconBg: "bg-blue-500/5",
    iconText: "text-blue-400",
    dot: "bg-blue-400",
    tagBg: "bg-blue-500/10",
    tagText: "text-blue-400",
    tagBorder: "border-blue-500/20",
  },
  green: {
    gradient: "from-green-500/20 to-green-600/5",
    border: "border-green-500/30",
    iconBg: "bg-green-500/5",
    iconText: "text-green-400",
    dot: "bg-green-400",
    tagBg: "bg-green-500/10",
    tagText: "text-green-400",
    tagBorder: "border-green-500/20",
  },
  yellow: {
    gradient: "from-yellow-500/20 to-yellow-600/5",
    border: "border-yellow-500/30",
    iconBg: "bg-yellow-500/5",
    iconText: "text-yellow-400",
    dot: "bg-yellow-400",
    tagBg: "bg-yellow-500/10",
    tagText: "text-yellow-400",
    tagBorder: "border-yellow-500/20",
  },
  purple: {
    gradient: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/30",
    iconBg: "bg-purple-500/5",
    iconText: "text-purple-400",
    dot: "bg-purple-400",
    tagBg: "bg-purple-500/10",
    tagText: "text-purple-400",
    tagBorder: "border-purple-500/20",
  },
  pink: {
    gradient: "from-pink-500/20 to-pink-600/5",
    border: "border-pink-500/30",
    iconBg: "bg-pink-500/5",
    iconText: "text-pink-400",
    dot: "bg-pink-400",
    tagBg: "bg-pink-500/10",
    tagText: "text-pink-400",
    tagBorder: "border-pink-500/20",
  },
  orange: {
    gradient: "from-orange-500/20 to-orange-600/5",
    border: "border-orange-500/30",
    iconBg: "bg-orange-500/5",
    iconText: "text-orange-400",
    dot: "bg-orange-400",
    tagBg: "bg-orange-500/10",
    tagText: "text-orange-400",
    tagBorder: "border-orange-500/20",
  },
  teal: {
    gradient: "from-teal-500/20 to-teal-600/5",
    border: "border-teal-500/30",
    iconBg: "bg-teal-500/5",
    iconText: "text-teal-400",
    dot: "bg-teal-400",
    tagBg: "bg-teal-500/10",
    tagText: "text-teal-400",
    tagBorder: "border-teal-500/20",
  },
  indigo: {
    gradient: "from-indigo-500/20 to-indigo-600/5",
    border: "border-indigo-500/30",
    iconBg: "bg-indigo-500/5",
    iconText: "text-indigo-400",
    dot: "bg-indigo-400",
    tagBg: "bg-indigo-500/10",
    tagText: "text-indigo-400",
    tagBorder: "border-indigo-500/20",
  },
  red: {
    gradient: "from-red-500/20 to-red-600/5",
    border: "border-red-500/30",
    iconBg: "bg-red-500/5",
    iconText: "text-red-400",
    dot: "bg-red-400",
    tagBg: "bg-red-500/10",
    tagText: "text-red-400",
    tagBorder: "border-red-500/20",
  },
  emerald: {
    gradient: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/30",
    iconBg: "bg-emerald-500/5",
    iconText: "text-emerald-400",
    dot: "bg-emerald-400",
    tagBg: "bg-emerald-500/10",
    tagText: "text-emerald-400",
    tagBorder: "border-emerald-500/20",
  },
};

// ==========================================
// المكون الرئيسي
// ==========================================
export default function CardStack() {
  const [cards, setCards] = useState(FEATURES);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [dragDirection, setDragDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  
  // Motion values للسحب
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const rotateX = useTransform(dragY, [-100, 0, 100], [8, 0, -8]);
  const rotateY = useTransform(dragX, [-100, 0, 100], [-8, 0, 8]);
  const opacity = useTransform(dragX, [-150, -75, 0, 75, 150], [0, 0.5, 1, 0.5, 0]);

  const moveToEnd = () => {
    setCards(prev => [...prev.slice(1), prev[0]]);
  };

  const moveToStart = () => {
    setCards(prev => [prev[prev.length - 1], ...prev.slice(0, -1)]);
  };

  // التقليب التلقائي كل 4 ثوان
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      moveToEnd();
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, cards.length]);

  // Configuration
  const offset = 10;
  const scaleStep = 0.06;
  const dimStep = 0.15;
  const stiff = 170;
  const damp = 26;
  const swipeThreshold = 50;

  const spring = {
    type: 'spring' as const,
    stiffness: stiff,
    damping: damp
  };

  // السحب بالجهات الأربع
  const handleDragEnd = (_: any, info: any) => {
    const { offset, velocity } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);

    if (Math.abs(velocity.x) > 500 || Math.abs(velocity.y) > 500 || absX > swipeThreshold || absY > swipeThreshold) {
      setIsAutoPlaying(false);
      
      if (absX > absY) {
        // سحب أفقي
        if (offset.x < 0 || velocity.x < -500) {
          setDragDirection('left');
          setTimeout(() => {
            moveToEnd();
            setDragDirection(null);
            setTimeout(() => setIsAutoPlaying(true), 6000);
          }, 150);
        } else {
          setDragDirection('right');
          setTimeout(() => {
            moveToStart();
            setDragDirection(null);
            setTimeout(() => setIsAutoPlaying(true), 6000);
          }, 150);
        }
      } else {
        // سحب عمودي
        if (offset.y < 0 || velocity.y < -500) {
          setDragDirection('up');
          setTimeout(() => {
            moveToEnd();
            setDragDirection(null);
            setTimeout(() => setIsAutoPlaying(true), 6000);
          }, 150);
        } else {
          setDragDirection('down');
          setTimeout(() => {
            moveToStart();
            setDragDirection(null);
            setTimeout(() => setIsAutoPlaying(true), 6000);
          }, 150);
        }
      }
    }
    dragX.set(0);
    dragY.set(0);
  };

  const currentIndex = FEATURES.findIndex(c => c.id === cards[0]?.id);

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-[#0A1628] via-[#0D1B30] to-[#0A1628] overflow-hidden" id="services">
      {/* خلفية ذهبية */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* العنوان */}
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="inline-flex items-center gap-2 bg-yellow-500/10 rounded-full px-4 py-1.5 mb-4 border border-yellow-500/20"
          >
            <Sparkles className="text-yellow-400" size={14} />
            <span className="text-yellow-400 text-sm font-medium">مميزات متكاملة</span>
          </motion.div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            كل ما تحتاجه عيادتك في مكان واحد
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
            اسحب البطاقة في أي اتجاه لاستكشاف جميع الميزات
          </p>
        </div>

        {/* حاوية البطاقات المتراكمة */}
        <div className="relative w-full flex items-center justify-center" style={{ height: '450px' }}>

          {/* حاوية مجموعة البطاقات - 3 بطاقات ظاهرة فقط */}
          {/* حاوية البطاقات المتراكمة */}
<div className="relative w-full flex items-center justify-center" style={{ height: '380px' }}>

  {/* حاوية مجموعة البطاقات - 3 بطاقات ظاهرة فقط */}
  <div className="relative w-80 sm:w-96 aspect-[4/3] sm:aspect-[5/4] overflow-visible z-10">
    <ul className="relative w-full h-full m-0 p-0">
      {cards.slice(0, 3).map(({ id, icon: Icon, title, description, color, stats }, i) => {
        const isFront = i === 0;
        const brightness = Math.max(0.4, 1 - i * dimStep);
        const baseZ = 3 - i;
        const colors = colorMap[color as keyof typeof colorMap];

        return (
          <motion.li
            key={id}
            className="absolute w-full h-full list-none overflow-hidden"
            style={{
              borderRadius: '20px',
              cursor: isFront ? 'grab' : 'auto',
              touchAction: 'none',
              background: isFront 
                ? 'linear-gradient(145deg, rgba(20, 35, 55, 0.98), rgba(12, 25, 45, 0.99))'
                : 'linear-gradient(145deg, rgba(15, 31, 53, 0.8), rgba(10, 22, 40, 0.85))',
              borderColor: isFront ? 'rgba(234, 179, 8, 0.35)' : 'rgba(234, 179, 8, 0.1)',
              borderWidth: isFront ? '1.5px' : '1px',
              borderStyle: 'solid',
              boxShadow: isFront
                ? '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(234, 179, 8, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
                : '0 10px 25px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.01)',
              rotateX: isFront ? rotateX : 0,
              rotateY: isFront ? rotateY : 0,
              transformPerspective: 1000,
              opacity: isFront ? (dragDirection ? opacity : 1) : 1,
            }}
            animate={{
              top: `${i * -offset}%`,
              scale: 1 - i * scaleStep,
              filter: `brightness(${brightness})`,
              zIndex: baseZ,
            }}
            transition={spring}
            drag={isFront}
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.7}
            onDrag={(_, info) => {
              if (isFront) {
                dragX.set(info.offset.x);
                dragY.set(info.offset.y);
              }
            }}
            onDragEnd={handleDragEnd}
            whileDrag={
              isFront
                ? {
                    zIndex: 4,
                    cursor: 'grabbing',
                    scale: 1.05,
                  }
                : {}
            }
          >
            {/* تأثير التوهج الذهبي العلوي - أخف */}
            <div 
              className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none rounded-t-2xl"
              style={{
                background: isFront 
                  ? 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.1), transparent 70%)'
                  : 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.03), transparent 70%)'
              }}
            />
            
            {/* خط انعكاس زجاجي - أنحف */}
            <div 
              className="absolute top-0 left-8 right-8 h-px pointer-events-none"
              style={{
                background: isFront 
                  ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.02), transparent)'
              }}
            />

            {/* نقطة زخرفية صغيرة */}
            <div className="absolute top-3 right-4 w-1.5 h-1.5 rounded-full bg-yellow-400/30" />

            {/* ✅ أيقونة كبيرة شفافة مائلة في الزاوية العلوية اليسرى - بدون إطار */}
            <div 
              className="absolute -top-4 -left-4 z-0 overflow-hidden"
              style={{ width: '45%', height: '45%' }}
            >
              <motion.div
                animate={{ 
                  scale: isFront ? 1 : 0.9,
                  rotate: -30,
                }}
                transition={{ duration: 0.5 }}
                className="w-full h-full flex items-start justify-start"
                style={{ transform: 'rotate(-30deg) translate(-10%, -10%)' }}
              >
                <Icon 
                  className={`${colors.iconText} opacity-[0.06]`}
                  size={120}
                  strokeWidth={1.5}
                />
              </motion.div>
            </div>

            {/* ✅ محتوى البطاقة - منحاز لليمين */}
            <div className="relative z-10 flex flex-col justify-end h-full p-5 sm:p-6 text-right pb-6">
              {/* عنوان الميزة */}
              <motion.h3
                animate={{ scale: isFront ? 1 : 0.9, opacity: isFront ? 1 : 0.5 }}
                className={`font-bold text-white mb-2 text-right leading-tight ${isFront ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}
              >
                {title}
              </motion.h3>

              {/* خط فاصل صغير */}
              <motion.div
                animate={{ width: isFront ? '40px' : '0px', opacity: isFront ? 1 : 0 }}
                className="h-0.5 bg-gradient-to-l from-yellow-400 to-transparent rounded-full mb-3 ml-0 mr-auto"
              />

              {/* وصف الميزة */}
              <motion.p
                animate={{ 
                  opacity: isFront ? 1 : 0,
                  maxHeight: isFront ? '60px' : '0px',
                }}
                className="text-gray-400 text-xs sm:text-sm leading-relaxed text-right overflow-hidden mb-3"
              >
                {description}
              </motion.p>

              {/* إحصائية */}
              <motion.div
                animate={{ opacity: isFront ? 1 : 0 }}
                className="flex items-center gap-2 justify-end"
              >
                <span className={`text-[10px] sm:text-xs ${colors.tagText} font-medium tracking-wider`}>{stats}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} shadow-lg`} style={{ boxShadow: `0 0 6px currentColor` }} />
              </motion.div>
            </div>

            {/* مؤشر السحب للبطاقة الأمامية */}
            {isFront && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2"
              >
                <motion.div
                  animate={{ y: [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-1.5"
                >
                </motion.div>
              </motion.div>
            )}
          </motion.li>
        );
      })}
    </ul>
  </div>
</div>
        </div>

        {/* نقاط التنقل */}
        <div className="flex justify-center gap-2 mt-6">
          {FEATURES.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                const targetId = FEATURES[index].id;
                const currentId = cards[0].id;
                if (targetId === currentId) {
                  setTimeout(() => setIsAutoPlaying(true), 6000);
                  return;
                }
                const currentGlobalIndex = FEATURES.findIndex(c => c.id === currentId);
                const diff = index - currentGlobalIndex;
                
                if (diff > 0) {
                  for (let i = 0; i < diff; i++) {
                    setTimeout(() => moveToEnd(), i * 100);
                  }
                } else {
                  for (let i = 0; i < Math.abs(diff); i++) {
                    setTimeout(() => moveToStart(), i * 100);
                  }
                }
                
                setTimeout(() => setIsAutoPlaying(true), 6000 + Math.abs(diff) * 100);
              }}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? 'bg-yellow-400 w-8 shadow-lg shadow-yellow-400/30' 
                  : 'bg-yellow-500/20 hover:bg-yellow-500/40 w-2'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* عداد البطاقات */}
        <div className="text-center mt-3">
          <span className="text-gray-500 text-sm">
            {currentIndex + 1} / {FEATURES.length}
          </span>
        </div>
      </div>
    </section>
  );
}