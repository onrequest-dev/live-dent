// livedent/app/guide/page.tsx
'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  ArrowRight,
  Search,
  UserPlus,
  Calendar,
  FileText,
  Users,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

// ==========================================
// مكون القسم المتحرك
// ==========================================
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

// ==========================================
// بطاقة الميزة
// ==========================================
const FeatureItem = ({ icon: Icon, title, description, color = "yellow" }: any) => {
  const colors: any = {
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <motion.div
      whileHover={{ x: -5 }}
      className="flex items-start gap-4 p-4 rounded-xl bg-[#0F1F35]/50 border border-white/5 hover:border-white/10 transition-all duration-300 cursor-default"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-white font-medium mb-1">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// ==========================================
// صندوق تنبيه/ملاحظة
// ==========================================
const NoteBox = ({ type = 'tip', children }: { type?: 'tip' | 'warning' | 'info'; children: React.ReactNode }) => {
  const config = {
    tip: { icon: Lightbulb, bg: 'bg-yellow-500/5', border: 'border-yellow-500/20', text: 'text-yellow-400', label: 'نصيحة' },
    warning: { icon: AlertCircle, bg: 'bg-orange-500/5', border: 'border-orange-500/20', text: 'text-orange-400', label: 'تنبيه' },
    info: { icon: CheckCircle2, bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', label: 'معلومة' },
  };

  const { icon: Icon, bg, border, text, label } = config[type];

  return (
    <div className={`${bg} ${border} border rounded-xl p-4 flex items-start gap-3 my-4`}>
      <Icon className={`${text} flex-shrink-0 mt-0.5`} size={18} />
      <div>
        <span className={`${text} text-sm font-medium block mb-1`}>{label}</span>
        <div className="text-gray-300 text-sm">{children}</div>
      </div>
    </div>
  );
};

// ==========================================
// شريط التنقل
// ==========================================
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  if (typeof window !== 'undefined') {
    useState(() => {
      const handleScroll = () => setIsScrolled(window.scrollY > 30);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    });
  }

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
            onClick={() => window.location.href = '/'}
          >
            <div className="relative w-8 h-8">
              <Image src="/logo.png" alt="LiveDent" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold text-white">LiveDent</span>
            <span className="text-yellow-400 text-sm font-medium mr-2 bg-yellow-500/10 px-2 py-0.5 rounded-full">دليل المستخدم</span>
          </motion.div>

          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            العودة للرئيسية
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
};

// ==========================================
// المكون الرئيسي
// ==========================================
export default function GuidePage() {
  const dashboardFeatures = [
    { icon: Users, title: "إدارة شاملة للمرضى", description: "استعراض قائمة 'كافة المرضى' المسجلين، مع إمكانية عرض 'مرضى اليوم' بشكل مخصص لتنظيم المواعيد الحالية وتوفير الوقت.", color: "blue" },
    { icon: Search, title: "محرك بحث ذكي", description: "خاصية البحث السريع عن المريض من خلال الاسم أو رقم الهاتف، مما يضمن الوصول الفوري للملف المطلوب دون الحاجة للتنقل الطويل.", color: "yellow" },
    { icon: UserPlus, title: "تعديل البيانات وإضافة المرضى", description: "مرونة كاملة لإضافة مرضى جدد إلى النظام، أو تعديل البيانات الشخصية والطبية للمرضى الحاليين لضمان دقة السجلات.", color: "green" },
    { icon: ClipboardList, title: "توثيق الجلسات الطبية", description: "إضافة وتحديث الجلسات لكل مريض، مع إمكانية تسجيل نوع الإجراء الطبي، التوقيت، والتفاصيل المالية لكل جلسة، مما يوفر أرشفة رقمية دقيقة لتاريخ المريض العلاجي.", color: "purple" },
  ];

  const addPatientFeatures = [
    { icon: FileText, title: "المعلومات الأساسية", description: "حقول جوهرية لتعريف المريض: الاسم الكامل، رقم الجوال، العمر، والجنس مع حقل مخصص للملاحظات." },
    { icon: Calendar, title: "جدولة الموعد الأولي المباشرة", description: "خاصية 'إضافة موعد أولي' يمكن تفعيلها اختيارياً عند تسجيل المريض لأول مرة، وتوفر طريقتين: تحديد تاريخ محدد أو بعد عدة أيام." },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] relative" dir="rtl">
      {/* تدرجات ذهبية في الزوايا */}
      <div className="absolute top-0 left-0 w-96 h-96 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(255, 215, 0, 0.08) 0%, rgba(255, 200, 0, 0.02) 40%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 100%, rgba(255, 215, 0, 0.08) 0%, rgba(255, 200, 0, 0.02) 40%, transparent 70%)' }} />

      <div className="relative z-10">
        <Navigation />

        {/* هيدر الصفحة */}
        <section className="pt-28 pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 rounded-full px-4 py-1.5 mb-4 border border-yellow-500/20">
                <Sparkles className="text-yellow-400" size={14} />
                <span className="text-yellow-400 text-sm font-medium">دليل الاستخدام</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                دليلك الشامل لاستخدام نظام <span className="text-yellow-400">LiveDent</span>
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
                تعرّف على كيفية إدارة عيادتك بكفاءة عالية من خلال هذا الدليل التفصيلي الذي يشرح جميع ميزات ووظائف النظام خطوة بخطوة
              </p>
            </motion.div>
          </div>
        </section>

        {/* القسم الأول: لوحة التحكم الرئيسية */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-yellow-400 font-bold text-sm">١</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">لوحة التحكم الرئيسية</h2>
                </div>
                <p className="text-gray-400 text-sm mr-11">
                  المركز الرئيسي الذي يربط بين مهام الاستقبال والمهام الطبية
                </p>
              </div>
            </AnimatedSection>

            {/* صورة لوحة التحكم */}
            <AnimatedSection delay={0.1}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl mb-8 bg-[#0F1F35]/30"
              >
                <Image
                  src="/Information/main.png"
                  alt="لوحة التحكم الرئيسية - LiveDent"
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                  <span className="text-gray-300 text-xs">لوحة التحكم الرئيسية</span>
                </div>
              </motion.div>
            </AnimatedSection>

            {/* شرح الميزات */}
            <AnimatedSection delay={0.2}>
              <div className="bg-gradient-to-br from-[#0F1F35]/50 to-[#0A1628]/50 rounded-2xl border border-white/5 p-6 mb-6">
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  تُقدم هذه الواجهة نظاماً متكاملاً لإدارة سجلات المرضى والعمليات اليومية داخل العيادة، حيث تركز على تسهيل الوصول للمعلومات وتنظيم سير العمل. تعتبر هذه الشاشة المركز الرئيسي الذي يربط بين مهام الاستقبال (من تنظيم مواعيد وبحث) والمهام الطبية (من توثيق إجراءات وجلسات).
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  {dashboardFeatures.map((feature, index) => (
                    <FeatureItem key={index} {...feature} />
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <NoteBox type="tip">
              يمكنك استخدام شريط البحث في الأعلى للوصول السريع إلى أي مريض باستخدام اسمه أو رقم هاتفه. هذه أسرع طريقة للتنقل في النظام.
            </NoteBox>
          </div>
        </section>

        {/* فاصل */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="border-t border-white/5" />
        </div>

        {/* القسم الثاني: النوافذ المنبثقة */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-yellow-400 font-bold text-sm">٢</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">النوافذ المنبثقة</h2>
                </div>
                <p className="text-gray-400 text-sm mr-11">
                  واجهات سريعة لإدخال البيانات وإدارة العمليات
                </p>
              </div>
            </AnimatedSection>

            {/* نافذة إضافة مريض */}
            <div className="mb-12">
              <AnimatedSection delay={0.1}>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <UserPlus className="text-yellow-400" size={22} />
                  نافذة إضافة مريض جديد
                </h3>
                <p className="text-gray-400 text-sm mb-6 mr-9">
                  واجهة مصممة بأسلوب بسيط يركز على الكفاءة وسرعة إدخال البيانات
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl mb-8 bg-[#0F1F35]/30"
                >
                  <Image
                    src="/Information/newp.png"
                    alt="نافذة إضافة مريض جديد - LiveDent"
                    width={800}
                    height={600}
                    className="w-full h-auto max-w-2xl mx-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                    <span className="text-gray-300 text-xs">نافذة إضافة مريض جديد</span>
                  </div>
                </motion.div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="bg-gradient-to-br from-[#0F1F35]/50 to-[#0A1628]/50 rounded-2xl border border-white/5 p-6 mb-6">
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    تتيح هذه النافذة المنبثقة للمستخدم تسجيل مريض جديد في النظام مع إمكانية جدولة أول زيارة له في خطوة واحدة، مما يقلل من الوقت والجهد الإداري.
                  </p>

                  <div className="space-y-4 mb-6">
                    {/* قسم المعلومات الأساسية */}
                    <div className="bg-[#0A1628]/50 rounded-xl p-5 border border-white/5">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <FileText className="text-blue-400" size={18} />
                        قسم المعلومات الأساسية
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          حقول تعريف المريض: <span className="text-gray-300">الاسم الكامل</span>، <span className="text-gray-300">رقم الجوال</span>، <span className="text-gray-300">العمر</span>، <span className="text-gray-300">الجنس</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          حقل مخصص لـ <span className="text-gray-300">الملاحظات</span> لإضافة أي معلومات طبية أو إدارية هامة قبل بدء المعالجة
                        </li>
                      </ul>
                    </div>

                    {/* قسم جدولة الموعد */}
                    <div className="bg-[#0A1628]/50 rounded-xl p-5 border border-white/5">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Calendar className="text-green-400" size={18} />
                        ميزة جدولة الموعد الأولي (المباشر)
                      </h4>
                      <p className="text-sm text-gray-400 mb-3">
                        تنفرد هذه الواجهة بخاصية <span className="text-yellow-400 font-medium">&quot;إضافة موعد أولي&quot;</span> التي يمكن تفعيلها اختيارياً عند تسجيل المريض لأول مرة، وتوفر طريقتين:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">تحديد تاريخ محدد:</span> لاختيار يوم ووقت بعينه</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">بعد عدة أيام:</span> خيار ذكي يتيح للنظام حساب تاريخ الموعد تلقائياً بناءً على عدد الأيام المدخلة</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <NoteBox type="info">
                هذه الخطوة تضمن عدم نسيان جدولة الموعد الأول للمرضى الجدد، مما يساهم في تحسين تنظيم تدفق المرضى داخل العيادة من اللحظة الأولى لتسجيلهم.
              </NoteBox>
            </div>
          </div>
        </section>

        {/* فاصل */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="border-t border-white/5" />
        </div>

        {/* القسم الثالث: ملخص سير العمل */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-yellow-400 font-bold text-sm">٣</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">سير العمل اليومي</h2>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bg-gradient-to-br from-[#0F1F35]/50 to-[#0A1628]/50 rounded-2xl border border-white/5 p-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { step: "١", title: "تسجيل المريض", desc: "أضف مريضاً جديداً أو ابحث عن مريض موجود" },
                    { step: "٢", title: "جدولة الموعد", desc: "حدد التاريخ والوقت المناسب للزيارة" },
                    { step: "٣", title: "تنفيذ الجلسة", desc: "وثق الإجراءات الطبية والتفاصيل المالية" },
                    { step: "٤", title: "المتابعة", desc: "راجع تاريخ المريض وجهز للزيارة القادمة" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -5 }}
                      className="text-center p-4 rounded-xl bg-[#0A1628]/50 border border-white/5 hover:border-yellow-500/20 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-yellow-400 font-bold">{item.step}</span>
                      </div>
                      <h4 className="text-white font-medium mb-1">{item.title}</h4>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* تذييل */}
        <footer className="border-t border-yellow-500/10 py-8 mt-8">
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