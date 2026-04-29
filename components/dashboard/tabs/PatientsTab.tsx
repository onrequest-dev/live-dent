// components/dashboard/tabs/PatientsTab.tsx
"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { Clinic, Patient, PatientCase, Session } from "@/types";

type ViewMode = "day" | "month" | "all";

interface PatientsTabProps {
  clinicData: Clinic | null;
  patients: Patient[];
  patientCases: PatientCase[];
  sessions: Session[];
}

export function PatientsTab({
  clinicData,
  patients,
  patientCases,
  sessions,
}: PatientsTabProps) {
  const clinicColor = clinicData?.settings.primaryColor || "#8385da";
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // ✅ ترتيب تنازلي افتراضي (الأحدث أولاً)

  // ✅ تعريف getPatientData قبل استخدامها
  const getPatientData = (patientId: string) => {
    return patients.find((p) => p.id === patientId);
  };

  // تجميع الجلسات حسب التاريخ
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, Session[]> = {};

    sessions.forEach((session) => {
      const dateKey = new Date(session.startTime).toISOString().split("T")[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
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

  // جميع الجلسات مرتبة حسب التاريخ والوقت
  const allSessionsSorted = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const dateCompare =
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      return dateCompare;
    });
  }, [sessions]);

  // ✅ تصفية جلسات الشهر الحالي
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

  const normalizeSearchText = (value: string) => {
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

  // تطبيق البحث على الجلسات حسب وضع العرض
  const filteredSessions = useMemo(() => {
    let baseSessions: Session[] = [];

    if (viewMode === "day") {
      baseSessions = sessionsByDate[selectedDate] || [];
    } else if (viewMode === "month") {
      baseSessions = currentMonthSessions;
    } else {
      baseSessions = allSessionsSorted;
    }

    if (!searchTerm.trim()) {
      return baseSessions;
    }

    const normalizedSearchTerm = normalizeSearchText(searchTerm);

    return baseSessions.filter((session) => {
      const patient = getPatientData(session.patientId);
      const patientName =
        patient?.fullName || session.patientSnapshot?.name || "";
      const normalizedPatientName = normalizeSearchText(patientName);
      return normalizedPatientName.includes(normalizedSearchTerm);
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

  // ✅ البيانات النهائية للعرض مع الترتيب
  const displayedSessions = useMemo(() => {
    const sessions = [...filteredSessions];
    // ترتيب حسب التاريخ والوقت
    sessions.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });
    return sessions;
  }, [filteredSessions, sortOrder]);

  // التواريخ المتاحة
  const availableDates = useMemo(() => {
    return Object.keys(sessionsByDate).sort((a, b) => b.localeCompare(a));
  }, [sessionsByDate]);

  // تنسيق التاريخ للعرض
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // الحصول على اسم اليوم بالعربية
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    return days[date.getDay()];
  };

  // تنسيق الوقت
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // استخراج التاريخ من كائن Date
  const getDateString = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  // التنقل بين الأيام
  const goToPreviousDay = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

  const goToNextDay = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };

  // الحصول على أيقونة واسم طريقة الدفع
  const getPaymentMethodDisplay = (session: Session) => {
    if (!session.isPaid) {
      return {
        icon: XCircle,
        text: "غير مدفوع",
        color: "#DC2626",
        bgColor: "#FEE2E2",
        borderColor: "#FECACA",
      };
    }

    switch (session.paymentMethod) {
      case "cash":
        return {
          icon: Banknote,
          text: "نقداً",
          color: "#059669",
          bgColor: "#D1FAE5",
          borderColor: "#A7F3D0",
        };
      case "card":
        return {
          icon: CreditCard,
          text: "تحويل",
          color: "#2563EB",
          bgColor: "#DBEAFE",
          borderColor: "#BFDBFE",
        };
      case "transfer":
        return {
          icon: Landmark,
          text: "تحويل",
          color: "#7C3AED",
          bgColor: "#EDE9FE",
          borderColor: "#DDD6FE",
        };
      default:
        return {
          icon: Wallet,
          text: "مدفوع",
          color: "#059669",
          bgColor: "#D1FAE5",
          borderColor: "#A7F3D0",
        };
    }
  };

  // الحصول على أيقونة واسم حالة الجلسة
  const getSessionStatusDisplay = (status: string) => {
    switch (status) {
      case "scheduled":
        return {
          icon: Calendar,
          text: "مجدول",
          color: "#2563EB",
          bgColor: "#DBEAFE",
        };
      case "completed":
        return {
          icon: CheckCircle,
          text: "مكتمل",
          color: "#059669",
          bgColor: "#D1FAE5",
        };
      case "cancelled":
        return {
          icon: XCircle,
          text: "ملغي",
          color: "#6B7280",
          bgColor: "#F3F4F6",
        };
      case "no-show":
        return {
          icon: AlertCircle,
          text: "لم يحضر",
          color: "#EA580C",
          bgColor: "#FFEDD5",
        };
      case "in-progress":
        return {
          icon: Clock,
          text: "قيد التنفيذ",
          color: "#D97706",
          bgColor: "#FEF3C7",
        };
      default:
        return {
          icon: Clock,
          text: status,
          color: "#6B7280",
          bgColor: "#F3F4F6",
        };
    }
  };

  // ✅ الحصول على عنوان الفترة الحالية
  const getPeriodTitle = () => {
    if (viewMode === "all") {
      return "جميع الجلسات";
    } else if (viewMode === "month") {
      return today.toLocaleDateString("ar-SA", {
        month: "long",
        year: "numeric",
      });
    } else {
      return `${getDayName(selectedDate)} - ${formatDisplayDate(selectedDate)}`;
    }
  };

  // ✅ دالة مساعدة لتعديل درجة اللون (تغميق أو تفتيح)
  const adjustColor = (hex: string, percent: number): string => {
    // إزالة # إذا وجدت
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
  };
  // ✅ تصدير Excel بتنسيق محسّن - نسخة مصححة
  const exportToExcel = () => {
    const clinicName = clinicData?.name || "عيادة الأسنان";
    const primaryColor = clinicColor.replace("#", "");

    // إنشاء ورقة عمل جديدة
    const wb = XLSX.utils.book_new();

    // البيانات الأساسية
    const excelData: any[][] = [];

    // صف العنوان الرئيسي
    excelData.push([clinicName]);

    // إضافة معلومات الفترة
    excelData.push([getPeriodTitle()]);

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

    const sessionsToExport = displayedSessions;

    sessionsToExport.forEach((session) => {
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
        paymentDisplay.text,
        statusDisplay.text,
      ]);
    });

    const totalCost = sessionsToExport.reduce(
      (sum, s) => sum + (s.sessionCost || 0),
      0,
    );
    const paidCount = sessionsToExport.filter((s) => s.isPaid).length;
    const unpaidCount = sessionsToExport.filter((s) => !s.isPaid).length;
    const footerText = `تم إنشاء هذا الجدول بواسطة نظام LiveDent`;
    excelData.push([]);
    excelData.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "الإجمالي:",
      totalCost,
      "",
    ]);
    excelData.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "مدفوع:",
      paidCount,
      "جلسة",
    ]);
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
    excelData.push([]); // سطر فارغ للفصل
    excelData.push([footerText]);

    // تحويل البيانات إلى ورقة عمل
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // ✅ تهيئة مصفوفة الدمج بشكل صحيح
    if (!ws["!merges"]) ws["!merges"] = [];

    // دمج خلايا العنوان
    ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } });
    ws["!merges"].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 10 } });

    ws["!merges"].push({
      s: { r: excelData.length - 1, c: 0 },
      e: { r: excelData.length - 1, c: 10 },
    });
    // ✅ الحصول على نطاق الخلايا بشكل آمن
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:K1");
    const darkerColor = adjustColor(clinicColor, -30).replace("#", "");

    // ✅ تطبيق التنسيقات على جميع الخلايا
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

        // ✅ التأكد من وجود الخلية
        if (!ws[cellAddress]) {
          ws[cellAddress] = { t: "s", v: "" };
        }

        // ✅ التأكد من وجود كائن التنسيق
        if (!ws[cellAddress].s) ws[cellAddress].s = {};

        const cell = ws[cellAddress];
        const rowData = excelData[R];

        // ============ تنسيق صف العنوان الرئيسي ============
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

        // ============ تنسيق صف الفترة ============
        else if (R === 1) {
          cell.s = {
            font: { bold: true, sz: 13, color: { rgb: primaryColor } },
            fill: { fgColor: { rgb: "F8FAFC" }, patternType: "solid" },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "CBD5E1" } },
              bottom: { style: "thin", color: { rgb: "CBD5E1" } },
              left: { style: "thin", color: { rgb: "CBD5E1" } },
              right: { style: "thin", color: { rgb: "CBD5E1" } },
            },
          };
        }

        // ============ تنسيق صف العناوين ============
        else if (R === 2) {
          cell.s = {
            font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: darkerColor }, patternType: "solid" },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "medium", color: { rgb: darkerColor } },
              bottom: { style: "medium", color: { rgb: darkerColor } },
              left: { style: "thin", color: { rgb: darkerColor } },
              right: { style: "thin", color: { rgb: darkerColor } },
            },
          };
        }

        // ============ تنسيق صفوف البيانات ============
        else if (
          R > 2 &&
          rowData &&
          rowData[0] !== "" &&
          !rowData[8]?.toString().includes("الإجمالي") &&
          !rowData[8]?.toString().includes("مدفوع")
        ) {
          // تنسيق الصفوف بالتبادل (zebra striping)
          const isEvenRow = (R - 3) % 2 === 0;

          // تنسيق أساسي
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
            border: {
              top: { style: "thin", color: { rgb: "E2E8F0" } },
              bottom: { style: "thin", color: { rgb: "E2E8F0" } },
              left: { style: "thin", color: { rgb: "E2E8F0" } },
              right: { style: "thin", color: { rgb: "E2E8F0" } },
            },
          };

          // ✅ تنسيق عمود الدفع
          if (C === 9) {
            const paymentValue = rowData[9];

            if (paymentValue === "غير مدفوع") {
              cell.s.fill = {
                fgColor: { rgb: "FEE2E2" },
                patternType: "solid",
              };
              cell.s.font = { bold: true, sz: 11, color: { rgb: "DC2626" } };
              cell.s.border = {
                top: { style: "thin", color: { rgb: "FCA5A5" } },
                bottom: { style: "thin", color: { rgb: "FCA5A5" } },
                left: { style: "thin", color: { rgb: "FCA5A5" } },
                right: { style: "thin", color: { rgb: "FCA5A5" } },
              };
            } else if (paymentValue === "نقداً") {
              cell.s.fill = {
                fgColor: { rgb: "D1FAE5" },
                patternType: "solid",
              };
              cell.s.font = { bold: true, sz: 11, color: { rgb: "059669" } };
            } else if (paymentValue === "بطاقة") {
              cell.s.fill = {
                fgColor: { rgb: "DBEAFE" },
                patternType: "solid",
              };
              cell.s.font = { bold: true, sz: 11, color: { rgb: "2563EB" } };
            } else if (paymentValue === "تحويل") {
              cell.s.fill = {
                fgColor: { rgb: "EDE9FE" },
                patternType: "solid",
              };
              cell.s.font = { bold: true, sz: 11, color: { rgb: "7C3AED" } };
            } else if (paymentValue === "مدفوع") {
              cell.s.fill = {
                fgColor: { rgb: "D1FAE5" },
                patternType: "solid",
              };
              cell.s.font = { bold: true, sz: 11, color: { rgb: "059669" } };
            }
          }

          // ✅ تنسيق عمود الحالة
          if (C === 10) {
            const statusValue = rowData[10];

            if (statusValue === "مكتمل") {
              cell.s.fill = {
                fgColor: { rgb: "D1FAE5" },
                patternType: "solid",
              };
              cell.s.font = { bold: true, sz: 11, color: { rgb: "059669" } };
            } else if (statusValue === "مجدول") {
              cell.s.fill = {
                fgColor: { rgb: "DBEAFE" },
                patternType: "solid",
              };
              cell.s.font = { bold: true, sz: 11, color: { rgb: "2563EB" } };
            } else if (statusValue === "ملغي") {
              cell.s.fill = {
                fgColor: { rgb: "F3F4F6" },
                patternType: "solid",
              };
              cell.s.font = { bold: true, sz: 11, color: { rgb: "6B7280" } };
            } else if (statusValue === "لم يحضر") {
              cell.s.fill = {
                fgColor: { rgb: "FFEDD5" },
                patternType: "solid",
              };
              cell.s.font = { bold: true, sz: 11, color: { rgb: "EA580C" } };
            } else if (statusValue === "قيد التنفيذ") {
              cell.s.fill = {
                fgColor: { rgb: "FEF3C7" },
                patternType: "solid",
              };
              cell.s.font = { bold: true, sz: 11, color: { rgb: "D97706" } };
            }
          }

          // ✅ تنسيق عمود الاسم
          if (C === 2) {
            cell.s.font = {
              ...cell.s.font,
              bold: true,
              sz: 12,
              color: { rgb: "111827" },
            };
          }

          // ✅ تنسيق عمود التكلفة
          if (C === 8) {
            cell.s.font = { ...cell.s.font, bold: true };
            cell.s.numFmt = '#,##0 "$"';
          }
        }

        // ============ تنسيق صف الإجمالي ============
        else if (rowData && rowData[8] === "الإجمالي:") {
          cell.s = {
            font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: primaryColor }, patternType: "solid" },
            alignment: {
              horizontal: C === 8 ? "right" : "center",
              vertical: "center",
            },
            border: {
              top: { style: "medium", color: { rgb: primaryColor } },
              bottom: { style: "medium", color: { rgb: primaryColor } },
              left: { style: "thin", color: { rgb: primaryColor } },
              right: { style: "thin", color: { rgb: primaryColor } },
            },
          };
        }

        // ============ تنسيق صفوف المدفوع/غير مدفوع ============
        else if (
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
            alignment: {
              horizontal: C === 8 ? "right" : "center",
              vertical: "center",
            },
            border: {
              top: { style: "thin", color: { rgb: "CBD5E1" } },
              bottom: { style: "thin", color: { rgb: "CBD5E1" } },
              left: { style: "thin", color: { rgb: "CBD5E1" } },
              right: { style: "thin", color: { rgb: "CBD5E1" } },
            },
          };
        }
        // ============ تنسيق سطر التوقيع ============
        else if (R === excelData.length - 1) {
          cell.s = {
            font: { italic: true, sz: 10, color: { rgb: "6B7280" } },
            fill: { fgColor: { rgb: "F9FAFB" }, patternType: "solid" },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
              top: { style: "thin", color: { rgb: "E5E7EB" } },
              bottom: { style: "thin", color: { rgb: "E5E7EB" } },
              left: { style: "thin", color: { rgb: "E5E7EB" } },
              right: { style: "thin", color: { rgb: "E5E7EB" } },
            },
          };
        }
      }
    }
    const signatureRow = excelData.length - 1;

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (ws[cellAddress]) {
          if (!ws[cellAddress].s) ws[cellAddress].s = {};
          ws[cellAddress].s.protection = { locked: false };
        }
      }
    }

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: signatureRow, c: C });
      if (ws[cellAddress]) {
        ws[cellAddress].s.protection = { locked: true };
      }
    }

    ws["!protection"] = {
      protected: true,
    };
    // ✅ تعيين ارتفاع الصفوف
    ws["!rows"] = [];
    ws["!rows"][0] = { hpt: 45 }; // العنوان الرئيسي
    ws["!rows"][1] = { hpt: 30 }; // الفترة
    ws["!rows"][2] = { hpt: 35 }; // العناوين

    for (let i = 3; i <= range.e.r; i++) {
      ws["!rows"][i] = { hpt: 28 };
    }

    // ✅ تعيين عرض الأعمدة
    ws["!cols"] = [
      { wch: 14 }, // اليوم
      { wch: 16 }, // التاريخ
      { wch: 30 }, // الاسم
      { wch: 18 }, // الرقم
      { wch: 10 }, // العمر
      { wch: 10 }, // الجنس
      { wch: 32 }, // الجلسة
      { wch: 14 }, // الوقت
      { wch: 14 }, // التكلفة
      { wch: 16 }, // الدفع
      { wch: 16 }, // الحالة
    ];

    // ✅ تعيين اتجاه RTL
    ws["!rtl"] = true;

    // إضافة الورقة للمصنف
    XLSX.utils.book_append_sheet(wb, ws, "جدول المرضى");

    // اسم الملف
    const fileName = `جدول_المرضى_${clinicName}_${new Date().toISOString().split("T")[0]}.xlsx`;

    // حفظ الملف
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">جدول المرضى</h1>
          <p className="text-gray-500 text-sm mt-0.5">{getPeriodTitle()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("refreshPatientsData"));
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: clinicColor }}
          >
            <RefreshCcw size={16} />
            <span className="font-medium text-sm">تحديث البيانات</span>
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "all"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <List size={15} className="inline ml-1.5" />
              عرض الكل
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "month"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Calendar size={15} className="inline ml-1.5" />
              الشهر الحالي
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === "day"
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Calendar size={15} className="inline ml-1.5" />
              يوم محدد
            </button>
          </div>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 shadow-sm"
            style={{ backgroundColor: clinicColor }}
          >
            <Download size={16} />
            <span className="font-medium text-sm">تحميل Excel</span>
          </button>
        </div>
      </div>

      {/* ✅ كروت إحصائية - تصميم متجاوب */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* كرت إجمالي الجلسات */}
        <div
          className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:px-5 sm:py-3"
          style={{ backgroundColor: `${clinicColor}10` }}
        >
          <div className="p-1.5 sm:p-2 rounded-lg flex-shrink-0">
            <List
              size={16}
              className="sm:size-[18px]"
              style={{ color: clinicColor }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-900 mb-0.5 truncate">
              إجمالي الجلسات
            </p>
            <p className="text-base sm:text-xl font-bold text-gray-800">
              {displayedSessions.length}
            </p>
          </div>
        </div>

        {/* كرت إجمالي التكلفة */}
        <div
          className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:px-5 sm:py-3 "
          style={{ backgroundColor: `${clinicColor}10` }}
        >
          <div
            className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: `${clinicColor}15` }}
          >
            <Receipt
              size={16}
              className="sm:size-[18px]"
              style={{ color: clinicColor }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-900 mb-0.5 truncate">
              إجمالي التكلفة
            </p>
            <p className="text-base sm:text-xl font-bold text-gray-800 truncate">
              {displayedSessions
                .reduce((sum, s) => sum + (s.sessionCost || 0), 0)
                .toLocaleString()}
              <span className="text-[10px] sm:text-sm font-normal text-gray-900 mr-0.5 sm:mr-1">
                {" "}
                $
              </span>
            </p>
          </div>
        </div>

        {/* كرت القيمة المدفوعة */}
        <div
          className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl shadow-sm border border-green-100 p-3 sm:px-5 sm:py-3"
          style={{ backgroundColor: `${clinicColor}10` }}
        >
          <div
            className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: "#D1FAE5" }}
          >
            <CheckCircle
              size={16}
              className="sm:size-[18px]"
              style={{ color: "#059669" }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-900 mb-0.5 truncate">
              القيمة المدفوعة
            </p>
            <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
              {displayedSessions
                .filter((s) => s.isPaid)
                .reduce((sum, s) => sum + (s.sessionCost || 0), 0)
                .toLocaleString()}
              <span className="text-[10px] sm:text-sm font-normal text-gray-900 mr-0.5 sm:mr-1">
                {" "}
                $
              </span>
            </p>
          </div>
        </div>

        {/* كرت القيمة غير المدفوعة */}
        <div
          className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl shadow-sm border border-red-100 p-3 sm:px-5 sm:py-3"
          style={{ backgroundColor: `${clinicColor}10` }}
        >
          <div
            className="p-1.5 sm:p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: "#FEE2E2" }}
          >
            <XCircle
              size={16}
              className="sm:size-[18px]"
              style={{ color: "#DC2626" }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-gray-900 mb-0.5 truncate">
              القيمة غير المدفوعة
            </p>
            <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
              {displayedSessions
                .filter((s) => !s.isPaid)
                .reduce((sum, s) => sum + (s.sessionCost || 0), 0)
                .toLocaleString()}
              <span className="text-[10px] sm:text-sm font-normal text-gray-900 mr-0.5 sm:mr-1">
                {" "}
                $
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* شريط الأدوات - سطر واحد يجمع كل العناصر */}
      <div className="flex items-center gap-3">
        {/* متصفح التاريخ - يظهر فقط في وضع اليوم */}
        {viewMode === "day" && (
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousDay}
              disabled={
                availableDates.indexOf(selectedDate) ===
                availableDates.length - 1
              }
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{ color: clinicColor }}
            >
              <ChevronRight size={16} />
            </button>

            <div className="relative min-w-[180px]">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-7 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer transition-all"
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
              onClick={goToNextDay}
              disabled={availableDates.indexOf(selectedDate) === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{ color: clinicColor }}
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}

        {/* Checkbox للترتيب */}
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
          <ArrowUpDown size={14} className="text-gray-400" />
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              الأقدم أولاً
            </span>
            <input
              type="checkbox"
              checked={sortOrder === "asc"}
              onChange={(e) => setSortOrder(e.target.checked ? "asc" : "desc")}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
              style={{ accentColor: clinicColor }}
            />
          </label>
        </div>

        {/* شريط البحث - يتمدد ليملأ المساحة المتبقية */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن اسم المريض..."
            className="w-full pr-9 pl-9 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm"
            style={
              {
                "--tw-ring-color": clinicColor,
                boxShadow: "none",
              } as React.CSSProperties
            }
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* جدول البيانات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* عنوان العيادة */}
        <div
          className="py-3 px-6 text-center"
          style={{
            background: `linear-gradient(135deg, ${clinicColor} 0%, ${clinicColor}dd 100%)`,
          }}
        >
          <h2 className="text-xl font-bold text-white">
            {clinicData?.name || "عيادة الأسنان"}
          </h2>
          <p className="text-white/80 text-xs mt-1">
            {getPeriodTitle()}{" "}
            {searchTerm && `- نتائج البحث: ${displayedSessions.length} جلسة`}
          </p>
        </div>

        {displayedSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    اليوم
                  </th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    التاريخ
                  </th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    الاسم
                  </th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    الرقم
                  </th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    العمر
                  </th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    الجنس
                  </th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    الجلسة
                  </th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    الوقت
                  </th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    التكلفة
                  </th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    الدفع
                  </th>
                  <th className="py-3 px-3 text-right text-xs font-semibold text-gray-700">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedSessions.map((session, index) => {
                  const dateStr = getDateString(session.startTime);
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

                  return (
                    <tr
                      key={session.id}
                      className={`border-b border-gray-100 hover:bg-gray-50/80 transition-all ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="py-3 px-3 text-sm text-gray-700">
                        {getDayName(dateStr)}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-700">
                        {formatDisplayDate(dateStr)}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-900 font-medium">
                        {patient?.fullName || session.patientSnapshot?.name}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-600" dir="ltr">
                        {patient?.phone || session.patientSnapshot?.phone}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-700">
                        {patient?.age || "-"}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-700">
                        {genderArabic}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-700 max-w-xs truncate">
                        {session.plannedProcedure ||
                          session.performedProcedure ||
                          "-"}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-600">
                        {formatTime(session.startTime)}
                      </td>
                      <td className="py-3 px-3 text-sm text-gray-700 font-medium">
                        {session.sessionCost} $
                      </td>
                      <td className="py-3 px-3">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border"
                          style={{
                            backgroundColor: paymentDisplay.bgColor,
                            borderColor: paymentDisplay.borderColor,
                          }}
                        >
                          <PaymentIcon
                            size={13}
                            style={{ color: paymentDisplay.color }}
                          />
                          <span style={{ color: paymentDisplay.color }}>
                            {paymentDisplay.text}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: statusDisplay.bgColor }}
                        >
                          <StatusIcon
                            size={13}
                            style={{ color: statusDisplay.color }}
                          />
                          <span style={{ color: statusDisplay.color }}>
                            {statusDisplay.text}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* ملخص */}
            <div className="border-t border-gray-200 bg-gray-50/50 px-6 py-2.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span className="text-xs text-gray-600">
                    عدد الجلسات:{" "}
                    <span className="font-bold text-gray-800">
                      {displayedSessions.length}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-gray-400" />
                  <span className="text-xs text-gray-600">
                    إجمالي التكلفة:{" "}
                    <span className="font-bold text-gray-800">
                      {displayedSessions
                        .reduce((sum, s) => sum + (s.sessionCost || 0), 0)
                        .toLocaleString()}{" "}
                      $
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              {searchTerm ? (
                <Search size={32} className="text-gray-400" />
              ) : (
                <Calendar size={32} className="text-gray-400" />
              )}
            </div>
            <p className="text-gray-500">
              {searchTerm
                ? "لا توجد نتائج للبحث"
                : viewMode === "month"
                  ? "لا توجد جلسات في هذا الشهر"
                  : "لا توجد جلسات مجدولة"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-3 text-sm font-medium hover:underline"
                style={{ color: clinicColor }}
              >
                مسح البحث
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
