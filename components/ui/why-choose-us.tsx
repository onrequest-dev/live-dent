"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Sparkles,
  Smartphone,
  Globe,
  Zap,
  Shield,
  Headphones,
  Cloud,
  Laptop,
  RefreshCw,
  Palette,
  Stethoscope,
  FileText,
  Calendar,
  Eye,
} from "lucide-react"

// ==========================================
// دالة cn مساعدة
// ==========================================
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ==========================================
// بيانات المميزات
// ==========================================
const FEATURES = [
  {
    id: 1,
    icon: Smartphone,
    title: "جميع الأجهزة",
    description: "يعمل على الهاتف، التابلت، والحاسوب بنفس الكفاءة والأداء العالي",
    color: "blue",
    details: ["متوافق مع iOS و Android", "تصميم متجاوب بالكامل", "تجربة موحدة على جميع الشاشات"],
  },
  {
    id: 2,
    icon: Globe,
    title: "جميع الأنظمة",
    description: "يدعم جميع أنظمة التشغيل والمتصفحات بدون أي مشاكل تقنية",
    color: "green",
    details: ["Windows, Mac, Linux", "Chrome, Safari, Firefox", "تحديثات مستمرة للتوافق"],
  },
  {
    id: 3,
    icon: Zap,
    title: "سرعة فائقة",
    description: "أداء سريع واستجابة فورية مع تحميل خفيف على الموارد",
    color: "yellow",
    details: ["تحميل خلال ثواني", "استهلاك منخفض للبيانات", "معالجة فورية للطلبات"],
  },
  {
    id: 4,
    icon: Shield,
    title: "أمان كامل",
    description: "حماية متكاملة لبيانات المرضى والسجلات الطبية بتشفير عالي",
    color: "purple",
    details: ["تشفير SSL/TLS", "نسخ احتياطي تلقائي", "خصوصية تامة للبيانات"],
  },
  {
    id: 5,
    icon: Headphones,
    title: "دعم فني 24/7",
    description: "فريق دعم متخصص متواجد على مدار الساعة لمساعدتك",
    color: "pink",
    details: ["دعم عبر الواتساب", "استجابة خلال دقائق", "مساعدة عن بعد"],
  },
  {
    id: 6,
    icon: Cloud,
    title: "سحابي بالكامل",
    description: "بياناتك متاحة دائماً في السحابة مع مزامنة فورية بين الأجهزة",
    color: "indigo",
    details: ["مزامنة فورية", "وصول من أي مكان", "تخزين غير محدود"],
  },
  {
    id: 7,
    icon: Laptop,
    title: "سهولة الاستخدام",
    description: "واجهة بسيطة وبديهية لا تحتاج لتدريب مع تجربة مستخدم ممتازة",
    color: "teal",
    details: ["تعلم خلال دقائق", "واجهة بالعربية", "تجربة سلسة وبديهية"],
  },
  {
    id: 8,
    icon: RefreshCw,
    title: "تأقلم سريع",
    description: "يتكيف مع احتياجات عيادتك وينمو معك مع تحديثات مستمرة",
    color: "orange",
    details: ["تحديثات أسبوعية", "ميزات حسب الطلب", "مرونة في التخصيص"],
  },
  {
    id: 9,
    icon: Palette,
    title: "تخصيص الهوية البصرية",
    description: "خصص ألوان وشعار البرنامج ليتناسب مع هوية عيادتك البصرية",
    color: "rose",
    details: ["ألوان قابلة للتخصيص", "رفع شعار العيادة", "واجهة مخصصة بالكامل"],
  },
  {
    id: 10,
    icon: Stethoscope,
    title: "CV احترافي للطبيب",
    description: "صفحة سيرة ذاتية متكاملة لكل طبيب تعرض خبراته وشهاداته",
    color: "emerald",
    details: ["عرض الخبرات والشهادات", "صورة شخصية", "مشاركة عبر رابط مباشر"],
  },
  {
    id: 11,
    icon: Eye,
    title: "صفحة تعريفية للعيادة",
    description: "صفحة ويب احترافية لعيادتك تعرض خدماتك وأطبائك وموقعك",
    color: "cyan",
    details: ["عرض الخدمات والتخصصات", "خريطة الموقع", "حجز موعد مباشر"],
  },
  {
    id: 12,
    icon: Calendar,
    title: "برنامج الدوام الذكي",
    description: "إدارة ذكية لأوقات العمل والإجازات مع نظام مناوبات مرن",
    color: "amber",
    details: ["جدولة المناوبات", "إدارة الإجازات", "تنبيهات تلقائية"],
  },
]

