// app/public/components/PatientPage.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import { toPng } from "html-to-image";
import {
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Download,
  Building2,
  Stethoscope,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  CalendarDays,
} from "lucide-react";
import { Clinic, Patient, Session } from "@/types";
import { PatientToothChart } from "./PatientToothChart";

// ============================================================
// تنسيق آلتاريخ مع اسم اليوم
// ============================================================
const formatDateWithDay = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const days = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  const dayName = days[d.getDay()];

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const formattedDate = `${year}/${month}/${day}`;

  return { dayName, formattedDate };
};

// ============================================================
// تنسيق الوقت
// ============================================================
const formatTime = (date: Date | string | null | undefined) => {
  if (!date) return "غير محدد";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "غير محدد";
  return d.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ============================================================
// بطاقة الحالة
// ============================================================
const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    completed: {
      icon: CheckCircle2,
      text: "مكتمل",
      color: "#10b981",
      bg: "#d1fae5",
    },
    scheduled: {
      icon: Calendar,
      text: "مجدول",
      color: "#3b82f6",
      bg: "#dbeafe",
    },
    "no-show": {
      icon: XCircle,
      text: "لم يحضر",
      color: "#ef4444",
      bg: "#fee2e2",
    },
    cancelled: {
      icon: XCircle,
      text: "ملغي",
      color: "#ef4444",
      bg: "#fee2e2",
    },
  };

  const {
    icon: Icon,
    text,
    color,
    bg,
  } = config[status as keyof typeof config] || config.scheduled;

  return (
    <div
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: bg, color }}
    >
      <Icon size={12} />
      <span>{text}</span>
    </div>
  );
};

