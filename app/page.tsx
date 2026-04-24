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
  MessageSquare,
  BarChart3,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

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
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-[#0F1F35] backdrop-blur-sm rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br from-yellow-500 to-yellow-400">
        <Icon className="text-[#0A1628]" size={24} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
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

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0A1628]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
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

          <motion.a
            href='/Requestcopy'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-yellow-500 text-[#0A1628] px-5 py-2 rounded-lg font-medium text-sm hover:bg-yellow-400 transition-colors"
          >
            ابدأ الآن
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
};

export default function Home() {
  const features = [
    { icon: Users, title: "إدارة المرضى", description: "سجل طبي متكامل لكل مريض مع تاريخ العلاجات والصور" },
    { icon: Calendar, title: "جدولة المواعيد", description: "نظام ذكي لحجز المواعيد مع إشعارات تلقائية" },
    { icon: CreditCard, title: "إدارة المدفوعات", description: "تتبع المدفوعات والفواتير مع تقارير مالية دقيقة" },
    { icon: Clock, title: "تنظيم الدوام", description: "إدارة أوقات العمل والإجازات بمرونة تامة" },
    { icon: FileText, title: "صفحة تعريفية", description: "صفحة احترافية تعرض خدمات العيادة وأطباءها" },
    { icon: IdCard, title: "كرت المريض", description: "بطاقة رقمية لكل مريض تحتوي على بياناته الكاملة" },
    { icon: Bell, title: "نظام تذكير", description: "تذكيرات أوتوماتيكية لتقليل نسبة الغياب" },
    { icon: MessageSquare, title: "دردشة مباشرة", description: "تواصل فوري مع المرضى للرد على استفساراتهم" },
    { icon: BarChart3, title: "تقارير وتحليلات", description: "لوحة تحكم مع رسوم بيانية وإحصاءات" },
    { icon: Smartphone, title: "تطبيق جوال", description: "تطبيق للمرضى لحجز المواعيد ومتابعة حالتهم" },
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
                <div className="relative w-24 h-24 mx-auto lg:mx-0 mb-6">
                  <Image
                    src="/logo.png"
                    alt="LiveDent"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  <span className="text-white">نظام </span>
                  <span className="text-yellow-400">LiveDent</span>
                  <br />
                  <span className="text-white">لإدارة عيادات الأسنان</span>
                </h1>

                <p className="text-gray-300 text-base md:text-lg mb-6 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  نظام رقمي متكامل يدير جميع جوانب عيادة الأسنان بكل سهولة واحترافية
                </p>

                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-yellow-500 text-[#0A1628] px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-yellow-400 transition-colors"
                  >
                    ابدأ تجربتك المجانية
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-[#1A2A44] text-white px-6 py-3 rounded-lg font-medium border border-yellow-500/30 hover:border-yellow-500/60 transition-colors"
                  >
                    تعرف على المميزات
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex-1"
              >
                <div>
                  <Image
                    src="/pn1.png"
                    alt="LiveDent Dashboard"
                    width={1000}
                    height={400}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent opacity-40" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-yellow-500/10 rounded-full px-4 py-1.5 mb-4 border border-yellow-500/20">
                  <Sparkles className="text-yellow-400" size={14} />
                  <span className="text-yellow-400 text-sm font-medium">مميزات متكاملة</span>
                </div>
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
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </AnimatedSection>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
              {features.slice(5, 10).map((feature, index) => (
                <AnimatedSection key={index + 5} delay={(index + 5) * 0.05}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
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
                      "تقارير يومية وأسبوعية وشهرية",
                      "إشعارات فورية لجميع النشاطات",
                      "دعم فني متواصل على مدار الساعة",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 text-gray-300"
                      >
                        <CheckCircle2 className="text-yellow-400 flex-shrink-0" size={18} />
                        <span className="text-sm">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="flex-1">
                  <div>
                    <Image
                      src="/pn2.png"
                      alt="LiveDent Features"
                      width={400}
                      height={550}
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-transparent to-transparent opacity-40" />
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-yellow-500/10 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7">
                  <Image src="/logo.png" alt="LiveDent" fill className="object-contain" />
                </div>
                <span className="text-lg font-bold text-white">LiveDent</span>
              </div>
              
              <p className="text-gray-500 text-sm text-center">
                © 2026 LiveDent. جميع الحقوق محفوظة
              </p>
              
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">سياسة الخصوصية</a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 text-sm transition-colors">الشروط والأحكام</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}