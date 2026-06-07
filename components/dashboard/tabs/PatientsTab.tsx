// components/dashboard/tabs/PatientsTab.tsx
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  List,
  Users,
  Search,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Receipt,
  Banknote,
  CreditCard,
  Landmark,
  Wallet,
  ArrowUpDown,
  RefreshCcw,
  Phone,
  User,
  Hash,
  Stethoscope,
  LayoutGrid,
  CalendarDays,
} from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { Clinic, Patient, PatientCase, Session } from "@/types";

// ============================================================================
// Types
// ============================================================================
type ViewMode = "day" | "month" | "all";
type ViewType = "table" | "calendar";

interface PatientsTabProps {
  clinicData: Clinic | null;
  patients: Patient[];
  patientCases: PatientCase[];
  sessions: Session[];
}

// ============================================================================
// Pure Utility Functions
// ============================================================================

const getDateString = (date: Date): string =>
  new Date(date).toISOString().split("T")[0];

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 6 ? 0 : -(day + 1);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function adjustColor(hex: string, percent: number): string {
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);
  R = Math.max(0, Math.min(255, R + percent));
  G = Math.max(0, Math.min(255, G + percent));
  B = Math.max(0, Math.min(255, B + percent));
  return (
    "#" +
    R.toString(16).padStart(2, "0") +
    G.toString(16).padStart(2, "0") +
    B.toString(16).padStart(2, "0")
  );
}

const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
};

const getDayName = (dateStr: string): string => {
  const days = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  return days[new Date(dateStr).getDay()];
};

const getShortDayName = (dateStr: string): string => {
  const days = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
  return days[new Date(dateStr).getDay()];
};

const formatTime = (date: Date): string =>
  new Date(date).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const normalizeSearchText = (value: string): string => {
  const arabicDigitMap: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/[ؤ]/g, "و")
    .replace(/[ئ]/g, "ي")
    .replace(/[٠١٢٣٤٥٦٧٨٩]/g, (digit) => arabicDigitMap[digit] || digit);
};

// ============================================================================
// Session Display Helpers
// ============================================================================

const getPaymentMethodDisplay = (session: Session) => {
  if (!session.isPaid)
    return {
      icon: XCircle,
      color: "#DC2626",
      bgColor: "#FEE2E2",
      label: "غير مدفوع",
    };
  switch (session.paymentMethod) {
    case "cash":
      return {
        icon: Banknote,
        color: "#059669",
        bgColor: "#D1FAE5",
        label: "نقداً",
      };
    case "card":
      return {
        icon: CreditCard,
        color: "#2563EB",
        bgColor: "#DBEAFE",
        label: "بطاقة",
      };
    case "transfer":
      return {
        icon: Landmark,
        color: "#7C3AED",
        bgColor: "#EDE9FE",
        label: "تحويل",
      };
    default:
      return {
        icon: Wallet,
        color: "#059669",
        bgColor: "#D1FAE5",
        label: "مدفوع",
      };
  }
};

const getSessionStatusDisplay = (status: string) => {
  switch (status) {
    case "scheduled":
      return {
        icon: Calendar,
        color: "#2563EB",
        bgColor: "#DBEAFE",
        label: "مجدول",
      };
    case "completed":
      return {
        icon: CheckCircle,
        color: "#059669",
        bgColor: "#D1FAE5",
        label: "مكتمل",
      };
    case "cancelled":
      return {
        icon: XCircle,
        color: "#6B7280",
        bgColor: "#F3F4F6",
        label: "ملغي",
      };
    case "no-show":
      return {
        icon: AlertCircle,
        color: "#EA580C",
        bgColor: "#FFEDD5",
        label: "لم يحضر",
      };
    case "in-progress":
      return {
        icon: Clock,
        color: "#D97706",
        bgColor: "#FEF3C7",
        label: "قيد التنفيذ",
      };
    default:
      return {
        icon: Clock,
        color: "#6B7280",
        bgColor: "#F3F4F6",
        label: status,
      };
  }
};

const getTimelineColor = (status: string): string =>
  getSessionStatusDisplay(status).color;

// ============================================================================
// Custom Hook: useIsMobile
// ============================================================================

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ============================================================================
// Custom Hook: useCurrentTimeIndicator
// ============================================================================

