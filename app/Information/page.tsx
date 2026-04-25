// livedent/app/guide/page.tsx
'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef, useState , useEffect} from 'react';
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
  Clock,
  Banknote,
  Paintbrush,
  Briefcase,
  Building2,
  MapPin,
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
// مكون خطوات سير العمل
// ==========================================
const WorkflowStep = ({ step, title, desc }: { step: string; title: string; desc: string }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="text-center p-4 rounded-xl bg-[#0A1628]/50 border border-white/5 hover:border-yellow-500/20 transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
        <span className="text-yellow-400 font-bold">{step}</span>
      </div>
      <h4 className="text-white font-medium mb-1">{title}</h4>
      <p className="text-gray-500 text-xs">{desc}</p>
    </motion.div>
  );
};

// ==========================================
// شريط التنقل
// ==========================================
const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // دالة معالج التمرير
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    // إضافة مستمع الحدث
    window.addEventListener('scroll', handleScroll);
    
    // دالة التنظيف: إزالة المستمع عند فك تحميل المكون
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // تمرير مصفوفة dependencies فارغة لتنفيذ التأثير مرة واحدة فقط عند التحميل
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
  // ميزات لوحة التحكم
  const dashboardFeatures = [
    { icon: Users, title: "إدارة شاملة للمرضى", description: "استعراض قائمة 'كافة المرضى' المسجلين، مع إمكانية عرض 'مرضى اليوم' بشكل مخصص لتنظيم المواعيد الحالية وتوفير الوقت.", color: "blue" },
    { icon: Search, title: "محرك بحث ذكي", description: "خاصية البحث السريع عن المريض من خلال الاسم أو رقم الهاتف، مما يضمن الوصول الفوري للملف المطلوب دون الحاجة للتنقل الطويل.", color: "yellow" },
    { icon: UserPlus, title: "تعديل البيانات وإضافة المرضى", description: "مرونة كاملة لإضافة مرضى جدد إلى النظام، أو تعديل البيانات الشخصية والطبية للمرضى الحاليين لضمان دقة السجلات.", color: "green" },
    { icon: ClipboardList, title: "توثيق الجلسات الطبية", description: "إضافة وتحديث الجلسات لكل مريض، مع إمكانية تسجيل نوع الإجراء الطبي، التوقيت، والتفاصيل المالية لكل جلسة، مما يوفر أرشفة رقمية دقيقة لتاريخ المريض العلاجي.", color: "purple" },
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
            <div className="mb-16">
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
                <div className="bg-gradient-to-br from-[#0F1F35]/50 to-[#0A1628]/50 rounded-2xl border border-white/5 p-6">
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    تتيح هذه النافذة المنبثقة للمستخدم تسجيل مريض جديد في النظام مع إمكانية جدولة أول زيارة له في خطوة واحدة، مما يقلل من الوقت والجهد الإداري.
                  </p>

                  <div className="space-y-4">
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

            {/* نافذة إضافة موعد جديد */}
            <div className="mb-16">
              <AnimatedSection delay={0.1}>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Calendar className="text-yellow-400" size={22} />
                  نافذة إضافة موعد جديد
                </h3>
                <p className="text-gray-400 text-sm mb-6 mr-9">
                  جدولة مراجعات المرضى بمرونة عالية وخيارات ذكية
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl mb-8 bg-[#0F1F35]/30"
                >
                  <Image
                    src="/Information/newdate.png"
                    alt="نافذة إضافة موعد جديد - LiveDent"
                    width={800}
                    height={600}
                    className="w-full h-auto max-w-2xl mx-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                    <span className="text-gray-300 text-xs">نافذة إضافة موعد جديد</span>
                  </div>
                </motion.div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="bg-gradient-to-br from-[#0F1F35]/50 to-[#0A1628]/50 rounded-2xl border border-white/5 p-6">
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    تتيح لك واجهة موعد جديد جدولة مراجعات المرضى بمرونة عالية، مع خيارات ذكية لتسريع عملية إدخال البيانات. إليك شرح لكيفية استخدامها بكفاءة:
                  </p>

                  <div className="space-y-4">
                    <div className="bg-[#0A1628]/50 rounded-xl p-5 border border-white/5">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Clock className="text-cyan-400" size={18} />
                        طريقة تحديد الموعد
                      </h4>
                      <p className="text-sm text-gray-400 mb-3">
                        تم تصميم هذه الواجهة لتوفر عليك عناء البحث في التقويم، حيث يمكنك الاختيار بين طريقتين:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">بعد عدة أيام (الخيار الأسرع):</span> بما أن أغلب المراجعات تتم خلال فترة قصيرة، يمكنك ببساطة إدخال عدد الأيام (من 1 إلى 10). سيقوم النظام تلقائياً بحساب التاريخ ومطابقته باليوم الفعلي.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">تاريخ محدد:</span> استخدم هذا الخيار إذا كانت الجلسة اليوم أو إذا كان موعد المراجعة بعيداً (أكثر من 10 أيام).</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-[#0A1628]/50 rounded-xl p-5 border border-white/5">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Briefcase className="text-purple-400" size={18} />
                        تفاصيل الموعد والإجراء الطبي
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">الوقت:</span> حدد الساعة الدقيقة للحضور لضمان عدم تضارب المواعيد في العيادة.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">الإجراء:</span> قم بكتابة نوع الخدمة الطبية المتوقعة (مثل: تنظيف أسنان، حشوة) لتجهيز الأدوات اللازمة مسبقاً.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">التكلفة المتوقعة:</span> ضع تقديراً لتكلفة الجلسة، مما يساعد في تنظيم الحسابات الأولية للمريض.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">ملاحظات إضافية:</span> أضف أي تفاصيل خاصة بالحالة، مثل تنبيهات طبية معينة أو توصيات.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <NoteBox type="tip">
                استخدام خيار بعد عدة أيام يضمن لك دقة عالية في ربط الموعد بأيام الأسبوع دون الحاجة لمراجعة نتيجة التقويم يدوياً.
              </NoteBox>
            </div>

            {/* نافذة تعديل الجلسة */}
            <div className="mb-16">
              <AnimatedSection delay={0.1}>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <ClipboardList className="text-yellow-400" size={22} />
                  نافذة تعديل الجلسة
                </h3>
                <p className="text-gray-400 text-sm mb-6 mr-9">
                  إدارة حالة الجلسة وتوثيق الإجراءات الطبية والمالية
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl mb-8 bg-[#0F1F35]/30"
                >
                  <Image
                    src="/Information/newedit.png"
                    alt="نافذة تعديل الجلسة - LiveDent"
                    width={800}
                    height={600}
                    className="w-full h-auto max-w-2xl mx-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                    <span className="text-gray-300 text-xs">نافذة تعديل الجلسة</span>
                  </div>
                </motion.div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="bg-gradient-to-br from-[#0F1F35]/50 to-[#0A1628]/50 rounded-2xl border border-white/5 p-6">
                  <div className="space-y-4">
                    <div className="bg-[#0A1628]/50 rounded-xl p-5 border border-white/5">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <AlertCircle className="text-orange-400" size={18} />
                        إدارة حالة الجلسة
                      </h4>
                      <p className="text-sm text-gray-400 mb-3">
                        تعتبر حالة الجلسة الجزء الأهم في الواجهة، حيث تتيح لك تصنيف حالة المريض وفقاً للمعايير التالية:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">مجدولة:</span> عندما يكون الموعد مستقبلياً وبانتظار حضور المريض.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">مكتملة:</span> تُستخدم عند إتمام الجلسة بنجاح، وشرط اختيارها هو استلام تكلفة الجلسة بالكامل.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">قيد التنفيذ:</span> في حال تم تنفيذ جزء من الإجراءات المقررة، مع تأجيل الجزء المتبقي لموعد آخر.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">لم يحضر:</span> إذا تخلف المريض عن الحضور دون أي اعتذار مسبق.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">ملغية:</span> كإجراء نهائي في حال تكرر غياب المريض عن مواعيده دون إخطار العيادة.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-[#0A1628]/50 rounded-xl p-5 border border-white/5">
                      <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                        <Banknote className="text-emerald-400" size={18} />
                        التكلفة والدفع
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">تكلفة الجلسة:</span> يتم إدخال المبلغ المستحق عن الجلسة الحالية.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400 mt-0.5">•</span>
                          <span><span className="text-gray-300 font-medium">تأكيد الدفع:</span> يجب تفعيل خيار-- تم دفع تكلفة-- الجلسة عند استلام المبلغ، مع تحديد طريقة الدفع (نقداً، بطاقة، أو تحويل بنكي).</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <NoteBox type="warning">
                في حال اعتذر المريض مسبقاً عن الموعد، لا تقم بتغيير الحالة إلى --ملغية--، بل ابقِها --مجدولة-- وقم فقط بتعديل التاريخ والوقت للموعد الجديد.
              </NoteBox>
            </div>
          </div>
        </section>

        {/* فاصل */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="border-t border-white/5" />
        </div>

        {/* القسم الثالث: إعدادات العيادة */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-yellow-400 font-bold text-sm">٣</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">إعدادات العيادة</h2>
                </div>
                <p className="text-gray-400 text-sm mr-11">
                  تخصيص الهوية البصرية وإدارة أوقات العمل
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl mb-8 bg-[#0F1F35]/30"
              >
                <Image
                  src="/Information/clin.png"
                  alt="صفحة معلومات العيادة - LiveDent"
                  width={1200}
                  height={675}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
                  <span className="text-gray-300 text-xs">صفحة معلومات العيادة</span>
                </div>
              </motion.div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="bg-gradient-to-br from-[#0F1F35]/50 to-[#0A1628]/50 rounded-2xl border border-white/5 p-6">
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  تُعد واجهة --معلومات العيادة-- المركز الرئيسي للتحكم في الهوية البصرية والتشغيلية لعيادتك. تتيح لك هذه الصفحة صياغة انطباع مهني واحترافي أمام المرضى.
                </p>

                <div className="space-y-4">
                  <div className="bg-[#0A1628]/50 rounded-xl p-5 border border-white/5">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Paintbrush className="text-pink-400" size={18} />
                      الهوية البصرية والمعلومات الأساسية
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span><span className="text-gray-300 font-medium">شعار العيادة (اللوغو):</span> رفع وتعديل الشعار الخاص بك ليظهر في كافة التقارير والواجهات.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span><span className="text-gray-300 font-medium">اسم العيادة والعنوان:</span> تحديد المسمى الرسمي وعنوان العيادة بالتفصيل.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span><span className="text-gray-300 font-medium">ألوان العيادة:</span> تخصيص اللون الأساسي واللون الثانوي لتطبيق الهوية البصرية على كامل النظام.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-[#0A1628]/50 rounded-xl p-5 border border-white/5">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Clock className="text-cyan-400" size={18} />
                      إدارة أوقات العمل (جدول الدوام)
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span><span className="text-gray-300 font-medium">تحديد الفترات:</span> ضبط ساعة البدء وساعة الانتهاء لكل يوم من أيام الأسبوع.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span><span className="text-gray-300 font-medium">أيام العطل:</span> تخصيص أيام معينة كأيام --مغلقة-- لمنع حجز المواعيد التلقائية فيها.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span><span className="text-gray-300 font-medium">مدة الموعد الافتراضية:</span> تحديد الوقت القياسي لكل جلسة لتنظيم تدفق المرضى.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <NoteBox type="info">
              تتميز الواجهة بخاصية التحديث الفوري؛ بمجرد إجراء أي تعديل على الألوان أو البيانات، ستظهر النتائج أمامك مباشرة، مما يضمن لك مراجعة الإجراءات قبل الاعتماد.
            </NoteBox>
          </div>
        </section>

        {/* فاصل */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="border-t border-white/5" />
        </div>

        {/* القسم الرابع: سير العمل اليومي */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <AnimatedSection>
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <span className="text-yellow-400 font-bold text-sm">٤</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">سير العمل اليومي</h2>
                </div>
                <p className="text-gray-400 text-sm mr-11">
                  خطوات بسيطة لإدارة يومك في العيادة بكفاءة
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bg-gradient-to-br from-[#0F1F35]/50 to-[#0A1628]/50 rounded-2xl border border-white/5 p-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <WorkflowStep step="١" title="تسجيل المريض" desc="أضف مريضاً جديداً أو ابحث عن مريض موجود" />
                  <WorkflowStep step="٢" title="جدولة الموعد" desc="حدد التاريخ والوقت المناسب للزيارة" />
                  <WorkflowStep step="٣" title="تنفيذ الجلسة" desc="وثق الإجراءات الطبية والتفاصيل المالية" />
                  <WorkflowStep step="٤" title="المتابعة" desc="راجع تاريخ المريض وجهز للزيارة القادمة" />
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