// livedent/app/guide/page.tsx
'use client';

// import Image from 'next/image';
// import { motion, useInView } from 'framer-motion';
// import { useRef, useState } from 'react';
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
import { Placeholder } from '@/components/shared/Placeholder';

// // ==========================================
// // مكون القسم المتحرك
// // ==========================================
// const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, margin: "-50px" });
  
//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 30 }}
//       animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
//       transition={{ duration: 0.6, delay, ease: "easeOut" }}
//     >
//       {children}
//     </motion.div>
//   );
// };

// // ==========================================
// // بطاقة الميزة
// // ==========================================
// const FeatureItem = ({ icon: Icon, title, description, color = "yellow" }: any) => {
//   const colors: any = {
//     yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
//     blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
//     green: "bg-green-500/10 text-green-400 border-green-500/20",
//     purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
//   };

//   return (
//     <motion.div
//       whileHover={{ x: -5 }}
//       className="flex items-start gap-4 p-4 rounded-xl bg-[#0F1F35]/50 border border-white/5 hover:border-white/10 transition-all duration-300 cursor-default"
//     >
//       <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
//         <Icon size={20} />
//       </div>
//       <div>
//         <h4 className="text-white font-medium mb-1">{title}</h4>
//         <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
//       </div>
//     </motion.div>
//   );
// };

// // ==========================================
// // صندوق تنبيه/ملاحظة
// // ==========================================
// const NoteBox = ({ type = 'tip', children }: { type?: 'tip' | 'warning' | 'info'; children: React.ReactNode }) => {
//   const config = {
//     tip: { icon: Lightbulb, bg: 'bg-yellow-500/5', border: 'border-yellow-500/20', text: 'text-yellow-400', label: 'نصيحة' },
//     warning: { icon: AlertCircle, bg: 'bg-orange-500/5', border: 'border-orange-500/20', text: 'text-orange-400', label: 'تنبيه' },
//     info: { icon: CheckCircle2, bg: 'bg-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', label: 'معلومة' },
//   };

//   const { icon: Icon, bg, border, text, label } = config[type];

//   return (
//     <div className={`${bg} ${border} border rounded-xl p-4 flex items-start gap-3 my-4`}>
//       <Icon className={`${text} flex-shrink-0 mt-0.5`} size={18} />
//       <div>
//         <span className={`${text} text-sm font-medium block mb-1`}>{label}</span>
//         <div className="text-gray-300 text-sm">{children}</div>
//       </div>
//     </div>
//   );
// };

// // ==========================================
// // شريط التنقل
// // ==========================================
// const Navigation = () => {
//   const [isScrolled, setIsScrolled] = useState(false);

//   if (typeof window !== 'undefined') {
//     useState(() => {
//       const handleScroll = () => setIsScrolled(window.scrollY > 30);
//       window.addEventListener('scroll', handleScroll);
//       return () => window.removeEventListener('scroll', handleScroll);
//     });
//   }

//   return (
//     <motion.nav
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       transition={{ duration: 0.5 }}
//       className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//         isScrolled ? 'bg-[#0A1628]/95 backdrop-blur-md shadow-lg shadow-yellow-500/5' : 'bg-transparent'
//       }`}
//     >
//       <div className="max-w-6xl mx-auto px-4 sm:px-6">
//         <div className="flex items-center justify-between h-16">
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="flex items-center gap-2 cursor-pointer"
//             onClick={() => window.location.href = '/'}
//           >
//             <div className="relative w-8 h-8">
//               <Image src="/logo.png" alt="LiveDent" fill className="object-contain" />
//             </div>
//             <span className="text-xl font-bold text-white">LiveDent</span>
//             <span className="text-yellow-400 text-sm font-medium mr-2 bg-yellow-500/10 px-2 py-0.5 rounded-full">دليل المستخدم</span>
//           </motion.div>

//           <motion.a
//             href="/"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-2"
//           >
//             <ChevronLeft size={16} />
//             العودة للرئيسية
//           </motion.a>
//         </div>
//       </div>
//     </motion.nav>
//   );
// };

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
    <Placeholder title={''}/>
     );
}