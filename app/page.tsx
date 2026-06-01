'use client';

import { motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
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
  Smartphone,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FaTelegramPlane, FaWhatsapp, FaYoutube, FaInstagram } from 'react-icons/fa';
import { DoctorsShowcase } from '@/components/ui/DoctorsShowcase';

// ==========================================
// مكون صورة بسيط
// ==========================================
const Img = ({ src, alt, width, height, className }: { src: string; alt: string; width?: number; height?: number; className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} width={width} height={height} className={className} loading="eager" />
);
// ==========================================
// TypewriterTextTrigger - يبدأ عند الدخول إلى viewport
// ==========================================
const TypewriterTextTrigger = ({ 
  text, 
  delay = 50, 
  startDelay = 0, 
  className = "",
  triggerOnce = true // إذا كان true، يبدأ مرة واحدة فقط
}: { 
  text: string; 
  delay?: number; 
  startDelay?: number; 
  className?: string;
  triggerOnce?: boolean;
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: triggerOnce, margin: "-100px" });

  // بدء الأنميشن عندما يصبح المكون مرئياً
  useEffect(() => {
    if (isInView && !hasStarted) {
      // تأخير إضافي قبل البدء
      const startTimer = setTimeout(() => {
        setHasStarted(true);
      }, startDelay);

      return () => clearTimeout(startTimer);
    }
  }, [isInView, hasStarted, startDelay]);

  // تأثير الكتابة
  useEffect(() => {
    if (!hasStarted) return;
    
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, delay, text, hasStarted]);

  // إعادة تعيين عند تغيير النص (اختياري)
  useEffect(() => {
    if (!isInView) {
      setDisplayText("");
      setCurrentIndex(0);
      setHasStarted(false);
    }
  }, [isInView, text]);

  return (
    <span ref={ref} className={className}>
      {displayText}
      {hasStarted && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-0.5 h-5 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-full mr-1"
          style={{ boxShadow: '0 0 8px rgba(234, 179, 8, 0.6)' }}
        />
      )}
    </span>
  );
};
// ==========================================
// GoldenParticles
// ==========================================
const GoldenParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<any[]>([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const PARTICLE_COUNT = 60;
  const MAX_DISTANCE = 150;

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    constructor(width: number, height: number) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.size = Math.random() * 2 + 1;
    }
    update(width: number, height: number) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 30 || this.x > width - 30) { this.vx *= -0.9; this.x = Math.max(30, Math.min(width - 30, this.x)); }
      if (this.y < 30 || this.y > height - 30) { this.vy *= -0.9; this.y = Math.max(30, Math.min(height - 30, this.y)); }
      if (Math.random() < 0.01) { this.vx += (Math.random() - 0.5) * 0.1; this.vy += (Math.random() - 0.5) * 0.1; }
      const s = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (s > 1.2) { this.vx = (this.vx / s) * 1.2; this.vy = (this.vy / s) * 1.2; }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      dimensionsRef.current = { width: w, height: h };
      canvas.width = w; canvas.height = h;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => new Particle(w, h));
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!ctx || !canvas) return;
      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach(p => p.update(width, height));

      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i], p2 = particlesRef.current[j];
          const d = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          if (d < MAX_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${(1 - d / MAX_DISTANCE) * 0.06})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }

      particlesRef.current.forEach(p => {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        g.addColorStop(0, 'rgba(212, 175, 55, 0.3)'); g.addColorStop(0.5, 'rgba(212, 175, 55, 0.08)'); g.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = '#D4AF37'; ctx.shadowColor = '#D4AF37'; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0;
      });
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />;
};

// ==========================================
// AnimatedSection
// ==========================================
const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
};

// ==========================================
// FeatureCardStack - بطاقات الميزات المتراكمة
// ==========================================
interface FeatureCard {
  id: number;
  icon: any;
  title: string;
  description: string;
}

