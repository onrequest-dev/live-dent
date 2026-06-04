"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  Bot,
  Bell,
  Store,
  Wrench,
  Package,
  Clock,
} from "lucide-react"

// ==========================================
// دالة cn مساعدة
// ==========================================
function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ==========================================
// الميزات المستقبلية
// ==========================================
const FUTURE_FEATURES = [
  {
    id: 1,
    icon: Bot,
    title: "مساعد ذكي",
    subtitle: "ذكاء اصطناعي في خدمة عيادتك",
    description: "مساعد متطور لتدوين المواعيد ومعاينة الجلسات وتذكيرك بالمهام المهمة. يتعلم من أنماط عملك ليقدم لك اقتراحات ذكية.",
    features: [
      "تدوين تلقائي للمواعيد",
      "معاينة ذكية للجلسات القادمة",
      "اقتراحات للجدولة المثلى",
      "تعلم تلقائي من أنماط عملك",
    ],
    color: "violet",
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-500/5",
    borderLight: "border-violet-500/20",
    textColor: "text-violet-400",
    dotColor: "bg-violet-400",
  },
  {
    id: 2,
    icon: Bell,
    title: "تنبيهات فورية",
    subtitle: "لا تفوّت أي شيء مهم",
    description: "نظام تنبيهات متطور لإشعارك بكل ما يحدث في عيادتك. ابق على اطلاع دائم بكل التفاصيل المهمة.",
    features: [
      "إشعارات فورية للمواعيد",
      "تنبيهات المخزون المنخفض",
      "تذكير بالمهام الدورية",
      "تقارير يومية مختصرة",
    ],
    color: "rose",
    gradient: "from-rose-500 to-pink-500",
    bgLight: "bg-rose-500/5",
    borderLight: "border-rose-500/20",
    textColor: "text-rose-400",
    dotColor: "bg-rose-400",
  },
  {
    id: 3,
    icon: Store,
    title: "متجر المستلزمات",
    subtitle: "كل ما تحتاجه في مكان واحد",
    description: "متجر متكامل يلبي كافة احتياجات عيادتك من أدوات ومواد ومستلزمات. نوفر لك أفضل المنتجات.",
    features: [
      "أدوات طب الأسنان المتطورة",
      "مواد التعقيم والتطهير",
      "مستلزمات طبية متنوعة",
      "أثاث وتجهيزات العيادات",
    ],
    color: "emerald",
    gradient: "from-emerald-500 to-green-500",
    bgLight: "bg-emerald-500/5",
    borderLight: "border-emerald-500/20",
    textColor: "text-emerald-400",
    dotColor: "bg-emerald-400",
  },
  {
    id: 4,
    icon: Wrench,
    title: "صيانة متخصصة",
    subtitle: "فريق صيانة وإصلاح احترافي",
    description: "فريق متخصص للصيانة والإصلاحات داخل العيادة وخارجها. نضمن استمرارية عمل أجهزتك بأعلى كفاءة.",
    features: [
      "صيانة دورية للأجهزة الطبية",
      "إصلاحات طارئة داخل العيادة",
      "خدمات المباني والمرافق",
      "عقود صيانة سنوية شاملة",
    ],
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-500/5",
    borderLight: "border-amber-500/20",
    textColor: "text-amber-400",
    dotColor: "bg-amber-400",
  },
  {
    id: 5,
    icon: Package,
    title: "كافة الاحتياجات",
    subtitle: "خدمة شاملة لقطاع الأسنان",
    description: "نعمل على تلبية أي مستلزمات إضافية لتخديم كافة قطاع طب الأسنان. مهما كان طلبك، سنعمل على تحقيقه.",
    features: [
      "طلبات مخصصة حسب الحاجة",
      "توريد خاص للكميات الكبيرة",
      "حلول متكاملة للقطاع الطبي",
      "شراكات مع أفضل الموردين",
    ],
    color: "cyan",
    gradient: "from-cyan-500 to-blue-500",
    bgLight: "bg-cyan-500/5",
    borderLight: "border-cyan-500/20",
    textColor: "text-cyan-400",
    dotColor: "bg-cyan-400",
  },
]

