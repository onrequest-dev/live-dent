"use client"

import { ArrowLeft, Sparkles, ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

// ==========================================
// دالة cn مساعدة
// ==========================================
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ==========================================
// أنواع البروبس
// ==========================================
interface PortfolioGalleryProps {
  title?: string;
  subtitle?: string;
  ctaButton?: {
    text: string;
    href: string;
  };
  images?: Array<{
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }>;
  className?: string;
}

// ==========================================
// صور افتراضية
// ==========================================
const DEFAULT_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&h=800&fit=crop&q=80",
    alt: "طبيب أسنان مع مريض",
    title: "عيادة مودرن",
    description: "أحدث تجهيزات طب الأسنان",
  },
  {
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=800&fit=crop&q=80",
    alt: "عيادة أسنان حديثة",
    title: "غرفة العمليات",
    description: "مجهزة بأعلى المعايير",
  },
  {
    src: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1200&h=800&fit=crop&q=80",
    alt: "أدوات طبيب أسنان",
    title: "أدوات متطورة",
    description: "تقنيات علاجية حديثة",
  },
  {
    src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&h=800&fit=crop&q=80",
    alt: "طبيب أسنان يعمل",
    title: "علاج احترافي",
    description: "فريق طبي متخصص",
  },
  {
    src: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=800&fit=crop&q=80",
    alt: "تقنية طبية",
    title: "تقنيات رقمية",
    description: "تصوير ثلاثي الأبعاد",
  },
  {
    src: "https://images.unsplash.com/photo-1550831107-1553da8c8464?w=1200&h=800&fit=crop&q=80",
    alt: "مكتب طبيب",
    title: "استشارة مريحة",
    description: "بيئة هادئة ومريحة",
  },
  {
    src: "https://images.unsplash.com/photo-1576091160392-f8f9d3b1d4c9?w=1200&h=800&fit=crop&q=80",
    alt: "عيادة حديثة",
    title: "استقبال راقي",
    description: "خدمة عملاء متميزة",
  },
  {
    src: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&h=800&fit=crop&q=80",
    alt: "طبيب محترف",
    title: "خبرة وكفاءة",
    description: "أطباء ذوو خبرة",
  },
]

