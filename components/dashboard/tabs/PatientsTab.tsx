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
  Filter,
} from "lucide-react";
import getCurrency from '@/client/helpers/getCurrency';
import * as XLSX from "xlsx-js-style";
import { Clinic, Patient, PatientCase, Session } from "@/types";
import React from "react";

// ============================================================================
// Types
// ============================================================================
type ViewMode = "day" | "month" | "all";
type ViewType = "table" | "calendar" | "agenda";

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

// components/dashboard/tabs/PatientsTab.tsx (تحديث PatientsHeader)

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

// ============================================================================
// Component: PatientsHeader - مبسط ونظيف
// ============================================================================

// ============================================================================
// Component: PatientsHeader - تصميم ذكي وموفر للمساحة
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
  totalSessions: number;
  totalCost: number;
  paidCost: number;
  unpaidCost: number;
  paymentFilter: "all" | "paid" | "unpaid";
  onPaymentFilterChange: (filter: "all" | "paid" | "unpaid") => void;
  handleViewTypeChange: (type: ViewType) => void;
  isMobile: boolean;
}

function PatientsHeader({
  clinicName,
  clinicColor,
  periodTitle,
  onRefresh,
  onExport,
  viewType,
  totalSessions,
  totalCost,
  paidCost,
  unpaidCost,
  paymentFilter,
  onPaymentFilterChange,
  handleViewTypeChange,
}: PatientsHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // إغلاق القائمة عند الضغط على Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    if (isMenuOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  // مكون كرت الإحصائية
  const StatCard = ({ 
    label, 
    value, 
    color, 
    isActive, 
    onClick 
  }: { 
    label: string; 
    value: number; 
    color: string; 
    isActive?: boolean; 
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center px-2 py-1.5 rounded-lg text-center
        transition-all duration-200 min-w-0
        ${onClick ? 'cursor-pointer hover:shadow-sm' : 'cursor-default'}
        ${isActive 
          ? 'bg-gray-100 ring-1 ring-gray-300' 
          : 'bg-white/80 hover:bg-gray-50'
        }
      `}
    >
      <span className="text-[10px] text-gray-500 truncate">{label}</span>
      <span className={`text-sm font-bold truncate`} style={{ color }}>
        {value.toLocaleString()}
        <span className="text-[10px] font-normal opacity-60 mr-0.5">{getCurrency()}</span>
      </span>
    </button>
  );

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* ============================================================ */}
      {/* الصف الأول: العنوان + أزرار التحكم                              */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between gap-3">
        {/* العنوان */}
        <div className="min-w-0 flex-1">
{/* العنوان */}
<div className="min-w-0 flex-1">
  {/* عنوان مبسط للموبايل */}
  <h1 className="sm:hidden text-base font-bold text-gray-800 truncate">
    المرضى
  </h1>
  
  {/* عنوان كامل للشاشات الكبيرة */}
  <h1 className="hidden sm:block text-base sm:text-lg font-bold text-gray-800 truncate">
    المرضى
    <span className="text-sm font-normal text-gray-500 mr-2">
      - {clinicName}
    </span>
  </h1>
  
  {/* الفترة - تظهر فقط على الشاشات الكبيرة */}
  <p className="hidden sm:block text-gray-400 text-xs mt-0.5 truncate">
    {periodTitle}
  </p>
</div>
        </div>

        {/* أزرار سطح المكتب */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <ViewTypeSwitcher
            clinicColor={clinicColor}
            viewType={viewType}
            onViewTypeChange={handleViewTypeChange}
          />
          
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium
                     hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: clinicColor }}
          >
            <RefreshCcw size={14} />
            <span>تحديث</span>
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-medium
                     hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: clinicColor }}
          >
            <Download size={14} />
            <span>Excel</span>
          </button>
        </div>

        {/* زر القائمة للموبايل (ثلاث نقاط) */}
        <div className="flex sm:hidden relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg active:bg-gray-200 transition-colors"
          >
            <div className="flex flex-col gap-1">
              <div className="w-1 h-1 rounded-full bg-gray-600" />
              <div className="w-1 h-1 rounded-full bg-gray-600" />
              <div className="w-1 h-1 rounded-full bg-gray-600" />
            </div>
          </button>

          {/* القائمة المنسدلة */}
          {isMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 overflow-hidden">
              <button
                onClick={() => { onRefresh(); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <RefreshCcw size={16} className="text-gray-500" />
                <span>تحديث البيانات</span>
              </button>
              <button
                onClick={() => { onExport(); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <Download size={16} className="text-gray-500" />
                <span>تصدير Excel</span>
              </button>
            </div>
          )}
        </div>
      </div>

{/* ============================================================ */}
{/* الصف الثاني: كروت الإحصائيات                                    */}
{/* ============================================================ */}

{/* نسخة الموبايل - 4 كروت في صفين */}
<div className="grid grid-cols-4 gap-1.5 sm:hidden">
  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 text-center border border-gray-100">
    <div className="text-[8px] text-gray-500">جلسات</div>
    <div className="text-[10px] font-bold text-gray-800 mt-0.5">
      {totalSessions}
    </div>
  </div>
  
  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 text-center border border-gray-100">
    <div className="text-[8px] text-gray-500">الإجمالي</div>
    <div className="text-[10px] font-bold text-gray-800 mt-0.5">
      {totalCost.toLocaleString()}
      <span className="text-[10px] font-normal text-gray-400 mr-0.5">{getCurrency()}</span>
    </div>
  </div>
  
  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 text-center border border-gray-100">
    <div className="text-[8px] text-teal-600">مدفوع</div>
    <div className="text-[10px] font-bold text-teal-600 mt-0.5">
      {paidCost.toLocaleString()}
      <span className="text-[10px] font-normal text-teal-400 mr-0.5">{getCurrency()}</span>
    </div>
  </div>
  
  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-2 text-center border border-gray-100">
    <div className="text-[8px] text-amber-600">متبقي</div>
    <div className="text-[10px] font-bold text-amber-600 mt-0.5">
      {unpaidCost.toLocaleString()}
      <span className="text-[10px] font-normal text-amber-400 mr-0.5">{getCurrency()}</span>
    </div>
  </div>
</div>

{/* نسخة سطح المكتب - كروت واضحة في صف واحد */}
<div className="hidden sm:flex items-center gap-2">
  <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-gray-200/60 shadow-sm">
    {/* كرت الجلسات */}
    <div className="flex items-center gap-2.5">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: clinicColor }} />
      <span className="text-sm text-gray-500">جلسات</span>
      <span className="text-base font-bold text-gray-800" dir="ltr">{totalSessions}</span>
    </div>
    
    <div className="w-px h-6 bg-gray-200" />
    
    {/* كرت الإجمالي */}
    <div className="flex items-center gap-2.5">
      <span className="text-sm text-gray-500">الإجمالي</span>
      <span className="text-base font-bold text-gray-800" dir="ltr">
        {totalCost.toLocaleString('en-US')}
        <span className="text-xs font-normal text-gray-400 ml-1">{getCurrency()}</span>
      </span>
    </div>
    
    <div className="w-px h-6 bg-gray-200" />
    
    {/* كرت المدفوع */}
    <div className="flex items-center gap-2.5">
      <span className="text-sm text-teal-600">مدفوع</span>
      <span className="text-base font-bold text-teal-600" dir="ltr">
        {paidCost.toLocaleString('en-US')}
        <span className="text-xs font-normal text-teal-400 ml-1">{getCurrency()}</span>
      </span>
    </div>
    
    <div className="w-px h-6 bg-gray-200" />
    
    {/* كرت المتبقي */}
    <div className="flex items-center gap-2.5">
      <span className="text-sm text-amber-600">متبقي</span>
      <span className="text-base font-bold text-amber-600" dir="ltr">
        {unpaidCost.toLocaleString('en-US')}
        <span className="text-xs font-normal text-amber-400 ml-1">{getCurrency()}</span>
      </span>
    </div>
  </div>
</div>

      </div>
  );
}// ============================================================================
// Component: PatientsStatsCards - مع دعم وضع التقويم
// ============================================================================

interface PatientsStatsCardsProps {
  clinicColor: string;
  sessions: Session[];
  paymentFilter: "all" | "paid" | "unpaid";
  onPaymentFilterChange: (filter: "all" | "paid" | "unpaid") => void;
  viewType: ViewType; // 🆕 لمعرفة ما إذا كنا في وضع التقويم
}

interface PatientsStatsBarProps {
  clinicColor: string;
  paymentFilter: "all" | "paid" | "unpaid";
  onPaymentFilterChange: (filter: "all" | "paid" | "unpaid") => void;
  paidSessionsCount: number;
  unpaidSessionsCount: number;
  viewType: string;
}

export function PatientsStatsBar({
  clinicColor,
  paymentFilter,
  onPaymentFilterChange,
  paidSessionsCount,
  unpaidSessionsCount,
  viewType,
}: PatientsStatsBarProps) {
  if (viewType === "calendar") return null;

  const totalCount = paidSessionsCount + unpaidSessionsCount;

  return (
    <div >

      
      {/* الكل */}
      {/* <button
        onClick={() => onPaymentFilterChange("all")}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
          ${
            paymentFilter === "all"
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
      >
        الكل {totalCount}
      </button> */}

      {/* مدفوع */}
      {/* <button
        onClick={() =>
          onPaymentFilterChange(paymentFilter === "paid" ? "all" : "paid")
        }
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
          ${
            paymentFilter === "paid"
              ? "bg-gray-100 text-green-800"
              : "text-green-600 hover:text-green-800 hover:bg-green-100"
          }`}
      >
        مدفوع {paidSessionsCount}
      </button> */}

      {/* غير مدفوع */}
      {/* <button
        onClick={() =>
          onPaymentFilterChange(paymentFilter === "unpaid" ? "all" : "unpaid")
        }
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
          ${
            paymentFilter === "unpaid"
              ? "bg-gray-100 text-red-800"
              : "text-red-600 hover:text-red-800 hover:bg-red-100"
          }`}
      >
        غير مدفوع {unpaidSessionsCount}
      </button> */}

      {/* زر المسح */}
      {/* {paymentFilter !== "all" && (
        <button
          onClick={() => onPaymentFilterChange("all")}
          className="p-1.5 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
        >
          <X size={12} />
        </button>
      )} */}
    </div>
  );
}

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
  onViewModeChange: (mode: ViewMode) => void;
  onViewTypeChange: (type: ViewType) => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isMobile: boolean;
  onRefresh: () => void;
  onExport: () => void;
  // 🆕 خصائص فلتر الدفع
  paymentFilter: "all" | "paid" | "unpaid";
  onPaymentFilterChange: (filter: "all" | "paid" | "unpaid") => void;
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
  onViewModeChange,
  onViewTypeChange,
  canGoPrevious,
  canGoNext,
  isMobile,
  onRefresh,
  onExport,
  paymentFilter,
  onPaymentFilterChange,
}: PatientsToolbarProps) {
  // حالة فتح/إغلاق قائمة الفلاتر
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isFilterOpen]);

  const isCalendarMode = viewType === "calendar";
  const isDayMode =
    viewMode === "day" && (viewType === "table" || viewType === "agenda");

  // 🆕 عدد الفلاتر النشطة
  const activeFiltersCount = [
    paymentFilter !== "all" ? 1 : 0,
    viewMode !== "all" ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

const FilterPopover = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);

  // التحقق من وجود تمرير في المحتوى
  useEffect(() => {
    if (isFilterOpen && contentRef.current) {
      const checkScroll = () => {
        if (contentRef.current) {
          setHasScroll(
            contentRef.current.scrollHeight > contentRef.current.clientHeight,
          );
        }
      };
      checkScroll();
      // استخدام ResizeObserver لمراقبة التغييرات
      const observer = new ResizeObserver(checkScroll);
      observer.observe(contentRef.current);
      return () => observer.disconnect();
    }
  }, [isFilterOpen]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    if (!isFilterOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  // إغلاق عند الضغط على Escape
  useEffect(() => {
    if (!isFilterOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFilterOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isFilterOpen]);

  // تنظيف timeout عند unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // فتح عند hover في سطح المكتب مع تأخير صغير
  const handleMouseEnter = () => {
    if (isMobile) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsFilterOpen(true);
    }, 150); // تأخير 150ms قبل الفتح
  };

  // إغلاق عند مغادرة hover مع تأخير للسماح بالعودة
  const handleMouseLeave = () => {
    if (isMobile) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsFilterOpen(false);
    }, 300); // تأخير 300ms قبل الإغلاق
  };

  // عدد الفلاتر النشطة
  const activeFiltersCount = [
    paymentFilter !== "all" ? 1 : 0,
    viewMode !== "all" ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  // معالج اختيار فترة زمنية
  const handleViewModeSelect = (mode: ViewMode) => {
    onViewModeChange(mode);
    // لا نغلق القائمة فوراً في سطح المكتب للسماح باختيارات متعددة
    if (isMobile) setIsFilterOpen(false);
  };

  // معالج اختيار حالة الدفع
  const handlePaymentFilterSelect = (filter: "all" | "paid" | "unpaid") => {
    onPaymentFilterChange(filter);
    if (isMobile) setIsFilterOpen(false);
  };

  // معالج اختيار الترتيب
  const handleSortSelect = (asc: boolean) => {
    onSortToggle(asc);
    if (isMobile) setIsFilterOpen(false);
  };

  // إعادة تعيين الفلاتر
  const handleResetFilters = () => {
    onViewModeChange("all");
    onPaymentFilterChange("all");
    setIsFilterOpen(false);
  };

  // محتوى الفلاتر
  const filterContent = (
    <>
      {/* رأس القائمة */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h4 className="text-sm font-bold text-gray-800">خيارات العرض</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFilterOpen(false);
          }}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="إغلاق"
        >
          <X size={14} className="text-gray-400" />
        </button>
      </div>

      {/* محتوى قابل للتمرير مع مؤشر */}
      <div
        ref={contentRef}
        className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50 pr-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#D1D5DB #F9FAFB",
        }}
      >
        {/* قسم الفترة الزمنية */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-500 mb-2 px-1">
            الفترة الزمنية
          </label>
          <div className="space-y-1">
            {[
              { value: "all", label: "عرض الكل", icon: List },
              { value: "month", label: "الشهر الحالي", icon: Calendar },
              { value: "day", label: "يوم محدد", icon: Calendar },
            ].map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewModeSelect(option.value as ViewMode);
                }}
                className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150
                    ${
                      viewMode === option.value
                        ? "bg-gray-100 text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }
                  `}
              >
                <option.icon size={16} className="flex-shrink-0" />
                <span>{option.label}</span>
                {viewMode === option.value && (
                  <CheckCircle
                    size={14}
                    className="mr-auto text-gray-800 flex-shrink-0"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* فاصل */}
        <div className="border-t border-gray-100 my-2" />

        {/* قسم حالة الدفع */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-500 mb-2 px-1">
            حالة الدفع
          </label>
          <div className="space-y-1">
            {[
              {
                value: "all",
                label: "الكل",
                icon: List,
                color: "#6B7280",
              },
              {
                value: "paid",
                label: "مدفوع",
                icon: CheckCircle,
                color: "#0D9488",
              },
              {
                value: "unpaid",
                label: "غير مدفوع",
                icon: XCircle,
                color: "#D97706",
              },
            ].map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePaymentFilterSelect(
                    option.value as "all" | "paid" | "unpaid",
                  );
                }}
                className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150
                    ${
                      paymentFilter === option.value
                        ? "bg-gray-100 text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }
                  `}
              >
                <option.icon
                  size={16}
                  className="flex-shrink-0"
                  style={{ color: option.color }}
                />
                <span>{option.label}</span>
                {paymentFilter === option.value && (
                  <CheckCircle
                    size={14}
                    className="mr-auto text-gray-800 flex-shrink-0"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* فاصل */}
        <div className="border-t border-gray-100 my-2" />

        {/* قسم الترتيب */}
        <div className="mb-1">
          <label className="block text-xs font-semibold text-gray-500 mb-2 px-1">
            ترتيب حسب التاريخ
          </label>
          <div className="space-y-1">
            {[
              { value: "desc", label: "الأحدث أولاً", asc: false },
              { value: "asc", label: "الأقدم أولاً", asc: true },
            ].map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSortSelect(option.asc);
                }}
                className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150
                    ${
                      sortOrder === option.value
                        ? "bg-gray-100 text-gray-900 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }
                  `}
              >
                <ArrowUpDown size={16} className="flex-shrink-0" />
                <span>{option.label}</span>
                {sortOrder === option.value && (
                  <CheckCircle
                    size={14}
                    className="mr-auto text-gray-800 flex-shrink-0"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* مؤشر التمرير (يظهر عند وجود محتوى إضافي) */}
      {hasScroll && (
        <div className="flex justify-center mt-2">
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>اسحب للمزيد</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="animate-bounce"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      )}

      {/* زر إعادة تعيين */}
      {(paymentFilter !== "all" || viewMode !== "all") && (
        <>
          <div className="border-t border-gray-100 my-2" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetFilters();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl 
                       text-sm font-medium text-blue-600 hover:bg-blue-50 
                       transition-colors duration-150"
          >
            <RefreshCcw size={14} />
            <span>إعادة تعيين الفلاتر</span>
          </button>
        </>
      )}
    </>
  );

  return (
<div
  className="relative"
  ref={filterRef}
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
  {/* زر الفلتر */}
  <button
    onClick={() => setIsFilterOpen(!isFilterOpen)}
    className={`
      relative flex items-center gap-2 px-3 py-2.5 rounded-full font-medium text-sm
      transition-all duration-200 whitespace-nowrap
      ${
        isFilterOpen || activeFiltersCount > 0
          ? "bg-gray-800 text-white shadow-md"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
      }
    `}
    aria-expanded={isFilterOpen}
    aria-haspopup="true"
  >
    <Filter size={15} className="flex-shrink-0" />
    <span className="hidden sm:inline">الفلاتر</span>
    {activeFiltersCount > 0 && (
      <span className="w-5 h-5 rounded-full bg-white text-gray-800 text-xs font-bold flex items-center justify-center">
        {activeFiltersCount}
      </span>
    )}
  </button>

  {/* عرض القائمة حسب الجهاز */}
  {isFilterOpen && (
    <>
      {isMobile ? (
        // Popup مركزي أنيق للموبايل
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* خلفية داكنة تمنع التفاعل */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsFilterOpen(false)}
          />
          
          {/* نافذة منبثقة في المنتصف */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* رأس النافذة */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">خيارات العرض</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* محتوى النافذة - بدون سكرول عمودي */}
            <div className="p-5 space-y-5">
  {/* قسم الفترة الزمنية */}
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2">
      الفترة الزمنية
    </label>
    <div className="grid grid-cols-3 gap-2">
      {[
        { value: "all", label: "الكل", icon: List },
        { value: "month", label: "الشهر", icon: Calendar },
        { value: "day", label: "يوم", icon: CalendarDays },
      ].map((option) => (
        <button
          key={option.value}
          onClick={() => {
            handleViewModeSelect(option.value as ViewMode);
            if (isMobile) setIsFilterOpen(false);
          }}
          className={`
            relative flex flex-col items-center gap-2 py-2.5 px-2 rounded-xl text-xs font-medium
            transition-all duration-200 overflow-hidden
            ${
              viewMode === option.value
                ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                : "bg-gray-50/80 text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:shadow-sm"
            }
          `}
        >
          {viewMode === option.value && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20" />
          )}
          <option.icon size={17} strokeWidth={viewMode === option.value ? 2 : 1.5} />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  </div>

  {/* قسم حالة الدفع */}
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2">
      حالة الدفع
    </label>
    <div className="grid grid-cols-3 gap-2">
      {[
        { value: "all", label: "الكل", icon: List, color: "#6B7280" },
        { value: "paid", label: "مدفوع", icon: CheckCircle, color: "#0D9488" },
        { value: "unpaid", label: "غير مدفوع", icon: XCircle, color: "#D97706" },
      ].map((option) => (
        <button
          key={option.value}
          onClick={() => {
            handlePaymentFilterSelect(option.value as "all" | "paid" | "unpaid");
            if (isMobile) setIsFilterOpen(false);
          }}
          className={`
            relative flex flex-col items-center gap-2 py-2.5 px-2 rounded-xl text-xs font-medium
            transition-all duration-200 overflow-hidden
            ${
              paymentFilter === option.value
                ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                : "bg-gray-50/80 text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:shadow-sm"
            }
          `}
        >
          {paymentFilter === option.value && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20" />
          )}
          <option.icon 
            size={17} 
            strokeWidth={paymentFilter === option.value ? 2 : 1.5}
            style={{ color: paymentFilter === option.value ? "white" : option.color }} 
          />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  </div>

  {/* قسم الترتيب */}
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2">
      ترتيب حسب التاريخ
    </label>
    <div className="grid grid-cols-2 gap-2">
      {[
        { value: "desc", label: "الأحدث أولاً" },
        { value: "asc", label: "الأقدم أولاً" },
      ].map((option) => (
        <button
          key={option.value}
          onClick={() => {
            handleSortSelect(option.value === "asc");
            if (isMobile) setIsFilterOpen(false);
          }}
          className={`
            relative flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium
            transition-all duration-200 overflow-hidden
            ${
              sortOrder === option.value
                ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                : "bg-gray-50/80 text-gray-500 hover:bg-gray-100 hover:text-gray-700 hover:shadow-sm"
            }
          `}
        >
          {sortOrder === option.value && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20" />
          )}
          <ArrowUpDown size={14} strokeWidth={sortOrder === option.value ? 2 : 1.5} />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  </div>
</div>

            {/* زر إعادة التعيين */}
            {(paymentFilter !== "all" || viewMode !== "all") && (
              <div className="px-5 py-3 border-t border-gray-100">
                <button
                  onClick={() => {
                    handleResetFilters();
                    setIsFilterOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl 
                           text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 
                           active:bg-red-200 transition-colors"
                >
                  <RefreshCcw size={14} />
                  <span>إعادة تعيين الفلاتر</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        // قائمة منسدلة لسطح المكتب - تبقى كما هي
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-50"
          style={{
            maxWidth: "calc(100vw - 2rem)",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {filterContent}
        </motion.div>
      )}
    </>
  )}
</div>
  );
};

// ============================================================================
// مكون فرعي: التنقل بين الأيام
// ============================================================================
// ============================================================================
// مكون فرعي: التنقل بين الأيام
// ============================================================================
const DayNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isCalendarMode) return null;
  if (!isDayMode) return null;

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
      <button
        onClick={onPreviousDay}
        disabled={!canGoPrevious}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        style={{ color: clinicColor }}
      >
        <ChevronRight size={16} />
      </button>

      {/* قائمة منسدلة مخصصة */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 px-4 py-1.5 text-sm font-medium text-gray-700 rounded-full border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 min-w-[150px] sm:min-w-[170px] justify-center"
        >
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-right">
            {getDayName(selectedDate)} - {formatDisplayDate(selectedDate)}
          </span>
          <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[220px] max-h-64 overflow-y-auto z-50">
            {availableDates.map((date) => (
              <button
                key={date}
                onClick={() => {
                  onDateChange(date);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-blue-50 ${
                  date === selectedDate 
                    ? 'bg-blue-50 text-blue-600 font-semibold' 
                    : 'text-gray-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  date === selectedDate ? 'bg-blue-500' : 'bg-gray-300'
                }`}></span>
                <span className="flex-1 text-right">
                  {getDayName(date)} - {formatDisplayDate(date)}
                </span>
                {date === selectedDate && (
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onNextDay}
        disabled={!canGoNext}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        style={{ color: clinicColor }}
      >
        <ChevronLeft size={16} />
      </button>
    </div>
  );
};

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="mb-3 sm:mb-4">
      {/* ============================================================ */}
      {/* سطح المكتب: صف واحد                                          */}
      {/* ============================================================ */}
      <div className="hidden lg:flex items-center gap-3">
        {/* حقل البحث - مخفي في التقويم */}
        {!isCalendarMode && (
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="البحث عن مريض..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pr-10 pl-4 py-3 bg-gray-100 rounded-full text-gray-900 placeholder-gray-400 text-sm border-0 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              style={{ "--tw-ring-color": clinicColor } as React.CSSProperties}
            />
            {searchTerm && (
              <button
                onClick={onSearchClear}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* زر الفلتر الموحد + التنقل اليومي */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* التنقل بين الأيام - مخفي في التقويم */}
          <DayNavigation />

          {/* زر الفلتر الموحد - مخفي في التقويم */}
          {!isCalendarMode && <FilterPopover />}
        </div>
      </div>

      {/* ============================================================ */}
      {/* الجوال والتابلت: صف واحد أو صفين حسب الحاجة                    */}
      {/* ============================================================ */}
<div className="flex lg:hidden flex-col gap-2">
  {/* السطر الأول: حقل البحث + الفلتر */}
  <div className="flex items-center gap-2">
    {/* حقل البحث - مخفي في التقويم */}
    {!isCalendarMode && (
      <div className="relative flex-1">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search size={14} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="بحث..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pr-8 pl-8 py-2.5 bg-gray-100 rounded-full text-gray-900 placeholder-gray-400 text-sm border-0 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          style={{ "--tw-ring-color": clinicColor } as React.CSSProperties}
        />
        {searchTerm && (
          <button
            onClick={onSearchClear}
            className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>
    )}

    {/* الفلتر الموحد */}
    {!isCalendarMode && <FilterPopover />}
  </div>

  {/* السطر الثاني: التنقل اليومي - يملأ عرض الشاشة */}
  {isDayMode && <DayNavigation />}
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
              {totalCost.toLocaleString()} {getCurrency()}
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

// ============================================================================
// Component: PatientsTable (Desktop + Mobile + Agenda)
// ============================================================================

interface PatientsTableProps {
  sessions: Session[];
  sessionsWithMobileGroups: Array<
    { type: "group"; dateStr: string } | { type: "session"; session: Session }
  >;
  searchTerm: string;
  viewMode: ViewMode;
  viewType: ViewType; // 🆕 إضافة نوع العرض
  isMobile: boolean;
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function PatientsTable({
  sessions,
  sessionsWithMobileGroups,
  searchTerm,
  viewMode,
  viewType, // 🆕
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
{/* Desktop Table - يظهر فقط على سطح المكتب في وضعي الجدول والأجندة */}
<div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
  {viewType === "agenda" ? (
    // عرض الأجندة لسطح المكتب
    <DesktopAgendaView
      sessions={sessions}
      getPatientData={getPatientData}
      onSessionSelect={onSessionSelect}
    />
  ) : (
    // عرض الجدول التقليدي مع رأس ثابت - جدول واحد متماسك
    <div
      className="flex flex-col"
      style={{ maxHeight: "calc(100vh - 170px)" }}
    >
      {/* حاوية التمرير تشمل الرأس والمحتوى */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          {/* رأس الجدول - sticky ليبقى ظاهراً أثناء التمرير */}
          <thead className="sticky top-0 z-20">
            <tr className="bg-gray-50/95 backdrop-blur-sm shadow-sm">
              <th className="py-3 px-0 w-1.5 sticky left-0 bg-gray-50/95"></th>
              <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap bg-gray-50/95">
                اليوم والتاريخ
              </th>
              <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 bg-gray-50/95">
                الاسم
              </th>
              <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap bg-gray-50/95">
                الرقم
              </th>
              <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell bg-gray-50/95">
                العمر
              </th>
              <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap hidden sm:table-cell bg-gray-50/95">
                الجنس
              </th>
              <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 max-w-xs bg-gray-50/95">
                الجلسة
              </th>
              <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap bg-gray-50/95">
                الوقت
              </th>
              <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700 whitespace-nowrap bg-gray-50/95">
                التكلفة
              </th>
              <th className="py-3 px-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap bg-gray-50/95">
                الدفع
              </th>
              <th className="py-3 px-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap bg-gray-50/95">
                الحالة
              </th>
            </tr>
          </thead>

          {/* جسم الجدول */}
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

      {/* Footer - ثابت في الأسفل */}
      <div className="flex-shrink-0 border-t border-gray-200">
        <TableFooter
          sessionsCount={sessions.length}
          totalCost={totalCost}
        />
      </div>
    </div>
  )}
</div>

      {/* Mobile View - يظهر على الهاتف فقط */}
      <div className="md:hidden bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
        {viewType === "agenda" ? (
          // 🆕 عرض الأجندة المكثفة للهاتف
          <MobileAgendaView
            sessions={sessions}
            sessionsWithMobileGroups={sessionsWithMobileGroups}
            getPatientData={getPatientData}
            onSessionSelect={onSessionSelect}
          />
        ) : (
          // عرض القائمة التقليدية للهاتف
          <>
            {sessionsWithMobileGroups.map((item, index) => {
              if (item.type === "group") {
                return (
                  <div
                    key={`m-group-${item.dateStr}`}
                    className="bg-gray-50/80 px-4 py-2 text-xs font-bold text-gray-600 border-b"
                  >
                    {getDayName(item.dateStr)} -{" "}
                    {formatDisplayDate(item.dateStr)}
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
            <TableFooter
              sessionsCount={sessions.length}
              totalCost={totalCost}
            />
          </>
        )}
      </div>
    </>
  );
}

// ============================================================================
// 🆕 Sub-component: DesktopAgendaView
// ============================================================================

interface DesktopAgendaViewProps {
  sessions: Session[];
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function DesktopAgendaView({
  sessions,
  getPatientData,
  onSessionSelect,
}: DesktopAgendaViewProps) {
  const totalCost = sessions.reduce((sum, s) => sum + (s.sessionCost || 0), 0);

  const groupedByDate = sessions.reduce(
    (acc, session) => {
      const dateStr = getDateString(session.startTime);
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(session);
      return acc;
    },
    {} as Record<string, Session[]>,
  );

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a),
  );

  return (
    <div
      className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ height: "calc(100vh - 200px)" }}
    >
      {/* منطقة التمرير – الوحيدة القابلة للتمرير */}
      <div className="flex-1 overflow-y-auto">
        {sortedDates.map((dateStr) => (
          <div key={dateStr}>
            {/* رأس اليوم – خلفية صلبة و بدون blur */}
            <div className="sticky top-0 z-10 bg-gray-50 px-6 py-2.5 flex items-center justify-between border-b border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  {getDayName(dateStr)} - {formatDisplayDate(dateStr)}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {groupedByDate[dateStr].length} جلسات
              </span>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                {groupedByDate[dateStr].map((session) => (
                  <AgendaCard
                    key={session.id}
                    session={session}
                    getPatientData={getPatientData}
                    onClick={onSessionSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer ثابت أسفل الحاوية */}
      <div className="flex-shrink-0 border-t border-gray-200">
        <TableFooter sessionsCount={sessions.length} totalCost={totalCost} />
      </div>
    </div>
  );
}
// ============================================================================
// 🆕 Sub-component: MobileAgendaView
// ============================================================================

interface MobileAgendaViewProps {
  sessions: Session[];
  sessionsWithMobileGroups: Array<
    { type: "group"; dateStr: string } | { type: "session"; session: Session }
  >;
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
}

function MobileAgendaView({
  sessions,
  sessionsWithMobileGroups,
  getPatientData,
  onSessionSelect,
}: MobileAgendaViewProps) {
  const totalCost = sessions.reduce((sum, s) => sum + (s.sessionCost || 0), 0);

  return (
    <div
      className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ height: "calc(100vh - 160px)" }}
    >
      <div className="flex-1 overflow-y-auto">
        {sessionsWithMobileGroups.map((item, index) => {
          if (item.type === "group") {
            return (
              <div
                key={`agenda-group-${item.dateStr}`}
                className="sticky top-0 z-10"
              >
                {/* طبقة الخلفية */}
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-gray-50 to-gray-50/95" />

                {/* شريط علوي ملون */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400" />

                {/* المحتوى */}
                <div className="relative px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* دائرة اليوم */}
                    <div className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-600">
                        {new Date(item.dateStr).getDate()}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-gray-800">
                        {getDayName(item.dateStr)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDisplayDate(item.dateStr)}
                      </span>
                    </div>
                  </div>

                  {/* نقطة مؤشرة */}
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                </div>

                {/* فاصل سفلي */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>
            );
          }
          return (
            <div key={`agenda-${item.session.id}`} className="my-5 mx-3">
              <AgendaCard
                session={item.session}
                getPatientData={getPatientData}
                onClick={onSessionSelect}
                isMobile
              />
            </div>
          );
        })}
      </div>

      <div className="flex-shrink-0 border-t border-gray-200">
        <TableFooter sessionsCount={sessions.length} totalCost={totalCost} />
      </div>
    </div>
  );
}

// ============================================================================
// 🆕 Sub-component: AgendaCard (مشترك بين Desktop و Mobile)
// ============================================================================

interface AgendaCardProps {
  session: Session;
  getPatientData: (patientId: string) => Patient | undefined;
  onClick: (session: Session) => void;
  isMobile?: boolean;
}

function AgendaCard({
  session,
  getPatientData,
  onClick,
  isMobile = false,
}: AgendaCardProps) {
  const patient = getPatientData(session.patientId);
  const statusDisplay = getSessionStatusDisplay(session.status);
  const paymentDisplay = getPaymentMethodDisplay(session);
  const StatusIcon = statusDisplay.icon;
  const PaymentIcon = paymentDisplay.icon;
  const timelineColor = getTimelineColor(session.status);
  const timeStr = formatTime(session.startTime);

  // تحديد ألوان الخلفية بناءً على الحالة
  const getCardStyles = () => {
    switch (session.status) {
      case "completed":
        return {
          bg: "bg-green-50/70",
          hoverBg: "hover:bg-green-100/80",
          border: "border-green-200",
          timelineBg: "#22C55E",
        };
      case "in-progress":
        return {
          bg: "bg-amber-50/70",
          hoverBg: "hover:bg-amber-100/80",
          border: "border-amber-200",
          timelineBg: "#F59E0B",
        };
      case "scheduled":
        return {
          bg: "bg-blue-50/70",
          hoverBg: "hover:bg-blue-100/80",
          border: "border-blue-200",
          timelineBg: "#3B82F6",
        };
      case "cancelled":
        return {
          bg: "bg-gray-50/70",
          hoverBg: "hover:bg-gray-100/80",
          border: "border-gray-200",
          timelineBg: "#9CA3AF",
        };
      case "no-show":
        return {
          bg: "bg-orange-50/70",
          hoverBg: "hover:bg-orange-100/80",
          border: "border-orange-200",
          timelineBg: "#F97316",
        };
      default:
        return {
          bg: "bg-gray-50/70",
          hoverBg: "hover:bg-gray-100/80",
          border: "border-gray-200",
          timelineBg: "#9CA3AF",
        };
    }
  };

  const cardStyles = getCardStyles();

  return (
    <div
      onClick={() => onClick(session)}
      className={`
        flex items-start gap-3 p-3 rounded-xl border cursor-pointer
        transition-all duration-200
        ${cardStyles.bg} ${cardStyles.hoverBg} ${cardStyles.border}
        ${isMobile ? "active:scale-[0.98]" : "hover:shadow-md hover:scale-[1.01]"}
      `}
    >
      {/* الخط الزمني على اليسار */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div
          className="w-1.5 flex-1 min-h-[40px] rounded-full"
          style={{ backgroundColor: cardStyles.timelineBg }}
        ></div>
        <StatusIcon
          size={14}
          style={{ color: statusDisplay.color }}
          className="flex-shrink-0 mt-1"
        />
      </div>

      {/* محتوى البطاقة */}
      <div className="flex-1 min-w-0">
        {/* اسم المريض والوقت */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {patient?.fullName || session.patientSnapshot?.name}
          </h4>
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap flex-shrink-0">
            {timeStr}
          </span>
        </div>

        {/* الإجراء */}
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {session.plannedProcedure ||
            session.performedProcedure ||
            "لا يوجد إجراء"}
        </p>

        {/* معلومات إضافية وتفاصيل */}
        <div className="flex items-center justify-between">
          {/* الحالة والدفع */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: statusDisplay.bgColor,
                color: statusDisplay.color,
              }}
            >
              {statusDisplay.label}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: paymentDisplay.bgColor,
                color: paymentDisplay.color,
              }}
            >
              {paymentDisplay.label}
            </span>
          </div>

          {/* التكلفة */}
          <span
            className="text-sm font-bold"
            style={{ color: session.isPaid ? "#059669" : "#DC2626" }}
          >
            {session.sessionCost?.toLocaleString()} {getCurrency()}
          </span>
        </div>

        {/* معلومات المريض الإضافية (اختياري) */}
        {patient && (
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-200/50">
            {patient.phone && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Phone size={10} />
                {patient.phone}
              </span>
            )}
            {patient.age && (
              <span className="text-xs text-gray-500">{patient.age} سنة</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-component: DesktopTableRow
// ============================================================================

// ============================================================================
// Sub-component: DesktopTableRow
// ============================================================================

interface DesktopTableRowProps {
  session: Session;
  getPatientData: (patientId: string) => Patient | undefined;
}

function DesktopTableRow({ session, getPatientData }: DesktopTableRowProps) {
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

  // تعيين كلاسات الخلفية والـ hover بناءً على الحالة
  const getRowStyles = () => {
    switch (session.status) {
      case "completed":
        return {
          bg: "bg-green-50/70",
          hoverBg: "hover:bg-green-100/80",
          border: "border-green-200",
        };
      case "in-progress":
        return {
          bg: "bg-amber-50/70",
          hoverBg: "hover:bg-amber-100/80",
          border: "border-amber-200",
        };
      case "scheduled":
        return {
          bg: "bg-blue-50/70",
          hoverBg: "hover:bg-blue-100/80",
          border: "border-blue-200",
        };
      case "cancelled":
        return {
          bg: "bg-gray-50/70",
          hoverBg: "hover:bg-gray-100/80",
          border: "border-gray-200",
        };
      case "no-show":
        return {
          bg: "bg-orange-50/70",
          hoverBg: "hover:bg-orange-100/80",
          border: "border-orange-200",
        };
      default:
        return {
          bg: "bg-gray-50/70",
          hoverBg: "hover:bg-gray-100/80",
          border: "border-gray-200",
        };
    }
  };

  const rowStyles = getRowStyles();

  return (
    <tr
      className={`border-b ${rowStyles.border} transition-all duration-200 ${rowStyles.bg} ${rowStyles.hoverBg}`}
    >
      {/* شريط جانبي أعرض مع لون الحالة */}
      <td
        className="py-2.5 px-0 w-1.5"
        style={{ backgroundColor: timelineColor }}
      ></td>

      <td className="py-2.5 px-3 text-xs md:text-sm text-gray-700 whitespace-nowrap">
        {combinedDate}
      </td>

      <td className="py-2.5 px-3 text-xs md:text-sm text-gray-900 font-semibold min-w-[120px]">
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
          {session.sessionCost?.toLocaleString()} {getCurrency()}
        </span>
      </td>

      {/* مؤشر الدفع - أكبر وأوضح */}
      <td className="py-2.5 px-3 text-center">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center mx-auto shadow-sm transition-transform hover:scale-110"
          style={{ backgroundColor: paymentDisplay.bgColor }}
          title={paymentDisplay.label}
        >
          <PaymentIcon size={16} style={{ color: paymentDisplay.color }} />
        </div>
      </td>

      {/* مؤشر الحالة - أكبر وأوضح */}
      <td className="py-2.5 px-3 text-center">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center mx-auto shadow-sm transition-transform hover:scale-110"
          style={{ backgroundColor: statusDisplay.bgColor }}
          title={statusDisplay.label}
        >
          <StatusIcon size={16} style={{ color: statusDisplay.color }} />
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
  const dateStr = getDateString(session.startTime);
  const combinedDate = `${getDayName(dateStr)} ${formatDisplayDate(dateStr)}`;
  const timeStr = formatTime(session.startTime);
  const patient = getPatientData(session.patientId);
  const statusDisplay = getSessionStatusDisplay(session.status);
  const StatusIcon = statusDisplay.icon;
  const timelineColor = getTimelineColor(session.status);
  const paymentDisplay = getPaymentMethodDisplay(session);

  // تعيين كلاسات الخلفية والـ active بناءً على الحالة
  const getRowStyles = () => {
    switch (session.status) {
      case "completed":
        return {
          bg: "bg-green-50/70",
          activeBg: "active:bg-green-100",
          border: "border-green-200",
        };
      case "in-progress":
        return {
          bg: "bg-amber-50/70",
          activeBg: "active:bg-amber-100",
          border: "border-amber-200",
        };
      case "scheduled":
        return {
          bg: "bg-blue-50/70",
          activeBg: "active:bg-blue-100",
          border: "border-blue-200",
        };
      case "cancelled":
        return {
          bg: "bg-gray-50/70",
          activeBg: "active:bg-gray-100",
          border: "border-gray-200",
        };
      case "no-show":
        return {
          bg: "bg-orange-50/70",
          activeBg: "active:bg-orange-100",
          border: "border-orange-200",
        };
      default:
        return {
          bg: "bg-gray-50/70",
          activeBg: "active:bg-gray-100",
          border: "border-gray-200",
        };
    }
  };

  const rowStyles = getRowStyles();

  return (
    <div
      onClick={() => onSelect(session)}
      className={`flex items-center gap-3 px-4 py-3 border-b ${rowStyles.border} cursor-pointer ${rowStyles.activeBg} transition-all duration-200 ${rowStyles.bg}`}
    >
      {/* شريط جانبي أعرض مع تدرج لوني */}
      <div
        className="w-1.5 self-stretch rounded-full"
        style={{ backgroundColor: timelineColor }}
      ></div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {patient?.fullName || session.patientSnapshot?.name}
        </p>
        <p className="text-xs text-gray-600 mt-0.5">
          {combinedDate} · {timeStr}
        </p>
      </div>

      <div className="text-right flex flex-col items-end gap-2">
        {/* التكلفة مع لون أوضح */}
        <p
          className="text-sm font-bold"
          style={{ color: session.isPaid ? "#059669" : "#DC2626" }}
        >
          {session.sessionCost?.toLocaleString()} {getCurrency()}
        </p>

        {/* مؤشر الحالة أكبر مع مؤشر الدفع */}
        <div className="flex items-center gap-2">
          {/* مؤشر الدفع */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: paymentDisplay.bgColor }}
            title={paymentDisplay.label}
          >
            {React.createElement(paymentDisplay.icon, {
              size: 13,
              style: { color: paymentDisplay.color },
            })}
          </div>

          {/* مؤشر الحالة */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: statusDisplay.bgColor }}
            title={statusDisplay.label}
          >
            <StatusIcon size={14} style={{ color: statusDisplay.color }} />
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
// Sub-component: DesktopCalendar (محسّن)
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

/**
 * تكديس الجلسات المتداخلة زمنياً (بحد أقصى 3 بطاقات)
 * تُرجع مصفوفة من stacks، كل stack يحتوي على جلسة أو أكثر
 */
function stackAppointments(sessions: Session[]): Session[][] {
  if (sessions.length === 0) return [];

  // ترتيب تصاعدي حسب وقت البداية
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const stacks: Session[][] = [];

  for (const session of sorted) {
    const sessionStart = new Date(session.startTime).getTime();
    const sessionEnd = new Date(session.endTime || session.startTime).getTime();

    // البحث عن stack يحتوي على جلسات متداخلة فقط
    let placed = false;
    for (const stack of stacks) {
      if (stack.length >= 3) continue; // الحد الأقصى 3

      const stackEnd = Math.max(
        ...stack.map((s) => new Date(s.endTime || s.startTime).getTime()),
      );

      // ضع الجلسة في stack فقط إذا كانت تتداخل زمنياً مع أي جلسة في الـ stack
      if (sessionStart < stackEnd) {
        stack.push(session);
        placed = true;
        break;
      }
    }

    if (!placed) {
      stacks.push([session]);
    }
  }

  return stacks;
}

// ============================================================================
// Sub-component: DesktopCalendar (Grid موحد - محاذاة مثالية)
// ============================================================================

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
  // تجميع الجلسات حسب اليوم
  const sessionsByDay = useMemo(() => {
    const map: Record<string, Session[]> = {};
    weekDays.forEach((day) => {
      const dateStr = day.toISOString().split("T")[0];
      map[dateStr] = calendarWeekSessions.filter(
        (s) => getDateString(s.startTime) === dateStr,
      );
    });
    return map;
  }, [weekDays, calendarWeekSessions]);

  // تكديس الجلسات لكل يوم
  const stackedByDay = useMemo(() => {
    const map: Record<string, Session[][]> = {};
    Object.entries(sessionsByDay).forEach(([dateStr, daySessions]) => {
      map[dateStr] = stackAppointments(daySessions);
    });
    return map;
  }, [sessionsByDay]);

  // صيغة عرض نطاق الأسبوع
  const weekRangeLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startStr = `${start.getDate()}/${start.getMonth() + 1}`;
    const endStr = `${end.getDate()}/${end.getMonth() + 1}`;
    return `من ${startStr} إلى ${endStr} `;
  }, [weekDays]);

  const todayStr = new Date().toISOString().split("T")[0];

  // الساعات من 9 صباحاً إلى 8 مساءً (12 ساعة)
  const hours = [
    { hour24: 9, label: "9 ص" },
    { hour24: 10, label: "10 ص" },
    { hour24: 11, label: "11 ص" },
    { hour24: 12, label: "12 م" },
    { hour24: 13, label: "1 م" },
    { hour24: 14, label: "2 م" },
    { hour24: 15, label: "3 م" },
    { hour24: 16, label: "4 م" },
    { hour24: 17, label: "5 م" },
    { hour24: 18, label: "6 م" },
    { hour24: 19, label: "7 م" },
    { hour24: 20, label: "8 م" },
  ];

  // ارتفاع الرأس
  const HEADER_HEIGHT = 44;
  // ارتفاع محتوى الوقت
  const TIME_CONTENT_HEIGHT = 660;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
      dir="rtl"
    >
      {/* ========== رأس التنقل - تصميم واضح ========== */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white">
        {/* عنوان الأسبوع */}
        <h3 className="text-sm font-semibold text-gray-800 select-none">
          {weekRangeLabel}
        </h3>

        {/* مجموعة الأزرار */}
        <div className="flex items-center gap-2">
          {/* زر اليوم */}
          <button
            onClick={onTodayWeek}
            className="h-9 px-4 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700
                 hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all duration-150
                 shadow-sm select-none"
          >
            اليوم
          </button>

          {/* أزرار التنقل مع تسميات */}
          <button
            onClick={onPreviousWeek}
            className="h-9 px-3 flex items-center gap-1.5 text-sm font-medium rounded-lg
                 border border-gray-300 bg-white text-gray-700
                 hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all duration-150
                 shadow-sm select-none"
            aria-label="الأسبوع السابق"
          >
            <ChevronRight size={16} strokeWidth={2} />
            <span>الأسبوع السابق</span>
          </button>

          <button
            onClick={onNextWeek}
            className="h-9 px-3 flex items-center gap-1.5 text-sm font-medium rounded-lg
                 border border-gray-300 bg-white text-gray-700
                 hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all duration-150
                 shadow-sm select-none"
            aria-label="الأسبوع التالي"
          >
            <span>الأسبوع التالي</span>
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ========== GRID موحد: رؤوس + وقت + بطاقات ========== */}
      <div
        className="relative overflow-auto"
        style={{
          height: `${HEADER_HEIGHT + TIME_CONTENT_HEIGHT}px`,
          scrollbarGutter: "stable",
        }}
      >
        <div
          className="relative"
          style={{
            width: "100%",
            height: `${HEADER_HEIGHT + TIME_CONTENT_HEIGHT}px`,
            display: "grid",
            gridTemplateColumns: "70px repeat(7, 1fr)",
            gridTemplateRows: `${HEADER_HEIGHT}px 1fr`,
            direction: "rtl",
          }}
        >
          {/* ================================================================ */}
          {/* الصف 1: رؤوس الأيام                                               */}
          {/* ================================================================ */}

          {/* الخلية الفارغة أعلى عمود الوقت */}
          <div
            className="bg-gray-50/60 border-b border-l border-gray-200"
            style={{ gridColumn: "1 / 2", gridRow: "1 / 2" }}
          />

          {/* رؤوس الأيام السبعة */}
          {weekDays.map((day, idx) => {
            const dateStr = day.toISOString().split("T")[0];
            const isToday = dateStr === todayStr;

            return (
              <div
                key={`header-${idx}`}
                className={`
                  flex flex-col items-center justify-center text-xs select-none
                  border-b border-l border-gray-200 bg-gray-50/60
                  ${idx === 6 ? "border-l-0" : ""}
                  ${isToday ? "!bg-blue-50/70" : ""}
                `}
                style={{
                  gridColumn: `${idx + 2} / ${idx + 3}`,
                  gridRow: "1 / 2",
                }}
              >
                <span className="text-[10px] text-gray-500 font-medium">
                  {getDayName(dateStr)}
                </span>
                <span
                  className={`
                    text-sm font-bold leading-tight
                    ${isToday ? "text-blue-600" : "text-gray-700"}
                  `}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}

          {/* ================================================================ */}
          {/* الصف 2: عمود الوقت                                                */}
          {/* ================================================================ */}

          <div
            className="relative border-l border-gray-200 bg-white"
            style={{ gridColumn: "1 / 2", gridRow: "2 / 3", zIndex: 10 }}
          >
            {hours.map((hour) => (
              <div
                key={hour.hour24}
                className="absolute right-0 left-0 flex items-start border-t border-gray-200"
                style={{
                  top: `${(hour.hour24 - 9) * 60}px`,
                  height: "60px",
                }}
              >
                <span className="text-[11px] text-gray-400 font-medium pr-2 pt-1 select-none">
                  {hour.label}
                </span>
              </div>
            ))}
          </div>

          {/* ================================================================ */}
          {/* الصف 2: أعمدة الأيام مع شبكة محسّنة                                */}
          {/* ================================================================ */}

          {weekDays.map((day, dayIndex) => {
            const dateStr = day.toISOString().split("T")[0];
            const isToday = dateStr === todayStr;
            const isEvenColumn = dayIndex % 2 === 0;

            return (
              <div
                key={`col-${dayIndex}`}
                className={`
                  relative
                  ${dayIndex < 6 ? "border-l border-gray-200" : ""}
                  ${isToday ? "bg-blue-50/30" : isEvenColumn ? "bg-gray-50/30" : "bg-white"}
                `}
                style={{
                  gridColumn: `${dayIndex + 2} / ${dayIndex + 3}`,
                  gridRow: "2 / 3",
                }}
              >
                {/* خطوط الساعات - أكثر وضوحاً */}
                {Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => (
                  <div
                    key={`hour-${hour}`}
                    className="absolute left-0 right-0"
                    style={{ top: `${(hour - 9) * 60}px` }}
                  >
                    <div className="absolute left-0 right-0 border-t border-gray-300" />
                  </div>
                ))}

                {/* خطوط نصف الساعة - أخف */}
                {Array.from({ length: 11 }, (_, i) => i + 9).map((hour) => (
                  <div
                    key={`half-${hour}`}
                    className="absolute left-0 right-0"
                    style={{ top: `${(hour - 9) * 60 + 30}px` }}
                  >
                    <div className="absolute left-0 right-0 border-t border-dashed border-gray-200" />
                  </div>
                ))}
              </div>
            );
          })}

          {/* ================================================================ */}
          {/* مؤشر الوقت الحالي                                                */}
          {/* ================================================================ */}

          <div
            ref={currentTimeRef}
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{
              top: `${HEADER_HEIGHT + getCurrentTimeTop()}px`,
            }}
          >
            {/* خط أحمر */}
            <div className="absolute left-0 right-0 border-t-2 border-red-500 shadow-sm" />
            {/* دائرة حمراء على اليسار مع تأثير نبض */}
            <div className="absolute right-0 -translate-y-1/2 translate-x-1/2">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-md shadow-red-200">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping absolute inset-0 opacity-40" />
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* بطاقات المواعيد المكدسة                                          */}
          {/* ================================================================ */}

          <div
            className="absolute pointer-events-none"
            style={{
              top: `${HEADER_HEIGHT}px`,
              right: "70px",
              left: "0",
              bottom: "0",
              zIndex: 5,
            }}
          >
            {weekDays.map((day, dayIndex) => {
              const dateStr = day.toISOString().split("T")[0];
              const stacks = stackedByDay[dateStr] || [];
              // تعديل: استخدام 7 أعمدة متساوية داخل المساحة المتبقية
              const colWidth = `calc((100% - 0px) / 7)`;
              const colLeft = `calc(${dayIndex} * ${colWidth})`;

              return stacks.flatMap((stack) =>
                stack.map((session, sessionIdxInStack) => (
                  <CalendarAppointmentCard
                    key={session.id}
                    session={session}
                    colLeft={colLeft}
                    colWidth={colWidth}
                    stackIndex={sessionIdxInStack}
                    totalInStack={stack.length}
                    getPatientData={getPatientData}
                    onClick={onSessionSelect}
                  />
                )),
              );
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

// ============================================================================
// Sub-component: CalendarTimeColumn (نظام 12 ساعة)
// ============================================================================

function CalendarTimeColumn() {
  // الساعات من 9 صباحاً إلى 8 مساءً (12 ساعة)
  const hours = [
    { hour24: 9, label: "9 ص" },
    { hour24: 10, label: "10 ص" },
    { hour24: 11, label: "11 ص" },
    { hour24: 12, label: "12 م" },
    { hour24: 13, label: "1 م" },
    { hour24: 14, label: "2 م" },
    { hour24: 15, label: "3 م" },
    { hour24: 16, label: "4 م" },
    { hour24: 17, label: "5 م" },
    { hour24: 18, label: "6 م" },
    { hour24: 19, label: "7 م" },
    { hour24: 20, label: "8 م" },
  ];

  return (
    <div
      className="relative border-l border-gray-200 bg-white"
      style={{ gridRow: "1 / -1", gridColumn: 1, zIndex: 10 }}
    >
      {hours.map((hour) => (
        <div
          key={hour.hour24}
          className="absolute right-0 left-0 flex items-start border-t border-gray-200"
          style={{
            top: `${(hour.hour24 - 9) * 60}px`,
            height: "60px",
          }}
        >
          <span className="text-[11px] text-gray-400 font-medium pr-2 pt-1 select-none">
            {hour.label}
          </span>
        </div>
      ))}
    </div>
  );
}
// ============================================================================
// Sub-component: CalendarDayGrid
// ============================================================================

// ============================================================================
// Sub-component: CalendarDayGrid (شبكة محسّنة + رقعة شطرنج)
// ============================================================================

function CalendarDayGrid({
  dayIndex,
  isToday,
}: {
  dayIndex: number;
  isToday: boolean;
}) {
  // نمط رقعة الشطرنج: الأعمدة الزوجية لها خلفية مختلفة قليلاً
  const isEvenColumn = dayIndex % 2 === 0;

  return (
    <div
      className={`
        relative border-l border-gray-200 last:border-l-0
        ${isToday ? "bg-blue-50/30" : isEvenColumn ? "bg-gray-50/30" : "bg-white"}
      `}
      style={{ gridRow: "1 / -1", gridColumn: dayIndex + 2 }}
    >
      {/* خطوط الساعات - أكثر وضوحاً */}
      {Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => (
        <div
          key={`hour-${hour}`}
          className="absolute left-0 right-0"
          style={{ top: `${(hour - 9) * 60}px` }}
        >
          {/* خط الساعة الرئيسي */}
          <div className="absolute left-0 right-0 border-t border-gray-300" />
        </div>
      ))}

      {/* خطوط نصف الساعة - أخف */}
      {Array.from({ length: 11 }, (_, i) => i + 9).map((hour) => (
        <div
          key={`half-${hour}`}
          className="absolute left-0 right-0"
          style={{ top: `${(hour - 9) * 60 + 30}px` }}
        >
          <div className="absolute left-0 right-0 border-t border-dashed border-gray-200" />
        </div>
      ))}

      {/* حدود عمودية رفيعة بين الأيام (يمين العمود فقط) */}
      <div className="absolute top-0 bottom-0 right-0 w-px bg-gray-200" />
    </div>
  );
}

// ============================================================================
// Sub-component: CalendarAppointmentCard (محسّن مع تكديس)
// ============================================================================

interface CalendarAppointmentCardProps {
  session: Session;
  colLeft: string;
  colWidth: string;
  stackIndex: number; // موقع البطاقة في الـ stack
  totalInStack: number; // إجمالي البطاقات في الـ stack
  getPatientData: (patientId: string) => Patient | undefined;
  onClick: (session: Session) => void;
}

function CalendarAppointmentCard({
  session,
  colLeft,
  colWidth,
  stackIndex,
  totalInStack,
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
  const paymentDisplay = getPaymentMethodDisplay(session);

  // حساب العرض والموقع مع التكديس
  // عندما يكون هناك عدة بطاقات، نقلص العرض ونحرك كل بطاقة قليلاً
  const gap = 2; // px
  const totalWidth = `calc(${colWidth} - 6px)`; // العرض الكامل مع هامش صغير
  const cardWidth =
    totalInStack > 1
      ? `calc((${colWidth} - 6px - ${(totalInStack - 1) * gap}px) / ${totalInStack})`
      : `calc(${colWidth} - 6px)`;
  const offsetX =
    totalInStack > 1
      ? `calc(${stackIndex} * (${cardWidth} + ${gap}px))`
      : "0px";

  // ألوان أكثر بروزاً حسب الحالة
  const getCardColors = () => {
    switch (session.status) {
      case "completed":
        return {
          bg: "#DCFCE7",
          border: "#22C55E",
          text: "#166534",
          badge: "#16A34A",
        };
      case "in-progress":
        return {
          bg: "#FEF3C7",
          border: "#F59E0B",
          text: "#92400E",
          badge: "#D97706",
        };
      case "scheduled":
        return {
          bg: "#DBEAFE",
          border: "#3B82F6",
          text: "#1E40AF",
          badge: "#2563EB",
        };
      case "cancelled":
        return {
          bg: "#F3F4F6",
          border: "#9CA3AF",
          text: "#4B5563",
          badge: "#6B7280",
        };
      case "no-show":
        return {
          bg: "#FFEDD5",
          border: "#F97316",
          text: "#9A3412",
          badge: "#EA580C",
        };
      default:
        return {
          bg: "#F3F4F6",
          border: "#9CA3AF",
          text: "#4B5563",
          badge: "#6B7280",
        };
    }
  };

  const colors = getCardColors();
  const isCompact = height < 45;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(session);
      }}
      className="absolute rounded-lg cursor-pointer overflow-hidden
                 transition-all duration-200 pointer-events-auto select-none"
      style={{
        right: `calc(${colLeft} + ${offsetX} + 2px)`,
        top: `${top}px`,
        height: `${Math.max(height, 22)}px`,
        width: cardWidth,
        backgroundColor: colors.bg,
        borderRight: `4px solid ${colors.border}`,
        borderTop: `1px solid ${adjustColor(colors.border, 40)}`,
        borderBottom: `1px solid ${adjustColor(colors.border, 40)}`,
        borderLeft: `1px solid ${adjustColor(colors.border, 40)}`,
        boxShadow: `0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)`,
        zIndex: 10 + stackIndex,
        padding: isCompact ? "2px 4px" : "4px 6px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.4)`;
        e.currentTarget.style.transform = "scale(1.03)";
        e.currentTarget.style.zIndex = "30";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)`;
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.zIndex = String(10 + stackIndex);
      }}
    >
      {isCompact ? (
        // عرض مكثف للبطاقات الصغيرة
        <div className="flex items-center gap-1 h-full min-w-0">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: colors.badge }}
          />
          <span
            className="text-[10px] font-semibold truncate"
            style={{ color: colors.text }}
          >
            {patient?.fullName || session.patientSnapshot?.name}
          </span>
        </div>
      ) : (
        // عرض كامل
        <div className="h-full flex flex-col justify-between min-w-0">
          {/* اسم المريض */}
          <div className="flex items-center gap-1 min-w-0">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: colors.badge }}
            />
            <span
              className="text-[11px] font-bold truncate leading-tight"
              style={{ color: colors.text }}
            >
              {patient?.fullName || session.patientSnapshot?.name}
            </span>
          </div>

          {/* الوقت والإجراء (إذا كانت البطاقة كبيرة بما يكفي) */}
          {height > 55 && (
            <>
              <div
                className="text-[10px] font-medium truncate"
                style={{ color: `${colors.text}99` }}
              >
                {formatTime(start)} - {formatTime(end)}
              </div>
              <div
                className="text-[10px] truncate"
                style={{ color: `${colors.text}CC` }}
              >
                {session.plannedProcedure || session.performedProcedure || ""}
              </div>
            </>
          )}

          {/* مؤشر الدفع (أسفل البطاقة) */}
          {height > 40 && (
            <div className="flex items-center justify-end">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: paymentDisplay.bgColor,
                  opacity: 0.9,
                }}
                title={paymentDisplay.label}
              >
                {React.createElement(paymentDisplay.icon, {
                  size: 9,
                  style: { color: paymentDisplay.color },
                })}
              </div>
            </div>
          )}
        </div>
      )}
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
  calendarWeekSessions,
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
          // 🆕 تمرير الخصائص المفقودة
          weekDays={weekDays}
          today={today}
          onCalendarDaySelect={onCalendarDaySelect}
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

// ============================================================================
// Sub-component: MobileDayView (محسّن)
// ============================================================================

interface MobileDayViewProps {
  selectedCalendarDay: string;
  sessionsForCalendarDay: (dateStr: string) => Session[];
  currentTimeRef: React.RefObject<HTMLDivElement>;
  getCurrentTimeTop: () => number;
  onCalendarDayNavigate: (direction: "prev" | "next") => void;
  getPatientData: (patientId: string) => Patient | undefined;
  onSessionSelect: (session: Session) => void;
  // 🆕 خصائص جديدة مطلوبة
  weekDays?: Date[];
  today?: Date;
  onCalendarDaySelect?: (dateStr: string) => void;
}

function MobileDayView({
  selectedCalendarDay,
  sessionsForCalendarDay,
  currentTimeRef,
  getCurrentTimeTop,
  onCalendarDayNavigate,
  getPatientData,
  onSessionSelect,
  weekDays,
  today,
  onCalendarDaySelect,
}: MobileDayViewProps) {
  const daySessions = sessionsForCalendarDay(selectedCalendarDay);

  // 🆕 حالة وإيماءات السحب
  const touchStartX = useRef<number | null>(null);
  const swipeThreshold = 50; // الحد الأدنى للسحب (بكسل)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // سحب لليسار -> اليوم التالي
        onCalendarDayNavigate("next");
      } else {
        // سحب لليمين -> اليوم السابق
        onCalendarDayNavigate("prev");
      }
    }

    touchStartX.current = null;
  };

  // 🆕 حساب الأيام للشريط الأفقي
  const dayStripDays = useMemo(() => {
    // إذا تم تمرير weekDays، استخدمها (للتكامل مع عرض الأسبوع)
    if (weekDays && weekDays.length > 0) return weekDays;

    // إنشاء 7 أيام حول اليوم المحدد
    const days: Date[] = [];
    const selected = new Date(selectedCalendarDay);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selected);
      d.setDate(selected.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedCalendarDay, weekDays]);

  const todayStr = today
    ? today.toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return (
    <>
      {/* 🆕 شريط الأيام الأفقي للتنقل السريع */}
      {dayStripDays.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-200 bg-white overflow-x-auto scrollbar-hide">
          {dayStripDays.map((day) => {
            const dateStr = day.toISOString().split("T")[0];
            const isSelected = dateStr === selectedCalendarDay;
            const isToday = dateStr === todayStr;
            const sessionCount = sessionsForCalendarDay(dateStr).length;

            return (
              <button
                key={dateStr}
                onClick={() => onCalendarDaySelect?.(dateStr)}
                className={`
                  flex-shrink-0 flex flex-col items-center justify-center
                  w-12 h-14 rounded-xl text-xs transition-all duration-200
                  ${
                    isSelected
                      ? "bg-gray-800 text-white shadow-md scale-105"
                      : isToday
                        ? "bg-blue-50 text-blue-600 border-2 border-blue-300"
                        : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }
                `}
              >
                <span className="text-[10px] font-medium">
                  {getShortDayName(dateStr)}
                </span>
                <span className="text-sm font-bold leading-tight">
                  {day.getDate()}
                </span>
                {sessionCount > 0 && (
                  <span
                    className={`
                      text-[9px] leading-none mt-0.5
                      ${isSelected ? "text-white/80" : "text-gray-400"}
                    `}
                  >
                    {sessionCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Day navigation header مع زر اليوم */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => onCalendarDayNavigate("prev")}
          className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
          aria-label="اليوم السابق"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-gray-800">
            {getDayName(selectedCalendarDay)}{" "}
            {formatDisplayDate(selectedCalendarDay)}
          </h3>
          {/* 🆕 زر العودة لليوم */}
          {selectedCalendarDay !== todayStr && onCalendarDaySelect && (
            <button
              onClick={() => onCalendarDaySelect(todayStr)}
              className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition"
            >
              اليوم
            </button>
          )}
        </div>

        <button
          onClick={() => onCalendarDayNavigate("next")}
          className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
          aria-label="اليوم التالي"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Vertical time grid - مع دعم السحب */}
      <div
        className="relative"
        style={{ height: "660px", overflow: "auto" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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

      {/* 🆕 عرض أجندة مكثفة أسفل الشبكة (يظهر فقط عند وجود جلسات) */}
      {daySessions.length > 0 && (
        <div className="border-t border-gray-200">
          <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <List size={13} className="text-gray-500" />
                قائمة الجلسات
              </span>
              <span className="text-xs text-gray-500">
                {daySessions.length} جلسات
              </span>
            </div>
          </div>
          <MobileDayAgendaList
            sessions={daySessions}
            getPatientData={getPatientData}
            onSessionSelect={onSessionSelect}
          />
        </div>
      )}

      {/* 🆕 رسالة عند عدم وجود جلسات */}
      {daySessions.length === 0 && (
        <div className="py-16 text-center border-t border-gray-200">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium">
            لا توجد جلسات في هذا اليوم
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {getDayName(selectedCalendarDay)} -{" "}
            {formatDisplayDate(selectedCalendarDay)}
          </p>
        </div>
      )}
    </>
  );
}

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
  className="fixed inset-0 z-50 flex items-center justify-center p-4"
  onClick={onClose}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.15 }}
>
  {/* خلفية داكنة شفافة */}
  <motion.div
    className="absolute inset-0 backdrop-blur-[2px]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  />

  {/* البطاقة المنبثقة */}
  <motion.div
    className="relative bg-white w-[calc(100%-2rem)] max-w-sm rounded-3xl shadow-2xl overflow-hidden text-gray-900"
    onClick={(e) => e.stopPropagation()}
    dir="rtl"
    initial={{ scale: 0.85, opacity: 0, y: 10 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0.9, opacity: 0, y: 10 }}
    transition={{ 
      type: "spring", 
      damping: 25, 
      stiffness: 350,
      mass: 0.6
    }}
  >
  {/* Header */}
  <div className="relative px-5 pt-5 pb-4">
    <button
      onClick={onClose}
      className="absolute left-3 top-4 w-8 h-8 rounded-full bg-gray-100/80 flex items-center justify-center 
                 text-gray-400 hover:text-gray-600 hover:bg-gray-200 active:scale-95 transition-all z-10"
    >
      <X size={15} />
    </button>

    {/* وسوم الحالة والدفع */}
    <div className="flex items-center gap-2 mb-3 pr-1">
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{
          backgroundColor: statusDisplay.bgColor,
          color: statusDisplay.color,
        }}
      >
        <StatusIcon size={13} />
        {statusDisplay.label}
      </span>
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{
          backgroundColor: paymentDisplay.bgColor,
          color: paymentDisplay.color,
        }}
      >
        <PaymentIcon size={13} />
        {paymentDisplay.label}
      </span>
    </div>

    <h3 className="text-lg font-bold text-gray-900 pr-1 leading-tight">
      {patient?.fullName || session.patientSnapshot?.name}
    </h3>
  </div>

  {/* Content */}
  <div className="px-5 pb-4 space-y-3">
    
    {/* بطاقة معلومات الجلسة */}
    <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
      <ModalInfoRow icon={Calendar} label="التاريخ والوقت">
        <div className="flex flex-col gap-0.5 text-left">
          <span className="text-xs font-medium text-gray-900">
            {getDayName(dateStr)} {formatDisplayDate(dateStr)}
          </span>
          <span className="text-[11px] text-gray-500">
            {formatTime(session.startTime)}
          </span>
        </div>
      </ModalInfoRow>

      <div className="border-t border-gray-200/60" />

      <ModalInfoRow icon={Stethoscope} label="الإجراء">
        <span className="text-xs font-medium text-gray-900 text-left line-clamp-2">
          {session.plannedProcedure || session.performedProcedure || "-"}
        </span>
      </ModalInfoRow>

      <div className="border-t border-gray-200/60" />

      <ModalInfoRow
        icon={Hash}
        label="التكلفة"
        valueColor={session.isPaid ? "#059669" : "#DC2626"}
        bold
      >
        {session.sessionCost?.toLocaleString()} {getCurrency()}
      </ModalInfoRow>
    </div>

    {/* بطاقة معلومات المريض */}
    <div className="bg-blue-50/50 rounded-2xl p-4 space-y-3">
      <ModalInfoRow icon={Phone} label="رقم الهاتف" dir="ltr">
        <span className="text-xs font-medium text-gray-900">
          {patient?.phone || session.patientSnapshot?.phone || "-"}
        </span>
      </ModalInfoRow>

      <div className="border-t border-blue-100/60" />

      <ModalInfoRow icon={User} label="المعلومات الشخصية">
        <span className="text-xs font-medium text-gray-900">
          {patient?.age || "-"} سنة · {genderArabic}
        </span>
      </ModalInfoRow>
    </div>

  </div>

  {/* Footer */}
  <div className="px-5 pb-5 pt-1">
    <button
      onClick={onClose}
      className="w-full py-3 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-2xl 
                 text-sm font-medium transition-all active:scale-[0.98]"
    >
      إغلاق
    </button>
  </div>
</motion.div>
</motion.div>
  );
}

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
  label,
  children,
  dir,
  valueColor,
  bold,
}: ModalInfoRowProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon size={13} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="text-[11px] text-gray-500 flex-shrink-0">{label}</span>
        <div dir={dir} className="text-right" style={valueColor ? { color: valueColor } : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Excel Export Utility
// ============================================================================

// ============================================================================
// Excel Export Utility
// ============================================================================

function exportToExcel(
  sessions: Session[],
  clinicName: string,
  clinicColor: string,
  periodTitle: string,
  getPatientData: (patientId: string) => Patient | undefined,
) {
  const primaryColor = clinicColor.replace("#", "");

  // إنشاء ورقة عمل جديدة
  const wb = XLSX.utils.book_new();

  // البيانات الأساسية
  const excelData: any[][] = [];

  // صف العنوان الرئيسي
  excelData.push([clinicName]);

  // إضافة معلومات الفترة
  excelData.push([periodTitle]);

  // صف عناوين الأعمدة
  excelData.push([
    "اليوم",
    "التاريخ",
    "الاسم",
    "الرقم",
    "العمر",
    "الجنس",
    "الجلسة",
    "الوقت",
    "التكلفة",
    "الدفع",
    "حالة الجلسة",
  ]);

  sessions.forEach((session) => {
    const dateStr = getDateString(session.startTime);
    const dayName = getDayName(dateStr);
    const formattedDate = formatDisplayDate(dateStr);
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
      dayName,
      formattedDate,
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

  const totalCost = sessions.reduce(
    (sum, s) => sum + (s.sessionCost || 0),
    0,
  );
  const paidCount = sessions.filter((s) => s.isPaid).length;
  const unpaidCount = sessions.filter((s) => !s.isPaid).length;
  const footerText = `تم إنشاء هذا الجدول بواسطة نظام LiveDent`;

  excelData.push([]);
  excelData.push([
    "", "", "", "", "", "", "", "", "الإجمالي:", totalCost, "",
  ]);
  excelData.push([
    "", "", "", "", "", "", "", "", "مدفوع:", paidCount, "جلسة",
  ]);
  excelData.push([
    "", "", "", "", "", "", "", "", "غير مدفوع:", unpaidCount, "جلسة",
  ]);
  excelData.push([]);
  excelData.push([footerText]);

  // تحويل البيانات إلى ورقة عمل
  const ws = XLSX.utils.aoa_to_sheet(excelData);

  // تهيئة مصفوفة الدمج
  if (!ws["!merges"]) ws["!merges"] = [];

  // دمج خلايا العنوان
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } });
  ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 10 } });
  ws["!merges"].push({
    s: { r: excelData.length - 1, c: 0 },
    e: { r: excelData.length - 1, c: 10 },
  });

  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:K1");
  const darkerColor = adjustColor(clinicColor, -30).replace("#", "");

  // تطبيق التنسيقات
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) ws[cellAddress] = { t: "s", v: "" };
      if (!ws[cellAddress].s) ws[cellAddress].s = {};

      const cell = ws[cellAddress];
      const rowData = excelData[R];

      // تنسيق صف العنوان الرئيسي
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
      }
      // تنسيق صف الفترة
      else if (R === 1) {
        cell.s = {
          font: { bold: true, sz: 13, color: { rgb: primaryColor } },
          fill: { fgColor: { rgb: "F8FAFC" }, patternType: "solid" },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
      // تنسيق صف العناوين
      else if (R === 2) {
        cell.s = {
          font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: darkerColor }, patternType: "solid" },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
      // تنسيق صفوف البيانات
      else if (
        R > 2 &&
        rowData &&
        rowData[0] !== "" &&
        !rowData[8]?.toString().includes("الإجمالي") &&
        !rowData[8]?.toString().includes("مدفوع")
      ) {
        const isEvenRow = (R - 3) % 2 === 0;

        cell.s = {
          font: { sz: 11, color: { rgb: "1F2937" } },
          fill: {
            fgColor: { rgb: isEvenRow ? "FFFFFF" : "F8FAFC" },
            patternType: "solid",
          },
          alignment: {
            horizontal: C === 3 ? "left" : "center",
            vertical: "center",
          },
        };

        // تنسيق عمود الاسم
        if (C === 2) {
          cell.s.font = { ...cell.s.font, bold: true, sz: 12, color: { rgb: "111827" } };
        }

        // تنسيق عمود التكلفة
        if (C === 8) {
          cell.s.font = { ...cell.s.font, bold: true };
        }

        // تنسيق عمود الدفع
        if (C === 9) {
          const pay = rowData[9];
          if (pay === "غير مدفوع") {
            cell.s.fill = { fgColor: { rgb: "FEE2E2" }, patternType: "solid" };
            cell.s.font = { bold: true, sz: 11, color: { rgb: "DC2626" } };
          } else if (pay === "نقداً") {
            cell.s.fill = { fgColor: { rgb: "D1FAE5" }, patternType: "solid" };
            cell.s.font = { bold: true, sz: 11, color: { rgb: "059669" } };
          } else if (pay === "بطاقة") {
            cell.s.fill = { fgColor: { rgb: "DBEAFE" }, patternType: "solid" };
            cell.s.font = { bold: true, sz: 11, color: { rgb: "2563EB" } };
          } else if (pay === "تحويل") {
            cell.s.fill = { fgColor: { rgb: "EDE9FE" }, patternType: "solid" };
            cell.s.font = { bold: true, sz: 11, color: { rgb: "7C3AED" } };
          } else if (pay === "مدفوع") {
            cell.s.fill = { fgColor: { rgb: "D1FAE5" }, patternType: "solid" };
            cell.s.font = { bold: true, sz: 11, color: { rgb: "059669" } };
          }
        }

        // تنسيق عمود الحالة
        if (C === 10) {
          const status = rowData[10];
          if (status === "مكتمل") {
            cell.s.fill = { fgColor: { rgb: "D1FAE5" }, patternType: "solid" };
            cell.s.font = { bold: true, sz: 11, color: { rgb: "059669" } };
          } else if (status === "مجدول") {
            cell.s.fill = { fgColor: { rgb: "DBEAFE" }, patternType: "solid" };
            cell.s.font = { bold: true, sz: 11, color: { rgb: "2563EB" } };
          } else if (status === "ملغي") {
            cell.s.fill = { fgColor: { rgb: "F3F4F6" }, patternType: "solid" };
            cell.s.font = { bold: true, sz: 11, color: { rgb: "6B7280" } };
          } else if (status === "لم يحضر") {
            cell.s.fill = { fgColor: { rgb: "FFEDD5" }, patternType: "solid" };
            cell.s.font = { bold: true, sz: 11, color: { rgb: "EA580C" } };
          } else if (status === "قيد التنفيذ") {
            cell.s.fill = { fgColor: { rgb: "FEF3C7" }, patternType: "solid" };
            cell.s.font = { bold: true, sz: 11, color: { rgb: "D97706" } };
          }
        }
      }
      // تنسيق صف الإجمالي
      else if (rowData && rowData[8] === "الإجمالي:") {
        cell.s = {
          font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: primaryColor }, patternType: "solid" },
          alignment: {
            horizontal: C === 8 ? "right" : "center",
            vertical: "center",
          },
        };
      }
      // تنسيق صفوف المدفوع/غير مدفوع
      else if (rowData && (rowData[8] === "مدفوع:" || rowData[8] === "غير مدفوع:")) {
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
          alignment: {
            horizontal: C === 8 ? "right" : "center",
            vertical: "center",
          },
        };
      }
      // تنسيق سطر التوقيع
      else if (R === excelData.length - 1) {
        cell.s = {
          font: { italic: true, sz: 10, color: { rgb: "6B7280" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }
  }

  // تعيين ارتفاع الصفوف
  ws["!rows"] = [];
  ws["!rows"][0] = { hpt: 45 };
  ws["!rows"][1] = { hpt: 30 };
  ws["!rows"][2] = { hpt: 35 };
  for (let i = 3; i <= range.e.r; i++) {
    ws["!rows"][i] = { hpt: 28 };
  }

  // تعيين عرض الأعمدة
  ws["!cols"] = [
    { wch: 14 },
    { wch: 16 },
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

  // تعيين اتجاه RTL
  ws["!rtl"] = true;

  // إضافة الورقة للمصنف
  XLSX.utils.book_append_sheet(wb, ws, "جدول المرضى");

  // اسم الملف
  const fileName = `جدول_المرضى_${clinicName}_${new Date().toISOString().split("T")[0]}.xlsx`;

  // حفظ الملف
  XLSX.writeFile(wb, fileName);
}

// ============================================================================
// Main Component: PatientsTab
// ============================================================================

// ============================================================================
// Component: ViewTypeSwitcher (مكبر - مستقل)
// ============================================================================

interface ViewTypeSwitcherProps {
  clinicColor: string;
  viewType: ViewType;
  onViewTypeChange: (type: ViewType) => void;
}

function ViewTypeSwitcher({
  clinicColor,
  viewType,
  onViewTypeChange,
}: ViewTypeSwitcherProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center bg-gray-100 rounded-full p-1">
        {/* زر عرض الجدول */}
        <button
          onClick={() => onViewTypeChange("table")}
          className={`
            flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm
            transition-all duration-200 whitespace-nowrap
            ${
              viewType === "table"
                ? "text-white shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
          style={
            viewType === "table"
              ? {
                  backgroundColor: clinicColor,
                  boxShadow: `0 2px 8px ${clinicColor}40`,
                }
              : {}
          }
          title="عرض جدولي"
        >
          <LayoutGrid size={20} />
          <span className="hidden sm:inline">جدول</span>
        </button>

        {/* زر عرض الأجندة */}
        <button
          onClick={() => onViewTypeChange("agenda")}
          className={`
            flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm
            transition-all duration-200 whitespace-nowrap
            ${
              viewType === "agenda"
                ? "text-white shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
          style={
            viewType === "agenda"
              ? {
                  backgroundColor: clinicColor,
                  boxShadow: `0 2px 8px ${clinicColor}40`,
                }
              : {}
          }
          title="عرض أجندة مكثفة"
        >
          <List size={20} />
          <span className="hidden sm:inline">أجندة</span>
        </button>

        {/* زر عرض التقويم */}
        <button
          onClick={() => onViewTypeChange("calendar")}
          className={`
            flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm
            transition-all duration-200 whitespace-nowrap
            ${
              viewType === "calendar"
                ? "text-white shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }
          `}
          style={
            viewType === "calendar"
              ? {
                  backgroundColor: clinicColor,
                  boxShadow: `0 2px 8px ${clinicColor}40`,
                }
              : {}
          }
          title="عرض تقويم"
        >
          <CalendarDays size={20} />
          <span className="hidden sm:inline">تقويم</span>
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component: PatientsTab (معدل - Mobile First مع ترتيب جديد)
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
  const [viewType, setViewType] = useState<ViewType>("agenda");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() =>
    getStartOfWeek(today),
  );
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>(
    today.toISOString().split("T")[0],
  );
  const [mobileCalendarSubView, setMobileCalendarSubView] = useState<
    "day" | "week"
  >("day");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">(
    "all",
  );
  const [searchFilterType, setSearchFilterType] = useState<
    "all" | "patient" | "procedure" | "date" | "status" | "payment"
  >("all");
  

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

    if (paymentFilter === "paid") {
      base = base.filter((s) => s.isPaid);
    } else if (paymentFilter === "unpaid") {
      base = base.filter((s) => !s.isPaid);
    }

    if (!searchTerm.trim()) return base;

    const normalized = normalizeSearchText(searchTerm);
    return base.filter((session) => {
      const patient = getPatientData(session.patientId);
      const name = patient?.fullName || session.patientSnapshot?.name || "";
      const procedure =
        session.plannedProcedure || session.performedProcedure || "";
      const dateStr = formatDisplayDate(getDateString(session.startTime));
      const statusLabel = getSessionStatusDisplay(session.status).label;
      const paymentLabel = getPaymentMethodDisplay(session).label;

      switch (searchFilterType) {
        case "patient":
          return normalizeSearchText(name).includes(normalized);
        case "procedure":
          return normalizeSearchText(procedure).includes(normalized);
        case "date":
          return normalizeSearchText(dateStr).includes(normalized);
        case "status":
          return normalizeSearchText(statusLabel).includes(normalized);
        case "payment":
          return normalizeSearchText(paymentLabel).includes(normalized);
        default:
          return normalizeSearchText(
            `${name} ${procedure} ${dateStr} ${statusLabel} ${paymentLabel}`,
          ).includes(normalized);
      }
    });
  }, [
    viewMode,
    selectedDate,
    sessionsByDate,
    currentMonthSessions,
    allSessionsSorted,
    searchTerm,
    searchFilterType,
    paymentFilter,
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
    for (let i = 0; i < 7; i++) {
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
    end.setDate(end.getDate() + 7);
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

  const changeCalendarDay = (newDateStr: string) => {
    setSelectedCalendarDay(newDateStr);

    const newDate = new Date(newDateStr);
    const currentStart = new Date(currentWeekStart);
    const currentEnd = new Date(currentWeekStart);
    currentEnd.setDate(currentEnd.getDate() + 6);
    currentEnd.setHours(23, 59, 59, 999);

    if (newDate < currentStart || newDate > currentEnd) {
      setCurrentWeekStart(getStartOfWeek(newDate));
    }

    if (viewType === "agenda" || viewType === "table") {
      setSelectedDate(newDateStr);
    }
  };

  const handleCalendarDayNavigate = (direction: "prev" | "next") => {
    const current = new Date(selectedCalendarDay);
    current.setDate(current.getDate() + (direction === "next" ? 1 : -1));
    const newDateStr = current.toISOString().split("T")[0];
    changeCalendarDay(newDateStr);
  };

  const handleViewTypeChange = (type: ViewType) => {
    if (isMobile && type !== "agenda") return;
    const previousViewType = viewType;
    setViewType(type);

    if (type === "agenda" || type === "table") {
      if (previousViewType === "calendar") {
        setSelectedDate(selectedCalendarDay);
      }
    } else if (type === "calendar") {
      if (previousViewType === "agenda" || previousViewType === "table") {
        changeCalendarDay(selectedDate);
      }
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);

    if (mode === "day") {
      if (selectedCalendarDay) {
        setSelectedDate(selectedCalendarDay);
      }
    }
  };

  const handleViewModeChangeWithReset = (mode: ViewMode) => {
    setPaymentFilter("all");
    handleViewModeChange(mode);
  };

  // ---- Period title ----
  const getPeriodTitle = () => {
    if (viewType === "calendar") {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${formatDisplayDate(start.toISOString().split("T")[0])} - ${formatDisplayDate(end.toISOString().split("T")[0])}`;
    }
    if (viewType === "agenda") {
      if (viewMode === "all") return "جميع الجلسات - عرض الأجندة";
      if (viewMode === "month")
        return `أجندة ${today.toLocaleDateString("ar-SA", {
          month: "long",
          year: "numeric",
        })}`;
      return `أجندة ${getDayName(selectedDate)} - ${formatDisplayDate(selectedDate)}`;
    }
    if (viewMode === "all") return "جميع الجلسات";
    if (viewMode === "month")
      return today.toLocaleDateString("ar-SA", {
        month: "long",
        year: "numeric",
      });
    return `${getDayName(selectedDate)} - ${formatDisplayDate(selectedDate)}`;
  };

const handleExport = () => {
  const sessionsToExport =
    viewType === "calendar" ? calendarWeekSessions : displayedSessions;

  exportToExcel(
    sessionsToExport,
    clinicName,
    clinicColor,
    getPeriodTitle(),
    getPatientData,
  );
};

  // ---- Refresh handler ----
  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent("refreshPatientsData"));
  };

  // ---- Current sessions for stats ----
  const getCurrentDisplayedSessions = () => {
    if (viewType === "calendar") return calendarWeekSessions;
    return displayedSessions;
  };

  const currentDisplayedSessions = getCurrentDisplayedSessions();

  // 🆕 إحصائيات مبسطة للهيدر
  const totalSessions = currentDisplayedSessions.length;
  const totalCost = currentDisplayedSessions.reduce(
    (sum, s) => sum + (s.sessionCost || 0),
    0,
  );
  const paidCost = currentDisplayedSessions
    .filter((s) => s.isPaid)
    .reduce((sum, s) => sum + (s.sessionCost || 0), 0);
  const unpaidCost = currentDisplayedSessions
    .filter((s) => !s.isPaid)
    .reduce((sum, s) => sum + (s.sessionCost || 0), 0);
  const paidSessionsCount = currentDisplayedSessions.filter(
    (s) => s.isPaid,
  ).length;
  const unpaidSessionsCount = currentDisplayedSessions.filter(
    (s) => !s.isPaid,
  ).length;

  // ============================================================================
  // Render
  // ============================================================================
  return (
    <div className="space-y-3 sm:space-y-4 pb-20" dir="rtl">
      {/* ============================================================ */}
      {/* 1. الهيدر مع الإحصائيات المبسطة وأزرار التحكم                    */}
      {/* ============================================================ */}
      <PatientsHeader
        clinicName={clinicName}
        clinicColor={clinicColor}
        periodTitle={getPeriodTitle()}
        onRefresh={handleRefresh}
        onExport={handleExport}
        viewMode={viewMode}
        viewType={viewType}
        onViewModeChange={handleViewModeChangeWithReset}
        totalSessions={totalSessions}
        totalCost={totalCost}
        paidCost={paidCost}
        unpaidCost={unpaidCost}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
        handleViewTypeChange={handleViewTypeChange}
        isMobile={isMobile}
      />

      {/* ============================================================ */}
      {/* 3. فلتر الدفع المصغر (وسامات) - مخفي في التقويم                   */}
      {/* ============================================================ */}
      {viewType !== "calendar" && (
        <PatientsStatsBar
          clinicColor={clinicColor}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
          paidSessionsCount={paidSessionsCount}
          unpaidSessionsCount={unpaidSessionsCount}
          viewType={viewType}
        />
      )}

      {/* ============================================================ */}
      {/* 4. شريط الأدوات - فلتر موحد + تنقل + بحث                        */}
      {/* ============================================================ */}
      <PatientsToolbar
        isMobile={isMobile}
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
        onSearchClear={() => {
          setSearchTerm("");
          setSearchFilterType("all");
        }}
        onSortToggle={(checked) => setSortOrder(checked ? "asc" : "desc")}
        onViewModeChange={handleViewModeChangeWithReset}
        onViewTypeChange={handleViewTypeChange}
        canGoPrevious={
          availableDates.indexOf(selectedDate) < availableDates.length - 1
        }
        canGoNext={availableDates.indexOf(selectedDate) > 0}
        onRefresh={handleRefresh}
        onExport={handleExport}
        paymentFilter={paymentFilter}
        onPaymentFilterChange={setPaymentFilter}
      />

      {/* ============================================================ */}
      {/* 5. المحتوى الرئيسي (جدول / أجندة / تقويم)                        */}
      {/* ============================================================ */}
      {viewType === "calendar" ? (
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
          onCalendarDaySelect={changeCalendarDay}
          onMobileSubViewChange={setMobileCalendarSubView}
          onCalendarDayNavigate={handleCalendarDayNavigate}
          getPatientData={getPatientData}
          onSessionSelect={setSelectedSession}
        />
      ) : (
        <PatientsTable
          sessions={displayedSessions}
          sessionsWithMobileGroups={sessionsWithMobileGroups}
          searchTerm={searchTerm}
          viewMode={viewMode}
          viewType={viewType}
          isMobile={isMobile}
          getPatientData={getPatientData}
          onSessionSelect={setSelectedSession}
        />
      )}

      {/* ============================================================ */}
      {/* 6. نافذة تفاصيل الجلسة                                          */}
      {/* ============================================================ */}
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
