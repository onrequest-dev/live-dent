// livedent/app/page.tsx
'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CreditCard,
  Clock,
  FileText,
  IdCard,
  Bell,
  FileSpreadsheet,
  MessageSquare,
  MessageCircle,
  BarChart3,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
// ==========================================
// مكون الجزيئات الذهبية المبسط
// ==========================================
const GoldenParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const PARTICLE_COUNT = 80;
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
      this.size = Math.random() * 2.5 + 1;
    }

    update(width: number, height: number) {
      this.x += this.vx;
      this.y += this.vy;

      const margin = 30;
      if (this.x < margin || this.x > width - margin) {
        this.vx *= -0.9;
        this.x = Math.max(margin, Math.min(width - margin, this.x));
      }
      if (this.y < margin || this.y > height - margin) {
        this.vy *= -0.9;
        this.y = Math.max(margin, Math.min(height - margin, this.y));
      }

      // حركة عشوائية خفيفة
      if (Math.random() < 0.01) {
        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.1;
      }

      const maxSpeed = 1.2;
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

    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      dimensionsRef.current = { width, height };
      canvas.width = width;
      canvas.height = height;
      
      particlesRef.current = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current.push(new Particle(width, height));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    const draw = () => {
      if (!ctx || !canvas) return;
      
      const { width, height } = dimensionsRef.current;
      ctx.clearRect(0, 0, width, height);
      
      // تحديث الجزيئات
      particlesRef.current.forEach(particle => {
        particle.update(width, height);
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
            const opacity = (1 - distance / MAX_DISTANCE) * 0.08;
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      // رسم الجزيئات
      particlesRef.current.forEach(particle => {
        // توهج
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, `rgba(212, 175, 55, 0.4)`);
        gradient.addColorStop(0.5, `rgba(212, 175, 55, 0.1)`);
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // النواة
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = '#D4AF37';
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

// مكون القسم المتحرك
const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// بطاقة الميزة
const FeatureCard = ({ icon: Icon, title, description }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative bg-[#0F1F35] backdrop-blur-sm rounded-xl p-6 border cursor-pointer transition-all duration-300 group"
      style={{
        borderColor: isHovered ? 'rgba(234, 179, 8, 0.6)' : 'rgba(234, 179, 8, 0.2)',
        boxShadow: isHovered ? '0 0 30px rgba(234, 179, 8, 0.15), 0 10px 25px -5px rgba(0,0,0,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}
    >
      <motion.div
        animate={{ rotate: isHovered ? 360 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br from-yellow-500 to-yellow-400 relative z-10"
      >
        <Icon className="text-[#0A1628]" size={24} />
      </motion.div>
      <h3 className="text-lg font-bold text-white mb-2 relative z-10">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed relative z-10">{description}</p>
      
      {/* تأثير التوهج عند التحويم */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle at center, rgba(234, 179, 8, 0.1) 0%, transparent 70%)'
        }}
      />
    </motion.div>
  );
};

// شريط التنقل المبسط
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0A1628]/95 backdrop-blur-md shadow-lg shadow-yellow-500/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="LiveDent"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">LiveDent</span>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.a
              href='/Requestcopy'
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(234, 179, 8, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] px-5 py-2 rounded-lg font-medium text-sm hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 shadow-lg shadow-yellow-500/20"
            >
              ابدأ الآن
            </motion.a>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  
const features = [
  { icon: Users, title: "إدارة المرضى", description: "سجل طبي إلكتروني متكامل لكل مريض" },
  { icon: Calendar, title: "جدولة المواعيد", description: "نظام ذكي لجدولة مواعيد المرضى" },
  { icon: CreditCard, title: "إدارة المدفوعات", description: "تتبع المدفوعات لكل موعد بشكل مخصص" },
  { icon: Clock, title: "تنظيم الدوام", description: "إدارة أوقات العمل والإجازات بمرونة تامة" },
  { icon: FileText, title: "صفحة تعريفية", description: "تعرض خدمات العيادة وتعزز من ظهورها الإلكتروني" },
  { icon: IdCard, title: "كرت المريض", description: "بطاقة رقمية لكل مريض تحتوي على بياناته الكاملة" },
  { icon: FileSpreadsheet, title: "تصدير البيانات", description: "تحويل بيانات المرضى لملف Excel بشكل مباشر وسهل" },
  { icon: MessageCircle, title: "تقليل الاستفسارات", description: " تقليل استفسارات المرضى عبر معلومات واضحة ومتكاملة" },
  { icon: BarChart3, title: "لوحة تحكم متكاملة", description: "لإدارة جميع بيانات المرضى وتسهيل البحث والتعديل" },
  { icon: Smartphone, title: "CV مخصص للطبيب", description: "CV مخصص للطبيب ليعرض اختصاصه وخبراته ومهاراته" },
];

  const stats = [
    { value: "+500", label: "عيادة تستخدم النظام" },
    { value: "+50,000", label: "مريض مسجل" },
    { value: "98%", label: "نسبة رضا العملاء" },
    { value: "24/7", label: "دعم فني متواصل" },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] relative" dir="rtl">
      {/* Golden Gradient Corners */}
      <div 
        className="absolute top-0 left-0 w-80 h-80 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(255, 215, 0, 0.12) 0%, rgba(255, 200, 0, 0.04) 40%, transparent 70%)'
        }}
      />
      <div 
        className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.25) 0%, transparent 100%)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)'
        }}
      />
      
      <div 
        className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 100% 100%, rgba(255, 215, 0, 0.12) 0%, rgba(255, 200, 0, 0.04) 40%, transparent 70%)'
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none"
        style={{
          background: 'linear-gradient(315deg, rgba(255, 215, 0, 0.25) 0%, transparent 100%)',
          clipPath: 'polygon(100% 100%, 0 100%, 100% 0)'
        }}
      />

      {/* الجزيئات الذهبية */}
      <GoldenParticles />

      {/* طبقة تحسين الوضوح */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0A1628]/60 via-transparent to-[#0A1628]/60 pointer-events-none" style={{ zIndex: 1 }} />

      {/* المحتوى */}
      <div className="relative" style={{ zIndex: 2 }}>
        <Navigation />

        {/* Hero Section */}
        <section className="relative pt-24 pb-12 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="flex-1 text-center lg:text-right"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative w-24 h-24 mx-auto lg:mx-0 mb-6 cursor-pointer"
                >
                  <Image
                    src="/logo.png"
                    alt="LiveDent"
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                >
                  <span className="text-white">نظام </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">LiveDent</span>
                  <br />
                  <span className="text-white">لإدارة عيادات الأسنان</span>
                </motion.h1>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-300 text-base md:text-lg mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
                >
                  نظام رقمي متكامل يدير جميع جوانب عيادة الأسنان بكل سهولة واحترافية
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-4 justify-center lg:justify-start"
                >
                  <motion.a
                    href="/Requestcopy"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(234, 179, 8, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] px-8 py-4 rounded-xl font-bold shadow-lg hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 inline-flex items-center gap-3 overflow-hidden"
                  >
                    <span className="relative z-10">ابدأ تجربتك</span>
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

                {/* إحصائيات سريعة */}
                {/* <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 grid grid-cols-2 gap-3"
                >
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="bg-[#0F1F35]/50 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/10"
                    >
                      <div className="text-yellow-400 font-bold text-lg">{stat.value}</div>
                      <div className="text-gray-400 text-xs">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div> */}
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
                  <Image
                    src="/pn1.png"
                    alt="LiveDent Dashboard"
                    width={1000}
                    height={400}
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent opacity-40 rounded-lg" />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                    animate={{ opacity: [0, 0.1, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="text-center mb-10">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 bg-yellow-500/10 rounded-full px-4 py-1.5 mb-4 border border-yellow-500/20 cursor-pointer"
                >
                  <Sparkles className="text-yellow-400" size={14} />
                  <span className="text-yellow-400 text-sm font-medium">مميزات متكاملة</span>
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  كل ما تحتاجه عيادتك في مكان واحد
                </h2>
                <p className="text-gray-400 max-w-xl mx-auto text-sm">
                  نقدم لك منظومة متكاملة تلبي جميع احتياجات عيادة الأسنان العصرية
                </p>
              </div>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {features.slice(0, 5).map((feature, index) => (
                <AnimatedSection key={index} delay={index * 0.05}>
                  <div onClick={() => setActiveFeature(activeFeature === index ? null : index)}>
                    <FeatureCard
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                    />
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
              {features.slice(5, 10).map((feature, index) => (
                <AnimatedSection key={index + 5} delay={(index + 5) * 0.05}>
                  <div onClick={() => setActiveFeature(activeFeature === index + 5 ? null : index + 5)}>
                    <FeatureCard
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                    />
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Section with pn2.png */}
        <section className="py-16 bg-black/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row-reverse gap-10 items-center">
              <AnimatedSection>
                <div className="flex-1 text-center lg:text-right">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    تحكم كامل في عيادتك
                  </h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    مع LiveDent يمكنك إدارة جميع جوانب عيادتك من مكان واحد. تابع المواعيد، 
                    راجع التقارير المالية، وتواصل مع مرضاك بكل سهولة.
                  </p>
                  
                  <ul className="space-y-3 mb-6">
                    {[
                      "لوحة تحكم شاملة وسهلة الاستخدام",
                      "جداول مرضى متكاملة بأدق التفاصيل",
                      "تسهيل ادارة العيادة بشكل سهل وفعال",
                      "دعم فني متواصل على مدار الساعة",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: -5 }}
                        className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white transition-colors"
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <CheckCircle2 className="text-yellow-400 flex-shrink-0" size={18} />
                        </motion.div>
                        <span className="text-sm">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <motion.div 
                  whileHover={{ scale: 1.02, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex-1 cursor-pointer"
                >
                  <div className="relative group">
                    <Image
                      src="/pn2.png"
                      alt="LiveDent Features"
                      width={400}
                      height={550}
                      className="w-full h-auto rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent opacity-40 rounded-lg" />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                      animate={{ opacity: [0, 0.1, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    />
                  </div>
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <AnimatedSection>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-[#0F1F35] to-[#1A2A44] rounded-2xl p-8 border border-yellow-500/20 relative overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  هل أنت مستعد لنقل عيادتك للمستوى التالي؟
                </h2>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  إنضم الآن واجعل عيادتك مواكبة لتطور العالم
                </p>
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(234, 179, 8, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/Requestcopy"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-yellow-500/20 transition-all duration-300"
                    >
                      ابدأ الآن 
                      <ArrowLeft size={20} />
                    </Link>
                  </motion.div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section> */}

        {/* Footer */}
        <footer className="border-t border-yellow-500/10 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="relative w-7 h-7">
                  <Image src="/logo.png" alt="LiveDent" fill className="object-contain" />
                </div>
                <span className="text-lg font-bold text-white">LiveDent</span>
              </motion.div>
              
              <p className="text-gray-500 text-sm text-center">
                © 2026 LiveDent. جميع الحقوق محفوظة
              </p>
              
              <div className="flex gap-6">
                <motion.a 
                  href="#" 
                  whileHover={{ scale: 1.1, color: '#FBBF24' }}
                  className="text-gray-400 hover:text-yellow-400 text-sm transition-colors"
                >
                  سياسة الخصوصية
                </motion.a>
                <motion.a 
                  href="#" 
                  whileHover={{ scale: 1.1, color: '#FBBF24' }}
                  className="text-gray-400 hover:text-yellow-400 text-sm transition-colors"
                >
                  الشروط والأحكام
                </motion.a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}