"use client";
import React, { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "framer-motion";

// مكون صورة محسن
const Img = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} className={className} loading="lazy" decoding="async" />
);

export const HeroParallax = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // المنتجات الثابتة
  const products = [
    {
      title: "إدارة المواعيد",
      link: "/",
      thumbnail: "/imglan/i1.webp",
    },
    {
      title: "سجلات المرضى",
      link: "/",
      thumbnail: "/imglan/i2.webp",
    },
    {
      title: "تخصيص معلومات العيادة",
      link: "/",
      thumbnail: "/imglan/i3.webp",
    },
    {
      title: "معلومات العيادة",
      link: "/",
      thumbnail: "/imglan/i3.webp",
    },
    {
      title: "الأشعة والصور",
      link: "/",
      thumbnail: "/imglan/i5.webp",
    },
    {
      title: "خطة العلاج",
      link: "/",
      thumbnail: "/imglan/i3.webp",
    },
    {
      title: "التذكيرات التلقائية",
      link: "/",
      thumbnail: "/imglan/i4.webp",
    },
    {
      title: "الإحصائياتخصيص ال cv",
      link: "/",
      thumbnail: "/imglan/i4.webp",
    },
    {
      title: "إدارة المخزون",
      link: "/",
      thumbnail: "/imglan/i5.webp",
    },
    {
      title: "التواصل مع المرضى",
      link: "/",
      thumbnail: "/images/dental-10.jpg",
    },
    {
      title: "الفواتير الإلكترونية",
      link: "/",
      thumbnail: "/images/dental-11.jpg",
    },
    {
      title: "نسخ احتياطي",
      link: "/",
      thumbnail: "/images/dental-12.jpg",
    },
    {
      title: "دعم فني",
      link: "/",
      thumbnail: "/images/dental-13.jpg",
    },
    {
      title: "تحديثات مستمرة",
      link: "/",
      thumbnail: "/images/dental-14.jpg",
    },
    {
      title: "أمان عالي",
      link: "/",
      thumbnail: "/images/dental-15.jpg",
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // إعدادات spring محسنة للهاتف - سريعة وسلسة
  const springConfig = {
    stiffness: isMobile ? 120 : 200,
    damping: isMobile ? 20 : 25,
    mass: isMobile ? 0.3 : 0.5,
    bounce: 0,
    restDelta: 0.001,
  };

  // قيم الحركة حسب الجهاز
  const mobileMultiplier = isMobile ? 0.25 : isTablet ? 0.5 : 1;

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000 * mobileMultiplier]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000 * mobileMultiplier]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [isMobile ? 8 : 15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.15], [0.4, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [isMobile ? 5 : 20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [isMobile ? -200 : -700, isMobile ? 100 : 500]),
    springConfig
  );

  // تقليل عدد العناصر على الهاتف
  const firstRow = isMobile ? products.slice(0, 3) : products.slice(0, 5);
  const secondRow = isMobile ? products.slice(3, 5) : products.slice(5, 10);
  const thirdRow = isMobile ? [] : products.slice(10, 15);

  // أبعاد متجاوبة
  const containerHeight = isMobile ? '150vh' : isTablet ? '220vh' : '300vh';
  const gapClass = isMobile ? 'gap-3' : isTablet ? 'gap-10' : 'gap-20';
  const paddingX = isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-10';
  const marginBottom = isMobile ? 'mb-6' : isTablet ? 'mb-12' : 'mb-20';

  return (
    <div
      ref={ref}
      className={`${containerHeight} py-20 md:py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:800px] md:[perspective:1000px] [transform-style:preserve-3d] bg-[#0A1628]`}
      dir="rtl"
    >
      <Header isMobile={isMobile} />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
          willChange: "transform",
        }}
        className="gpu-accelerate"
      >
        <motion.div className={`flex flex-row-reverse ${gapClass} ${marginBottom} ${paddingX}`}>
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
              isMobile={isMobile}
            />
          ))}
        </motion.div>
        <motion.div className={`flex flex-row ${gapClass} ${marginBottom} ${paddingX}`}>
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
              isMobile={isMobile}
            />
          ))}
        </motion.div>
        {thirdRow.length > 0 && (
          <motion.div className={`flex flex-row-reverse ${gapClass} ${paddingX}`}>
            {thirdRow.map((product) => (
              <ProductCard
                product={product}
                translate={translateX}
                key={product.title}
                isMobile={isMobile}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export const Header = ({ isMobile }: { isMobile?: boolean }) => {
  return (
<div className={`max-w-7xl relative mx-auto ${isMobile ? 'py-8 px-4' : 'py-20 md:py-40 px-4'} w-full left-0 top-0`}>

  {/* العنوان الرئيسي */}
  <motion.h1 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className={`font-bold text-center leading-tight ${
      isMobile ? 'text-2xl' : 'text-3xl md:text-6xl lg:text-7xl'
    }`}
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
        className="relative w-16 h-16 md:w-20 md:h-20 mx-0 inline-flex items-center justify-center pointer-events-none"
      >
        <img 
          src="/icon-192x192.png" 
          alt="LiveDent" 
          className="w-full h-full object-contain pointer-events-none"
          style={{ filter: 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.5))' }}
        />
      </motion.div>
      <span className="text-white">ــــــــــــــــــــان</span>
    </span>
  </motion.h1>

  {/* الوصف */}
  <motion.p 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className={`text-white/90 text-center mx-auto leading-relaxed ${
      isMobile ? 'max-w-xs text-xs mt-4' : 'max-w-2xl text-base md:text-xl mt-6 md:mt-10'
    }`}
  >
    قم بإدارة مواعيدك و مدفوعاتك بكل بساطة وسهولة بعيدا عن الورقيات
  </motion.p>

  {/* زر CTA */}
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className="flex justify-center mt-6 md:mt-10"
  >
    <motion.a
      href="/Requestcopy"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative z-20 bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] rounded-xl font-bold shadow-lg shadow-yellow-500/25 transition-all duration-300 inline-flex items-center gap-2 md:gap-3 hover:shadow-yellow-500/40 pointer-events-auto ${
        isMobile ? 'px-6 py-3 text-sm' : 'px-8 py-4 text-base md:text-lg'
      }`}
      style={{ position: 'relative', isolation: 'isolate' }}
    >
      <span className="relative z-10">ابدأ الآن</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={isMobile ? "16" : "20"}
        height={isMobile ? "16" : "20"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative z-10 group-hover:translate-x-1 transition-transform duration-300"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </motion.a>
  </motion.div>
</div>
  );
};

export const ProductCard = ({
  product,
  translate,
  isMobile,
}: {
  product: {
    title: string;
    link: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
  isMobile?: boolean;
}) => {
  return (
    <motion.div
      style={{
        x: translate,
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
      key={product.title}
      className={`group relative flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden border border-yellow-500/10 md:border-2 md:border-yellow-500/20 shadow-lg md:shadow-xl cursor-pointer ${
        isMobile ? 'w-52 h-36' : 'w-60 sm:w-72 md:w-[30rem] h-48 sm:h-64 md:h-80'
      }`}
    >
      <div className="relative h-full w-full">
        <Img
          src={product.thumbnail}
          className="object-cover absolute h-full w-full inset-0 group-hover:scale-110 transition-transform duration-500"
          alt={product.title}
        />
        {/* تدرج سفلي محسن */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/40 to-transparent opacity-60 group-hover:opacity-70 transition-opacity duration-300"></div>
        
        {/* تأثير ذهبي في الأسفل */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-yellow-500/20 to-transparent group-hover:from-yellow-500/30 transition-all duration-300"></div>
        
        {/* إطار داخلي */}
        <div className="absolute inset-2 md:inset-3 rounded-lg md:rounded-xl border border-white/10 group-hover:border-yellow-500/30 transition-colors duration-300"></div>
        
        {/* عنوان البطاقة - بدون شفافية */}
        <div className="absolute bottom-3 md:bottom-6 right-3 md:right-6 left-3 md:left-6">
          <h2 className={`text-white font-bold drop-shadow-lg group-hover:translate-y-[-2px] transition-transform duration-300 ${
            isMobile ? 'text-sm' : 'text-base md:text-xl lg:text-2xl'
          }`}>
            {product.title}
          </h2>
        </div>
      </div>
    </motion.div>
  );
};