const FeatureCardStack = () => {
  const initialCards: FeatureCard[] = [
    { id: 1, icon: Users, title: "إدارة المرضى", description: "سجل طبي إلكتروني متكامل لكل مريض" },
    { id: 2, icon: Calendar, title: "جدولة المواعيد", description: "نظام ذكي لجدولة مواعيد المرضى" },
    { id: 3, icon: CreditCard, title: "إدارة المدفوعات", description: "تتبع المدفوعات لكل موعد بشكل مخصص" },
    { id: 4, icon: Clock, title: "تنظيم الدوام", description: "إدارة أوقات العمل والإجازات بمرونة تامة" },
    { id: 5, icon: FileText, title: "صفحة تعريفية", description: "تعرض خدمات العيادة وتعزز من ظهورها الإلكتروني" },
    { id: 6, icon: IdCard, title: "كرت المريض", description: "بطاقة رقمية لكل مريض تحتوي على بياناته الكاملة" },
    { id: 7, icon: FileSpreadsheet, title: "تصدير البيانات", description: "تحويل بيانات المرضى لملف Excel بشكل مباشر وسهل" },
    { id: 8, icon: MessageCircle, title: "تقليل الاستفسارات", description: "تقليل استفسارات المرضى عبر معلومات واضحة ومتكاملة" },
    { id: 9, icon: BarChart3, title: "لوحة تحكم متكاملة", description: "لإدارة جميع بيانات المرضى وتسهيل البحث والتعديل" },
    { id: 10, icon: Smartphone, title: "CV مخصص للطبيب", description: "CV مخصص للطبيب ليعرض اختصاصه وخبراته ومهاراته" },
  ];

  const [cards, setCards] = useState<FeatureCard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

const dragX = useMotionValue(0);
const rotateY = useTransform(dragX, [-200, 0, 200], [-15, 0, 15]);
const opacity = useTransform(dragX, [-200, -100, 0, 100, 200], [0, 0.5, 1, 0.5, 0]);

  // Configuration
  const offset = 5;
  const scaleStep = 0.07;
  const dimStep = 0.15;
  const stiff = 170;
  const damp = 26;
  const swipeThreshold = 50;

  const spring = {
    type: 'spring' as const,
    stiffness: stiff,
    damping: damp
  };

  // التقليب التلقائي كل 4 ثواني
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      moveToEnd();
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, cards.length]);

  const moveToEnd = () => {
    setCards(prev => [...prev.slice(1), prev[0]]);
    setCurrentIndex((prev) => (prev + 1) % initialCards.length);
  };

  const moveToStart = () => {
    setCards(prev => [prev[prev.length - 1], ...prev.slice(0, -1)]);
    setCurrentIndex((prev) => (prev - 1 + initialCards.length) % initialCards.length);
  };

