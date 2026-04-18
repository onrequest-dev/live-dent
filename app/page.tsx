// livedent\app\page.tsx

'use client';

import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CreditCard,
  Clock,
  FileText,
  IdCard,
  Bell,
  Activity,
  Shield,
  Smartphone,
  BarChart3,
  MessageSquare,
  Star,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Menu,
  X 
} from 'lucide-react';

// ==========================================
// مكون الجزيئات المتحركة التفاعلية
// ==========================================
const InteractiveParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, isMoving: false, lastMove: 0 });
  const touchRef = useRef({ x: -1000, y: -1000, active: false });
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const isMobileRef = useRef(false);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const PARTICLE_COUNT = 150;
  const MAX_DISTANCE = 200;
  const MOUSE_RADIUS = 180;
  const TOUCH_RADIUS = 220;

  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    baseSize: number;
    
    constructor(width: number, height: number) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.baseSize = Math.random() * 3 + 1.5;
      this.size = this.baseSize;
    }

    update(width: number, height: number, mouseX: number, mouseY: number, isActive: boolean) {
      this.x += this.vx;
      this.y += this.vy;

      const margin = 20;
      if (this.x < margin || this.x > width - margin) {
        this.vx *= -0.9;
        this.x = Math.max(margin, Math.min(width - margin, this.x));
      }
      if (this.y < margin || this.y > height - margin) {
        this.vy *= -0.9;
        this.y = Math.max(margin, Math.min(height - margin, this.y));
      }

      this.vx *= 0.992;
      this.vy *= 0.992;

      if (isActive && mouseX > 0 && mouseY > 0) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = isMobileRef.current ? TOUCH_RADIUS : MOUSE_RADIUS;

        if (distance < radius) {
          const force = Math.pow(1 - distance / radius, 1.5) * 1.5;
          const angle = Math.atan2(dy, dx);
          
          if (isMobileRef.current) {
            // على الهاتف: الجزيئات تنجذب نحو نقطة اللمس
            this.vx += dx * force * 0.015;
            this.vy += dy * force * 0.015;
            this.size = this.baseSize * (1 + force * 2);
          } else {
            // على الكمبيوتر: الجزيئات تتنافر من المؤشر
            this.vx -= Math.cos(angle) * force;
            this.vy -= Math.sin(angle) * force;
            this.size = this.baseSize * (1 + force * 1.5);
          }
        } else {
          this.size += (this.baseSize - this.size) * 0.08;
        }
      } else {
        this.size += (this.baseSize - this.size) * 0.08;
      }

      // إضافة حركة عشوائية خفيفة
      if (Math.random() < 0.02) {
        this.vx += (Math.random() - 0.5) * 0.2;
        this.vy += (Math.random() - 0.5) * 0.2;
      }

      const maxSpeed = 2;
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > maxSpeed) {
        this.vx = (this.vx / speed) * maxSpeed;
        this.vy = (this.vy / speed) * maxSpeed;
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // اكتشاف نوع الجهاز
    isMobileRef.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
      || ('ontouchstart' in window) 
      || (navigator.maxTouchPoints > 0);

    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      dimensionsRef.current = { width, height };
      canvas.width = width;
      canvas.height = height;
      
      // إعادة تهيئة الجزيئات
      particlesRef.current = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push(new Particle(width, height));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // تتبع الماوس
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
        isMoving: true,
        lastMove: Date.now()
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.isMoving = false;
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const handleMouseEnter = () => {
      mouseRef.current.isMoving = true;
    };

    // تتبع اللمس
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        touchRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          active: true
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        touchRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          active: true
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchRef.current.active = false;
      touchRef.current.x = -1000;
      touchRef.current.y = -1000;
    };

    // إضافة المستمعين
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mouseenter', handleMouseEnter);
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('touchcancel', handleTouchEnd);

    // التحقق من انتهاء حركة الماوس
    const checkMouseActive = () => {
      if (Date.now() - mouseRef.current.lastMove > 100) {
        mouseRef.current.isMoving = false;
      }
    };

    const interval = setInterval(checkMouseActive, 100);

    // رسم الجزيئات
    const draw = () => {
      if (!ctx || !canvas) return;
      
      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);
      
      const isActive = isMobileRef.current ? touchRef.current.active : mouseRef.current.isMoving;
      const activeX = isMobileRef.current ? touchRef.current.x : mouseRef.current.x;
      const activeY = isMobileRef.current ? touchRef.current.y : mouseRef.current.y;
      
      // تحديث الجزيئات
      particlesRef.current.forEach(particle => {
        particle.update(width, height, activeX, activeY, isActive);
      });
      
      // رسم الوصلات بين الجزيئات
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < MAX_DISTANCE) {
            const opacity = (1 - distance / MAX_DISTANCE) * 0.12;
            
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            gradient.addColorStop(0, `rgba(212, 175, 55, ${opacity * 0.8})`);
            gradient.addColorStop(1, `rgba(255, 215, 0, ${opacity})`);
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      
      // رسم وصلات إضافية للجزيئات القريبة من المؤشر
      if (isActive && activeX > 0 && activeY > 0) {
        particlesRef.current.forEach(particle => {
          const dx = activeX - particle.x;
          const dy = activeY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const radius = isMobileRef.current ? TOUCH_RADIUS : MOUSE_RADIUS;
          
          if (distance < radius) {
            const opacity = (1 - distance / radius) * 0.2;
            
            ctx.beginPath();
            ctx.moveTo(activeX, activeY);
            ctx.lineTo(particle.x, particle.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      }
      
      // رسم الجزيئات
      particlesRef.current.forEach(particle => {
        // توهج خارجي
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        gradient.addColorStop(0, `rgba(212, 175, 55, ${0.7})`);
        gradient.addColorStop(0.4, `rgba(212, 175, 55, ${0.2})`);
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // نواة الجزيء
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = '#D4AF37';
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 15;
        ctx.fill();
        
        // نقطة بيضاء في المركز للتألق
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF8DC';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        ctx.shadowBlur = 0;
      });
      
      // رسم دائرة المؤشر
      if (isActive && activeX > 0 && activeY > 0) {
        const radius = isMobileRef.current ? TOUCH_RADIUS : MOUSE_RADIUS;
        
        // دائرة شفافة
        ctx.beginPath();
        ctx.arc(activeX, activeY, radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(activeX, activeY, 0, activeX, activeY, radius);
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.03)');
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // حلقة المؤشر
        if (isMobileRef.current) {
          ctx.beginPath();
          ctx.arc(activeX, activeY, 25, 0, Math.PI * 2);
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 10]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
      clearInterval(interval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto"
      style={{ 
        zIndex: 0,
        cursor: isMobileRef.current ? 'default' : 'none'
      }}
    />
  );
};

// مكون القسم المتحرك
const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
};

// بطاقة الخدمة
const ServiceCard = ({ icon: Icon, title, description, delay }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-[#D4AF37]/40 transition-all duration-300"
    >
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/80">
          <Icon className="text-white" size={28} />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </div>
      
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-transparent"
        initial={{ width: "0%" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

// شريط التنقل
const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = ['المميزات', 'الخدمات', 'المزايا', 'تواصل'];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0a0e1a]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image
                src="/logo.png"
                alt="LiveDent"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-white">
              LiveDent
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item, index) => (
              <motion.a
                key={index}
                href={`#${item}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-300 font-medium"
                whileHover={{ x: 3 }}
              >
                {item}
              </motion.a>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-[#D4AF37] text-white px-6 py-2 rounded-full font-medium text-sm shadow-lg hover:shadow-xl transition-all"
            >
              طلب تجربة
            </motion.button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0e1a]/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-3">
              {menuItems.map((item, index) => (
                <motion.a
                  key={index}
                  href={`#${item}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 text-gray-300 hover:text-[#D4AF37] transition-colors"
                >
                  {item}
                </motion.a>
              ))}
              <button className="w-full bg-[#D4AF37] text-white px-6 py-3 rounded-full font-medium">
                طلب تجربة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default function Home() {
  const features = [
    { icon: Users, title: "إدارة المرضى", description: "سجل طبي متكامل لكل مريض مع تاريخ العلاجات والصور والأشعة" },
    { icon: Calendar, title: "جدولة المواعيد", description: "نظام ذكي لحجز المواعيد مع إشعارات تلقائية وتجنب التعارضات" },
    { icon: CreditCard, title: "إدارة المدفوعات", description: "تتبع المدفوعات والفواتير مع تقارير مالية دقيقة وتحليلات" },
    { icon: Clock, title: "تنظيم أوقات الدوام", description: "إدارة أوقات العمل والإجازات بمرونة مع جدولة نوبات الموظفين" },
    { icon: FileText, title: "صفحة تعريفية للعيادة", description: "صفحة احترافية تعرض خدمات العيادة وأطباءها وإنجازاتها" },
    { icon: IdCard, title: "كرت إلكتروني للمريض", description: "بطاقة رقمية لكل مريض تحتوي على بياناته وتاريخ مواعيده" },
    { icon: Bell, title: "نظام تذكير فعال", description: "تذكيرات أوتوماتيكية عبر SMS وواتساب لتقليل نسبة الغياب" },
    { icon: MessageSquare, title: "دردشة مباشرة", description: "تواصل فوري مع المرضى للرد على استفساراتهم وحجز المواعيد" },
    { icon: BarChart3, title: "تقارير وتحليلات", description: "لوحة تحكم متكاملة مع رسوم بيانية وإحصاءات لحالة العيادة" },
    { icon: Smartphone, title: "تطبيق جوال", description: "تطبيق مخصص للمرضى لحجز المواعيد ومتابعة حالتهم الصحية" },
  ];

  const advantages = [
    "واجهة مستخدم عربية بالكامل وسهلة الاستخدام",
    "تحديثات مستمرة ومجانية مدى الحياة",
    "دعم فني على مدار الساعة",
    "نسخ احتياطي تلقائي للبيانات",
    "تكامل مع أنظمة الفواتير المحلية",
    "تشفير عالي المستوى لحماية بيانات المرضى",
  ];

  return (
    <div className="min-h-screen bg-[#050810] relative" dir="rtl">
      {/* الجزيئات التفاعلية - بدون أي هيدر */}
      <InteractiveParticles />

      {/* طبقة تدرج لتحسين وضوح النص */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#050810]/70 via-transparent to-[#050810]/70 pointer-events-none" style={{ zIndex: 1 }} />

      {/* المحتوى الرئيسي */}
      <div className="relative" style={{ zIndex: 2 }}>
        <Navigation />

        {/* Hero Section */}
        <section className="relative pt-20 md:pt-32 pb-16 md:pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 text-center lg:text-right"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-[#D4AF37]/20 rounded-full px-4 py-2 mb-6"
                >
                  <Sparkles className="text-[#D4AF37]" size={16} />
                  <span className="text-[#D4AF37] font-medium text-sm">نظام متكامل لإدارة عيادات الأسنان</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                >
                  <span className="text-white">LiveDent</span>
                  <br />
                  <span className="text-[#D4AF37]">
                    تحكم كامل في عيادتك
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                >
                  نظام رقمي متكامل يدير جميع جوانب عيادة الأسنان بدءاً من المواعيد والمرضى
                  وصولاً إلى المدفوعات والتقارير. واجهة عصرية وسهلة الاستخدام مصممة خصيصاً للأطباء.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-4 justify-center lg:justify-start"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#D4AF37] text-white px-6 md:px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    ابدأ الآن مجاناً
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-[#D4AF37] text-[#D4AF37] px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-[#D4AF37]/10 transition-all"
                  >
                    طلب عرض توضيحي
                  </motion.button>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="flex-1 relative"
              >
                <div className="relative w-full max-w-md mx-auto">
                  <Image
                    src="/logo.png"
                    alt="LiveDent"
                    width={500}
                    height={500}
                    className="w-full h-auto"
                    priority
                  />
                  
                  <motion.div
                    className="absolute inset-0 rounded-full blur-3xl"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ backgroundColor: '#D4AF37' }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="المميزات" className="py-16 md:py-20 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-[#D4AF37]/20 rounded-full px-4 py-2 mb-4"
                >
                  <Star className="text-[#D4AF37]" size={16} />
                  <span className="text-[#D4AF37] font-medium">مميزات متكاملة</span>
                </motion.div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                  كل ما تحتاجه عيادتك في مكان واحد
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
                  نقدم لك منظومة متكاملة تلبي جميع احتياجات عيادة الأسنان العصرية
                </p>
              </div>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <ServiceCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.05}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section id="المزايا" className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <AnimatedSection>
                <div className="relative">
                  <div className="relative bg-gradient-to-br from-[#D4AF37]/10 to-transparent backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/10">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-6">لماذا تختار LiveDent؟</h3>
                    <ul className="space-y-4">
                      {advantages.map((advantage, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 text-gray-300"
                        >
                          <CheckCircle2 className="text-[#D4AF37]" size={20} />
                          <span className="text-sm md:text-base">{advantage}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="space-y-6 text-center lg:text-right">
                  <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 rounded-full px-4 py-2">
                    <Activity className="text-[#D4AF37]" size={16} />
                    <span className="text-[#D4AF37] font-medium">مزايا تنافسية</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    نتميز حيث يفتقر الآخرون
                  </h2>
                  <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                    تم تصميم LiveDent بعناية فائقة ليلبي احتياجات أطباء الأسنان بشكل خاص،
                    مع مراعاة خصوصية المجال الطبي وتوفير أعلى معايير الأمان والجودة.
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="border-r-2 border-[#D4AF37] pr-4">
                      <div className="text-2xl md:text-3xl font-bold text-[#D4AF37]">100%</div>
                      <div className="text-xs md:text-sm text-gray-400">تطبيق سحابي</div>
                    </div>
                    <div className="border-r-2 border-[#D4AF37] pr-4">
                      <div className="text-2xl md:text-3xl font-bold text-[#D4AF37]">24/7</div>
                      <div className="text-xs md:text-sm text-gray-400">دعم فني</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { value: "500+", label: "عيادة تثق بنا" },
                { value: "50K+", label: "موعد شهرياً" },
                { value: "98%", label: "رضا العملاء" },
                { value: "24/7", label: "دعم فني" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#D4AF37] mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-xs md:text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative bg-gradient-to-r from-[#D4AF37]/20 to-transparent backdrop-blur-sm rounded-3xl p-8 md:p-12 text-center overflow-hidden border border-white/10"
            >
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center"
                >
                  <Sparkles className="text-[#D4AF37]" size={32} />
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                  ابدأ رحلة التحول الرقمي لعيادتك اليوم
                </h2>
                <p className="text-gray-300 text-base md:text-lg mb-8 max-w-2xl mx-auto">
                  انضم إلى أكثر من 500 عيادة تثق في LiveDent لإدارة عملياتها بكفاءة واحترافية
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#D4AF37] text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
                >
                  احصل على عرضك الآن
                  <ChevronRight size={20} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/50 border-t border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                  <div className="relative w-8 h-8">
                    <Image src="/logo.png" alt="LiveDent" fill className="object-contain" />
                  </div>
                  <span className="text-xl font-bold text-white">LiveDent</span>
                </div>
                <p className="text-gray-400 text-sm">
                  نظام متكامل لإدارة عيادات الأسنان
                </p>
              </div>
              <div className="text-center sm:text-right">
                <h4 className="font-bold text-white mb-4">روابط سريعة</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-[#D4AF37] transition">الرئيسية</a></li>
                  <li><a href="#" className="hover:text-[#D4AF37] transition">المميزات</a></li>
                  <li><a href="#" className="hover:text-[#D4AF37] transition">الأسعار</a></li>
                  <li><a href="#" className="hover:text-[#D4AF37] transition">اتصل بنا</a></li>
                </ul>
              </div>
              <div className="text-center sm:text-right">
                <h4 className="font-bold text-white mb-4">التواصل</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-center justify-center sm:justify-start gap-2">
                    <Phone size={16} className="text-[#D4AF37]" />
                    <span dir="ltr">+966 12 345 6789</span>
                  </li>
                  <li className="flex items-center justify-center sm:justify-start gap-2">
                    <Mail size={16} className="text-[#D4AF37]" />
                    <span>info@livedent.com</span>
                  </li>
                  <li className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin size={16} className="text-[#D4AF37]" />
                    <span>الرياض، المملكة العربية السعودية</span>
                  </li>
                </ul>
              </div>
              <div className="text-center sm:text-right">
                <h4 className="font-bold text-white mb-4">تابعنا</h4>
                <div className="flex gap-3 justify-center sm:justify-start">
                  {['تويتر', 'لينكد إن', 'فيسبوك'].map((social, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#D4AF37] transition-colors">
                      <span className="text-white text-sm">{social[0]}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} LiveDent. جميع الحقوق محفوظة
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}