// ============================================================
// بطاقة الدفع
// ============================================================
const PaymentBadge = ({ isPaid }: { isPaid: boolean }) => {
  if (isPaid) {
    return (
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
        <CheckCircle2 size={11} />
        <span>مدفوع</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200">
      <AlertCircle size={11} />
      <span>غير مدفوع</span>
    </div>
  );
};

// ============================================================
// الأقسام (التبويبات)
// ============================================================
type TabType = "appointments" | "chart";

// ============================================================
// Props
// ============================================================
interface PatientPageProps {
  clinic: Clinic;
  patient: Patient;
  sessions: Session[];
}

// ============================================================
// المكون الرئيسي
// ============================================================
export default function PatientPage({
  clinic,
  patient,
  sessions,
}: PatientPageProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("appointments");

  const primaryColor = clinic.settings.primaryColor;
  const secondaryColor = clinic.settings.secondaryColor;

  // ============================================================
  // معالجة البيانات مرة واحدة فقط (useMemo)
  // ============================================================
  const now = new Date();

const processedSessions = useMemo(() => {
  const allSessions = [...sessions].sort(
    (a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  const scheduled = allSessions
    .filter((s) => s.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  const upcoming = scheduled.filter((s) => new Date(s.startTime) >= now);
  const pastScheduled = scheduled.filter((s) => new Date(s.startTime) < now);

  const completed = allSessions
    .filter((s) => s.status === "completed" || s.status === "no-show")
    .slice(0, 10);

  const totalAmount = allSessions
    .filter((s) => s.status !== "cancelled")
    .reduce((sum, s) => sum + (s.sessionCost || 0), 0);

  const totalPaid = allSessions
    .filter((s) => s.isPaid)
    .reduce((sum, s) => sum + (s.sessionCost || 0), 0);

  const remainingAmount = totalAmount - totalPaid;

  const latestSession = allSessions[0] || null;

  return {
    allSessions,
    scheduled,
    upcoming, // ← تأكد من وجود هذا
    pastScheduled,
    completed,
    totalAmount,
    totalPaid,
    remainingAmount,
    latestSession,
  };
}, [sessions]);

  // ============================================================
  // تحميل الكرت كصورة
  // ============================================================
  const downloadCard = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `${patient.fullName}-card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading card:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // ============================================================
  // مكون التبويب
  // ============================================================
  const TabButton = ({
    tab,
    icon: Icon,
    label,
  }: {
    tab: TabType;
    icon: any;
    label: string;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`
        flex-1 flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-medium text-sm transition-all duration-300
        ${
          activeTab === tab
            ? "text-white shadow-lg"
            : "text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-50"
        }
      `}
      style={
        activeTab === tab
          ? {
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }
          : {}
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6"
      dir="rtl"
    >
      <div className="max-w-md lg:max-w-4xl xl:max-w-5xl mx-auto">
        {/* ============================================================ */}
        {/* Header مع الأزرار */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap"
        >
          {/* زر التحميل */}
          <button
            onClick={downloadCard}
            disabled={isDownloading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 sm:py-3.5 px-4 sm:px-6 rounded-2xl font-medium text-white shadow-lg transition-all disabled:opacity-50 hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Download size={18} className="sm:w-5 sm:h-5" />
            <span>{isDownloading ? "جاري التحميل..." : "تحميل الكرت"}</span>
          </button>

          {/* روابط خارجية */}
          <Link
            href={`/public-clinic/${clinic.id}`}
            className="p-3 sm:p-3.5 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <Building2 size={18} className="sm:w-5 sm:h-5" style={{ color: primaryColor }} />
          </Link>

          <Link
            href={`/public-clinic/${clinic.id}/doctor-cv`}
            className="p-3 sm:p-3.5 rounded-2xl bg-white shadow-md hover:shadow-lg transition-all border border-gray-100"
          >
            <Stethoscope size={18} className="sm:w-5 sm:h-5" style={{ color: primaryColor }} />
          </Link>
        </motion.div>

        {/* ============================================================ */}
        {/* الكرت الرئيسي */}
        {/* ============================================================ */}
        <div
          ref={cardRef}
          className="relative bg-white rounded-3xl overflow-hidden shadow-2xl mb-4 sm:mb-6"
          style={{
            boxShadow: `0 25px 50px -12px ${primaryColor}20`,
          }}
        >
          {/* ============================================================ */}
          {/* Header - العيادة والمريض */}
          {/* ============================================================ */}
          <div className="relative z-10">
            {/* العيادة */}
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
              <div className="flex items-start gap-3 sm:gap-4">
                {clinic.logo ? (
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-100 flex-shrink-0">
                    <Image
                      src={clinic.logo}
                      alt={clinic.name}
                      fill
                      className="object-contain p-3"
                    />
                  </div>
                ) : (
                  <div
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    }}
                  >
                    <Building2 size={28} className="sm:w-8 sm:h-8 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-3 sm:mt-4 truncate">
                    {clinic.name}
                  </h2>
                </div>
              </div>
            </div>

            {/* المريض */}
            <div className="px-4 sm:px-6 pb-3 sm:pb-4">
              <div
                className="p-4 sm:p-5 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}05 100%)`,
                  border: `1px solid ${primaryColor}15`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                      {patient.fullName}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <span className="flex items-center gap-1.5 sm:gap-2">
                          <Phone size={14} className="sm:w-4 sm:h-4" style={{ color: primaryColor }} />
                          <span className="text-gray-600">رقم الهاتف:</span>
                        </span>
                        <span className="font-medium text-gray-900" dir="ltr">
                          {patient.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <span className="flex items-center gap-1.5 sm:gap-2">
                          <User size={14} className="sm:w-4 sm:h-4" style={{ color: primaryColor }} />
                          <span className="text-gray-600">المعلومات الشخصية:</span>
                        </span>
                        <span className="font-medium text-gray-900">
                          {patient.gender === "male" ? "ذكر" : "أنثى"} · {patient.age} سنة
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* ============================================================ */}
            {/* أزرار التبويب */}
            {/* ============================================================ */}
            <div className="px-4 sm:px-6 pb-2">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <TabButton tab="appointments" icon={CalendarDays} label="المواعيد" />
                <TabButton tab="chart" icon={LayoutGrid} label="الشارت السني" />
              </div>
            </div>

{/* ============================================================ */}
{/* محتوى التبويب */}
{/* ============================================================ */}
<div className="px-4 sm:px-6 pb-4 sm:pb-6">
  {/* تبويب المواعيد */}
  <div style={{ display: activeTab === "appointments" ? "block" : "none" }}>
    <motion.div
      key="appointments"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: activeTab === "appointments" ? 1 : 0, y: activeTab === "appointments" ? 0 : 10 }}
      transition={{ duration: 0.3 }}
    >
      <AppointmentsTab
        scheduled={processedSessions.scheduled}
        upcoming={processedSessions.upcoming}
        pastScheduled={processedSessions.pastScheduled}
        completed={processedSessions.completed}
        totalAmount={processedSessions.totalAmount}
        totalPaid={processedSessions.totalPaid}
        remainingAmount={processedSessions.remainingAmount}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        now={now}
      />
    </motion.div>
  </div>

  {/* تبويب الشارت - يبقى محملاً دائماً */}
  <div style={{ display: activeTab === "chart" ? "block" : "none" }}>
    <motion.div
      key="chart"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: activeTab === "chart" ? 1 : 0, y: activeTab === "chart" ? 0 : 10 }}
      transition={{ duration: 0.3 }}
    >
      <ChartTab
        patientId={patient.id}
        patientName={patient.fullName}
        primaryColor={primaryColor}
      />
    </motion.div>
  </div>
</div>

            {/* ============================================================ */}
            {/* تذييل */}
            {/* ============================================================ */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-center">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-gray-50">
                <p className="text-[10px] sm:text-xs text-gray-500">
                  LiveDent نتمنى لكم الشفاء العاجل
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                {clinic.name} © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* رسالة تلميح */}
        {/* ============================================================ */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-[10px] sm:text-xs text-gray-400"
        >
          يمكنك تحميل الكرت كصورة ومشاركته
        </motion.p>
      </div>
    </div>
  );
}