function useCurrentTimeIndicator() {
  const currentTimeRef = useRef<HTMLDivElement>(null);
  const [, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTimeTop = () => {
    const now = new Date();
    const startMinutes = now.getHours() * 60 + now.getMinutes();
    return Math.max(0, Math.min(660, startMinutes - 9 * 60));
  };

  return { currentTimeRef, getCurrentTimeTop };
}

// ============================================================================
// Component: PatientsHeader
// ============================================================================

interface PatientsHeaderProps {
  clinicName: string;
  clinicColor: string;
  periodTitle: string;
  onRefresh: () => void;
  onExport: () => void;
  viewMode: ViewMode;
  viewType: ViewType;
  onViewModeChange: (mode: ViewMode) => void;
}

function PatientsHeader({
  clinicName,
  clinicColor,
  periodTitle,
  onRefresh,
  onExport,
  viewMode,
  viewType,
  onViewModeChange,
}: PatientsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          جدول المرضى
          <span className="text-sm font-normal text-gray-500 mr-2">
            - {clinicName}
          </span>
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{periodTitle}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onRefresh}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg text-white transition-all hover:opacity-90 shadow-sm flex-1 sm:flex-none"
            style={{ backgroundColor: clinicColor }}
          >
            <RefreshCcw size={16} />
            <span className="font-medium text-sm">تحديث البيانات</span>
          </button>
          <button
            onClick={onExport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg text-white transition-all hover:opacity-90 shadow-sm flex-1 sm:flex-none"
            style={{ backgroundColor: clinicColor }}
          >
            <Download size={16} />
            <span className="font-medium text-sm">تحميل Excel</span>
          </button>
        </div>
        {viewType === "table" && (
          <div className="flex items-center bg-gray-100 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => onViewModeChange("all")}
              className={`flex-1 sm:flex-none px-3 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                viewMode === "all"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <List size={15} className="inline ml-1.5" />
              عرض الكل
            </button>
            <button
              onClick={() => onViewModeChange("month")}
              className={`flex-1 sm:flex-none px-3 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                viewMode === "month"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Calendar size={15} className="inline ml-1.5" />
              الشهر الحالي
            </button>
            <button
              onClick={() => onViewModeChange("day")}
              className={`flex-1 sm:flex-none px-3 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                viewMode === "day"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Calendar size={15} className="inline ml-1.5" />
              يوم محدد
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Component: PatientsStatsCards
// ============================================================================

interface PatientsStatsCardsProps {
  clinicColor: string;
  sessions: Session[];
}

function PatientsStatsCards({
  clinicColor,
  sessions,
}: PatientsStatsCardsProps) {
  const totalSessions = sessions.length;
  const totalCost = sessions.reduce((sum, s) => sum + (s.sessionCost || 0), 0);
  const paidCost = sessions
    .filter((s) => s.isPaid)
    .reduce((sum, s) => sum + (s.sessionCost || 0), 0);
  const unpaidCost = sessions
    .filter((s) => !s.isPaid)
    .reduce((sum, s) => sum + (s.sessionCost || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        clinicColor={clinicColor}
        icon={List}
        label="إجمالي الجلسات"
        value={totalSessions.toLocaleString()}
        iconBgClass=""
      />
      <StatCard
        clinicColor={clinicColor}
        icon={Receipt}
        label="إجمالي التكلفة"
        value={`${totalCost.toLocaleString()} $`}
        iconBgClass="bg-opacity-15"
        useClinicBg
      />
      <StatCard
        clinicColor={clinicColor}
        icon={CheckCircle}
        label="القيمة المدفوعة"
        value={`${paidCost.toLocaleString()} $`}
        iconBgClass="bg-[#D1FAE5]"
        iconColor="#059669"
        borderColor="border-green-100"
      />
      <StatCard
        clinicColor={clinicColor}
        icon={XCircle}
        label="القيمة غير المدفوعة"
        value={`${unpaidCost.toLocaleString()} $`}
        iconBgClass="bg-[#FEE2E2]"
        iconColor="#DC2626"
        borderColor="border-red-100"
      />
    </div>
  );
}

interface StatCardProps {
  clinicColor: string;
  icon: React.ElementType;
  label: string;
  value: string;
  iconBgClass: string;
  iconColor?: string;
  useClinicBg?: boolean;
  borderColor?: string;
}

function StatCard({
  clinicColor,
  icon: Icon,
  label,
  value,
  iconBgClass,
  iconColor,
  useClinicBg,
  borderColor,
}: StatCardProps) {
  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 bg-white rounded-xl shadow-sm border ${borderColor || "border-gray-100"} p-3 sm:px-5 sm:py-3`}
      style={{ backgroundColor: `${clinicColor}10` }}
    >
      <div
        className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${iconBgClass}`}
        style={
          useClinicBg ? { backgroundColor: `${clinicColor}15` } : undefined
        }
      >
        <Icon
          size={16}
          className="sm:size-[18px]"
          style={{ color: iconColor || clinicColor }}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-gray-900 mb-0.5 truncate">
          {label}
        </p>
        <p className="text-base sm:text-xl font-bold text-gray-800 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Component: PatientsToolbar
// ============================================================================

interface PatientsToolbarProps {
  clinicColor: string;
  viewType: ViewType;
  viewMode: ViewMode;
  selectedDate: string;
  availableDates: string[];
  searchTerm: string;
  sortOrder: "asc" | "desc";
  onDateChange: (date: string) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onSearchChange: (term: string) => void;
  onSearchClear: () => void;
  onSortToggle: (checked: boolean) => void;
  onViewTypeChange: (type: ViewType) => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

function PatientsToolbar({
  clinicColor,
  viewType,
  viewMode,
  selectedDate,
  availableDates,
  searchTerm,
  sortOrder,
  onDateChange,
  onPreviousDay,
  onNextDay,
  onSearchChange,
  onSearchClear,
  onSortToggle,
  onViewTypeChange,
  canGoPrevious,
  canGoNext,
}: PatientsToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Day navigation */}
        {viewType === "table" && viewMode === "day" && (
          <div className="flex items-center gap-1 flex-1 md:flex-none">
            <button
              onClick={onPreviousDay}
              disabled={!canGoPrevious}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: clinicColor }}
            >
              <ChevronRight size={16} />
            </button>
            <div className="relative flex-1 md:min-w-[180px]">
              <select
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 md:py-2 pr-7 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer"
                style={
                  {
                    "--tw-ring-color": clinicColor,
                    direction: "rtl",
                  } as React.CSSProperties
                }
              >
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {getDayName(date)} - {formatDisplayDate(date)}
                  </option>
                ))}
              </select>
              <Calendar
                size={13}
                className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>
            <button
              onClick={onNextDay}
              disabled={!canGoNext}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: clinicColor }}
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}

        {/* Sort toggle */}
        {viewType === "table" && (
          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2.5 md:py-2 flex-shrink-0">
            <ArrowUpDown size={14} className="text-gray-400" />
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-600 whitespace-nowrap">
                الأقدم أولاً
              </span>
              <input
                type="checkbox"
                checked={sortOrder === "asc"}
                onChange={(e) => onSortToggle(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                style={{ accentColor: clinicColor }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full md:flex-1">
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="البحث عن اسم المريض..."
          className="w-full pr-9 pl-9 py-2.5 md:py-2 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
          style={
            {
              "--tw-ring-color": clinicColor,
              boxShadow: "none",
            } as React.CSSProperties
          }
        />
        {searchTerm && (
          <button
            onClick={onSearchClear}
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* View type switcher */}
      <div className="flex items-center gap-2 md:border-r md:border-gray-200 md:pr-3">
        <div className="flex items-center bg-gray-100 rounded-full p-0.5">
          <button
            onClick={() => onViewTypeChange("table")}
            className={`p-1.5 rounded-full transition ${
              viewType === "table"
                ? "text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            style={viewType === "table" ? { backgroundColor: clinicColor } : {}}
            title="عرض جدولي"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onViewTypeChange("calendar")}
            className={`p-1.5 rounded-full transition ${
              viewType === "calendar"
                ? "text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            style={
              viewType === "calendar" ? { backgroundColor: clinicColor } : {}
            }
            title="عرض تقويم"
          >
            <CalendarDays size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component: EmptyState
// ============================================================================

interface EmptyStateProps {
  searchTerm: string;
  viewMode: ViewMode;
}

function EmptyState({ searchTerm, viewMode }: EmptyStateProps) {
  return (
    <div className="py-12 text-center">
      <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
        {searchTerm ? (
          <Search size={32} className="text-gray-400" />
        ) : (
          <Calendar size={32} className="text-gray-400" />
        )}
      </div>
      <p className="text-sm text-gray-500">
        {searchTerm
          ? "لا توجد نتائج للبحث"
          : viewMode === "month"
            ? "لا توجد جلسات في هذا الشهر"
            : "لا توجد جلسات مجدولة"}
      </p>
    </div>
  );
}

// ============================================================================
// Component: TableFooter
// ============================================================================

interface TableFooterProps {
  sessionsCount: number;
  totalCost: number;
}

function TableFooter({ sessionsCount, totalCost }: TableFooterProps) {
  return (
    <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-2.5">
      <div className="flex justify-between items-center text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-400" />
          <span>
            عدد الجلسات:{" "}
            <span className="font-bold text-gray-800">{sessionsCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Receipt size={14} className="text-gray-400" />
          <span>
            إجمالي التكلفة:{" "}
            <span className="font-bold text-gray-800">
              {totalCost.toLocaleString()} $
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component: PatientsTable (Desktop + Mobile)
// ============================================================================

interface PatientsTableProps {
  sessions: Session[];
  sessionsWithMobileGroups: Array<
    { type: "group"; dateStr: string } | { type: "session"; session: Session }
  >;
  searchTerm: string;
  viewMode: ViewMode;
  isMobile: boolean;
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function PatientsTable({
  sessions,
  sessionsWithMobileGroups,
  searchTerm,
  viewMode,
  isMobile,
  getPatientData,
  onSessionSelect,
}: PatientsTableProps) {
  const totalCost = sessions.reduce((sum, s) => sum + (s.sessionCost || 0), 0);

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <EmptyState searchTerm={searchTerm} viewMode={viewMode} />
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-gray-50/80">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-0 w-1"></th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap">
                  اليوم والتاريخ
                </th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                  الاسم
                </th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap">
                  الرقم
                </th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell">
                  العمر
                </th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell">
                  الجنس
                </th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 max-w-xs">
                  الجلسة
                </th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap">
                  الوقت
                </th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap">
                  التكلفة
                </th>
                <th className="py-3 px-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                  الدفع
                </th>
                <th className="py-3 px-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <DesktopTableRow
                  key={session.id}
                  session={session}
                  getPatientData={getPatientData}
                />
              ))}
            </tbody>
          </table>
        </div>
        <TableFooter sessionsCount={sessions.length} totalCost={totalCost} />
      </div>

      {/* Mobile List */}
      <div className="md:hidden bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {sessionsWithMobileGroups.map((item, index) => {
          if (item.type === "group") {
            return (
              <div
                key={`m-group-${item.dateStr}`}
                className="bg-gray-50/80 px-4 py-2 text-xs font-bold text-gray-600 border-b"
              >
                {getDayName(item.dateStr)} - {formatDisplayDate(item.dateStr)}
              </div>
            );
          }
          return (
            <MobileListRow
              key={item.session.id}
              session={item.session}
              getPatientData={getPatientData}
              onSelect={onSessionSelect}
            />
          );
        })}
        <TableFooter sessionsCount={sessions.length} totalCost={totalCost} />
      </div>
    </>
  );
}

// ============================================================================
// Sub-component: DesktopTableRow
// ============================================================================

interface DesktopTableRowProps {
  session: Session;
  getPatientData: (patientId: string) => Patient | undefined;
}

function DesktopTableRow({ session, getPatientData }: DesktopTableRowProps) {
  const today = new Date();
  const dateStr = getDateString(session.startTime);
  const combinedDate = `${getDayName(dateStr)} ${formatDisplayDate(dateStr)}`;
  const patient = getPatientData(session.patientId);
  const genderArabic =
    patient?.gender === "male"
      ? "ذكر"
      : patient?.gender === "female"
        ? "أنثى"
        : "-";
  const paymentDisplay = getPaymentMethodDisplay(session);
  const statusDisplay = getSessionStatusDisplay(session.status);
  const PaymentIcon = paymentDisplay.icon;
  const StatusIcon = statusDisplay.icon;
  const timelineColor = getTimelineColor(session.status);
  const past = new Date(session.startTime) < today;

  return (
    <tr
      className={`border-b border-gray-100 hover:bg-gray-50/80 transition-colors ${
        past ? "bg-gray-50/40" : "bg-white"
      }`}
    >
      <td
        className="py-2.5 px-0 w-1"
        style={{ backgroundColor: timelineColor }}
      ></td>
      <td className="py-2.5 px-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
        {combinedDate}
      </td>
      <td className="py-2.5 px-3 text-xs md:text-sm text-gray-900 font-medium min-w-[120px]">
        {patient?.fullName || session.patientSnapshot?.name}
      </td>
      <td
        className="py-2.5 px-3 text-xs md:text-sm text-gray-600 whitespace-nowrap"
        dir="ltr"
      >
        {patient?.phone || session.patientSnapshot?.phone}
      </td>
      <td className="py-2.5 px-3 text-xs md:text-sm text-gray-700 whitespace-nowrap hidden sm:table-cell">
        {patient?.age || "-"}
      </td>
      <td className="py-2.5 px-3 text-xs md:text-sm text-gray-700 whitespace-nowrap hidden sm:table-cell">
        {genderArabic}
      </td>
      <td className="py-2.5 px-3 text-xs md:text-sm text-gray-700 max-w-[100px] md:max-w-xs">
        <span className="line-clamp-2">
          {session.plannedProcedure || session.performedProcedure || "-"}
        </span>
      </td>
      <td className="py-2.5 px-3 text-xs md:text-sm text-gray-600 whitespace-nowrap">
        {formatTime(session.startTime)}
      </td>
      <td className="py-2.5 px-3 text-xs md:text-sm font-bold whitespace-nowrap">
        <span style={{ color: session.isPaid ? "#059669" : "#DC2626" }}>
          {session.sessionCost?.toLocaleString()} $
        </span>
      </td>
      <td className="py-2.5 px-3 text-center">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: paymentDisplay.bgColor }}
          title={paymentDisplay.label}
        >
          <PaymentIcon size={14} style={{ color: paymentDisplay.color }} />
        </div>
      </td>
      <td className="py-2.5 px-3 text-center">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: statusDisplay.bgColor }}
          title={statusDisplay.label}
        >
          <StatusIcon size={14} style={{ color: statusDisplay.color }} />
        </div>
      </td>
    </tr>
  );
}

// ============================================================================
// Sub-component: MobileListRow
// ============================================================================

interface MobileListRowProps {
  session: Session;
  getPatientData: (patientId: string) => Patient | undefined;
  onSelect: (session: Session) => void;
}

function MobileListRow({
  session,
  getPatientData,
  onSelect,
}: MobileListRowProps) {
  const today = new Date();
  const dateStr = getDateString(session.startTime);
  const combinedDate = `${getDayName(dateStr)} ${formatDisplayDate(dateStr)}`;
  const timeStr = formatTime(session.startTime);
  const patient = getPatientData(session.patientId);
  const statusDisplay = getSessionStatusDisplay(session.status);
  const StatusIcon = statusDisplay.icon;
  const timelineColor = getTimelineColor(session.status);
  const past = new Date(session.startTime) < today;

  return (
    <div
      onClick={() => onSelect(session)}
      className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer active:bg-gray-50 transition-colors ${
        past ? "bg-gray-50/40" : "bg-white"
      }`}
    >
      <div
        className="w-1 self-stretch rounded-full"
        style={{ backgroundColor: timelineColor }}
      ></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {patient?.fullName || session.patientSnapshot?.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {combinedDate} · {timeStr}
        </p>
      </div>
      <div className="text-right">
        <p
          className="text-sm font-bold"
          style={{ color: session.isPaid ? "#059669" : "#DC2626" }}
        >
          {session.sessionCost?.toLocaleString()} $
        </p>
        <div className="mt-1 flex justify-end">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: statusDisplay.bgColor }}
            title={statusDisplay.label}
          >
            <StatusIcon size={12} style={{ color: statusDisplay.color }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Component: PatientsCalendar
// ============================================================================

interface PatientsCalendarProps {
  clinicColor: string;
  currentWeekStart: Date;
  weekDays: Date[];
  selectedCalendarDay: string;
  mobileCalendarSubView: "day" | "week";
  calendarWeekSessions: Session[];
  isMobile: boolean;
  today: Date;
  currentTimeRef: React.RefObject<HTMLDivElement>;
  getCurrentTimeTop: () => number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onTodayWeek: () => void;
  onCalendarDaySelect: (dateStr: string) => void;
  onMobileSubViewChange: (subView: "day" | "week") => void;
  onCalendarDayNavigate: (direction: "prev" | "next") => void;
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function PatientsCalendar({
  currentWeekStart,
  weekDays,
  selectedCalendarDay,
  mobileCalendarSubView,
  calendarWeekSessions,
  isMobile,
  today,
  currentTimeRef,
  getCurrentTimeTop,
  onPreviousWeek,
  onNextWeek,
  onTodayWeek,
  onCalendarDaySelect,
  onMobileSubViewChange,
  onCalendarDayNavigate,
  getPatientData,
  onSessionSelect,
}: PatientsCalendarProps) {
  const sessionsForCalendarDay = (dateStr: string) =>
    calendarWeekSessions.filter((s) => getDateString(s.startTime) === dateStr);

  if (!isMobile) {
    return (
      <DesktopCalendar
        currentWeekStart={currentWeekStart}
        weekDays={weekDays}
        calendarWeekSessions={calendarWeekSessions}
        currentTimeRef={currentTimeRef}
        getCurrentTimeTop={getCurrentTimeTop}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
        onTodayWeek={onTodayWeek}
        getPatientData={getPatientData}
        onSessionSelect={onSessionSelect}
      />
    );
  }

  return (
    <MobileCalendar
      selectedCalendarDay={selectedCalendarDay}
      mobileCalendarSubView={mobileCalendarSubView}
      weekDays={weekDays}
      calendarWeekSessions={calendarWeekSessions}
      today={today}
      currentTimeRef={currentTimeRef}
      getCurrentTimeTop={getCurrentTimeTop}
      sessionsForCalendarDay={sessionsForCalendarDay}
      onCalendarDaySelect={onCalendarDaySelect}
      onMobileSubViewChange={onMobileSubViewChange}
      onCalendarDayNavigate={onCalendarDayNavigate}
      onPreviousWeek={onPreviousWeek}
      onNextWeek={onNextWeek}
      onTodayWeek={onTodayWeek}
      getPatientData={getPatientData}
      onSessionSelect={onSessionSelect}
    />
  );
}

// ============================================================================
// Sub-component: DesktopCalendar
// ============================================================================

interface DesktopCalendarProps {
  currentWeekStart: Date;
  weekDays: Date[];
  calendarWeekSessions: Session[];
  currentTimeRef: React.RefObject<HTMLDivElement>;
  getCurrentTimeTop: () => number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onTodayWeek: () => void;
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function DesktopCalendar({
  weekDays,
  calendarWeekSessions,
  currentTimeRef,
  getCurrentTimeTop,
  onPreviousWeek,
  onNextWeek,
  onTodayWeek,
  getPatientData,
  onSessionSelect,
}: DesktopCalendarProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      dir="rtl"
    >
      {/* Week navigation header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/80">
        <button
          onClick={onPreviousWeek}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
        <h3 className="text-sm font-semibold text-gray-700">
          {weekDays[0].toLocaleDateString("ar-SA", {
            month: "short",
            day: "numeric",
          })}{" "}
          -{" "}
          {weekDays[5].toLocaleDateString("ar-SA", {
            month: "short",
            day: "numeric",
          })}
        </h3>
        <button
          onClick={onNextWeek}
          className="p-1.5 rounded-lg hover:bg-gray-200 transition"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <button
          onClick={onTodayWeek}
          className="text-xs px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition font-medium"
        >
          اليوم
        </button>
      </div>

      {/* Time grid */}
      <div className="relative overflow-auto" style={{ height: "660px" }}>
        <div
          className="relative"
          style={{
            width: "100%",
            height: "660px",
            display: "grid",
            gridTemplateColumns: "70px repeat(6, 1fr)",
            gridTemplateRows: "40px auto",
            direction: "rtl",
          }}
        >
          {/* Header row */}
          <div
            style={{
              gridColumn: "1 / 2",
              gridRow: "1",
              position: "sticky",
              top: 0,
              zIndex: 20,
              backgroundColor: "#f9fafb",
            }}
          ></div>
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center border-b border-gray-200 bg-gray-50/80 text-xs font-semibold text-gray-700"
              style={{
                gridColumn: `${idx + 2} / ${idx + 3}`,
                gridRow: "1",
              }}
            >
              <span>{getDayName(day.toISOString().split("T")[0])}</span>
              <span className="text-[10px] text-gray-500">
                {day.getDate()}/{day.getMonth() + 1}
              </span>
            </div>
          ))}

          {/* Time column */}
          <CalendarTimeColumn />

          {/* Day columns background grid */}
          {weekDays.map((day, dayIndex) => (
            <CalendarDayGrid key={`bg-${dayIndex}`} dayIndex={dayIndex} />
          ))}

          {/* Current time indicator */}
          <div
            ref={currentTimeRef}
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{
              top: `${getCurrentTimeTop()}px`,
              borderTop: "2px solid #EF4444",
            }}
          >
            <div className="absolute right-0 w-2.5 h-2.5 rounded-full bg-red-500 -translate-y-1/2 translate-x-1/2 shadow-sm" />
          </div>

          {/* Appointment cards */}
          <div
            className="absolute inset-0"
            style={{
              top: "40px",
              right: "70px",
              left: "0",
              zIndex: 5,
            }}
          >
            {weekDays.map((day, dayIndex) => {
              const dateStr = day.toISOString().split("T")[0];
              const daySessions = calendarWeekSessions.filter(
                (s) => getDateString(s.startTime) === dateStr,
              );
              const colWidth = `calc((100% - 0px) / 6)`;
              const left = `calc(${dayIndex} * ${colWidth})`;
              return daySessions.map((session) => (
                <CalendarAppointmentCard
                  key={session.id}
                  session={session}
                  left={left}
                  colWidth={colWidth}
                  getPatientData={getPatientData}
                  onClick={onSessionSelect}
                />
              ));
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-component: CalendarTimeColumn
// ============================================================================

function CalendarTimeColumn() {
  return (
    <div
      style={{
        gridColumn: "1 / 2",
        gridRow: "2",
        position: "relative",
        backgroundColor: "#ffffff",
        zIndex: 10,
      }}
    >
      {Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => (
        <div
          key={hour}
          className="absolute right-0 left-0 text-[10px] text-gray-500 pr-1 flex items-start border-t border-gray-200"
          style={{
            top: `${(hour - 9) * 60}px`,
            height: "60px",
            paddingTop: "2px",
          }}
        >
          {hour.toString().padStart(2, "0")}:00
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Sub-component: CalendarDayGrid
// ============================================================================

function CalendarDayGrid({ dayIndex }: { dayIndex: number }) {
  return (
    <div
      style={{
        gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`,
        gridRow: "2",
        position: "relative",
        borderRight: "1px solid #f3f4f6",
      }}
    >
      {Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => (
        <div
          key={hour}
          className="absolute left-0 right-0 border-t border-dashed border-gray-100"
          style={{ top: `${(hour - 9) * 60}px`, height: "0" }}
        />
      ))}
      {Array.from({ length: 11 }, (_, i) => i + 9).map((hour) => (
        <div
          key={`half-${hour}`}
          className="absolute left-0 right-0 border-t border-dotted border-gray-50"
          style={{
            top: `${(hour - 9) * 60 + 30}px`,
            height: "0",
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Sub-component: CalendarAppointmentCard
// ============================================================================

interface CalendarAppointmentCardProps {
  session: Session;
  left: string;
  colWidth: string;
  getPatientData: (patientId: string) => Patient | undefined;
  onClick: (session: Session) => void;
}

function CalendarAppointmentCard({
  session,
  left,
  colWidth,
  getPatientData,
  onClick,
}: CalendarAppointmentCardProps) {
  const start = new Date(session.startTime);
  const end = new Date(session.endTime || start);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const visibleStart = Math.max(startMinutes, 9 * 60);
  const visibleEnd = Math.min(endMinutes, 20 * 60);
  if (visibleEnd <= visibleStart) return null;

  const top = visibleStart - 9 * 60;
  const height = visibleEnd - visibleStart;
  const statusDisplay = getSessionStatusDisplay(session.status);
  const StatusIcon = statusDisplay.icon;
  const patient = getPatientData(session.patientId);

  return (
    <div
      onClick={() => onClick(session)}
      className="absolute rounded-lg cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 overflow-hidden"
      style={{
        left,
        top: `${top}px`,
        height: `${height}px`,
        width: `calc(${colWidth} - 8px)`,
        marginLeft: "4px",
        marginRight: "4px",
        backgroundColor: "white",
        borderRight: `3px solid ${statusDisplay.color}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        zIndex: 10,
        padding: "6px 8px",
      }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <StatusIcon
          size={12}
          style={{ color: statusDisplay.color }}
          className="flex-shrink-0"
        />
        <span
          className="text-xs font-semibold text-gray-800 truncate"
          style={{ fontSize: "11px" }}
        >
          {patient?.fullName || session.patientSnapshot?.name}
        </span>
      </div>
      <div
        className="text-[10px] text-gray-500 mb-0.5"
        style={{ fontSize: "10px" }}
      >
        {formatTime(start)} - {formatTime(end)}
      </div>
      <div
        className="text-[10px] text-gray-600 truncate"
        style={{ fontSize: "10px" }}
      >
        {session.plannedProcedure || session.performedProcedure || ""}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-component: MobileCalendar
// ============================================================================

interface MobileCalendarProps {
  selectedCalendarDay: string;
  mobileCalendarSubView: "day" | "week";
  weekDays: Date[];
  calendarWeekSessions: Session[];
  today: Date;
  currentTimeRef: React.RefObject<HTMLDivElement>;
  getCurrentTimeTop: () => number;
  sessionsForCalendarDay: (dateStr: string) => Session[];
  onCalendarDaySelect: (dateStr: string) => void;
  onMobileSubViewChange: (subView: "day" | "week") => void;
  onCalendarDayNavigate: (direction: "prev" | "next") => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onTodayWeek: () => void;
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function MobileCalendar({
  selectedCalendarDay,
  mobileCalendarSubView,
  weekDays,
  today,
  currentTimeRef,
  getCurrentTimeTop,
  sessionsForCalendarDay,
  onCalendarDaySelect,
  onMobileSubViewChange,
  onCalendarDayNavigate,
  onPreviousWeek,
  onNextWeek,
  onTodayWeek,
  getPatientData,
  onSessionSelect,
}: MobileCalendarProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      dir="rtl"
    >
      {/* Mobile sub-view switcher */}
      <div className="flex items-center gap-1 p-2 bg-gray-50/80 border-b border-gray-200">
        <button
          onClick={() => onMobileSubViewChange("day")}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition ${
            mobileCalendarSubView === "day"
              ? "bg-white shadow-sm text-gray-800"
              : "text-gray-500"
          }`}
        >
          عرض اليوم
        </button>
        <button
          onClick={() => onMobileSubViewChange("week")}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition ${
            mobileCalendarSubView === "week"
              ? "bg-white shadow-sm text-gray-800"
              : "text-gray-500"
          }`}
        >
          عرض الأسبوع
        </button>
      </div>

      {mobileCalendarSubView === "day" ? (
        <MobileDayView
          selectedCalendarDay={selectedCalendarDay}
          sessionsForCalendarDay={sessionsForCalendarDay}
          currentTimeRef={currentTimeRef}
          getCurrentTimeTop={getCurrentTimeTop}
          onCalendarDayNavigate={onCalendarDayNavigate}
          getPatientData={getPatientData}
          onSessionSelect={onSessionSelect}
        />
      ) : (
        <MobileWeekView
          selectedCalendarDay={selectedCalendarDay}
          weekDays={weekDays}
          today={today}
          currentTimeRef={currentTimeRef}
          getCurrentTimeTop={getCurrentTimeTop}
          sessionsForCalendarDay={sessionsForCalendarDay}
          onCalendarDaySelect={onCalendarDaySelect}
          onPreviousWeek={onPreviousWeek}
          onNextWeek={onNextWeek}
          onTodayWeek={onTodayWeek}
          getPatientData={getPatientData}
          onSessionSelect={onSessionSelect}
        />
      )}
    </div>
  );
}

// ============================================================================
// Sub-component: MobileDayView
// ============================================================================

interface MobileDayViewProps {
  selectedCalendarDay: string;
  sessionsForCalendarDay: (dateStr: string) => Session[];
  currentTimeRef: React.RefObject<HTMLDivElement>;
  getCurrentTimeTop: () => number;
  onCalendarDayNavigate: (direction: "prev" | "next") => void;
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function MobileDayView({
  selectedCalendarDay,
  sessionsForCalendarDay,
  currentTimeRef,
  getCurrentTimeTop,
  onCalendarDayNavigate,
  getPatientData,
  onSessionSelect,
}: MobileDayViewProps) {
  const daySessions = sessionsForCalendarDay(selectedCalendarDay);

  return (
    <>
      {/* Day navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => onCalendarDayNavigate("prev")}
          className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
        <h3 className="text-base font-bold text-gray-800">
          {getDayName(selectedCalendarDay)}{" "}
          {formatDisplayDate(selectedCalendarDay)}
        </h3>
        <button
          onClick={() => onCalendarDayNavigate("next")}
          className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Vertical time grid */}
      <div className="relative" style={{ height: "660px", overflow: "auto" }}>
        <div className="flex" style={{ height: "660px", position: "relative" }}>
          <MobileTimeColumn width={50} />
          <MobileAppointmentsArea
            sessions={daySessions}
            currentTimeRef={currentTimeRef}
            getCurrentTimeTop={getCurrentTimeTop}
            getPatientData={getPatientData}
            onSessionSelect={onSessionSelect}
          />
        </div>
      </div>

      {/* Sessions list (agenda) */}
      <MobileDayAgendaList
        sessions={daySessions}
        getPatientData={getPatientData}
        onSessionSelect={onSessionSelect}
      />
    </>
  );
}

// ============================================================================
// Sub-component: MobileWeekView
// ============================================================================

interface MobileWeekViewProps {
  selectedCalendarDay: string;
  weekDays: Date[];
  today: Date;
  currentTimeRef: React.RefObject<HTMLDivElement>;
  getCurrentTimeTop: () => number;
  sessionsForCalendarDay: (dateStr: string) => Session[];
  onCalendarDaySelect: (dateStr: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onTodayWeek: () => void;
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function MobileWeekView({
  selectedCalendarDay,
  weekDays,
  today,
  currentTimeRef,
  getCurrentTimeTop,
  sessionsForCalendarDay,
  onCalendarDaySelect,
  onPreviousWeek,
  onNextWeek,
  onTodayWeek,
  getPatientData,
  onSessionSelect,
}: MobileWeekViewProps) {
  const daySessions = sessionsForCalendarDay(selectedCalendarDay);

  return (
    <>
      {/* Week navigation with scrollable day pills */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={onPreviousWeek}
          className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-1.5 overflow-x-auto flex-1 scrollbar-hide">
          {weekDays.map((day) => {
            const dateStr = day.toISOString().split("T")[0];
            const isActive = dateStr === selectedCalendarDay;
            const isToday = dateStr === today.toISOString().split("T")[0];
            return (
              <button
                key={dateStr}
                onClick={() => onCalendarDaySelect(dateStr)}
                className={`flex-shrink-0 w-10 h-12 rounded-full flex flex-col items-center justify-center text-xs font-medium transition ${
                  isActive
                    ? "bg-gray-800 text-white shadow-sm"
                    : isToday
                      ? "bg-blue-50 text-blue-600 border border-blue-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}
              >
                <span className="text-[10px]">{getShortDayName(dateStr)}</span>
                <span className="text-xs font-bold">{day.getDate()}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={onNextWeek}
          className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        <button
          onClick={onTodayWeek}
          className="text-[10px] px-2 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition flex-shrink-0 font-medium"
        >
          اليوم
        </button>
      </div>

      {/* Time grid for selected day */}
      <div className="relative" style={{ height: "660px", overflow: "auto" }}>
        <div className="flex" style={{ height: "660px", position: "relative" }}>
          <MobileTimeColumn width={45} />
          <MobileAppointmentsArea
            sessions={daySessions}
            currentTimeRef={currentTimeRef}
            getCurrentTimeTop={getCurrentTimeTop}
            getPatientData={getPatientData}
            onSessionSelect={onSessionSelect}
          />
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Sub-component: MobileTimeColumn
// ============================================================================

function MobileTimeColumn({ width }: { width: number }) {
  return (
    <div
      className="flex-shrink-0 border-l border-gray-200"
      style={{ width: `${width}px`, position: "relative" }}
    >
      {Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => (
        <div
          key={hour}
          className="absolute right-0 left-0 text-[10px] text-gray-500 pr-1 flex items-start border-t border-gray-200"
          style={{
            top: `${(hour - 9) * 60}px`,
            height: "60px",
            paddingTop: "2px",
          }}
        >
          {hour.toString().padStart(2, "0")}:00
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Sub-component: MobileAppointmentsArea
// ============================================================================

interface MobileAppointmentsAreaProps {
  sessions: Session[];
  currentTimeRef: React.RefObject<HTMLDivElement>;
  getCurrentTimeTop: () => number;
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function MobileAppointmentsArea({
  sessions,
  currentTimeRef,
  getCurrentTimeTop,
  getPatientData,
  onSessionSelect,
}: MobileAppointmentsAreaProps) {
  return (
    <div className="flex-1 relative" style={{ position: "relative" }}>
      {/* Background grid */}
      {Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => (
        <div
          key={hour}
          className="absolute left-0 right-0 border-t border-dashed border-gray-100"
          style={{ top: `${(hour - 9) * 60}px`, height: "0" }}
        />
      ))}
      {Array.from({ length: 11 }, (_, i) => i + 9).map((hour) => (
        <div
          key={`half-${hour}`}
          className="absolute left-0 right-0 border-t border-dotted border-gray-50"
          style={{
            top: `${(hour - 9) * 60 + 30}px`,
            height: "0",
          }}
        />
      ))}

      {/* Current time indicator */}
      <div
        ref={currentTimeRef}
        className="absolute left-0 right-0 z-20 pointer-events-none"
        style={{
          top: `${getCurrentTimeTop()}px`,
          borderTop: "2px solid #EF4444",
        }}
      >
        <div className="absolute right-0 w-2.5 h-2.5 rounded-full bg-red-500 -translate-y-1/2 shadow-sm" />
      </div>

      {/* Appointments */}
      {sessions.map((session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime || start);
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();
        const visibleStart = Math.max(startMinutes, 9 * 60);
        const visibleEnd = Math.min(endMinutes, 20 * 60);
        if (visibleEnd <= visibleStart) return null;
        const top = visibleStart - 9 * 60;
        const height = visibleEnd - visibleStart;
        const statusDisplay = getSessionStatusDisplay(session.status);
        const StatusIcon = statusDisplay.icon;
        const patient = getPatientData(session.patientId);

        return (
          <div
            key={session.id}
            onClick={() => onSessionSelect(session)}
            className="absolute rounded-lg cursor-pointer active:scale-95 transition-transform overflow-hidden"
            style={{
              top: `${top}px`,
              height: `${height}px`,
              left: "8px",
              right: "8px",
              backgroundColor: "white",
              borderRight: `3px solid ${statusDisplay.color}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              zIndex: 10,
              padding: "6px 8px",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <StatusIcon
                size={12}
                style={{ color: statusDisplay.color }}
                className="flex-shrink-0"
              />
              <span
                className="text-xs font-semibold text-gray-800 truncate"
                style={{ fontSize: "12px" }}
              >
                {patient?.fullName || session.patientSnapshot?.name}
              </span>
            </div>
            <div
              className="text-[11px] text-gray-500 mb-0.5"
              style={{ fontSize: "11px" }}
            >
              {formatTime(start)} - {formatTime(end)}
            </div>
            <div
              className="text-[10px] text-gray-600 truncate"
              style={{ fontSize: "10px" }}
            >
              {session.plannedProcedure || session.performedProcedure || ""}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Sub-component: MobileDayAgendaList
// ============================================================================

interface MobileDayAgendaListProps {
  sessions: Session[];
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function MobileDayAgendaList({
  sessions,
  getPatientData,
  onSessionSelect,
}: MobileDayAgendaListProps) {
  if (sessions.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm border-t border-gray-100">
        لا توجد جلسات في هذا اليوم
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 max-h-[40vh] overflow-y-auto border-t border-gray-100">
      {sessions.map((session) => {
        const patient = getPatientData(session.patientId);
        const statusDisplay = getSessionStatusDisplay(session.status);
        const StatusIcon = statusDisplay.icon;
        return (
          <div
            key={session.id}
            onClick={() => onSessionSelect(session)}
            className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 cursor-pointer"
          >
            <div className="text-sm font-bold text-gray-700 w-16 flex-shrink-0">
              {formatTime(session.startTime)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {patient?.fullName || session.patientSnapshot?.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <StatusIcon size={12} style={{ color: statusDisplay.color }} />
                <span className="text-xs text-gray-500">
                  {statusDisplay.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Component: SessionDetailModal
// ============================================================================

interface SessionDetailModalProps {
  session: Session;
  getPatientData: (patientId: string) => Patient | undefined;
  onClose: () => void;
}

function SessionDetailModal({
  session,
  getPatientData,
  onClose,
}: SessionDetailModalProps) {
  const patient = getPatientData(session.patientId);
  const genderArabic =
    patient?.gender === "male"
      ? "ذكر"
      : patient?.gender === "female"
        ? "أنثى"
        : "-";
  const paymentDisplay = getPaymentMethodDisplay(session);
  const statusDisplay = getSessionStatusDisplay(session.status);
  const StatusIcon = statusDisplay.icon;
  const PaymentIcon = paymentDisplay.icon;
  const dateStr = getDateString(session.startTime);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Header */}
        <div className="relative p-4 pt-8 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute left-2 top-2 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
          <h3 className="text-lg font-bold text-gray-900 pr-2">
            {patient?.fullName || session.patientSnapshot?.name}
          </h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-sm">
          <ModalInfoRow icon={Calendar} label="التاريخ والوقت">
            {getDayName(dateStr)} {formatDisplayDate(dateStr)} ·{" "}
            {formatTime(session.startTime)}
          </ModalInfoRow>
          <ModalInfoRow icon={Phone} label="رقم الهاتف" dir="ltr">
            {patient?.phone || session.patientSnapshot?.phone || "-"}
          </ModalInfoRow>
          <ModalInfoRow icon={User} label="المعلومات الشخصية">
            {patient?.age || "-"} سنة · {genderArabic}
          </ModalInfoRow>
          <ModalInfoRow icon={Stethoscope} label="الإجراء">
            {session.plannedProcedure || session.performedProcedure || "-"}
          </ModalInfoRow>
          <ModalInfoRow
            icon={Hash}
            label="التكلفة"
            valueColor={session.isPaid ? "#059669" : "#DC2626"}
            bold
          >
            {session.sessionCost?.toLocaleString()} $
          </ModalInfoRow>

          {/* Status & Payment */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: statusDisplay.bgColor }}
              >
                <StatusIcon size={14} style={{ color: statusDisplay.color }} />
              </div>
              <span>{statusDisplay.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: paymentDisplay.bgColor }}
              >
                <PaymentIcon
                  size={14}
                  style={{ color: paymentDisplay.color }}
                />
              </div>
              <span>{paymentDisplay.label}</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-2 mb-4 mx-4 w-[calc(100%-2rem)] py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          إغلاق
        </button>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Sub-component: ModalInfoRow
// ============================================================================

interface ModalInfoRowProps {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  dir?: "rtl" | "ltr";
  valueColor?: string;
  bold?: boolean;
}

function ModalInfoRow({
  icon: Icon,
  children,
  dir,
  valueColor,
  bold,
}: ModalInfoRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-gray-400" />
      <span
        dir={dir}
        className={bold ? "font-bold" : ""}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {children}
      </span>
    </div>
  );
}

// ============================================================================
// Excel Export Utility
// ============================================================================

function exportSessionsToExcel(
  sessions: Session[],
  clinicName: string,
  clinicColor: string,
  periodTitle: string,
  getPatientData: (patientId: string) => Patient | undefined,
) {
  const primaryColor = clinicColor.replace("#", "");
  const wb = XLSX.utils.book_new();
  const excelData: any[][] = [];

  excelData.push([clinicName]);
  excelData.push([periodTitle]);
  excelData.push([
    "اليوم والتاريخ",
    "الاسم",
    "الرقم",
    "العمر",
    "الجنس",
    "الجلسة",
    "الوقت",
    "التكلفة",
    "الدفع",
    "الحالة",
  ]);

  sessions.forEach((session) => {
    const dateStr = getDateString(session.startTime);
    const combined = `${getDayName(dateStr)} ${formatDisplayDate(dateStr)}`;
    const patient = getPatientData(session.patientId);
    const genderArabic =
      patient?.gender === "male"
        ? "ذكر"
        : patient?.gender === "female"
          ? "أنثى"
          : "-";
    const paymentDisplay = getPaymentMethodDisplay(session);
    const statusDisplay = getSessionStatusDisplay(session.status);
    excelData.push([
      combined,
      patient?.fullName || session.patientSnapshot?.name || "-",
      patient?.phone || session.patientSnapshot?.phone || "-",
      patient?.age || "-",
      genderArabic,
      session.plannedProcedure || session.performedProcedure || "-",
      formatTime(session.startTime),
      session.sessionCost || 0,
      paymentDisplay.label,
      statusDisplay.label,
    ]);
  });

  const totalCost = sessions.reduce((sum, s) => sum + (s.sessionCost || 0), 0);
  const paidCount = sessions.filter((s) => s.isPaid).length;
  const unpaidCount = sessions.filter((s) => !s.isPaid).length;

  excelData.push([]);
  excelData.push(["", "", "", "", "", "", "", "", "الإجمالي:", totalCost, ""]);
  excelData.push(["", "", "", "", "", "", "", "", "مدفوع:", paidCount, "جلسة"]);
  excelData.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "غير مدفوع:",
    unpaidCount,
    "جلسة",
  ]);
  excelData.push([]);
  excelData.push([`تم إنشاء هذا الجدول بواسطة نظام LiveDent`]);

  const ws = XLSX.utils.aoa_to_sheet(excelData);

  if (!ws["!merges"]) ws["!merges"] = [];
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } });
  ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 9 } });
  ws["!merges"].push({
    s: { r: excelData.length - 1, c: 0 },
    e: { r: excelData.length - 1, c: 9 },
  });

  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:J1");
  const darkerColor = adjustColor(clinicColor, -30).replace("#", "");

  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) ws[cellAddress] = { t: "s", v: "" };
      if (!ws[cellAddress].s) ws[cellAddress].s = {};
      const cell = ws[cellAddress];
      const rowData = excelData[R];

      if (R === 0) {
        cell.s = {
          font: { bold: true, sz: 22, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: primaryColor }, patternType: "solid" },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thick", color: { rgb: primaryColor } },
            bottom: { style: "thick", color: { rgb: primaryColor } },
            left: { style: "thick", color: { rgb: primaryColor } },
            right: { style: "thick", color: { rgb: primaryColor } },
          },
        };
      } else if (R === 1) {
        cell.s = {
          font: { bold: true, sz: 13, color: { rgb: primaryColor } },
          fill: { fgColor: { rgb: "F8FAFC" }, patternType: "solid" },
          alignment: { horizontal: "center", vertical: "center" },
        };
      } else if (R === 2) {
        cell.s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: darkerColor }, patternType: "solid" },
          alignment: { horizontal: "center", vertical: "center" },
        };
      } else if (
        R > 2 &&
        rowData &&
        rowData[0] !== "" &&
        !rowData[8]?.toString().includes("الإجمالي") &&
        !rowData[8]?.toString().includes("مدفوع")
      ) {
        cell.s = {
          font: { sz: 11, color: { rgb: "1F2937" } },
          alignment: {
            horizontal: C === 2 ? "left" : "center",
            vertical: "center",
          },
        };
        if (C === 7) cell.s.font = { ...cell.s.font, bold: true };
        if (C === 8) {
          const pay = rowData[8];
          if (pay === "غير مدفوع")
            cell.s.font = { bold: true, color: { rgb: "DC2626" } };
          else if (pay === "نقداً")
            cell.s.font = { bold: true, color: { rgb: "059669" } };
          else if (pay === "بطاقة")
            cell.s.font = { bold: true, color: { rgb: "2563EB" } };
          else if (pay === "تحويل")
            cell.s.font = { bold: true, color: { rgb: "7C3AED" } };
        }
        if (C === 9) {
          const status = rowData[9];
          if (status === "مكتمل")
            cell.s.font = { bold: true, color: { rgb: "059669" } };
          else if (status === "مجدول")
            cell.s.font = { bold: true, color: { rgb: "2563EB" } };
          else if (status === "ملغي")
            cell.s.font = { bold: true, color: { rgb: "6B7280" } };
          else if (status === "لم يحضر")
            cell.s.font = { bold: true, color: { rgb: "EA580C" } };
          else if (status === "قيد التنفيذ")
            cell.s.font = { bold: true, color: { rgb: "D97706" } };
        }
      } else if (rowData && rowData[8] === "الإجمالي:") {
        cell.s = {
          font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: primaryColor }, patternType: "solid" },
          alignment: { horizontal: C === 8 ? "right" : "center" },
        };
      } else if (
        rowData &&
        (rowData[8] === "مدفوع:" || rowData[8] === "غير مدفوع:")
      ) {
        const isPaidRow = rowData[8] === "مدفوع:";
        cell.s = {
          font: {
            bold: true,
            sz: 12,
            color: { rgb: isPaidRow ? "059669" : "DC2626" },
          },
          fill: {
            fgColor: { rgb: isPaidRow ? "D1FAE5" : "FEE2E2" },
            patternType: "solid",
          },
        };
      } else if (R === excelData.length - 1) {
        cell.s = {
          font: { italic: true, sz: 10, color: { rgb: "6B7280" } },
        };
      }
    }
  }

  ws["!rows"] = [{ hpt: 45 }, { hpt: 30 }, { hpt: 35 }];
  for (let i = 3; i <= range.e.r; i++) ws["!rows"][i] = { hpt: 28 };
  ws["!cols"] = [
    { wch: 22 },
    { wch: 30 },
    { wch: 18 },
    { wch: 10 },
    { wch: 10 },
    { wch: 32 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
  ];
  ws["!rtl"] = true;

  XLSX.utils.book_append_sheet(wb, ws, "جدول المرضى");
  const fileName = `جدول_المرضى_${clinicName}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ============================================================================
// Main Component: PatientsTab
// ============================================================================

export function PatientsTab({
  clinicData,
  patients,
  patientCases,
  sessions,
}: PatientsTabProps) {
  const clinicColor = clinicData?.settings.primaryColor || "#8385da";
  const clinicName = clinicData?.name || "عيادة الأسنان";
  const today = new Date();

  // ---- State ----
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [viewType, setViewType] = useState<ViewType>("table");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    getStartOfWeek(today),
  );
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>(
    today.toISOString().split("T")[0],
  );
  const [mobileCalendarSubView, setMobileCalendarSubView] = useState<
    "day" | "week"
  >("day");

  const isMobile = useIsMobile();
  const { currentTimeRef, getCurrentTimeTop } = useCurrentTimeIndicator();

  // ---- Data helpers ----
  const getPatientData = (patientId: string) =>
    patients.find((p) => p.id === patientId);

  // ---- Memoized data ----
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, Session[]> = {};
    sessions.forEach((session) => {
      const dateKey = getDateString(session.startTime);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(session);
    });
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
    });
    return grouped;
  }, [sessions]);

  const allSessionsSorted = useMemo(() => {
    return [...sessions].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  }, [sessions]);

  const currentMonthSessions = useMemo(() => {
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    return allSessionsSorted.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return (
        sessionDate.getFullYear() === currentYear &&
        sessionDate.getMonth() === currentMonth
      );
    });
  }, [allSessionsSorted, today]);

  const filteredSessions = useMemo(() => {
    let base: Session[] = [];
    if (viewMode === "day") base = sessionsByDate[selectedDate] || [];
    else if (viewMode === "month") base = currentMonthSessions;
    else base = allSessionsSorted;

    if (!searchTerm.trim()) return base;

    const normalized = normalizeSearchText(searchTerm);
    return base.filter((session) => {
      const patient = getPatientData(session.patientId);
      const name = patient?.fullName || session.patientSnapshot?.name || "";
      return normalizeSearchText(name).includes(normalized);
    });
  }, [
    viewMode,
    selectedDate,
    sessionsByDate,
    currentMonthSessions,
    allSessionsSorted,
    searchTerm,
    patients,
  ]);

  const displayedSessions = useMemo(() => {
    const sorted = [...filteredSessions];
    sorted.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
    return sorted;
  }, [filteredSessions, sortOrder]);

  const sessionsWithMobileGroups = useMemo(() => {
    const result: Array<
      { type: "group"; dateStr: string } | { type: "session"; session: Session }
    > = [];
    let lastDate = "";
    displayedSessions.forEach((session) => {
      const dateStr = getDateString(session.startTime);
      if (dateStr !== lastDate) {
        result.push({ type: "group", dateStr });
        lastDate = dateStr;
      }
      result.push({ type: "session", session });
    });
    return result;
  }, [displayedSessions]);

  const availableDates = useMemo(
    () => Object.keys(sessionsByDate).sort((a, b) => b.localeCompare(a)),
    [sessionsByDate],
  );

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 6; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentWeekStart]);

  const calendarWeekSessions = useMemo(() => {
    if (viewType !== "calendar") return [];
    const start = new Date(currentWeekStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return sessions.filter((s) => {
      const time = new Date(s.startTime).getTime();
      return time >= start.getTime() && time <= end.getTime();
    });
  }, [sessions, currentWeekStart, viewType]);

  // ---- Navigation handlers ----
  const goToPreviousDay = () => {
    const idx = availableDates.indexOf(selectedDate);
    if (idx < availableDates.length - 1)
      setSelectedDate(availableDates[idx + 1]);
  };

  const goToNextDay = () => {
    const idx = availableDates.indexOf(selectedDate);
    if (idx > 0) setSelectedDate(availableDates[idx - 1]);
  };

  const goToPreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const goToTodayWeek = () => {
    setCurrentWeekStart(getStartOfWeek(today));
    setSelectedCalendarDay(today.toISOString().split("T")[0]);
  };

  // ---- Period title ----
  const getPeriodTitle = () => {
    if (viewType === "calendar") {
      const start = weekDays[0];
      const end = weekDays[5];
      return `${formatDisplayDate(start.toISOString().split("T")[0])} - ${formatDisplayDate(end.toISOString().split("T")[0])}`;
    }
    if (viewMode === "all") return "جميع الجلسات";
    if (viewMode === "month")
      return today.toLocaleDateString("ar-SA", {
        month: "long",
        year: "numeric",
      });
    return `${getDayName(selectedDate)} - ${formatDisplayDate(selectedDate)}`;
  };

  // ---- Excel export ----
  const handleExport = () => {
    exportSessionsToExcel(
      displayedSessions,
      clinicName,
      clinicColor,
      getPeriodTitle(),
      getPatientData,
    );
  };

  // ---- Calendar day navigation ----
  const handleCalendarDayNavigate = (direction: "prev" | "next") => {
    const current = new Date(selectedCalendarDay);
    current.setDate(current.getDate() + (direction === "next" ? 1 : -1));
    setSelectedCalendarDay(current.toISOString().split("T")[0]);
  };

  // ---- Current sessions for display ----
  const currentDisplayedSessions =
    viewType === "table" ? displayedSessions : calendarWeekSessions;

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="space-y-5 pb-20" dir="rtl">
      <PatientsHeader
        clinicName={clinicName}
        clinicColor={clinicColor}
        periodTitle={getPeriodTitle()}
        onRefresh={() =>
          window.dispatchEvent(new CustomEvent("refreshPatientsData"))
        }
        onExport={handleExport}
        viewMode={viewMode}
        viewType={viewType}
        onViewModeChange={setViewMode}
      />

      <PatientsStatsCards
        clinicColor={clinicColor}
        sessions={currentDisplayedSessions}
      />

      <PatientsToolbar
        clinicColor={clinicColor}
        viewType={viewType}
        viewMode={viewMode}
        selectedDate={selectedDate}
        availableDates={availableDates}
        searchTerm={searchTerm}
        sortOrder={sortOrder}
        onDateChange={setSelectedDate}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
        onSearchChange={setSearchTerm}
        onSearchClear={() => setSearchTerm("")}
        onSortToggle={(checked) => setSortOrder(checked ? "asc" : "desc")}
        onViewTypeChange={setViewType}
        canGoPrevious={
          availableDates.indexOf(selectedDate) < availableDates.length - 1
        }
        canGoNext={availableDates.indexOf(selectedDate) > 0}
      />

      {viewType === "table" ? (
        <PatientsTable
          sessions={displayedSessions}
          sessionsWithMobileGroups={sessionsWithMobileGroups}
          searchTerm={searchTerm}
          viewMode={viewMode}
          isMobile={isMobile}
          getPatientData={getPatientData}
          onSessionSelect={setSelectedSession}
        />
      ) : (
        <PatientsCalendar
          clinicColor={clinicColor}
          currentWeekStart={currentWeekStart}
          weekDays={weekDays}
          selectedCalendarDay={selectedCalendarDay}
          mobileCalendarSubView={mobileCalendarSubView}
          calendarWeekSessions={calendarWeekSessions}
          isMobile={isMobile}
          today={today}
          currentTimeRef={currentTimeRef}
          getCurrentTimeTop={getCurrentTimeTop}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onTodayWeek={goToTodayWeek}
          onCalendarDaySelect={setSelectedCalendarDay}
          onMobileSubViewChange={setMobileCalendarSubView}
          onCalendarDayNavigate={handleCalendarDayNavigate}
          getPatientData={getPatientData}
          onSessionSelect={setSelectedSession}
        />
      )}

      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          getPatientData={getPatientData}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