// ==========================================
// المكون الرئيسي
// ==========================================
export function PortfolioGallery({
  title = "معرض الصور",
  subtitle = "تعرف على عيادتنا",
  ctaButton = {
    text: "اطلب نسختك التجريبية",
    href: "/CreateClinicAccount",
  },
  images: customImages,
  className = "",
}: PortfolioGalleryProps) {
  const images = customImages || DEFAULT_IMAGES;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeImage = images[activeIndex];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const goToImage = (index: number) => {
    setIsAutoPlaying(false);
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const goNext = () => {
    setIsAutoPlaying(false);
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % images.length);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const goPrev = () => {
    setIsAutoPlaying(false);
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <section
      className={`relative py-12 md:py-24 overflow-hidden bg-gradient-to-b from-[#0D1B30] to-[#0A1628] ${className}`}
      dir="rtl"
    >
      <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Header */}
        <div className="relative z-10 text-center mb-6 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-yellow-500/10 rounded-full px-3 md:px-4 py-1 md:py-1.5 mb-3 md:mb-4 border border-yellow-500/20"
          >
            <Sparkles className="text-yellow-400 w-3 h-3 md:w-4 md:h-4" />
            <span className="text-yellow-400 text-xs md:text-sm font-medium">
              {subtitle}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl md:text-4xl lg:text-5xl font-bold text-white mb-2"
          >
            {title}
          </motion.h2>
        </div>

        {/* ========== الإطار الرئيسي (المكتبي) ========== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-4xl"
        >
          {/* ========== نسخة المكتبي: كل شيء داخل إطار واحد ========== */}
          <div
            className="hidden md:block relative rounded-3xl overflow-hidden border-2 border-yellow-500/20 bg-[#0A1628] shadow-2xl shadow-yellow-500/5"
            style={{ perspective: "1200px" }}
          >
            <div className="relative aspect-[16/10] lg:aspect-[16/9] overflow-hidden group">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0"
                >
                  <img
                    src={activeImage.src}
                    alt={activeImage.alt}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/90 to-transparent pointer-events-none" />

              {/* أزرار التنقل */}
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/3 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 hover:border-yellow-400/50 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/3 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 hover:border-yellow-400/50 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </button>

              {/* عنوان + عداد */}
              <div className="absolute top-4 left-4 right-4 z-20">
                <div className="flex items-center justify-between">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/10">
                    <h3 className="text-white font-bold text-sm lg:text-base">
                      {activeImage.title}
                    </h3>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
                    <span className="text-yellow-400 text-xs font-medium">
                      {activeIndex + 1} / {images.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* صور مصغرة 3D للمكتبي */}
              <div
                className="absolute bottom-0 left-0 right-0 z-20 pb-4 px-6"
                style={{ perspective: "800px" }}
              >
                <div className="flex items-end justify-center gap-3">
                  {images.map((image, index) => {
                    const isActive = index === activeIndex;
                    const distance = Math.abs(index - activeIndex);
                    return (
                      <motion.div
                        key={index}
                        animate={{
                          rotateX: 30,
                          rotateY: (index - activeIndex) * 15,
                          scale: isActive ? 1.25 : 0.85 - distance * 0.05,
                          y: isActive ? -8 : distance * 3,
                          z: isActive ? 50 : -distance * 20,
                          opacity: isActive ? 1 : 0.5 - distance * 0.08,
                          filter: isActive
                            ? "brightness(1.1) saturate(1.2)"
                            : `brightness(${0.6 - distance * 0.08})`,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 25,
                        }}
                        whileHover={{
                          scale: isActive ? 1.35 : 0.95,
                          y: isActive ? -12 : -2,
                          rotateX: 30,
                        }}
                        className="cursor-pointer origin-bottom flex-shrink-0"
                        onClick={() => goToImage(index)}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <div
                          className={cn(
                            "relative w-16 md:w-20 lg:w-24 h-12 md:h-14 lg:h-16 rounded-xl overflow-hidden transition-all duration-300",
                            isActive
                              ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#0A1628] shadow-xl shadow-yellow-500/40"
                              : "ring-1 ring-white/20 hover:ring-yellow-500/40",
                          )}
                        >
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {!isActive && (
                            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
                          )}
                          {isActive && (
                            <>
                              <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600" />
                            </>
                          )}
                          {isActive && isAutoPlaying && (
                            <motion.div
                              initial={{ scaleX: 1 }}
                              animate={{ scaleX: 0 }}
                              transition={{ duration: 5, ease: "linear" }}
                              className="absolute top-0 left-0 right-0 h-0.5 bg-yellow-400 origin-left"
                            />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* شريط المعلومات السفلي */}
            <div className="relative px-6 py-4 border-t border-yellow-500/10 bg-[#0A1628]/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  {activeImage.description}
                </p>
                <div className="flex items-center gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={cn(
                        "rounded-full transition-all duration-300",
                        index === activeIndex
                          ? "w-5 h-1.5 bg-yellow-400"
                          : "w-1.5 h-1.5 bg-yellow-500/30 hover:bg-yellow-500/50",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========== نسخة الهاتف: تصميم منفصل ========== */}
          <div className="md:hidden">
            {/* الصورة الكبيرة */}
            <div className="relative rounded-2xl overflow-hidden border border-yellow-500/20 bg-[#0A1628] shadow-xl mb-4">
              <div className="relative aspect-[4/3] overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0"
                  >
                    <img
                      src={activeImage.src}
                      alt={activeImage.alt}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A1628] to-transparent pointer-events-none" />

                {/* أزرار التنقل */}
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center z-20 active:scale-90 transition-transform"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center z-20 active:scale-90 transition-transform"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>

                {/* عنوان + عداد */}
                <div className="absolute top-3 left-3 right-3 z-20">
                  <div className="flex items-center justify-between">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10">
                      <h3 className="text-white font-bold text-xs">
                        {activeImage.title}
                      </h3>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 border border-white/10">
                      <span className="text-yellow-400 text-[10px] font-medium">
                        {activeIndex + 1}/{images.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* وصف */}
              <div className="px-3 py-2 border-t border-yellow-500/10 bg-[#0A1628]">
                <p className="text-gray-400 text-xs">
                  {activeImage.description}
                </p>
              </div>
            </div>

            {/* الصور المصغرة - صف منفصل أسفل الصورة الكبيرة */}
            {/* الصور المصغرة - دائرية متداخلة أفقياً للهاتف */}
            <div className="relative py-4 flex justify-center">
              <div className="flex items-center justify-center gap-1">
                {images.map((image, index) => {
                  const isActive = index === activeIndex;
                  const distance = Math.abs(index - activeIndex);

                  return (
                    <motion.button
                      key={index}
                      onClick={() => goToImage(index)}
                      animate={{
                        width: isActive ? 56 : Math.max(28, 48 - distance * 8),
                        height: isActive ? 56 : Math.max(28, 48 - distance * 8),
                        opacity: isActive
                          ? 1
                          : Math.max(0.4, 0.8 - distance * 0.15),
                        scale: isActive ? 1.1 : 1,
                        marginLeft:
                          distance === 1 && !isActive ? "-8px" : "0px",
                        marginRight:
                          distance === 1 && !isActive ? "-8px" : "0px",
                        zIndex: isActive ? 20 : 10 - distance,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 150,
                        damping: 20,
                        mass: 0.3,
                      }}
                      whileTap={{ scale: 0.9 }}
                      className="relative rounded-full overflow-hidden cursor-pointer flex-shrink-0"
                      style={{
                        boxShadow: isActive
                          ? "0 0 0 3px rgba(234, 179, 8, 0.9), 0 0 0 7px rgba(234, 179, 8, 0.2), 0 8px 25px rgba(234, 179, 8, 0.35)"
                          : "0 3px 10px rgba(0,0,0,0.4), 0 0 0 1.5px rgba(255,255,255,0.1)",
                      }}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover pointer-events-none select-none"
                        loading="lazy"
                        draggable={false}
                        style={{ aspectRatio: "1/1" }}
                      />

                      {/* Overlay للصور غير النشطة */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-[#0A1628]/45" />
                      )}

                      {/* تأثيرات الصورة النشطة */}
                      {isActive && (
                        <>
                          {/* توهج ذهبي داخلي */}
                          <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 via-yellow-500/5 to-transparent" />

                          {/* حلقة داخلية رفيعة */}
                          <div className="absolute inset-[3px] rounded-full border border-white/20" />

                          {/* نقطة مضيئة في الأعلى */}
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/70 shadow-sm shadow-white/50" />

                          {/* مؤشر التقدم الدائري */}
                          {isAutoPlaying && (
                            <svg
                              className="absolute inset-0 -rotate-90"
                              viewBox="0 0 56 56"
                              style={{ width: "100%", height: "100%" }}
                            >
                              <motion.circle
                                cx="28"
                                cy="28"
                                r="25"
                                fill="none"
                                stroke="rgba(234, 179, 8, 0.7)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 25}`}
                                initial={{ strokeDashoffset: 0 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 25 }}
                                transition={{ duration: 5, ease: "linear" }}
                              />
                            </svg>
                          )}
                        </>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-6 md:mt-10"
        >
          <Link
            href={ctaButton.href}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all duration-300 group text-sm md:text-base"
          >
            <span>{ctaButton.text}</span>
            <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}