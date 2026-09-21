// app/pricing/page.tsx
'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// ==========================================
// الألوان — نفس نظام صفحة الهبوط
// ==========================================
const COLORS = {
  primary: '#0043fa',
  primaryLight: '#0043fa15',
  primaryMedium: '#0043fa30',
  background: '#d2d9ff',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#8892a6',
  border: '#e8ecf1',
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
};

// ==========================================
// الخطوات
// ==========================================
const STEPS = [
  {
    image: '/imglan/p1.webp',
    step: 'البداية',
    title: 'ابدأ في ثوانٍ',
    description: 'أنشئ حسابك وانتقل مباشرة إلى لوحة تحكم عيادتك.',
    punch: 'أبسط نظام تسجيل إطلاقاً',
  },
  {
    image: '/imglan/p2.webp',
    step: 'الهوية',
    title: 'عيادتك بهويتك',
    description: 'خصّص دوامك، ألوانك، وشعارك — كل شيء يعكس تميّزك.',
    punch: 'هويتك البصرية تعكس تميّزك',
  },
  {
    image: '/imglan/p3.webp',
    step: 'العلاجات',
    title: 'جاهزة من اليوم الأول',
    description: 'أكثر من 12 علاجاً بأسعار ومواعيد، جاهزة للتخصيص.',
    punch: 'راحتك في العمل أولويتنا',
  },
  {
    image: '/imglan/p4.webp',
    step: 'المرضى',
    title: 'ببساطة ووضوح',
    description: 'أدرج مرضاك ببيانات منظّمة ومنسّقة في لحظات.',
    punch: 'كل مريض في مكانه',
  },
  {
    image: '/imglan/p5.webp',
    step: 'الشارت',
    title: 'شارت سنّي تفاعلي',
    description: 'حدّد العلاج لكل سن، وسيُعلم المريض تلقائياً.',
    punch: 'التزام مرضاك جزء من نجاحنا',
  },
  {
    image: '/imglan/p6.webp',
    step: 'المواعيد',
    title: 'يومك بوضوح تام',
    description: 'جدولك اليومي مفصّل، وتواصل مع مرضاك بنقرة واحدة.',
    punch: 'سهولة الوصول جزء من خطتنا',
  },
  {
    image: '/imglan/p7.webp',
    step: 'بياناتك',
    title: 'ملكك وحدك',
    description: 'نسخ احتياطي وتحميل Excel — خذ بياناتك متى شئت.',
    punch: 'لك الأريحية الكاملة',
  },
  {
    image: '/imglan/p8.webp',
    step: 'البدء',
    title: 'سعر بسيط وعادل',
    description: 'أنشئ حسابك وجرب النظام',
    punch: 'هدفنا الأول هو راحتك',
    isPricing: true,
  },
];