// ==========================================
// المكون الرئيسي
// ==========================================
export function FutureFeatures() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const activeFeature = FUTURE_FEATURES[activeIndex]
  const Icon = activeFeature.icon

  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-[#0A1628] via-[#0D1B30] to-[#0A1628]" id="future">
      {/* خلفيات */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-yellow-500/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-blue-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* ========== Header ========== */}
        <div className="text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-yellow-500/10 rounded-full px-4 py-1.5 mb-4 border border-yellow-500/20"
          >
            <Sparkles className="text-yellow-400 w-4 h-4" />
            <span className="text-yellow-400 text-sm font-medium">قريباً</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3"
          >
            في <span className="bg-gradient-to-l from-yellow-400 to-yellow-200 bg-clip-text text-transparent">المستقبل</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-sm md:text-base max-w-xl mx-auto"
          >
            نعمل باستمرار على تطوير خدمات جديدة لتلبية جميع احتياجات قطاع طب الأسنان
          </motion.p>
        </div>

        {/* ========== مكتبي: عرض Grid كامل ========== */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {FUTURE_FEATURES.map((feature, index) => {
            const Icon = feature.icon
            const isActive = index === activeIndex
            
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  "relative rounded-2xl border p-5 lg:p-6 cursor-pointer transition-all duration-500",
                  "bg-gradient-to-br from-[#0F1F35]/90 to-[#0A1628]/95",
                  isActive
                    ? `${feature.borderLight} shadow-xl scale-[1.03]`
                    : "border-white/5 hover:border-white/10"
                )}
              >
                {/* أيقونة كبيرة شفافة في الخلفية */}
                <div className={cn(
                  "absolute -bottom-4 -right-4 pointer-events-none select-none transition-all duration-500",
                  isActive ? "opacity-[0.06]" : "opacity-[0.02]"
                )}>
                  <Icon className="w-32 h-32 lg:w-40 lg:h-40" strokeWidth={1} />
                </div>

                <div className="relative z-10">
                  {/* أيقونة صغيرة */}
                  <div className={cn(
                    "w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center mb-4",
                    `bg-gradient-to-br ${feature.gradient} bg-opacity-10`,
                    feature.bgLight, feature.borderLight, "border"
                  )}>
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>

                  {/* عنوان فرعي */}
                  <p className={cn("text-xs mb-1", feature.textColor)}>
                    {feature.subtitle}
                  </p>

                  {/* عنوان */}
                  <h3 className="text-base lg:text-lg font-bold text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* وصف */}
                  <p className="text-gray-400 text-xs lg:text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* مميزات */}
                  <ul className="space-y-2">
                    {feature.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] lg:text-xs text-gray-500">
                        <span className={cn("w-1 h-1 rounded-full mt-1.5 flex-shrink-0", feature.dotColor)} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* خط علوي عند التفعيل */}
                {isActive && (
                  <motion.div
                    layoutId="activeLine"
                    className={cn("absolute top-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r", feature.gradient)}
                  />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* ========== هاتف: عرض بطاقة واحدة مع تنقل ========== */}
        <div className="md:hidden">
          {/* البطاقة الحالية */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-[#0F1F35]/95 to-[#0A1628]/98 shadow-xl"
            >
              {/* أيقونة كبيرة شفافة */}
              <div className="absolute -bottom-6 -right-6 pointer-events-none select-none opacity-[0.04]">
                <Icon className="w-48 h-48" strokeWidth={1} />
              </div>

              {/* خط علوي ملون */}
              <div className={cn("absolute top-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r", activeFeature.gradient)} />

              <div className="relative z-10">
                {/* أيقونة + عنوان */}
                <div className="flex items-center gap-4 mb-5">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                    `bg-gradient-to-br ${activeFeature.gradient} bg-opacity-10`,
                    activeFeature.bgLight, activeFeature.borderLight, "border"
                  )}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className={cn("text-xs mb-0.5", activeFeature.textColor)}>
                      {activeFeature.subtitle}
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      {activeFeature.title}
                    </h3>
                  </div>
                </div>

                {/* وصف */}
                <p className="text-gray-300 text-sm leading-relaxed mb-5">
                  {activeFeature.description}
                </p>

                {/* مميزات في شبكة 2×2 */}
                <div className="grid grid-cols-2 gap-2">
                  {activeFeature.features.map((feat, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-start gap-2 p-2.5 rounded-xl",
                        activeFeature.bgLight,
                        activeFeature.borderLight,
                        "border"
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0", activeFeature.dotColor)} />
                      <span className="text-gray-400 text-[11px] leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* نقاط التنقل + أيقونة الساعة */}
          <div className="flex items-center justify-between mt-5 px-2">
            {/* الساعة */}
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-xs">قريباً</span>
            </div>

            {/* النقاط */}
            <div className="flex items-center gap-2">
              {FUTURE_FEATURES.map((feature, index) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    index === activeIndex
                      ? `w-6 h-2 bg-gradient-to-r ${activeFeature.gradient}`
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>

            {/* العداد */}
            <span className="text-gray-500 text-xs">
              {activeIndex + 1}/{FUTURE_FEATURES.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}