// ============================================================
// مكون تبويب المواعيد
// ============================================================
function AppointmentsTab({
  scheduled,
  upcoming,
  pastScheduled,
  completed,
  totalAmount,
  totalPaid,
  remainingAmount,
  primaryColor,
  secondaryColor,
  now,
}: {
  scheduled: Session[];
  upcoming: Session[];
  pastScheduled: Session[];
  completed: Session[];
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  primaryColor: string;
  secondaryColor: string;
  now: Date;
}) {
  return (
    <div className="space-y-4">
      {/* المواعيد المجدولة */}
      {scheduled.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" style={{ color: primaryColor }} />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-gray-800">
              المواعيد المجدولة ({scheduled.length}) يتوجب عليك حضورها
            </h4>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {scheduled.map((session, index) => {
              const sessionDate = formatDateWithDay(session.startTime);
              const isPast = new Date(session.startTime) < now;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 sm:p-4 rounded-xl border transition-all ${
                    isPast
                      ? "bg-gray-50/50 border-gray-200 opacity-75"
                      : "bg-white shadow-sm border-gray-100"
                  }`}
                  style={{
                    borderRight: `3px solid ${primaryColor}`,
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {session.plannedProcedure}
                        </span>
                        <StatusBadge status={session.status} />
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Calendar size={13} className="sm:w-3.5 sm:h-3.5" style={{ color: primaryColor }} />
                          <span className="text-gray-500">{sessionDate.dayName}</span>
                          <span className="text-gray-300">•</span>
                          <span className="font-medium text-gray-700">{sessionDate.formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                          <Clock size={13} className="sm:w-3.5 sm:h-3.5" style={{ color: primaryColor }} />
                          <span className="font-medium text-gray-700">{formatTime(session.startTime)}</span>
                        </div>
                      </div>

                      {session.toothNumber && session.toothNumber.length > 0 && (
                        <div className="mt-2 sm:mt-3 flex flex-wrap gap-1">
                          {session.toothNumber.map((tooth) => (
                            <span
                              key={tooth}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-xs"
                              style={{
                                backgroundColor: `${primaryColor}10`,
                                color: primaryColor,
                              }}
                            >
                              🦷 {tooth}
                            </span>
                          ))}
                        </div>
                      )}

                      {session.notes && (
                        <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-500 line-clamp-2">
                          📝 {session.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1">
                      <p className="text-base sm:text-lg font-bold" style={{ color: primaryColor }}>
                        {session.sessionCost.toLocaleString()}{" "}
                        <span className="text-[10px] sm:text-xs font-normal text-gray-600">$</span>
                      </p>
                      <PaymentBadge isPaid={session.isPaid} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {upcoming.length === 0 && scheduled.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-center">
              <p className="text-[10px] sm:text-xs text-amber-700">
                ⚠️ جميع المواعيد المجدولة قد فاتت، يرجى التواصل مع العيادة
              </p>
            </div>
          )}
        </div>
      )}

      {/* الجلسات السابقة */}
      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <CheckCircle2 size={16} className="sm:w-[18px] sm:h-[18px]" style={{ color: primaryColor }} />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-gray-800">
               المواعيد السابقة ({completed.length}) التي قمت بحضورها 
            </h4>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            {completed.map((session, index) => {
              const sessionDate = formatDateWithDay(session.startTime);
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-3 sm:p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {session.plannedProcedure}
                        </span>
                        <StatusBadge status={session.status} />
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-600 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="sm:w-3 sm:h-3" />
                          {sessionDate.dayName} {sessionDate.formattedDate}
                        </span>
                        {session.toothNumber && session.toothNumber.length > 0 && (
                          <span className="flex items-center gap-1">
                            <span>🦷</span>
                            {session.toothNumber.join("، ")}
                          </span>
                        )}
                      </div>
                      {session.performedProcedure && (
                        <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-600">
                          ✅ {session.performedProcedure}
                        </p>
                      )}
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1">
                      <p className="text-sm sm:text-base font-bold text-gray-900">
                        {session.sessionCost.toLocaleString()} $
                      </p>
                      <PaymentBadge isPaid={session.isPaid} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* الملخص المالي */}
      <div
        className="p-4 sm:p-5 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}10 0%, ${secondaryColor}05 100%)`,
          border: `1px solid ${primaryColor}20`,
        }}
      >
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <CreditCard size={18} className="sm:w-5 sm:h-5" style={{ color: primaryColor }} />
          <h4 className="font-bold text-gray-800 text-sm sm:text-base">الملخص المالي</h4>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600 text-xs sm:text-sm">إجمالي التكاليف</span>
            <span className="font-bold text-gray-900 text-base sm:text-lg">
              {totalAmount.toLocaleString()} $
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-600 text-xs sm:text-sm">المبلغ المدفوع</span>
            <span className="font-bold text-emerald-600 text-base sm:text-lg">
              {totalPaid.toLocaleString()} $
            </span>
          </div>
          <div className="relative my-1 sm:my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-gray-300"></div>
            </div>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="font-medium text-gray-800 text-xs sm:text-sm">المبلغ المتبقي</span>
            <span
              className={`font-bold text-lg sm:text-xl ${
                remainingAmount > 0 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              {remainingAmount.toLocaleString()} $
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// مكون تبويب الشارت السني
// ============================================================
function ChartTab({
  patientId,
  patientName,
  primaryColor,
}: {
  patientId: string;
  patientName: string;
  primaryColor: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <LayoutGrid size={16} className="sm:w-[18px] sm:h-[18px]" style={{ color: primaryColor }} />
        </div>
        <h4 className="text-sm sm:text-base font-bold text-gray-800">الشارت السني</h4>
      </div>
      <div className="bg-gray-50/50 rounded-2xl p-2 sm:p-4">
        <PatientToothChart
          patientId={patientId}
          patientName={patientName}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
}