// ==========================================
// ألوان Tailwind لكل لون
// ==========================================
const colorMap: Record<string, {
  gradient: string;
  border: string;
  bg: string;
  text: string;
  dot: string;
  shadow: string;
  glow: string;
}> = {
  blue: {
    gradient: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
    shadow: "shadow-blue-500/10",
    glow: "text-blue-500/4",
  },
  green: {
    gradient: "from-green-500/20 to-green-600/5",
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    text: "text-green-400",
    dot: "bg-green-400",
    shadow: "shadow-green-500/10",
    glow: "text-green-500/4",
  },
  yellow: {
    gradient: "from-yellow-500/20 to-yellow-600/5",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
    shadow: "shadow-yellow-500/10",
    glow: "text-yellow-500/4",
  },
  purple: {
    gradient: "from-purple-500/20 to-purple-600/5",
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-400",
    shadow: "shadow-purple-500/10",
    glow: "text-purple-500/4",
  },
  pink: {
    gradient: "from-pink-500/20 to-pink-600/5",
    border: "border-pink-500/30",
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    dot: "bg-pink-400",
    shadow: "shadow-pink-500/10",
    glow: "text-pink-500/4",
  },
  indigo: {
    gradient: "from-indigo-500/20 to-indigo-600/5",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    dot: "bg-indigo-400",
    shadow: "shadow-indigo-500/10",
    glow: "text-indigo-500/4",
  },
  teal: {
    gradient: "from-teal-500/20 to-teal-600/5",
    border: "border-teal-500/30",
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    dot: "bg-teal-400",
    shadow: "shadow-teal-500/10",
    glow: "text-teal-500/4",
  },
  orange: {
    gradient: "from-orange-500/20 to-orange-600/5",
    border: "border-orange-500/30",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "bg-orange-400",
    shadow: "shadow-orange-500/10",
    glow: "text-orange-500/4",
  },
  rose: {
    gradient: "from-rose-500/20 to-rose-600/5",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    dot: "bg-rose-400",
    shadow: "shadow-rose-500/10",
    glow: "text-rose-500/4",
  },
  emerald: {
    gradient: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    shadow: "shadow-emerald-500/10",
    glow: "text-emerald-500/4",
  },
  cyan: {
    gradient: "from-cyan-500/20 to-cyan-600/5",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    dot: "bg-cyan-400",
    shadow: "shadow-cyan-500/10",
    glow: "text-cyan-500/4",
  },
  amber: {
    gradient: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
    shadow: "shadow-amber-500/10",
    glow: "text-amber-500/4",
  },
}

// ==========================================
// بطاقة ميزة واحدة
// ==========================================
const FeatureCard = ({ feature, index }: { feature: typeof FEATURES[0]; index: number }) => {
  const Icon = feature.icon
  const colors = colorMap[feature.color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      viewport={{ once: true, margin: "-30px" }}
      className="group relative h-full"
    >
      <div className={cn(
        "relative h-full rounded-2xl border border-white/5 p-5 md:p-6",
        "bg-gradient-to-br from-[#0F1F35]/90 to-[#0A1628]/95",
        "backdrop-blur-sm shadow-lg hover:shadow-xl",
        "transition-all duration-500 overflow-hidden",
        "hover:border-yellow-500/20"
      )}>
        {/* ✅ أيقونة كبيرة شفافة في الخلفية */}
        <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 pointer-events-none select-none opacity-[0.04] group-hover:opacity-[0.06] transition-opacity duration-500">
          <Icon className="w-40 h-40 md:w-48 md:h-48" strokeWidth={1} />
        </div>

        {/* تأثير توهج علوي */}
        <div className={cn(
          "absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent",
          "group-hover:via-yellow-500/30 transition-all duration-500"
        )} />

        {/* المحتوى */}
        <div className="relative z-10">
          {/* أيقونة صغيرة في الأعلى */}
          <div className={cn(
            "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4",
            "bg-gradient-to-br", colors.gradient,
            "border", colors.border,
            "group-hover:scale-110 transition-transform duration-500",
          )}>
            <Icon className={cn("w-5 h-5 md:w-6 md:h-6", colors.text)} />
          </div>

          {/* عنوان */}
          <h3 className="text-base md:text-lg font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
            {feature.title}
          </h3>

          {/* وصف */}
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-4">
            {feature.description}
          </p>

          {/* نقاط التفاصيل */}
          <ul className="space-y-1.5">
            {feature.details.map((detail, i) => (
              <li key={i} className="flex items-center gap-2 text-[11px] md:text-xs text-gray-500">
                <span className={cn("w-1 h-1 rounded-full flex-shrink-0", colors.dot)} />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

// ==========================================
// المكون الرئيسي
// ==========================================
export function WhyChooseUs() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-[#0A1628] via-[#0D1B30] to-[#0A1628]" id="why-us">
      {/* خلفيات متوهجة */}
      <div className="absolute top-1/3 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-yellow-500/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-blue-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* ========== Header ========== */}
        <div className="text-center mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-yellow-500/10 rounded-full px-4 py-1.5 mb-4 border border-yellow-500/20"
          >
            <Sparkles className="text-yellow-400 w-4 h-4" />
            <span className="text-yellow-400 text-sm font-medium">لماذا تختارنا</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3"
          >
            ما <span className="bg-gradient-to-l from-yellow-400 to-yellow-200 bg-clip-text text-transparent">يميزنا</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-sm md:text-base max-w-xl mx-auto"
          >
            نظام LiveDent مصمم ليكون متوافقاً مع جميع احتياجات عيادتك أينما كنت وكيفما تعمل
          </motion.p>
        </div>

        {/* ========== شبكة المميزات ========== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>

        {/* ========== إحصائية سريعة ========== */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 md:mt-14 flex flex-wrap justify-center gap-6 md:gap-12"
        >
          {[
            { value: "100+", label: "عيادة تستخدم النظام" },
            { value: "5000+", label: "مريض مسجل" },
            { value: "99.9%", label: "وقت تشغيل بدون أعطال" },
            { value: "24/7", label: "دعم فني متواصل" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-l from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-gray-500 text-xs md:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}