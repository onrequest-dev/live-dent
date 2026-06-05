"use client"

import React from "react"
import { motion } from "framer-motion"
import { Sparkles, ArrowLeft, ExternalLink, Code2, Smartphone, Palette, Globe, Server, Users } from "lucide-react"
import Link from "next/link"
import { FaTelegramPlane, FaWhatsapp, FaYoutube, FaInstagram } from "react-icons/fa"

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
    description: "الدعم والمستجدات"
  },
  { 
    icon: FaWhatsapp, 
    href: "https://wa.me/79610195064", 
    color: "#25D366", 
    label: "واتساب",
    description: "تواصل مباشر"
  },
  { 
    icon: FaYoutube, 
    href: "https://youtube.com/@OnRequest_dev", 
    color: "#FF0000", 
    label: "يوتيوب",
    description: "مقاطع تعليمية"
  },
  { 
    icon: FaInstagram, 
    href: "https://www.instagram.com/onrequest.dev", 
    color: "#E4405F", 
    label: "انستغرام",
    description: "آخر التحديثات"
  },
]

// ==========================================
// خدمات OnRequest
// ==========================================
const services = [
  { icon: Globe, title: "مواقع ويب", description: "مواقع احترافية متكاملة" },
  { icon: Smartphone, title: "تطبيقات جوال", description: "iOS و Android" },
  { icon: Palette, title: "تصميم UI/UX", description: "تجربة مستخدم مميزة" },
  { icon: Server, title: "أنظمة متكاملة", description: "حلول برمجية مخصصة" },
]

// ==========================================
// المكون الرئيسي
// ==========================================
export function OnRequestAbout() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-[#0D1B30] to-[#0A1628]" id="about">
      {/* خلفيات متوهجة */}
      <div className="absolute top-0 right-0 w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-yellow-500/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* ========== Header ========== */}
        <div className="text-center mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-yellow-500/10 rounded-full px-4 py-1.5 mb-4 border border-yellow-500/20"
          >
            <Sparkles className="text-yellow-400 w-4 h-4" />
            <span className="text-yellow-400 text-sm font-medium">من نحن</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3"
          >
            <span className="bg-gradient-to-l from-yellow-400 to-yellow-200 bg-clip-text text-transparent">OnRequest</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-sm md:text-base max-w-xl mx-auto"
          >
            فريق متخصص في تطوير الحلول البرمجية وتصميم المواقع والتطبيقات
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ========== العمود الأيمن: عن الشركة ========== */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#0F1F35]/90 to-[#0A1628]/95 p-6 md:p-8 shadow-xl">
              {/* خط علوي */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />

              <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                نبذة <span className="text-yellow-400">عن الشركة</span>
              </h3>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                OnRequest هي شركة تقنية متخصصة في تطوير البرمجيات وتصميم الحلول الرقمية. 
                نقدم خدمات متكاملة تشمل تطوير مواقع الويب، تطبيقات الهاتف، وتصميم تجربة المستخدم.
              </p>

              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                نؤمن بأن التكنولوجيا يجب أن تخدم الإنسان ببساطة وفعالية. 
                مهمتنا هي تحويل أفكارك إلى واقع رقمي ينافس في السوق.
              </p>

              {/* إحصائيات */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { value: "15+", label: "مشروع منجز" },
                  { value: "3+", label: "سنوات خبرة" },
                  { value: "100%", label: "رضا العملاء" },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-lg md:text-xl font-bold bg-gradient-to-l from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-gray-500 text-[10px] md:text-xs mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* خدماتنا */}
              <div className="grid grid-cols-2 gap-2">
                {services.map((service, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/20 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-500/20 transition-colors">
                      <service.icon className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium">{service.title}</p>
                      <p className="text-gray-500 text-[10px] truncate">{service.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ========== العمود الأيسر: التواصل ========== */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#0F1F35]/90 to-[#0A1628]/95 p-6 md:p-8 shadow-xl h-full flex flex-col">
              {/* خط علوي */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />

              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                تواصل <span className="text-yellow-400">معنا</span>
              </h3>

              <p className="text-gray-400 text-sm mb-6">
                نحن هنا للإجابة على استفساراتك وتقديم الدعم
              </p>

              {/* روابط التواصل */}
              <div className="space-y-3 mb-6">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-3 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${social.color}15` }}
                    >
                      <social.icon className="w-5 h-5" style={{ color: social.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{social.label}</p>
                      <p className="text-gray-500 text-xs">{social.description}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 transition-colors flex-shrink-0" />
                  </motion.a>
                ))}
              </div>

              {/* معلومة إضافية */}
              <div className="mt-auto p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">فريق OnRequest</span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  فريقنا مستعد لمساعدتك في أي وقت. لا تتردد في التواصل معنا عبر أي من القنوات أعلاه.
                </p>
              </div>

              {/* زر الموقع */}
              <Link
                href="https://on-request.vercel.app/"
                target="_blank"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-400 font-medium text-sm transition-all duration-300 group"
              >
                <span>زيارة الموقع الرسمي</span>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}