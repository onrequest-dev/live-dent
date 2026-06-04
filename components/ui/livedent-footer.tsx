"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import { FaTelegramPlane, FaWhatsapp, FaYoutube, FaInstagram } from "react-icons/fa";
import { ArrowUp, Heart, Sparkles, ExternalLink } from "lucide-react";

// ==========================================
// دالة cn مساعدة
// ==========================================
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ==========================================
// روابط التواصل
// ==========================================
const socialLinks = [
  { 
    icon: FaTelegramPlane, 
    href: "https://t.me/OnRequest_dev", 
    color: "#0088cc", 
    label: "تلغرام",
  },
  { 
    icon: FaWhatsapp, 
    href: "https://wa.me/79610195064", 
    color: "#25D366", 
    label: "واتساب",
  },
  { 
    icon: FaYoutube, 
    href: "https://youtube.com/@OnRequest_dev", 
    color: "#FF0000", 
    label: "يوتيوب",
  },
  { 
    icon: FaInstagram, 
    href: "https://www.instagram.com/onrequest.dev", 
    color: "#E4405F", 
    label: "انستغرام",
  },
];

// ==========================================
// ماركي النص المتحرك
// ==========================================
const MarqueeText = () => {
  const items = [
    "إدارة ذكية", "تقارير فورية", "دعم متواصل",
    "أمان كامل", "سهولة تامة", "توفير الوقت",
    "تنظيم مثالي", "نجاح مضمون",
  ];

  return (
    <div className="relative overflow-hidden border-y border-yellow-500/10 bg-[#0A1628]/60 backdrop-blur-sm py-3">
      <motion.div
        className="flex whitespace-nowrap gap-12 px-6"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-yellow-400/40 text-xs md:text-sm font-medium tracking-wider uppercase">
            {item} <span className="mx-4 text-yellow-500/20">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// ==========================================
// المكون الرئيسي
// ==========================================
export function LiveDentFooter() {
  const [isVisible, setIsVisible] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    setIsVisible(true);
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#0A1628] to-[#060E1A] overflow-hidden" dir="rtl">
      {/* ========== خلفية ========== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* شبكة */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)',
          }}
        />
        
        {/* توهج */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-3xl" />
        
        {/* نص خلفي عملاق */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 select-none pointer-events-none">
          <span 
            className="text-[20vw] font-black leading-none opacity-[0.02] whitespace-nowrap"
            style={{ 
              WebkitTextStroke: '1px rgba(234, 179, 8, 0.1)',
              color: 'transparent',
            }}
          >
            LIVE DENT
          </span>
        </div>
      </div>

      <div className="relative z-10">
        {/* ========== ماركي ========== */}
        <MarqueeText />

        {/* ========== المحتوى الرئيسي ========== */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          {/* شعار + عنوان */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border-2 border-yellow-500/30 flex items-center justify-center shadow-xl shadow-yellow-500/10"
            >
              <img 
                src="/logo.png" 
                alt="LiveDent" 
                className="w-12 h-12 md:w-14 md:h-14 object-contain"
              />
            </motion.div>

            <h2 className="text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-4">
              <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                LIVE
              </span>
              {" "}
              <span className="bg-gradient-to-b from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                DENT
              </span>
            </h2>

            <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
              نظام إدارة عيادات الأسنان المتكامل
            </p>
          </motion.div>

          {/* ========== شبكة الروابط ========== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16">
            {/* روابط سريعة */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-white font-bold text-lg mb-4">روابط سريعة</h3>
              <ul className="space-y-3">
                {[
                  { text: "الرئيسية", href: "#" },
                  { text: "المميزات", href: "#services" },
                  { text: "معرض الصور", href: "#" },
                  { text: "من نحن", href: "#about" },
                ].map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-yellow-400 text-sm transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-yellow-500/0 group-hover:bg-yellow-400 transition-all duration-300" />
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* تواصل معنا */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-white font-bold text-lg mb-4">تواصل معنا</h3>
              <div className="space-y-3">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: -4 }}
                    className="flex items-center gap-3 text-gray-400 hover:text-white text-sm transition-all duration-300 group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
                      style={{ backgroundColor: `${social.color}10` }}
                    >
                      <social.icon className="w-4 h-4" style={{ color: social.color }} />
                    </div>
                    <span>{social.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* عن LiveDent */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-white font-bold text-lg mb-4">عن LiveDent</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                نظام متكامل لإدارة عيادات الأسنان. نوفر لك جميع الأدوات التي تحتاجها لإدارة عيادتك بكفاءة عالية.
              </p>
              <Link
                href="/Requestcopy"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] px-4 py-2 rounded-lg font-bold text-sm hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300 shadow-lg shadow-yellow-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>جرب الآن</span>
              </Link>
            </motion.div>
          </div>

          {/* ========== الشريط السفلي ========== */}
          <div className="border-t border-yellow-500/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* حقوق النشر */}
            <div className="flex items-center gap-3 order-2 md:order-1">
              <img src="/logo.png" alt="LiveDent" className="w-6 h-6 object-contain opacity-50" />
              <span className="text-gray-500 text-xs">
                © {new Date().getFullYear()} LiveDent. جميع الحقوق محفوظة
              </span>
            </div>

            {/* صنع بحب */}
            <div className="flex items-center gap-2 text-xs text-gray-500 order-1 md:order-2">
              <span>صنع بـ</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              </motion.span>
              <span>بواسطة</span>
              <Link 
                href="https://on-request.vercel.app/" 
                target="_blank"
                className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors"
              >
                OnRequest
              </Link>
            </div>

            {/* العودة للأعلى */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="order-3 w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20 transition-all duration-300"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}