// استبدل دالة handleDragEnd بالكامل:
const handleDragEnd = (_: any, info: any) => {
  const velocity = info.velocity.x; // غيرنا من y إلى x
  const offset = info.offset.x;     // غيرنا من y إلى x

  if (Math.abs(offset) > swipeThreshold || Math.abs(velocity) > 500) {
    if (offset < 0 || velocity < 0) {
      // سحب لليسار
      setDragDirection('left');
      setIsAutoPlaying(false);
      setTimeout(() => {
        moveToEnd();
        setDragDirection(null);
        setTimeout(() => setIsAutoPlaying(true), 6000);
      }, 150);
    } else {
      // سحب لليمين
      setDragDirection('right');
      setIsAutoPlaying(false);
      setTimeout(() => {
        moveToStart();
        setDragDirection(null);
        setTimeout(() => setIsAutoPlaying(true), 6000);
      }, 150);
    }
  }
  dragX.set(0); // غيرنا من dragY إلى dragX
};

  const handleNavClick = (direction: 'prev' | 'next') => {
    setIsAutoPlaying(false);
    if (direction === 'next') {
      moveToEnd();
    } else {
      moveToStart();
    }
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    const currentFrontCard = cards[0];
    const targetCard = initialCards[index];
    
    if (currentFrontCard.id === targetCard.id) {
      setTimeout(() => setIsAutoPlaying(true), 6000);
      return;
    }

    const currentGlobalIndex = initialCards.findIndex(c => c.id === currentFrontCard.id);
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
    
    setTimeout(() => setIsAutoPlaying(true), 6000);
  };

  const currentGlobalIndex = initialCards.findIndex(c => c.id === cards[0]?.id);

  return (
    <section id="features" className="py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* العنوان والوصف */}
        <div className="text-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            className="inline-flex items-center gap-2 bg-yellow-500/10 rounded-full px-4 py-1.5 mb-4 border border-yellow-500/20 cursor-pointer"
          >
            <Sparkles className="text-yellow-400" size={14} />
            <span className="text-yellow-400 text-sm font-medium">مميزات متكاملة</span>
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">كل ما تحتاجه عيادتك في مكان واحد</h2>

        </div>

        {/* حاوية البطاقات المتراكمة */}
        <div className="relative w-full flex items-center justify-center" style={{ height: '500px' }}>
          {/* أزرار التنقل */}
          <motion.button
            onClick={() => handleNavClick('prev')}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-[#0F1F35]/80 hover:bg-[#1A2F45]/80 border border-yellow-500/20 hover:border-yellow-500/40 backdrop-blur-sm transition-all duration-300 z-20 shadow-lg"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
          </motion.button>

          <motion.button
            onClick={() => handleNavClick('next')}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-[#0F1F35]/80 hover:bg-[#1A2F45]/80 border border-yellow-500/20 hover:border-yellow-500/40 backdrop-blur-sm transition-all duration-300 z-20 shadow-lg"
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
          </motion.button>

          {/* حاوية مجموعة البطاقات */}
          <div className="relative w-72 md:w-80 aspect-[4/5] md:aspect-[3/4] overflow-visible z-10">
            <ul className="relative w-full h-full m-0 p-0">
              {cards.map(({ id, icon: Icon, title, description }, i) => {
                const isFront = i === 0;
                const brightness = Math.max(0.4, 1 - i * dimStep);
                const baseZ = cards.length - i;

                return (
                  <motion.li
                    key={id}
                    className="absolute w-full h-full list-none overflow-hidden"
                    style={{
                      borderRadius: '16px',
                      cursor: isFront ? 'grab' : 'auto',
                      touchAction: 'none',
                      background: isFront 
                        ? 'linear-gradient(145deg, rgba(15, 31, 53, 0.95), rgba(10, 22, 40, 0.98))' 
                        : 'linear-gradient(145deg, rgba(15, 31, 53, 0.8), rgba(10, 22, 40, 0.85))',
                      borderColor: isFront 
                        ? 'rgba(234, 179, 8, 0.5)' 
                        : 'rgba(234, 179, 8, 0.15)',
                      borderWidth: isFront ? '2px' : '1px',
                      boxShadow: isFront
                        ? '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(234, 179, 8, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                        : '0 15px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
                      rotateY: isFront ? rotateY : 0,
                      transformPerspective: 1000
                    }}
                    animate={{
                      top: `${i * -offset}%`,
                      scale: 1 - i * scaleStep,
                      filter: `brightness(${brightness})`,
                      zIndex: baseZ,
                      opacity: dragDirection && isFront ? 0 : 1
                    }}
                    transition={spring}
                    drag={isFront ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDrag={(_, info) => {
                      if (isFront) {
                        dragX.set(info.offset.x); // غيرنا من y إلى x
                      }
                    }}
                    onDragEnd={handleDragEnd}
                    whileDrag={
                      isFront
                        ? {
                            zIndex: cards.length + 1,
                            cursor: 'grabbing',
                            scale: 1.05,
                          }
                        : {}
                    }
                    onHoverStart={() => isFront && setShowInfo(true)}
                    onHoverEnd={() => setShowInfo(false)}
                  >
                    {/* تأثير التوهج الذهبي العلوي */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
                      style={{
                        background: isFront 
                          ? 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.2), transparent 70%)'
                          : 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.05), transparent 70%)'
                      }}
                    />
                    
                    {/* خط انعكاس زجاجي */}
                    <div 
                      className="absolute top-0 left-6 right-6 h-px pointer-events-none"
                      style={{
                        background: isFront 
                          ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)'
                          : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent)'
                      }}
                    />

                    {/* إطار ذهبي متوهج للبطاقة الأمامية */}
                    {isFront && (
                      <div 
                        className="absolute -inset-1 rounded-3xl pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.1), transparent 70%)',
                          filter: 'blur(15px)',
                        }}
                      />
                    )}

                    {/* محتوى البطاقة */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 md:p-8 text-center">
                      {/* أيقونة الميزة */}
                      <motion.div
                        animate={{ scale: isFront ? 1 : 0.85 }}
                        className={`rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-yellow-500 to-yellow-400 ${
                          isFront ? 'w-20 h-20 md:w-24 md:h-24 shadow-xl shadow-yellow-500/30' : 'w-14 h-14 md:w-16 md:h-16'
                        }`}
                      >
                        <Icon className="text-[#0A1628]" size={isFront ? 36 : 24} />
                      </motion.div>

                      {/* عنوان الميزة */}
                      <motion.h3
                        animate={{ scale: isFront ? 1 : 0.9, opacity: isFront ? 1 : 0.6 }}
                        className={`font-bold text-white mb-3 ${isFront ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}`}
                      >
                        {title}
                      </motion.h3>

                      {/* وصف الميزة */}
                      <motion.p
                        animate={{ 
                          opacity: isFront ? 1 : 0,
                          maxHeight: isFront ? '100px' : '0px',
                          marginBottom: isFront ? '0px' : '0px',
                        }}
                        className="text-gray-400 text-sm md:text-base leading-relaxed max-w-[220px] md:max-w-[260px] overflow-hidden"
                      >
                        {description}
                      </motion.p>
                    </div>

                    {/* مؤشر السحب للبطاقة الأمامية */}
                    {isFront && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2"
                      >
                        <motion.div
                          animate={{ y: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="w-1.5 h-1.5 bg-yellow-400/60 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                            className="w-1.5 h-1.5 bg-yellow-400/40 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                            className="w-1.5 h-1.5 bg-yellow-400/20 rounded-full"
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* نقاط التنقل */}
        <div className="flex justify-center gap-2 mt-8">
          {initialCards.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentGlobalIndex
                  ? 'bg-yellow-400 w-8 shadow-lg shadow-yellow-400/30' 
                  : 'bg-yellow-500/20 hover:bg-yellow-500/40 w-2'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* عداد البطاقات */}
        <div className="text-center mt-4">
          <span className="text-gray-500 text-sm">
            {currentGlobalIndex + 1} / {initialCards.length}
          </span>
        </div>
      </div>
    </section>
  );
};

// ==========================================
// Navigation
// ==========================================
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const h = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0A1628]/95 backdrop-blur-md shadow-lg shadow-yellow-500/5' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Img src="/logo.png" alt="LiveDent" width={32} height={32} className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white">LiveDent</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.a href='/Requestcopy' whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(234,179,8,0.4)" }} whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] px-5 py-2 rounded-lg font-medium text-sm hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 shadow-lg shadow-yellow-500/20">
              ابدأ الآن
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

// ==========================================
// SocialContact
// ==========================================
// ==========================================
// SocialContact - نسخة مطورة بتفاعلات متقدمة
// ==========================================
const SocialContact = () => {
  const socialLinks = [
    { 
      icon: FaTelegramPlane, 
      href: "https://t.me/OnRequest_dev", 
      color: "#0088cc", 
      label: "تلغرام",
      gradient: "from-[#0088cc] to-[#00a3e0]",
      description: "تواصل معنا عبر تلغرام للحصول على الدعم والمستجدات"
    },
    { 
      icon: FaWhatsapp, 
      href: "https://wa.me/79610195064", 
      color: "#25D366", 
      label: "واتساب",
      gradient: "from-[#25D366] to-[#40d066]",
      description: "تواصل معنا مباشرة"
    },
    { 
      icon: FaYoutube, 
      href: "https://youtube.com/@OnRequest_dev", 
      color: "#FF0000", 
      label: "يوتيوب",
      gradient: "from-[#FF0000] to-[#ff3333]",
      description: "شاهد مقاطعنا التعليمية"
    },
    { 
      icon: FaInstagram, 
      href: "https://www.instagram.com/onrequest.dev", 
      color: "#E4405F", 
      label: "انستغرام",
      gradient: "from-[#E4405F] to-[#f5607c]",
      description: "تابع آخر التحديثات"
    },
  ];

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (clickedIndex !== null) {
      const timer = setTimeout(() => setClickedIndex(null), 500);
      return () => clearTimeout(timer);
    }
  }, [clickedIndex]);

  return (
    <div className="py-12 relative overflow-hidden" dir="ltr">
      {/* خلفية ذهبية متدرجة خفيفة */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* العنوان مع تأثيرات متطورة */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          {/* أيقونة صغيرة متحركة */}
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5
            }}
            className="inline-flex items-center justify-center mb-3"
          >
          </motion.div>

          <h3 className="text-white text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            تواصل معنا
          </h3>
          
          {/* خط ذهبي متحرك */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-0.5 bg-gradient-to-r from-yellow-500 to-yellow-400 mx-auto rounded-full"
          />
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-400 text-sm mt-3"
          >
            تابعنا على منصات التواصل الاجتماعي
          </motion.p>
        </motion.div>

        {/* روابط التواصل الاجتماعي */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8 flex-wrap"
        >
          {socialLinks.map((social, index) => (
            <motion.a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onClick={() => setClickedIndex(index)}
              custom={index}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.8 },
                visible: (i) => ({
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    delay: i * 0.1,
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }
                })
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              {/* خلفية متوهجة عند التمرير */}
              <motion.div
                className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 blur-2xl"
                style={{ 
                  background: `radial-gradient(circle, ${social.color}40, transparent 70%)`,
                }}
                animate={hoveredIndex === index ? {
                  scale: [1, 1.2, 1],
                  opacity: [0, 0.5, 0],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />

              {/* الحاوية الرئيسية */}
              <motion.div
                className="relative"
                animate={clickedIndex === index ? {
                  scale: [1, 0.9, 1.1, 1],
                  rotate: [0, -10, 10, 0]
                } : {}}
                transition={{ duration: 0.4 }}
              >
                {/* حلقة خارجية متحركة */}
                <motion.div
                  className="absolute -inset-1 rounded-full border-2 border-yellow-500/20"
                  animate={hoveredIndex === index ? {
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                    rotate: [0, 360]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* الدائرة الرئيسية */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#0F1F35] to-[#0A1628] backdrop-blur-sm border-2 border-yellow-500/20 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-yellow-500/60 shadow-lg">
                  
                  {/* خلفية متدرجة عند التمرير */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{ 
                      background: `linear-gradient(135deg, ${social.color}20, ${social.color}05)`
                    }}
                    animate={hoveredIndex === index ? {
                      scale: [1, 1.5],
                      opacity: [0, 0.3, 0]
                    } : {}}
                    transition={{ duration: 1 }}
                  />

                  {/* أيقونة السوشيال ميديا */}
                  <motion.div
                    animate={hoveredIndex === index ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <social.icon
                      className="relative z-10 text-xl sm:text-2xl md:text-3xl transition-all duration-300 group-hover:scale-110"
                      style={{ 
                        color: hoveredIndex === index ? social.color : '#D4AF37',
                        filter: `drop-shadow(0 0 ${hoveredIndex === index ? '8px' : '4px'} ${social.color}80)`
                      }}
                    />
                  </motion.div>

                  {/* خطوط ذهبية زخرفية */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={hoveredIndex === index ? {
                      boxShadow: [
                        `0 0 0 0 ${social.color}20`,
                        `0 0 0 10px ${social.color}00`
                      ]
                    } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>

                {/* اسم المنصة يظهر عند التمرير */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.8 }}
                  animate={hoveredIndex === index ? { opacity: 1, y: -45, scale: 1 } : { opacity: 0, y: -10, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 pointer-events-none whitespace-nowrap"
                >
                  <div className="bg-gradient-to-r from-[#0F1F35] to-[#0A1628] backdrop-blur-md px-3 py-1.5 rounded-lg border border-yellow-500/30 shadow-lg">
                    <span className="text-yellow-400 text-xs font-medium">{social.label}</span>
                  </div>
                </motion.div>

                {/* وصف المنصة يظهر عند التمرير */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={hoveredIndex === index ? { opacity: 1, y: 30 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap"
                >
                  <span className="text-gray-500 text-[10px]">{social.description}</span>
                </motion.div>
              </motion.div>
            </motion.a>
          ))}
        </motion.div>

        {/* خط فاصل زخرفي */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 mx-auto max-w-md"
        >
          <div className="relative">
            <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
            <motion.div
              animate={{ x: [-100, 100] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              className="absolute top-1/2 left-0 w-20 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"
            />
          </div>
        </motion.div>

        {/* نص إضافي مع تأثير كتابة */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center mt-6"
        >
          <p className="text-gray-500 text-xs">
            <span className="text-yellow-400">✦</span> فريقنا ينتظرك 
            <span className="text-yellow-400 mx-1">✦</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// ==========================================
// Home
// ==========================================
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A1628] relative" dir="rtl">
      {/* زوايا ذهبية */}
      <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(255,215,0,0.12) 0%, rgba(255,200,0,0.04) 40%, transparent 70%)' }} />
      <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.25) 0%, transparent 100%)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 100%, rgba(255,215,0,0.12) 0%, rgba(255,200,0,0.04) 40%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none" style={{ background: 'linear-gradient(315deg, rgba(255,215,0,0.25) 0%, transparent 100%)', clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }} />

      <GoldenParticles />
      <div className="fixed inset-0 bg-gradient-to-b from-[#0A1628]/60 via-transparent to-[#0A1628]/60 pointer-events-none" style={{ zIndex: 1 }} />

      <div className="relative" style={{ zIndex: 2 }}>
        <Navigation />

        {/* Hero */}
        <section className="relative pt-24 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-[#0A1628]">
            <svg 
              className="absolute inset-0 w-full h-full" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="vFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
                  <stop offset="8%" stopColor="#D4AF37" stopOpacity="0.6" />
                  <stop offset="20%" stopColor="#D4AF37" stopOpacity="0.3" />
                  <stop offset="40%" stopColor="#D4AF37" stopOpacity="0.12" />
                  <stop offset="65%" stopColor="#D4AF37" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="hFade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.95" />
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity="0.7" />
                  <stop offset="15%" stopColor="#D4AF37" stopOpacity="0.4" />
                  <stop offset="30%" stopColor="#D4AF37" stopOpacity="0.18" />
                  <stop offset="55%" stopColor="#D4AF37" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                </linearGradient>
                <pattern id="goldGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <line x1="60" y1="0" x2="60" y2="900" stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.2"/>
                  <line x1="0" y1="60" x2="1440" y2="60" stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.18"/>
                </pattern>
                <mask id="fadeMask">
                  <rect x="0" y="0" width="1440" height="900" fill="url(#maskGrad)"/>
                </mask>
                <linearGradient id="maskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop offset="15%" stopColor="white" stopOpacity="0.9" />
                  <stop offset="35%" stopColor="white" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="white" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="1440" height="900" fill="url(#goldGrid)" mask="url(#fadeMask)"/>
              {[80, 180, 280, 380, 480, 580, 680, 780, 880, 980, 1080, 1180, 1280, 1380].map((x, i) => (
                <line key={`v${i}`} x1={x} y1="0" x2={x} y2="900" stroke="url(#vFade)" strokeWidth={i % 4 === 0 ? 2.5 : i % 3 === 0 ? 2 : i % 2 === 0 ? 1.5 : 1} />
              ))}
              {[40, 90, 140, 190, 240, 290, 340, 390, 440, 490, 540, 590, 640, 690, 740].map((y, i) => (
                <line key={`h${i}`} x1="0" y1={y} x2="1440" y2={y} stroke="url(#hFade)" strokeWidth={i % 5 === 0 ? 2.2 : i % 3 === 0 ? 1.8 : i % 2 === 0 ? 1.3 : 0.9} />
              ))}
            </svg>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="flex-1 text-center lg:text-right">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.2 }} 
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight"
                >
                  <span className="text-white">نظـام </span>
                  <span className="text-white">إدارة مدفوعـات </span>
                  <span className="text-white">ومواعــيد</span>
                  <br />
                  <span className="text-white">عيــــــــــــــــــــادات</span>
                  <br />
                  <span className="inline-flex items-center gap-0">
                    <span className="text-white">الأسنـــــــــــــ</span>
                    <motion.div 
                      whileHover={{ scale: 1.15, rotate: 5 }} 
                      transition={{ type: "spring", stiffness: 300 }} 
                      className="relative w-12 h-12 md:w-14 md:h-14 mx-0 inline-flex items-center justify-center"
                    >
                      <Img src="/logo.png" alt="LiveDent" className="w-full h-full object-contain" />
                    </motion.div>
                    <span className="text-white">ــــــــــــــــــــان</span>
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.4 }} 
                  className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
                >
                  قم بإدارة مواعيدك و مدفوعاتك بكل بساطة وسهولة بعيدا عن الورقيات
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.6 }} 
                  className="flex flex-wrap gap-4 justify-center lg:justify-start"
                >
                  <motion.a 
                    href="/Requestcopy" 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    className="group relative bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] px-8 py-4 rounded-xl font-bold shadow-lg hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 inline-flex items-center gap-3 overflow-hidden"
                  >
                    <span className="relative z-10">ابدأ الآن</span>
                    <motion.div 
                      animate={{ x: [0, 5, 0] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }} 
                      className="relative z-10"
                    >
                      <ArrowLeft size={20} />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.a>
                </motion.div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.7, delay: 0.2 }} 
                className="flex-1"
              >
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  transition={{ type: "spring", stiffness: 300 }} 
                  className="relative group cursor-pointer"
                >
                  <Img src="/pn1.png" alt="LiveDent Dashboard" className="w-full h-auto rounded-lg" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent opacity-40 rounded-lg" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Card Stack */}
        <FeatureCardStack />

{/* pn2 - نسخة معدلة مع بدء أنميشن الكتابة عند الدخول */}
<section className="py-16 relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0D1F3A] to-[#0A1628]">
  {/* الخلفية ذات الخطوط الذهبية المتعامدة القطرية */}
  <div className="absolute inset-0 pointer-events-none">
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="diagonalGoldLines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="80" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.15" />
          <line x1="0" y1="0" x2="80" y2="0" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.15" />
        </pattern>
        <pattern id="diagonalGoldLinesDense" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="20" stroke="#D4AF37" strokeWidth="0.3" strokeOpacity="0.08" />
          <line x1="0" y1="0" x2="20" y2="0" stroke="#D4AF37" strokeWidth="0.3" strokeOpacity="0.08" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalGoldLines)" />
      <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonalGoldLinesDense)" />
    </svg>
  </div>

  {/* تأثير التدرج الذهبي الخفيف في الزوايا */}
  <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
  <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-yellow-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

  <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
    <div className="flex flex-col lg:flex-row-reverse gap-10 items-center">
      <AnimatedSection>
        <div className="flex-1 text-center lg:text-right">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            <TypewriterTextTrigger 
              text="تحكم كامل في عيادتك"
              delay={80}
              className="inline-block"
            />
          </h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            <TypewriterTextTrigger 
              text="مع LiveDent يمكنك إدارة جميع جوانب عيادتك من مكان واحد. تابع المواعيد، راجع التقارير المالية، وتواصل مع مرضاك بكل سهولة."
              delay={40}
              startDelay={400}
            />
          </p>
          <ul className="space-y-3 mb-6">
            {[
              { text: "لوحة تحكم شاملة وسهلة الاستخدام"},
              { text: "جداول مرضى متكاملة بأدق التفاصيل" },
              { text: "تسهيل ادارة العيادة بشكل سهل وفعال" },
              { text: "دعم فني متواصل على مدار الساعة" }
            ].map((item, i) => (
              <motion.li 
                key={i} 
                initial={{ opacity: 0, x: -20 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 + 0.8 }} 
                whileHover={{ x: -5 }} 
                className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white transition-colors group"
              >
                <div className="relative">
                  <CheckCircle2 className="text-yellow-400 flex-shrink-0 relative z-10" size={18} />
                </div>
                <span className="text-sm relative z-10">{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </AnimatedSection>
      
      <AnimatedSection delay={0.2}>
        <motion.div 
          whileHover={{ scale: 1.02 }} 
          transition={{ type: "spring", stiffness: 300 }} 
          className="flex-1 cursor-pointer relative group"
        >
          <div className="relative">
            <Img src="/pn2.png" alt="LiveDent Features" className="w-full h-auto rounded-lg relative z-10" />
          </div>
        </motion.div>
      </AnimatedSection>
    </div>
  </div>
</section>
        <DoctorsShowcase />
        <SocialContact />

                {/* Footer */}
        <footer className="border-t border-yellow-500/10 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer">
                <Img src="/logo.png" alt="LiveDent" className="w-7 h-7 object-contain" />
                <span className="text-lg font-bold text-white">LiveDent</span>
              </motion.div>
              <p className="text-gray-500 text-sm text-center">© 2026 LiveDent. جميع الحقوق محفوظة</p>
              <div className="flex gap-6">
                <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">سياسة الخصوصية</motion.a>
                <motion.a href="#" whileHover={{ scale: 1.1 }} className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">الشروط والأحكام</motion.a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}