// ==========================================
// الصفحة
// ==========================================
export default function PricingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = STEPS.length;
  const step = STEPS[currentStep];
  const isLast = currentStep === totalSteps - 1;

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= totalSteps) return;
      setCurrentStep(i);
    },
    [totalSteps]
  );

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) goTo(currentStep + 1);
  }, [currentStep, goTo, totalSteps]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) goTo(currentStep - 1);
  }, [currentStep, goTo]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goPrev();
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'Escape') window.location.href = '/';
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "'Plus Jakarta Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif",
      }}
      dir="rtl"
    >
      {/* ===== خلفيات ناعمة بنفس أسلوب الهبوط ===== */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 35%, ${COLORS.primary}10, transparent 70%),
            radial-gradient(ellipse 40% 30% at 50% 100%, ${COLORS.primary}08, transparent 70%),
            radial-gradient(ellipse 50% 40% at 85% 15%, ${COLORS.primary}06, transparent 70%)
          `,
        }}
      />

      {/* شبكة خفيفة جداً */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(${COLORS.primary}40 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.primary}40 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      {/* ===== الشريط العلوي ===== */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4">
        {/* الشعار */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7">
            <Image
              src="/icon-192x192.png"
              alt="LiveDent"
              fill
              className="object-contain"
            />
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: COLORS.text }}
          >
            LiveDent
          </span>
          <span
            className="text-xs font-medium hidden sm:inline"
            style={{ color: COLORS.textMuted }}
          >
            · عرض تفاعلي
          </span>
        </div>

        {/* إغلاق */}
        <Link
          href="/"
          aria-label="إغلاق"
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            backgroundColor: COLORS.glassBg,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${COLORS.glassBorder}`,
            boxShadow: '0 4px 16px rgba(0, 67, 250, 0.06)',
          }}
        >
          <X size={14} style={{ color: COLORS.primary }} />
        </Link>
      </div>

      {/* ===== شريط التقدم العلوي ===== */}
      <div
        className="fixed top-0 left-0 right-0 h-[2px] z-50"
        style={{ backgroundColor: 'transparent' }}
      >
        <motion.div
          className="h-full"
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            background: `linear-gradient(90deg, transparent, ${COLORS.primary}80, ${COLORS.primary})`,
            boxShadow: `0 0 10px ${COLORS.primary}60`,
          }}
        />
      </div>

      {/* ===== المحتوى الرئيسي ===== */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        
        {/* ===== الهاتف ===== */}
        <div className="relative mb-8 sm:mb-10">
          {/* هالة خلفية ناعمة */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.75, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 -z-10"
            style={{
              background: `radial-gradient(circle, ${COLORS.primary}35, transparent 60%)`,
              filter: 'blur(50px)',
              transform: 'scale(1.6)',
            }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
              className="relative"
              style={{
                width: 'clamp(160px, 40vw, 190px)',
                aspectRatio: '9 / 19.5',
                padding: '4px',
                borderRadius: '2rem',
                background:
                  'linear-gradient(160deg, #3a3a3a 0%, #1a1a1a 40%, #252525 70%, #151515 100%)',
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.06),
                  0 30px 60px -20px rgba(15, 23, 42, 0.35),
                  0 0 60px -15px ${COLORS.primary}40,
                  inset 0 1px 0 rgba(255,255,255,0.1)
                `,
              }}
            >

              {/* الشاشة */}
              <div
                className="relative w-full h-full overflow-hidden"
                style={{
                  borderRadius: '1.75rem',
                  backgroundColor: '#000',
                }}
              >
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 40vw, 190px"
                  priority
                />

                {/* انعكاس زجاجي */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(
                        135deg,
                        rgba(255,255,255,0.08) 0%,
                        transparent 40%,
                        transparent 60%,
                        rgba(255,255,255,0.03) 100%
                      )
                    `,
                  }}
                />
              </div>

              {/* أزرار جانبية */}
              <div
                className="absolute top-[22%] -right-[2px] w-[2px] h-[10%] rounded-l"
                style={{ backgroundColor: '#2a2a2a' }}
              />
              <div
                className="absolute top-[18%] -left-[2px] w-[2px] h-[6%] rounded-r"
                style={{ backgroundColor: '#2a2a2a' }}
              />
              <div
                className="absolute top-[26%] -left-[2px] w-[2px] h-[10%] rounded-r"
                style={{ backgroundColor: '#2a2a2a' }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ===== النص ===== */}
        <div className="text-center max-w-md mx-auto" style={{ minHeight: '200px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {/* التصنيف */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3"
                style={{ color: COLORS.primary }}
              >
                {step.step}
              </motion.p>

              {/* العنوان */}
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 tracking-tight"
                style={{
                  color: COLORS.text,
                  lineHeight: 1.2,
                }}
              >
                {step.title}
              </h1>

              {/* الوصف */}
              <p
                className="text-sm sm:text-[15px] leading-relaxed mb-6 max-w-sm mx-auto"
                style={{ color: COLORS.textSecondary }}
              >
                {step.description}
              </p>

              {/* العبارة القوية */}
              <div className="inline-flex items-center gap-2">
                <div
                  className="w-6 h-px"
                  style={{ backgroundColor: COLORS.primary }}
                />
                <p
                  className="text-xs sm:text-[13px] font-semibold"
                  style={{ color: COLORS.text }}
                >
                  {step.punch}
                </p>
                <div
                  className="w-6 h-px"
                  style={{ backgroundColor: COLORS.primary }}
                />
              </div>

              {/* الأسعار */}
              {step.isPricing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="grid grid-cols-2 gap-3 mt-7 max-w-xs mx-auto"
                >
                  {/* شهري */}
                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      backgroundColor: COLORS.surface,
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: '0 8px 30px rgba(0, 67, 250, 0.06)',
                    }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color: COLORS.textSecondary }}
                    >
                      شهرياً
                    </p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.text }}>
                      $10
                    </p>
                  </div>

                  {/* سنوي */}
                  <div
                    className="p-4 rounded-2xl relative"
                    style={{
                      backgroundColor: `${COLORS.primary}10`,
                      border: `1.5px solid ${COLORS.primary}50`,
                      boxShadow: `0 10px 30px ${COLORS.primary}20`,
                    }}
                  >
                    <div
                      className="absolute -top-2 left-3 text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: COLORS.primary,
                        color: '#fff',
                      }}
                    >
                      الأفضل
                    </div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                      style={{ color: COLORS.textSecondary }}
                    >
                      سنوياً
                    </p>
                    <p
                      className="text-2xl font-bold flex items-baseline gap-1.5"
                      style={{ color: COLORS.primary }}
                    >
                      <span
                        className="text-xs line-through opacity-50 font-medium"
                        style={{ color: COLORS.textSecondary }}
                      >
                        $120
                      </span>
                      $100
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ===== التنقل ===== */}
        <div className="mt-10 flex flex-col items-center gap-5">
          {/* النقاط */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`الخطوة ${i + 1}`}
                className="transition-all duration-500 rounded-full"
                style={{
                  width: i === currentStep ? '24px' : '5px',
                  height: '5px',
                  backgroundColor:
                    i === currentStep ? COLORS.primary : `${COLORS.primary}30`,
                  borderRadius: '3px',
                  boxShadow:
                    i === currentStep ? `0 0 10px ${COLORS.primary}60` : 'none',
                }}
              />
            ))}
          </div>

          {/* الأزرار */}
          <div className="flex items-center gap-3">
            {/* السابق */}
            <button
              onClick={goPrev}
              disabled={currentStep === 0}
              aria-label="السابق"
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
              style={{
                backgroundColor: COLORS.glassBg,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${COLORS.glassBorder}`,
                boxShadow: '0 4px 16px rgba(0, 67, 250, 0.06)',
                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <ArrowRight size={16} style={{ color: COLORS.primary }} />
            </button>

            {/* التالي / ابدأ الآن */}
            {isLast ? (
              <Link
                href="/register"
                className="group h-11 px-7 rounded-full flex items-center gap-2 text-sm font-bold transition-all duration-300 hover:scale-[1.03]"
                style={{
                  backgroundColor: COLORS.primary,
                  color: '#fff',
                  boxShadow: `0 10px 30px ${COLORS.primary}50`,
                }}
              >
                <span>ابدأ الآن</span>
                <ArrowLeft
                  size={15}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
              </Link>
            ) : (
              <button
                onClick={goNext}
                aria-label="التالي"
                className="group h-11 px-6 rounded-full flex items-center gap-2 text-sm font-bold transition-all duration-300 hover:scale-[1.03]"
                style={{
                  backgroundColor: COLORS.primary,
                  color: '#fff',
                  boxShadow: `0 10px 30px ${COLORS.primary}50`,
                }}
              >
                <span>التالي</span>
                <ArrowLeft
                  size={15}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
              </button>
            )}
          </div>

          {/* اختصارات */}
          <p
            className="text-[10px] tracking-wide hidden sm:block"
            style={{ color: COLORS.textMuted }}
          >
            استخدم الأسهم ← → للتنقل
          </p>
        </div>
      </div>

      {/* ===== توهج سفلي ناعم ===== */}
      <div
        className="fixed bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${COLORS.primary}08, transparent)`,
        }}
      />
    </div>
  );
}