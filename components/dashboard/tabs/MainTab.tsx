// app/dashboard/[clinicId]/page.tsx

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { ExpandedSessionCard } from "./ExpandedSessionCard";
import {
  Search,
  UserPlus,
  Clock,
  Phone,
  Calendar,
  History,
  ChevronRight,
  X,
  Filter,
  Users,
  Stethoscope,
  CheckCircle,
  Plus,
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  Check,
  Play,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  generateWhatsAppMessage,
  openWhatsAppChat,
} from "@/lib/services/communication";
import { Clinic, Patient, PatientCase, Session } from "@/types";
import { createPatient, updatePatient } from "@/client/helpers/patient";
import {
  createSession,
  deleteSession,
  updateSession,
} from "@/client/helpers/session";
import { ToastContainer, useToast } from "./Toast";
import { XRayViewerButton } from "../XRayViewer";
import { useModalBackHandler } from "@/hooks/useModalBackHandler";
import ToothLoader from '../../loding';
// ============================================================
// خدمة API محاكية (لتحضير الربط مع الباك إند)
// ============================================================
interface MainTabProps {
  clinicData: Clinic | null;
  patients: Patient[];
  patientCases: PatientCase[];
  sessions: Session[];
}
const api = {
  // إضافة مريض جديد
  addPatient: async (
    clinicId: string,
    patientData: Omit<Patient, "id" | "clinicId" | "createdAt">,
  ): Promise<Patient> => {
    const result = await createPatient(patientData);
    if (!result || !result.data || !result.data.id)
      throw new Error("فشل إنشاء المريض");
    const newPatient: Patient = {
      id: result.data.id,
      clinicId,
      ...patientData,
      createdAt: new Date(),
    };

    // في الإصدار الحقيقي: حفظ في قاعدة البيانات

    return newPatient;
  },

  // إضافة موعد جديد
  addSession: async (
    clinicId: string,
    sessionData: Omit<Session, "id" | "clinicId" | "patientSnapshot">,
  ): Promise<Session> => {
    const result = await createSession(sessionData);
    if (!result || !result.data || !result.data.id)
      throw new Error("فشل إنشاء الموعد");
    const newSession: Session = {
      id: result.data.id,
      clinicId,
      ...sessionData,
    };

    return newSession;
  },

  // تحديث حالة الجلسة
  updateSessionStatus: async (
    sessionId: string,
    status: Session["status"],
  ): Promise<Session> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    // في الإصدار الحقيقي: تحديث في قاعدة البيانات
    return {} as Session;
  },
};

// ============================================================
// المكون الرئيسي
// ============================================================

export function MainTab({
  clinicData,
  patients: initialPatients,
  patientCases: initialCases,
  sessions: initialSessions,
}: MainTabProps) {
  const params = useParams();
  const clinicId = params?.clinicId as string;

  const primaryColor = clinicData?.settings.primaryColor || "#007bff";
  const secondaryColor = clinicData?.settings.secondaryColor || "#6c757d";

  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [cases, setCases] = useState<PatientCase[]>(initialCases);

  const [searchQuery, setSearchQuery] = useState("");
  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [showEditSessionModal, setShowEditSessionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);

  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isUpdatingPatient, setIsUpdatingPatient] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const settings = localStorage.getItem("dashboard_settings");
      if (settings) {
        const parsed = JSON.parse(settings);
        return parsed?.patientListCollapsed ?? true;
      }
    } catch (e) {}
    return false;
  });

  const [listWidth, setListWidth] = useState<number>(() => {
    return 320;
  });

  const resizingRef = useRef<boolean>(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const currentSettings = localStorage.getItem("dashboard_settings");
      const settings = currentSettings ? JSON.parse(currentSettings) : {};
      settings.patientListCollapsed = isCollapsed;
      localStorage.setItem("dashboard_settings", JSON.stringify(settings));
    } catch (e) {}
  }, [isCollapsed]);

  useEffect(() => {
    setPatients(initialPatients);
    setSessions(initialSessions);
    setCases(initialCases);
  }, [initialPatients, initialSessions, initialCases]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!selectedPatient && isCollapsed) {
      setIsCollapsed(false);
    }
  }, [selectedPatient, isCollapsed]);

  // استخدام useMemo للقيم المشتقة بدلاً من useState منفصل
  const selectedPatientSessions = useMemo(() => {
    if (!selectedPatient) return [];
    return sessions.filter((s) => s.patientId === selectedPatient.id);
  }, [sessions, selectedPatient]);

  const selectedPatientCases = useMemo(() => {
    if (!selectedPatient) return [];
    return cases.filter((c) => c.patientId === selectedPatient.id);
  }, [cases, selectedPatient]);

  const normalizeText = (text: string) => {
    return text
      .replace(/[أإآ]/g, "ا")
      .replace(/[٠-٩]/g, (match) =>
        String.fromCharCode(match.charCodeAt(0) - 0x0660 + 0x0030),
      )
      .toLowerCase();
  };

  const filteredPatients = useMemo(() => {
    let filtered = patients;
    if (showTodayOnly) {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayPatientIds = sessions
        .filter((s) => {
          const sessionDate = new Date(s.startTime).toISOString().split("T")[0];
          return sessionDate === todayStr && s.status === "scheduled";
        })
        .map((s) => s.patientId);
      filtered = filtered.filter((p) => todayPatientIds.includes(p.id));
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          normalizeText(p.fullName).includes(normalizeText(query)) ||
          normalizeText(p.phone).includes(normalizeText(query)) ||
          normalizeText(p.id).includes(normalizeText(query)),
      );
    }
    return filtered;
  }, [patients, sessions, searchQuery, showTodayOnly]);

  const patientsWithDetails = useMemo(() => {
    return filteredPatients.map((patient) => {
      const patientSessions = sessions.filter(
        (s) => s.patientId === patient.id,
      );
      const todayStr = new Date().toISOString().split("T")[0];
      const todaySession = patientSessions.find((s) => {
        const sessionDate = new Date(s.startTime).toISOString().split("T")[0];
        return sessionDate === todayStr && s.status === "scheduled";
      });
      const completedSessions = patientSessions.filter(
        (s) => s.status === "completed",
      );
      const lastVisit =
        completedSessions.length > 0
          ? completedSessions.sort(
              (a, b) =>
                new Date(b.startTime).getTime() -
                new Date(a.startTime).getTime(),
            )[0].startTime
          : undefined;
      return { ...patient, sessions: patientSessions, todaySession, lastVisit };
    });
  }, [filteredPatients, sessions]);

  const calculatePatientFinance = (patientId: string) => {
    const patientSessions = sessions.filter((s) => s.patientId === patientId);
    const totalCost = patientSessions.reduce(
      (sum, s) => sum + (s.sessionCost || 0),
      0,
    );
    const totalPaid = patientSessions
      .filter((s) => s.isPaid)
      .reduce((sum, s) => sum + (s.sessionCost || 0), 0);
    return { totalCost, totalPaid, totalDue: totalCost - totalPaid };
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      currencyDisplay: "code",
    })
      .format(amount)
      .replace("USD", "$");
  };

  const calculateBirthYear = (age: number) => new Date().getFullYear() - age;

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isCollapsed || !selectedPatient) return;
      e.preventDefault();
      resizingRef.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const startX = e.clientX;
      const startWidth = listWidth;

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!resizingRef.current) return;
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.max(240, Math.min(600, startWidth - delta));
        setListWidth(newWidth);
      };

      const onMouseUp = () => {
        resizingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [isCollapsed, selectedPatient, listWidth],
  );

  const handleUpdatePatient = async (patientId: string, patientData: any) => {
    setIsUpdatingPatient(true);

    try {
      const result = await updatePatient(patientId, patientData);

      if (!result.success) {
        throw new Error(result.error || "فشل في تعديل المريض");
      }

      // تحديث المريض في القائمة
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, ...result.data } : p)),
      );

      // إذا كان المريض المحدث هو المريض المحدد حالياً، حدثه أيضاً
      if (selectedPatient?.id === patientId) {
        setSelectedPatient({ ...selectedPatient, ...result.data });
      }

      addToast({
        message: "تم تعديل بيانات المريض بنجاح",
        type: "success",
      });

      setShowEditPatientModal(false);
      setEditingPatient(null);
    } catch (error: any) {
      addToast({
        message: error?.message || "حدث خطأ أثناء تعديل المريض",
        type: "error",
      });
      throw error;
    } finally {
      setIsUpdatingPatient(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    // لم نعد بحاجة لتحديث selectedPatientCases و selectedPatientSessions يدوياً
    // لأنهما مشتقان تلقائياً من useMemo
    if (isMobile) {
      setIsMobileDrawerOpen(true);
    }
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  const handleWhatsApp = (
    patient: Patient,
    session?: Session,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();

    const message = generateWhatsAppMessage({
      patient,
      session,
      clinicName: clinicData?.name || "عيادة الأسنان",
      messageType: session ? "reminder" : "confirmation",
      clinicId: clinicId,
    });

    openWhatsAppChat(patient.phone, message);
  };

  const handleUpdateSessionStatus = async (
    sessionId: string,
    newStatus: Session["status"],
  ) => {
    try {
      await api.updateSessionStatus(sessionId, newStatus);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s)),
      );
      // لا حاجة لتحديث selectedPatientSessions يدوياً لأنه مشتق من sessions مباشرة
      addToast({
        message: "تم تحديث حالة الجلسة بنجاح",
        type: "success",
      });
    } catch (error: any) {
      addToast({
        message: error?.message || "خطأ في تحديث حالة الجلسة",
        type: "error",
      });
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setShowEditSessionModal(true);
  };

  const handleSaveSessionEdit = async (
    updatedSessionData: Partial<Session>,
  ) => {
    if (!editingSession) return;
    const result = await updateSession(editingSession.id, updatedSessionData);
    if (!result.success) {
      throw new Error("حدث خطأ ما اثناء التعديل");
    }
    setSessions((prev) =>
      prev.map((s) =>
        s.id === editingSession.id ? { ...s, ...updatedSessionData } : s,
      ),
    );
    // لا حاجة لتحديث selectedPatientSessions يدوياً لأنه مشتق من sessions مباشرة
    setShowEditSessionModal(false);
    setEditingSession(null);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const result = await deleteSession(sessionId);
    if (!result.success) {
      throw new Error("فشل حذف الجلسة");
    }
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    // لا حاجة لتحديث selectedPatientSessions يدوياً لأنه مشتق من sessions مباشرة
    if (editingSession?.id === sessionId) {
      setShowEditSessionModal(false);
      setEditingSession(null);
    }
  };

  const handleRequestDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    const result = await deleteSession(sessionToDelete);
    if (!result.success) {
      throw new Error("فشل حذف الجلسة");
    }
    setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
    // لا حاجة لتحديث selectedPatientSessions يدوياً لأنه مشتق من sessions مباشرة
    if (editingSession?.id === sessionToDelete) {
      setShowEditSessionModal(false);
      setEditingSession(null);
    }
    setShowDeleteConfirm(false);
    setSessionToDelete(null);
  };

  const handleAddPatient = async (patientData: any) => {
    setIsAddingPatient(true);

    try {
      const newPatient = await api.addPatient(clinicId, {
        fullName: patientData.fullName,
        phone: patientData.phone,
        gender: patientData.gender,
        age: patientData.age,
        notes: patientData.notes,
        totalPrice: patientData.totalPrice || "0",
        plannedProcedure: patientData.plannedProcedure || undefined,
      });

      setPatients((prev) => [...prev, newPatient]);

      if (patientData.addAppointment && patientData.appointment) {
        const newSession = await api.addSession(clinicId, {
          patientId: newPatient.id,
          startTime: patientData.appointment.startTime,
          endTime: patientData.appointment.endTime,
          status: "scheduled",
          plannedProcedure: patientData.appointment.procedure,
          sessionCost: patientData.appointment.cost || 0,
          isPaid: false,
          notes: patientData.appointment.notes,
        });
        setSessions((prev) => [...prev, newSession]);
      }

      setShowNewPatientModal(false);

      // الآن لا نحتاج setTimeout لأن selectedPatientSessions مشتق تلقائياً
      // وسيتم تحديثه بمجرد أن يمرر React الحالة الجديدة ويعيد التصيير
      handlePatientSelect(newPatient);
    } catch (error: any) {
      throw error;
    } finally {
      setIsAddingPatient(false);
    }
  };

  const handleAddAppointment = async (appointmentData: any) => {
    if (!selectedPatient) return;

    setIsAddingAppointment(true);

    try {
      const newSession = await api.addSession(clinicId, {
        patientId: selectedPatient.id,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        status: "scheduled",
        plannedProcedure: appointmentData.procedure,
        sessionCost: appointmentData.cost || 0,
        isPaid: false,
        caseId: appointmentData.caseId,
        notes: appointmentData.notes,
      });
      setSessions((prev) => [...prev, newSession]);
      // لا حاجة لتحديث selectedPatientSessions لأنه مشتق تلقائياً
      setShowNewAppointmentModal(false);
    } catch (error: any) {
      throw error;
    } finally {
      setIsAddingAppointment(false);
    }
  };

  if (!clinicData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ToothLoader />
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="min-h-screen  p-3 sm:p-4 lg:p-6 ">
        {/* شريط العمليات العلوي */}
        <div className="mb-4 sm:mb-6 lg:mb-8 ">
          {/* ============================================================ */}
          {/* سطح المكتب: كل العناصر في سطر واحد                            */}
          {/* ============================================================ */}
          <div className="hidden lg:flex items-center gap-3">
            {/* زر إضافة مريض جديد */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowNewPatientModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm text-white transition-all duration-200 flex-shrink-0 shadow-sm"
              style={{
                background: primaryColor,
                boxShadow: `0 2px 8px ${primaryColor}35`,
              }}
            >
              <UserPlus size={18} className="flex-shrink-0" />
              <span className="whitespace-nowrap">مريض جديد</span>
            </motion.button>

            {/* حقل البحث - يملأ المساحة المتبقية */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="البحث عن مريض..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full text-gray-900 placeholder-gray-400 text-sm border-0 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                style={{ "--tw-ring-color": primaryColor } as any}
              />
            </div>

            {/* حاوية الفلاتر المجمعة */}
            <div className="flex items-center gap-0.5 bg-gray-100 p-1 rounded-full flex-shrink-0 ">
              {/* فلتر 1: اليوم / الكل */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowTodayOnly(!showTodayOnly)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                  showTodayOnly
                    ? " text-gray-900 "
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {!showTodayOnly ? (
                  <Calendar size={15} className="flex-shrink-0 text-blue-600" />
                ) : (
                  <Users size={15} className="flex-shrink-0" />
                )}
                <span className="whitespace-nowrap">
                  {!showTodayOnly ? "مرضى اليوم" : "جميع المرضى"}
                </span>
              </motion.button>

              {/* فاصل رأسي رفيع */}
              <div className="w-px  h-5 bg-gray-300 mx-0.5" />

              {/* فلتر 2: ترتيب (شكلي فقط) */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200 text-gray-500 hover:text-gray-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  <path d="M3 6h18" />
                  <path d="M6 12h12" />
                  <path d="M10 18h4" />
                </svg>
                <span className="whitespace-nowrap">الأحدث</span>
                <ChevronRight size={13} className="flex-shrink-0 rotate-90" />
              </motion.button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* الجوال والتابلت: صفين                                        */}
          {/* ============================================================ */}
          <div className="flex flex-col gap-2 sm:gap-3 lg:hidden">
            {/* الصف الأول: زر الإضافة (1/3) + حقل البحث (2/3) */}
            <div
              className="flex items-center gap-2 sm:gap-3"
              style={{ width: "calc(100% - 8px)" }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowNewPatientModal(true)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full font-medium text-xs sm:text-sm text-white transition-all duration-200 flex-shrink-0 shadow-sm"
                style={{
                  background: primaryColor,
                  boxShadow: `0 2px 8px ${primaryColor}35`,
                  width: "33.333%",
                }}
              >
                <UserPlus
                  size={15}
                  className="sm:w-[17px] sm:h-[17px] flex-shrink-0"
                />
                <span className="whitespace-nowrap">
                  <span className="hidden sm:inline">جديد</span>
                  <span className="sm:hidden">جديد</span>
                </span>
              </motion.button>

              <div className="relative" style={{ width: "66.666%" }}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    size={16}
                    className="text-gray-400 sm:w-[18px] sm:h-[18px]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="البحث عن مريض..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2.5 bg-gray-100 rounded-full text-gray-900 placeholder-gray-400 text-sm sm:text-base border-0 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  style={{ "--tw-ring-color": primaryColor } as any}
                />
              </div>
            </div>

            {/* الصف الثاني: الفلترين في حاوية واحدة مقسمة */}
            <div
              className="flex items-center gap-0.5 bg-gray-100 p-1 rounded-full mt-2"
              style={{ width: "calc(100% - 8px)" }}
            >
              {/* فلتر 1: اليوم / الكل */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowTodayOnly(!showTodayOnly)}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full font-medium text-[11px] sm:text-xs transition-all duration-200 flex-1 ${
                  showTodayOnly
                    ? " text-gray-900 "
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {!showTodayOnly ? (
                  <Calendar
                    size={13}
                    className="sm:w-[14px] sm:h-[14px] flex-shrink-0 text-blue-600"
                  />
                ) : (
                  <Users
                    size={13}
                    className="sm:w-[14px] sm:h-[14px] flex-shrink-0"
                  />
                )}
                <span className="whitespace-nowrap">
                  {!showTodayOnly ? "اليوم" : "الكل"}
                </span>
              </motion.button>

              {/* فاصل رأسي رفيع */}
              <div className="w-px h-4 bg-gray-300" />

              {/* فلتر 2: ترتيب (شكلي فقط) */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full font-medium text-[11px] sm:text-xs transition-all duration-200 text-gray-500 hover:text-gray-700 flex-1"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="13"
                  height="13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="sm:w-[14px] sm:h-[14px] flex-shrink-0"
                >
                  <path d="M3 6h18" />
                  <path d="M6 12h12" />
                  <path d="M10 18h4" />
                </svg>
                <span className="whitespace-nowrap">الأحدث</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* عمود قائمة المرضى - كرت Native */}
          <div
            ref={listRef}
            className={`relative flex-shrink-0 transition-all duration-200 ${
              !selectedPatient ? "flex-1" : ""
            } ${isCollapsed ? "w-16 sm:w-20" : ""}`}
            style={
              selectedPatient && !isCollapsed
                ? { width: `${listWidth}px` }
                : undefined
            }
          >
            <div
              className={`bg-white rounded-[1.25rem] sm:rounded-3xl shadow-sm border border-gray-100 h-full overflow-hidden ${isCollapsed ? "px-1" : ""}`}
            >
              {/* Header مع زر الطي/الفرد */}
              <div
                className={`flex items-center ${isCollapsed ? "justify-center py-3 sm:py-4" : "px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100 bg-gray-50/50"}`}
              >
                {!isCollapsed ? (
                  <>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* أيقونة معبرة مع خلفية ملونة */}
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            background: showTodayOnly
                              ? `${primaryColor}15`
                              : "#f3f4f6",
                          }}
                        >
                          {showTodayOnly ? (
                            <Calendar
                              size={16}
                              className="sm:w-[18px] sm:h-[18px]"
                              style={{ color: primaryColor }}
                            />
                          ) : (
                            <Users
                              size={16}
                              className="sm:w-[18px] sm:h-[18px] text-gray-500"
                            />
                          )}
                        </div>

                        {/* النص الرئيسي مع وصف إضافي */}
                        <div className="flex flex-col gap-0.5">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                            {showTodayOnly ? "مرضى اليوم" : "جميع المرضى"}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            {/* وسام العدد */}
                            <span
                              className="text-[11px] sm:text-xs font-semibold px-0.5 py-0.5 "
                              style={{
                                color: primaryColor,
                              }}
                            >
                              {patientsWithDetails.length}
                            </span>
                            <span className="text-[11px] sm:text-xs text-gray-400">
                              {showTodayOnly
                                ? "لديهم مواعيد اليوم"
                                : "في القائمة"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedPatient && (
                        <button
                          onClick={() => setIsCollapsed(true)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          title="طي القائمة"
                        >
                          <PanelLeftClose size={16} className="text-gray-500" />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setIsCollapsed(false)}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="توسيع القائمة"
                  >
                    <PanelLeftOpen size={18} className="text-gray-500" />
                  </button>
                )}
              </div>

              {/* محتوى القائمة */}
              {!isCollapsed ? (
                <div className="max-h-[calc(100vh-260px)] sm:max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
                  <AnimatePresence>
                    {patientsWithDetails.map((patient, index) => {
                      const finance = calculatePatientFinance(patient.id);
                      const isSelected = selectedPatient?.id === patient.id;
                      return (
                        <motion.div
                          key={patient.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => handlePatientSelect(patient)}
                          className={`px-4 sm:px-5 py-3 sm:py-4 cursor-pointer transition-colors duration-150 border-b border-gray-50 last:border-b-0
                            ${isSelected ? "bg-blue-50/60" : "hover:bg-gray-50/80"}`}
                          style={{
                            borderRight: isSelected
                              ? `3px solid ${primaryColor}`
                              : "3px solid transparent",
                          }}
                        >
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                                {patient.fullName}
                              </h4>
                              <span
                                className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${patient.gender === "male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}
                              >
                                {patient.gender === "male" ? "ذكر" : "أنثى"}
                              </span>
                              {patient.age && (
                                <span className="text-[10px] sm:text-xs text-gray-400">
                                  {patient.age} سنة
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                            <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                              <Phone
                                size={13}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <span className="text-xs sm:text-sm" dir="ltr">
                                {patient.phone}
                              </span>
                              {/* زر واتساب مدمج داخل صف الهاتف */}
                              {/* <button
                                onClick={(e) =>
                                  handleWhatsApp(
                                    patient,
                                    patient.todaySession,
                                    e,
                                  )
                                }
                                className="inline-flex items-center justify-center w-7 h-7  rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors active:scale-95 flex-shrink-0"
                                title="واتساب"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  width="14"
                                  height="14"
                                  fill="currentColor"
                                  className="sm:w-[40px] sm:h-[40px]"
                                >
                                  <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.498 2 2.017 6.477 2.012 11.984c-.001 1.76.46 3.478 1.335 4.992L2 21.991l5.172-1.356c1.46.796 3.104 1.215 4.828 1.216h.004c5.508 0 9.99-4.478 9.995-9.984.002-2.667-1.035-5.175-2.922-7.064zm-7.071 15.355h-.003c-1.507 0-2.985-.405-4.273-1.169l-.306-.181-3.069.805.819-2.991-.202-.32a8.268 8.268 0 0 1-1.267-4.439c.003-4.572 3.724-8.29 8.301-8.29 2.216.001 4.299.865 5.866 2.432a8.238 8.238 0 0 1 2.428 5.873c-.003 4.572-3.724 8.29-8.297 8.29zm4.551-6.208c-.25-.125-1.476-.728-1.705-.812-.229-.083-.396-.124-.562.125-.167.25-.647.812-.793.978-.146.167-.292.187-.542.062-.25-.124-1.054-.389-2.008-1.24-.742-.662-1.243-1.48-1.389-1.729-.146-.25-.015-.385.11-.509.112-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.021-.438-.062-.125-.562-1.355-.771-1.855-.203-.486-.409-.42-.562-.427-.144-.007-.308-.009-.473-.009-.166 0-.437.063-.666.313-.229.25-.874.854-.874 2.083s.895 2.416 1.02 2.583c.125.166 1.761 2.688 4.267 3.77.596.257 1.062.411 1.425.526.599.19 1.144.163 1.575.099.48-.072 1.476-.604 1.684-1.187.208-.583.208-1.083.146-1.187-.062-.104-.229-.167-.479-.292z" />
                                </svg>
                              </button> */}
                            </div>
                            {patient.todaySession && (
                              <div className="flex items-center gap-1 sm:gap-1.5">
                                <Clock
                                  size={13}
                                  style={{ color: primaryColor }}
                                />
                                <span
                                  className="text-xs sm:text-sm font-medium"
                                  style={{ color: primaryColor }}
                                >
                                  {formatTime(patient.todaySession.startTime)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              {patient.todaySession ? (
                                <>
                                  <Stethoscope
                                    size={13}
                                    className="text-gray-400"
                                  />
                                  <span className="text-xs sm:text-sm text-gray-600">
                                    {patient.todaySession.plannedProcedure ||
                                      "كشف"}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs sm:text-sm text-gray-400">
                                  لا يوجد موعد اليوم
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {patientsWithDetails.length === 0 && (
                    <div className="text-center py-10 sm:py-14">
                      {/* أيقونة مع خلفية دائرية ناعمة */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users
                          size={28}
                          className="sm:w-8 sm:h-8 text-gray-300"
                        />
                      </div>

                      {/* العنوان */}
                      <p className="text-gray-800 font-semibold mb-1.5 text-sm sm:text-base">
                        لا يوجد مرضى
                      </p>

                      {/* الوصف */}
                      <p className="text-gray-400 text-xs sm:text-sm mb-5">
                        {showTodayOnly
                          ? "لا توجد مواعيد لهذا اليوم"
                          : "لا يوجد أي مرضى في القائمة بعد"}
                      </p>

                      {/* بطاقات صغيرة أفقية (Horizontal Pills) - تصميم iOS Settings Suggestions */}
                      <div className="inline-flex flex-col gap-2">
                        {showTodayOnly && (
                          <button
                            onClick={() => {
                              setShowTodayOnly(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group"
                          >
                            {/* أيقونة داخل دائرة */}
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Users
                                size={15}
                                className="sm:w-4 sm:h-4 text-gray-500"
                              />
                            </div>

                            {/* النص */}
                            <div className="text-right flex-1">
                              <p className="text-xs sm:text-sm font-medium text-gray-700">
                                عرض جميع المرضى
                              </p>
                              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                تصفح القائمة الكاملة بدون فلترة
                              </p>
                            </div>

                            {/* سهم للإشارة */}
                            <ChevronRight
                              size={14}
                              className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
                            />
                          </button>
                        )}

                        <button
                          onClick={() => setShowNewPatientModal(true)}
                          className="flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group"
                        >
                          {/* أيقونة داخل دائرة */}
                          <div
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                            style={{
                              backgroundColor: `${primaryColor}15`,
                            }}
                          >
                            <Plus
                              size={15}
                              className="sm:w-4 sm:h-4"
                              style={{ color: primaryColor }}
                            />
                          </div>

                          {/* النص */}
                          <div className="text-right flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-700">
                              {showTodayOnly
                                ? "إضافة مريض جديد"
                                : "إضافة أول مريض"}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                              {showTodayOnly
                                ? "تسجيل مريض وإضافة موعد"
                                : "ابدأ ببناء قاعدة مرضاك"}
                            </p>
                          </div>

                          {/* سهم للإشارة */}
                          <ChevronRight
                            size={14}
                            className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0"
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-h-[calc(100vh-260px)] sm:max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide py-2">
                  <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                    {patientsWithDetails.map((patient) => {
                      const initials = getInitials(patient.fullName);
                      const isSelected = selectedPatient?.id === patient.id;
                      return (
                        <motion.button
                          key={patient.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePatientSelect(patient)}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-medium text-xs sm:text-sm transition-all shadow-sm
                            ${isSelected ? "ring-2 ring-offset-1" : "hover:shadow-md"}`}
                          style={
                            {
                              backgroundColor: isSelected
                                ? primaryColor
                                : "#f3f4f6",
                              color: isSelected ? "white" : "#374151",
                              "--tw-ring-color": primaryColor,
                            } as React.CSSProperties
                          }
                          title={patient.fullName}
                        >
                          {initials}
                        </motion.button>
                      );
                    })}
                  </div>
                  {patientsWithDetails.length === 0 && (
                    <div className="flex justify-center py-4">
                      <Users size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* مقبض تغيير الحجم - سطح المكتب فقط */}
            {!isCollapsed && selectedPatient && !isMobile && (
              <div
                className="absolute top-0 -left-3 w-6 h-full cursor-col-resize z-10 flex items-center justify-center group"
                onMouseDown={handleMouseDown}
              >
                <div className="w-1 h-10 sm:h-12 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors" />
                <GripVertical
                  size={14}
                  className="absolute text-gray-400 group-hover:text-blue-500 transition-colors"
                />
              </div>
            )}
          </div>

          {selectedPatient && !isMobile && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 min-w-0 lg:pr-2"
            >
              <PatientDetailsCard
                patient={selectedPatient}
                cases={selectedPatientCases}
                sessions={selectedPatientSessions}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                onClose={() => setSelectedPatient(null)}
                onAddAppointment={() => setShowNewAppointmentModal(true)}
                onWhatsApp={handleWhatsApp}
                onUpdateSessionStatus={handleUpdateSessionStatus}
                expandedCaseId={expandedCaseId}
                setExpandedCaseId={setExpandedCaseId}
                formatDate={formatDate}
                formatTime={formatTime}
                formatCurrency={formatCurrency}
                calculateFinance={() =>
                  calculatePatientFinance(selectedPatient.id)
                }
                calculateBirthYear={calculateBirthYear}
                onEditSession={handleEditSession}
                onDeleteSession={handleDeleteSession}
                onRequestDeleteSession={handleRequestDeleteSession}
                onEditPatient={() => {
                  setEditingPatient(selectedPatient);
                  setShowEditPatientModal(true);
                }}
              />
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNewPatientModal && (
          <NewPatientModal
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onClose={() => {
              setShowNewPatientModal(false);
            }}
            onSubmit={handleAddPatient}
            isLoading={isAddingPatient}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewAppointmentModal && selectedPatient && (
          <NewAppointmentModal
            patient={selectedPatient}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onClose={() => {
              setShowNewAppointmentModal(false);
            }}
            onSubmit={handleAddAppointment}
            isLoading={isAddingAppointment}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditPatientModal && editingPatient && (
          <EditPatientModal
            patient={editingPatient}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onClose={() => {
              setShowEditPatientModal(false);
              setEditingPatient(null);
            }}
            onSubmit={handleUpdatePatient}
            isLoading={isUpdatingPatient}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobile && isMobileDrawerOpen && selectedPatient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => {
                setIsMobileDrawerOpen(false);
                setSelectedPatient(null);
              }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl"
            >
              <PatientDetailsCard
                onEditPatient={() => {
                  setEditingPatient(selectedPatient);
                  setShowEditPatientModal(true);
                }}
                patient={selectedPatient}
                cases={selectedPatientCases}
                sessions={selectedPatientSessions}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                onClose={() => {
                  setIsMobileDrawerOpen(false);
                  setSelectedPatient(null);
                }}
                onAddAppointment={() => {
                  setShowNewAppointmentModal(true);
                }}
                onWhatsApp={handleWhatsApp}
                onUpdateSessionStatus={handleUpdateSessionStatus}
                expandedCaseId={expandedCaseId}
                setExpandedCaseId={setExpandedCaseId}
                formatDate={formatDate}
                formatTime={formatTime}
                formatCurrency={formatCurrency}
                calculateFinance={() =>
                  calculatePatientFinance(selectedPatient.id)
                }
                calculateBirthYear={calculateBirthYear}
                isMobile
                onEditSession={handleEditSession}
                onDeleteSession={handleDeleteSession}
                onRequestDeleteSession={handleRequestDeleteSession}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditSessionModal && editingSession && (
          <EditSessionModal
            session={editingSession}
            primaryColor={primaryColor}
            onClose={() => {
              setShowEditSessionModal(false);
              setEditingSession(null);
            }}
            onSave={handleSaveSessionEdit}
            onDelete={handleDeleteSession}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSessionToDelete(null);
        }}
        onConfirm={handleConfirmDeleteSession}
        primaryColor="#dc2626"
        sessionInfo={
          sessionToDelete
            ? (() => {
                const session = sessions.find((s) => s.id === sessionToDelete);
                return session
                  ? {
                      date: formatDate(session.startTime),
                      procedure:
                        session.plannedProcedure ||
                        session.performedProcedure ||
                        "جلسة",
                    }
                  : undefined;
              })()
            : undefined
        }
        addToast={addToast}
      />
    </>
  );
}

// ============================================================
// مكون بطاقة تفاصيل المريض
// ============================================================

interface PatientDetailsCardProps {
  patient: Patient;
  cases: PatientCase[];
  sessions: Session[];
  primaryColor: string;
  secondaryColor: string;
  onClose: () => void;
  onAddAppointment: () => void;
  onWhatsApp: (patient: Patient, session?: Session) => void;
  onUpdateSessionStatus: (sessionId: string, status: Session["status"]) => void;
  expandedCaseId: string | null;
  setExpandedCaseId: (id: string | null) => void;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  formatCurrency: (amount: number) => string;
  calculateFinance: () => {
    totalCost: number;
    totalPaid: number;
    totalDue: number;
  };
  calculateBirthYear: (age: number) => number;
  isMobile?: boolean;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
  onRequestDeleteSession: (sessionId: string) => void;
  onEditPatient: () => void;
}

function PatientDetailsCard({
  patient,
  cases,
  sessions,
  primaryColor,
  secondaryColor,
  onClose,
  onAddAppointment,
  onWhatsApp,
  onUpdateSessionStatus,
  expandedCaseId,
  setExpandedCaseId,
  formatDate,
  formatTime,
  formatCurrency,
  calculateFinance,
  calculateBirthYear,
  isMobile = false,
  onEditSession,
  onDeleteSession,
  onEditPatient,
  onRequestDeleteSession,
}: PatientDetailsCardProps) {
  useModalBackHandler(onClose);
  const finance = calculateFinance();
  const pastSessions = sessions;
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // فرز الجلسات من الأحدث إلى الأقدم
  const sortedSessions = [...pastSessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  // دالة مساعدة لعرض حالة الجلسة بشكل موحد
  const getSessionStatusBadge = (status: Session["status"]) => {
    switch (status) {
      case "scheduled":
        return {
          dotColor: "bg-yellow-400",
          textColor: "text-yellow-700",
          bgColor: "bg-yellow-50",
          label: "مجدولة",
        };
      case "completed":
        return {
          dotColor: "bg-green-500",
          textColor: "text-green-700",
          bgColor: "bg-green-50",
          label: "مكتملة",
        };
      case "in-progress":
        return {
          dotColor: "bg-blue-500",
          textColor: "text-blue-700",
          bgColor: "bg-blue-50",
          label: "قيد التنفيذ",
        };
      case "cancelled":
        return {
          dotColor: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          label: "ملغية",
        };
      case "no-show":
        return {
          dotColor: "bg-gray-400",
          textColor: "text-gray-700",
          bgColor: "bg-gray-50",
          label: "لم يحضر",
        };
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm sm:shadow-md border border-gray-100 overflow-hidden">
        {/* Header - معلومات أساسية */}
        <div className="relative p-4 pt-10 sm:p-6 sm:pt-12 border-b border-gray-100">
          {/* زر الإغلاق */}
          <button
            onClick={onClose}
            className="absolute left-2 top-2 sm:left-3 sm:top-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>

          {/* الاسم ورقم الهاتف وعدد الجلسات */}
          <div className="flex flex-col gap-3 mt-1 sm:mt-2">
            {/* معلومات المريض */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {patient.fullName}
                  </h2>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-gray-600">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Phone size={14} className="sm:w-4 sm:h-4 text-gray-400" />
                    <span dir="ltr" className="text-xs sm:text-sm">
                      {patient.phone}
                    </span>
                    {/* زر واتساب مدمج */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onWhatsApp(patient);
                      }}
                      className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors active:scale-95 flex-shrink-0"
                      title="واتساب"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="12"
                        height="12"
                        fill="currentColor"
                        className="sm:w-[13px] sm:h-[13px]"
                      >
                        <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.498 2 2.017 6.477 2.012 11.984c-.001 1.76.46 3.478 1.335 4.992L2 21.991l5.172-1.356c1.46.796 3.104 1.215 4.828 1.216h.004c5.508 0 9.99-4.478 9.995-9.984.002-2.667-1.035-5.175-2.922-7.064zm-7.071 15.355h-.003c-1.507 0-2.985-.405-4.273-1.169l-.306-.181-3.069.805.819-2.991-.202-.32a8.268 8.268 0 0 1-1.267-4.439c.003-4.572 3.724-8.29 8.301-8.29 2.216.001 4.299.865 5.866 2.432a8.238 8.238 0 0 1 2.428 5.873c-.003 4.572-3.724 8.29-8.297 8.29zm4.551-6.208c-.25-.125-1.476-.728-1.705-.812-.229-.083-.396-.124-.562.125-.167.25-.647.812-.793.978-.146.167-.292.187-.542.062-.25-.124-1.054-.389-2.008-1.24-.742-.662-1.243-1.48-1.389-1.729-.146-.25-.015-.385.11-.509.112-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.021-.438-.062-.125-.562-1.355-.771-1.855-.203-.486-.409-.42-.562-.427-.144-.007-.308-.009-.473-.009-.166 0-.437.063-.666.313-.229.25-.874.854-.874 2.083s.895 2.416 1.02 2.583c.125.166 1.761 2.688 4.267 3.77.596.257 1.062.411 1.425.526.599.19 1.144.163 1.575.099.48-.072 1.476-.604 1.684-1.187.208-.583.208-1.083.146-1.187-.062-.104-.229-.167-.479-.292z" />
                      </svg>
                    </button>
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Calendar
                      size={14}
                      className="sm:w-4 sm:h-4 text-gray-400"
                    />
                    <span className="text-xs sm:text-sm">
                      {sessions.length} جلسة
                    </span>
                  </span>
                </div>
              </div>

              {/* الأزرار للشاشات الكبيرة */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onEditPatient}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gray-100 text-gray-700 font-medium text-xs sm:text-sm transition-all hover:bg-gray-200 active:scale-95"
                  title="تعديل بيانات المريض"
                >
                  <Edit size={14} className="sm:w-4 sm:h-4" />
                  <span>تعديل</span>
                </button>

                <XRayViewerButton
                  patientId={patient.id}
                  patientName={patient.fullName}
                  primaryColor={primaryColor}
                  isMobile={false}
                />

                <button
                  onClick={onAddAppointment}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-white font-medium text-xs sm:text-sm transition-all hover:shadow-md active:scale-95"
                  style={{ background: primaryColor }}
                >
                  <Plus size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span>موعد جديد</span>
                </button>
              </div>
            </div>

            {/* سطر الأزرار للهاتف */}
            <div className="flex sm:hidden items-center gap-2 w-full">
              <button
                onClick={onEditPatient}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-full bg-gray-100 text-gray-700 font-medium text-xs transition-all hover:bg-gray-200 active:scale-95 flex-1 justify-center"
              >
                <Edit size={14} />
                <span>تعديل</span>
              </button>

              <div className="flex-1">
                <XRayViewerButton
                  patientId={patient.id}
                  patientName={patient.fullName}
                  primaryColor={primaryColor}
                  isMobile={true}
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddAppointment();
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-full text-white font-medium text-xs transition-all hover:shadow-md active:scale-95 flex-1 justify-center"
                style={{ background: primaryColor }}
              >
                <Plus size={14} />
                <span>موعد جديد</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* العمر والجنس وسنة الميلاد */}
          <div className="space-y-3 sm:space-y-4">
            {/* العمر والجنس وسنة الميلاد */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
              {patient.age && (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] sm:text-xs text-gray-500">
                      العمر:
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium text-gray-900">
                      {patient.age} سنة
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] sm:text-xs text-gray-500">
                      سنة الميلاد:
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium text-gray-900">
                      {calculateBirthYear(patient.age)} تقريباً
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-1">
                <span className="text-[11px] sm:text-xs text-gray-500">
                  الجنس:
                </span>
                <span
                  className={`text-[11px] sm:text-xs font-medium px-1.5 py-0.5 rounded-full ${
                    patient.gender === "male"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-pink-50 text-pink-700"
                  }`}
                >
                  {patient.gender === "male" ? "ذكر" : "أنثى"}
                </span>
              </div>
            </div>

            {/* معلومات إضافية */}
            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 pt-2 sm:pt-3 border-t border-gray-100">
              {/* الإجراء المخطط */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Stethoscope
                  size={13}
                  className="sm:w-[14px] sm:h-[14px] text-gray-400"
                />
                <span className="text-[11px] sm:text-xs text-gray-500">
                  الإجراء المخطط:
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {patient.plannedProcedure || "غير محدد"}
                </span>
              </div>

              {/* السعر الإجمالي */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] sm:text-xs text-gray-500">
                  السعر الإجمالي:
                </span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">
                  {patient.totalPrice
                    ? `${formatCurrency(parseFloat(patient.totalPrice))}`
                    : formatCurrency(finance.totalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* ملاحظات إن وجدت */}
          {patient.notes && (
            <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
              <p className="text-xs sm:text-sm text-gray-600">
                {patient.notes}
              </p>
            </div>
          )}

          {/* المواعيد */}
          {sortedSessions.length > 0 ? (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                المواعيد
              </h3>

              {/* ============================================================ */}
              {/* عرض الجدول للشاشات الكبيرة فقط */}
              {/* ============================================================ */}
              <div className="hidden lg:block border border-gray-200 rounded-xl overflow-x-auto">
                <div className="min-w-[900px] lg:min-w-full">
                  {/* رأس الجدول */}
                  <div className="grid grid-cols-[100px_1.5fr_1fr_100px_100px_100px_100px] bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="text-xs sm:text-sm font-medium text-gray-500 text-right">
                      الحالة
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-500 text-right">
                      الإجراء
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-500 text-right">
                      التاريخ
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-500 text-right">
                      الوقت
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-500 text-right">
                      الإجمالي
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-500 text-right">
                      حالة الدفع
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-500 text-right">
                      إجراءات
                    </div>
                  </div>

                  {/* صفوف الجدول */}
                  <div className="divide-y divide-gray-100">
                    {sortedSessions.map((session) => {
                      const statusBadge = getSessionStatusBadge(session.status);
                      return (
                        <div
                          key={session.id}
                          className="grid grid-cols-[100px_1.5fr_1fr_100px_100px_100px_100px] px-4 py-2.5 items-center hover:bg-gray-50/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedSession(session)}
                        >
                          {/* حالة الجلسة */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${statusBadge.dotColor} flex-shrink-0`}
                            />
                            <span
                              className={`text-xs sm:text-sm ${statusBadge.textColor} truncate`}
                            >
                              {statusBadge.label}
                            </span>
                          </div>

                          {/* الإجراء */}
                          <div
                            className="text-xs sm:text-sm text-gray-900 font-medium truncate"
                            title={
                              session.performedProcedure ||
                              session.plannedProcedure ||
                              "جلسة"
                            }
                          >
                            {session.performedProcedure ||
                              session.plannedProcedure ||
                              "جلسة"}
                          </div>

                          {/* التاريخ */}
                          <div className="text-xs sm:text-sm text-gray-600 truncate">
                            {formatDate(session.startTime)}
                          </div>

                          {/* الوقت */}
                          <div className="text-xs sm:text-sm text-gray-600 truncate">
                            {formatTime(session.startTime)}
                          </div>

                          {/* الإجمالي */}
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {formatCurrency(session.sessionCost)}
                          </div>

                          {/* حالة الدفع */}
                          <div className="text-xs sm:text-sm text-gray-600 truncate">
                            {session.isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-[11px] sm:text-xs font-medium">
                                <CheckCircle size={11} />
                                مدفوع
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 text-[11px] sm:text-xs font-medium">
                                <AlertCircle size={11} />
                                غير مدفوع
                              </span>
                            )}
                          </div>

                          {/* أزرار الإجراءات */}
                          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditSession(session);
                              }}
                              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
                              title="تعديل الجلسة"
                            >
                              <Edit
                                size={14}
                                className="sm:w-4 sm:h-4 text-gray-600"
                              />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRequestDeleteSession(session.id);
                              }}
                              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-50 hover:bg-red-100 transition-colors flex-shrink-0"
                              title="حذف الجلسة"
                            >
                              <Trash2
                                size={14}
                                className="sm:w-4 sm:h-4 text-red-600"
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* عرض البطاقات للشاشات الصغيرة (الجوال والتابلت) */}
              {/* ============================================================ */}
              <div className="flex flex-col gap-2 sm:gap-3 lg:hidden">
                {sortedSessions.map((session) => {
                  const statusBadge = getSessionStatusBadge(session.status);
                  return (
                    <div
                      key={session.id}
                      className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-100"
                      onClick={() => setSelectedSession(session)}
                    >
                      {/* الصف الأول: حالة الجلسة + التاريخ */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${statusBadge.dotColor} flex-shrink-0`}
                          />
                          <span
                            className={`text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge.bgColor} ${statusBadge.textColor}`}
                          >
                            {statusBadge.label}
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-xs text-gray-500">
                          {formatDate(session.startTime)}
                        </span>
                      </div>

                      {/* الصف الثاني: الإجراء + الوقت */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[60%]"
                          title={
                            session.performedProcedure ||
                            session.plannedProcedure ||
                            "جلسة"
                          }
                        >
                          {session.performedProcedure ||
                            session.plannedProcedure ||
                            "جلسة"}
                        </span>
                        <span className="text-[11px] sm:text-xs text-gray-500">
                          {formatTime(session.startTime)}
                        </span>
                      </div>

                      {/* الصف الثالث: التكلفة + حالة الدفع + الأزرار */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {formatCurrency(session.sessionCost)}
                          </span>
                          {session.isPaid ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] sm:text-[11px] font-medium">
                              <CheckCircle size={10} />
                              مدفوع
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] sm:text-[11px] font-medium">
                              <AlertCircle size={10} />
                              غير مدفوع
                            </span>
                          )}
                        </div>

                        {/* أزرار الإجراءات */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditSession(session);
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-gray-200 transition-colors flex-shrink-0 shadow-sm"
                            title="تعديل الجلسة"
                          >
                            <Edit size={13} className="text-gray-600" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestDeleteSession(session.id);
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-red-50 transition-colors flex-shrink-0 shadow-sm"
                            title="حذف الجلسة"
                          >
                            <Trash2 size={13} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* حالة عدم وجود جلسات */
            <div className="text-center py-8 sm:py-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                <History
                  size={20}
                  className="sm:w-[22px] sm:h-[22px] text-gray-300"
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-500">لا توجد جلسات</p>
            </div>
          )}
        </div>
      </div>

      {/* البطاقة الموسعة للجلسة */}
      {selectedSession && (
        <ExpandedSessionCard
          session={selectedSession}
          patient={patient}
          onClose={() => setSelectedSession(null)}
          formatDate={formatDate}
          formatTime={formatTime}
          formatCurrency={formatCurrency}
          primaryColor={primaryColor}
          onEditSession={onEditSession}
          onDeleteSession={(sessionId) => {
            onRequestDeleteSession(sessionId);
            setSelectedSession(null);
          }}
        />
      )}
    </>
  );
}

// ============================================================
// نافذة تعديل الجلسة
// ============================================================

interface EditSessionModalProps {
  session: Session;
  primaryColor: string;
  onClose: () => void;
  onSave: (data: Partial<Session>) => Promise<void> | void;
  onDelete: (sessionId: string) => Promise<void> | void;
  addToast?: (toast: {
    message: string;
    type: "success" | "error" | "info";
  }) => void;
}

const formatToLocalDatetimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
function EditSessionModal({
  session,
  primaryColor,
  onClose,
  onSave,
  onDelete,
  addToast,
}: EditSessionModalProps) {
  useModalBackHandler(onClose);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    status: session.status,
    plannedProcedure: session.plannedProcedure || "",
    performedProcedure: session.performedProcedure || "",
    sessionCost: session.sessionCost,
    isPaid: session.isPaid,
    paymentMethod: session.paymentMethod || ("cash" as "cash" | "transfer"),
    notes: session.notes || "",
    startTime: formatToLocalDatetimeLocal(new Date(session.startTime)),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(startTime.getTime() + 30 * 60000);

      await onSave({
        id: session.id,
        status: formData.status,
        plannedProcedure: formData.plannedProcedure,
        performedProcedure: formData.performedProcedure,
        sessionCost: formData.sessionCost,
        isPaid: formData.isPaid,
        paymentMethod: formData.isPaid ? formData.paymentMethod : undefined,
        paidAt:
          formData.isPaid && !session.isPaid ? new Date() : session.paidAt,
        notes: formData.notes,
        startTime: startTime,
        endTime: endTime,
      });

      if (addToast) {
        addToast({
          message: "تم حفظ التعديلات بنجاح",
          type: "success",
        });
      }

      onClose();
    } catch (error: any) {
      if (addToast) {
        addToast({
          message: error?.message || "حدث خطأ أثناء حفظ التعديلات",
          type: "error",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(session.id);

      if (addToast) {
        addToast({
          message: "تم حذف الجلسة بنجاح",
          type: "success",
        });
      }

      onClose();
    } catch (error: any) {
      if (addToast) {
        addToast({
          message: error?.message || "حدث خطأ أثناء حذف الجلسة",
          type: "error",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = isSaving || isDeleting;
  const [sessionCostDisplay, setSessionCostDisplay] = useState(
    formData.sessionCost?.toString() || "",
  );
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-fullscreen-overlay"
        // onClick={isLoading ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-fullscreen  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6" style={{ background: primaryColor }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Edit size={20} />
                تعديل الجلسة
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-white/90 mt-1">
              {session.patientSnapshot?.name &&
                `المريض: ${session.patientSnapshot.name}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* حالة الجلسة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                حالة الجلسة
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "scheduled", label: "مجدولة" },
                  { value: "completed", label: "مكتملة" },
                  { value: "in-progress", label: "قيد التنفيذ" },
                  { value: "cancelled", label: "ملغية" },
                  { value: "no-show", label: "لم يحضر" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex-1 min-w-fit px-4 py-2.5 rounded-xl text-sm font-medium text-center cursor-pointer transition-all border-2 ${
                      formData.status === option.value
                        ? "border-transparent text-white"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={
                      formData.status === option.value
                        ? { backgroundColor: primaryColor }
                        : {}
                    }
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={formData.status === option.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as Session["status"],
                        })
                      }
                      disabled={isLoading}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* تاريخ ووقت الجلسة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ ووقت الجلسة
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
              />
            </div>

            {/* الإجراء المخطط */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الإجراء المخطط
              </label>
              <input
                type="text"
                required
                value={formData.plannedProcedure}
                onChange={(e) =>
                  setFormData({ ...formData, plannedProcedure: e.target.value })
                }
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
                placeholder="مثال: تنظيف أسنان، حشوة..."
              />
            </div>

            {/* الإجراء المنفذ */}
            {(formData.status === "completed" ||
              formData.status === "in-progress") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الإجراء المنفذ
                </label>
                <textarea
                  value={formData.performedProcedure}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      performedProcedure: e.target.value,
                    })
                  }
                  disabled={isLoading}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ "--tw-ring-color": primaryColor } as any}
                  placeholder="ما تم تنفيذه فعلياً في الجلسة..."
                />
              </div>
            )}

            {/* تكلفة الجلسة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تكلفة الجلسة ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={sessionCostDisplay}
                onChange={(e) => {
                  let value = e.target.value
                    .replace(/[^0-9.,]/g, "")
                    .replace(",", ".")
                    .replace(/(\..*)\./g, "$1");

                  // تحديث العرض دائماً
                  setSessionCostDisplay(value);

                  // تحديث الرقم فقط إذا اكتمل
                  if (!value.endsWith(".")) {
                    const numValue = parseFloat(value);
                    setFormData({
                      ...formData,
                      sessionCost: isNaN(numValue) ? 0 : numValue,
                    });
                  }
                }}
                onBlur={(e) => {
                  const finalValue = parseFloat(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    sessionCost: finalValue,
                  });
                  setSessionCostDisplay(finalValue.toString());
                }}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent invalid:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
                placeholder="0"
                dir="rtl"
              />
            </div>

            {/* حالة الدفع */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <label
                className={`flex items-center gap-3 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  checked={formData.isPaid}
                  onChange={(e) =>
                    setFormData({ ...formData, isPaid: e.target.checked })
                  }
                  disabled={isLoading}
                  className="w-4 h-4"
                  style={{ accentColor: primaryColor }}
                />
                <span className="text-gray-900 font-medium">
                  تم دفع تكلفة الجلسة
                </span>
              </label>

              {formData.isPaid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    طريقة الدفع
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value as "cash" | "transfer",
                      })
                    }
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="cash">نقداً</option>
                    <option value="transfer">تحويل بنكي</option>
                  </select>
                </div>
              )}
            </div>

            {/* ملاحظات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                disabled={isLoading}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
                placeholder="ملاحظات إضافية..."
              />
            </div>

            {/* أزرار التحكم */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {/* <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                {isDeleting ? "جاري الحذف..." : "حذف الجلسة"}
              </button> */}

              <div className="flex-1" />

              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 rounded-xl text-white font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: primaryColor }}
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Edit size={18} />
                )}
                {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </>
  );
}

// ============================================================
// نافذة تأكيد الحذف
// ============================================================

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  primaryColor?: string;
  sessionInfo?: {
    date?: string;
    procedure?: string;
  };
  addToast?: (toast: {
    message: string;
    type: "success" | "error" | "info";
  }) => void;
}

function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "تأكيد الحذف",
  message = "هل أنت متأكد من حذف هذه الجلسة؟",
  primaryColor = "#dc2626",
  sessionInfo,
  addToast,
}: ConfirmDeleteModalProps) {
  useModalBackHandler(onClose);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      if (addToast) {
        addToast({
          message: "تم الحذف بنجاح",
          type: "success",
        });
      }
      onClose();
    } catch (error: any) {
      if (addToast) {
        addToast({
          message: error?.message || "حدث خطأ أثناء الحذف",
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        // onClick={isLoading ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6" style={{ background: primaryColor }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Trash2 size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-white/80 text-sm mt-1">
                  لا يمكن التراجع عن هذا الإجراء
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 text-base mb-4">{message}</p>

            {sessionInfo && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {sessionInfo.date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {sessionInfo.date}
                    </span>
                  </div>
                )}
                {sessionInfo.procedure && (
                  <div className="flex items-center gap-2">
                    <Stethoscope size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {sessionInfo.procedure}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* أزرار التحكم */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: primaryColor }}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                {isLoading ? "جاري الحذف..." : "نعم، احذف"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// نافذة إضافة مريض جديد (معدلة مع العمر والموعد المرن)
// ============================================================

interface NewPatientModalProps {
  primaryColor: string;
  secondaryColor: string;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  addToast?: (toast: {
    message: string;
    type: "success" | "error" | "info";
  }) => void;
}

function NewPatientModal({
  primaryColor,
  secondaryColor,
  onClose,
  onSubmit,
  isLoading: externalLoading = false,
  addToast,
}: NewPatientModalProps) {
  useModalBackHandler(onClose);
  const [internalLoading, setInternalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLoading = externalLoading || internalLoading;

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "male" as "male" | "female",
    age: "",
    address: "",
    notes: "",
    plannedProcedure: "",
    totalPrice: "",
    addAppointment: true,
    appointmentMode: "date" as "date" | "days",
    appointment: {
      days: "1",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      procedure: "كشف أولي",
      cost: "5",
      notes: "",
    },
  });

  const calculateAppointmentDate = (): Date => {
    if (formData.appointmentMode === "days") {
      const days = parseInt(formData.appointment.days) || 1;
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    } else {
      return new Date(formData.appointment.date);
    }
  };

  const calculateBirthYear = (age: number): number => {
    const currentYear = new Date().getFullYear();
    return currentYear - age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // تحقق من صحة البيانات
    if (!formData.fullName.trim()) {
      const errorMsg = "الرجاء إدخال اسم المريض";
      setLocalError(errorMsg);
      if (addToast) {
        addToast({
          message: errorMsg,
          type: "error",
        });
      }
      return;
    }

    if (
      formData.age &&
      (parseInt(formData.age) < 5 || parseInt(formData.age) > 100)
    ) {
      const errorMsg = "الرجاء إدخال عمر صحيح بين 5 و 100";
      setLocalError(errorMsg);
      if (addToast) {
        addToast({
          message: errorMsg,
          type: "error",
        });
      }
      return;
    }

    setInternalLoading(true);

    try {
      const patientData = {
        fullName: formData.fullName,
        phone: formData.phone || "",
        email: formData.email || undefined,
        gender: formData.gender,
        age: parseInt(formData.age) || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
        plannedProcedure: formData.plannedProcedure || undefined,
        totalPrice: formData.totalPrice || undefined,
        addAppointment: formData.addAppointment,
      };

      let appointmentData = null;
      if (formData.addAppointment) {
        const appointmentDate = calculateAppointmentDate();
        const [hours, minutes] = formData.appointment.time.split(":");
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const endTime = new Date(appointmentDate.getTime() + 30 * 60000);

        appointmentData = {
          startTime: appointmentDate,
          endTime: endTime,
          procedure: formData.appointment.procedure,
          cost: parseFloat(formData.appointment.cost) || 0,
          notes: formData.appointment.notes || undefined,
        };
      }
      await onSubmit({
        ...patientData,
        appointment: appointmentData,
      });

      if (addToast) {
        addToast({
          message: formData.addAppointment
            ? "تم إضافة المريض والموعد بنجاح"
            : "تم إضافة المريض بنجاح",
          type: "success",
        });
      }

      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || "حدث خطأ أثناء إضافة المريض";
      setLocalError(errorMessage);
      if (addToast) {
        addToast({
          message: errorMessage,
          type: "error",
        });
      }
    } finally {
      setInternalLoading(false);
    }
  };

  const appointmentDate = calculateAppointmentDate();
  const formattedAppointmentDate = appointmentDate.toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden modal-fullscreen-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto  modal-fullscreen [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3" style={{ background: primaryColor }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <UserPlus size={24} />
                إضافة مريض جديد
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-3 space-y-3">
            {/* عرض الخطأ المحلي */}
            {localError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle
                  size={20}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-red-800 font-medium text-sm">حدث خطأ</p>
                  <p className="text-red-600 text-sm mt-1">{localError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {/* معلومات أساسية */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => {
                      const valueWithoutNumbers = e.target.value.replace(
                        /[0-9]/g,
                        "",
                      );
                      setFormData({
                        ...formData,
                        fullName: valueWithoutNumbers,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key >= "0" && e.key <= "9") {
                        e.preventDefault();
                      }
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "--tw-ring-color": primaryColor } as any}
                    placeholder="مثال: أحمد محمد الكامل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الجوال (واتساب)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      let phoneValue = e.target.value.replace(/[^\d+]/g, "");

                      if (phoneValue.startsWith("0")) {
                        phoneValue = "+963" + phoneValue.slice(2);
                      }

                      setFormData({ ...formData, phone: phoneValue });
                    }}
                    onKeyDown={(e) => {
                      const allowedKeys = [
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Tab",
                        "+",
                      ];
                      if (
                        !allowedKeys.includes(e.key) &&
                        !(e.key >= "0" && e.key <= "9")
                      ) {
                        e.preventDefault();
                      }
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "--tw-ring-color": primaryColor } as any}
                    placeholder="+963........"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العمر
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "--tw-ring-color": primaryColor } as any}
                    placeholder="بين 5 و 100"
                  />
                  {formData.age &&
                    parseInt(formData.age) >= 5 &&
                    parseInt(formData.age) <= 100 && (
                      <p className="text-xs text-gray-500 mt-1">
                        سنة الميلاد تقريباً:{" "}
                        {calculateBirthYear(parseInt(formData.age))}
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنس
                  </label>
                  <div className="flex gap-4">
                    <label
                      className={`flex items-center gap-2 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                      <input
                        type="radio"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: "male" })
                        }
                        disabled={isLoading}
                        className="w-4 h-4"
                        style={{ accentColor: primaryColor }}
                      />
                      <span className="text-gray-700">ذكر</span>
                    </label>
                    <label
                      className={`flex items-center gap-2 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                      <input
                        type="radio"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: "female" })
                        }
                        disabled={isLoading}
                        className="w-4 h-4"
                        style={{ accentColor: primaryColor }}
                      />
                      <span className="text-gray-700">أنثى</span>
                    </label>
                  </div>
                </div>

                {/* حقل الإجراء المخطط */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الإجراء المخطط
                  </label>
                  <input
                    type="text"
                    value={formData.plannedProcedure}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plannedProcedure: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "--tw-ring-color": primaryColor } as any}
                    placeholder="مثال: زراعة أسنان، تقويم..."
                  />
                </div>

                {/* حقل السعر الإجمالي */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الإجمالي
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.totalPrice}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/(\..*)\./g, "$1");

                      setFormData({
                        ...formData,
                        totalPrice: value,
                      });
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "--tw-ring-color": primaryColor } as any}
                    placeholder="0"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  disabled={isLoading}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ "--tw-ring-color": primaryColor } as any}
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>
            </div>

            {/* الموعد الأول */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="addAppointment"
                  checked={formData.addAppointment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      addAppointment: e.target.checked,
                    })
                  }
                  disabled={isLoading}
                  className="w-4 h-4"
                  style={{ accentColor: primaryColor }}
                />
                <label
                  htmlFor="addAppointment"
                  className={`font-bold text-gray-900 text-lg ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  إضافة موعد أولي
                </label>
              </div>

              {formData.addAppointment && (
                <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      طريقة تحديد الموعد
                    </label>
                    <div className="flex gap-4">
                      <label
                        className={`flex items-center gap-2 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      >
                        <input
                          type="radio"
                          value="days"
                          checked={formData.appointmentMode === "days"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              appointmentMode: e.target.value as
                                | "days"
                                | "date",
                            })
                          }
                          disabled={isLoading}
                          className="w-4 h-4"
                          style={{ accentColor: primaryColor }}
                        />
                        <span className="text-gray-700">بعد عدة أيام</span>
                      </label>
                      <label
                        className={`flex items-center gap-2 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                      >
                        <input
                          type="radio"
                          value="date"
                          checked={formData.appointmentMode === "date"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              appointmentMode: e.target.value as
                                | "days"
                                | "date",
                            })
                          }
                          disabled={isLoading}
                          className="w-4 h-4"
                          style={{ accentColor: primaryColor }}
                        />
                        <span className="text-gray-700">تاريخ محدد</span>
                      </label>
                    </div>
                  </div>

                  {formData.appointmentMode === "days" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        بعد كم يوم؟ (1 - 10 أيام)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.appointment.days}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            appointment: {
                              ...formData.appointment,
                              days: e.target.value,
                            },
                          })
                        }
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ "--tw-ring-color": primaryColor } as any}
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        التاريخ المحدد:{" "}
                        <span className="font-medium">
                          {formattedAppointmentDate}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر التاريخ
                      </label>
                      <input
                        type="date"
                        value={formData.appointment.date}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            appointment: {
                              ...formData.appointment,
                              date: e.target.value,
                            },
                          })
                        }
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ "--tw-ring-color": primaryColor } as any}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوقت
                    </label>
                    <input
                      type="time"
                      value={formData.appointment.time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appointment: {
                            ...formData.appointment,
                            time: e.target.value,
                          },
                        })
                      }
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ "--tw-ring-color": primaryColor } as any}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الإجراء
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.appointment.procedure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appointment: {
                            ...formData.appointment,
                            procedure: e.target.value,
                          },
                        })
                      }
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ "--tw-ring-color": primaryColor } as any}
                      placeholder="مثال: كشف أولي، تنظيف أسنان..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التكلفة ($)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      required
                      value={formData.appointment.cost}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/[^0-9.]/g, "")
                          .replace(/(\..*)\./g, "$1");

                        setFormData({
                          ...formData,
                          appointment: { ...formData.appointment, cost: value },
                        });
                      }}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ "--tw-ring-color": primaryColor } as any}
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* أزرار */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl text-white font-medium transition-all
                        disabled:opacity-70 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2 hover:opacity-90"
                style={{ background: primaryColor }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>جاري الإضافة...</span>
                  </>
                ) : (
                  <span>إضافة المريض</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </>
  );
}

// ============================================================
// نافذة إضافة موعد جديد (معدلة مع خيار الأيام أو التاريخ)
// ============================================================

interface NewAppointmentModalProps {
  patient: Patient;
  primaryColor: string;
  secondaryColor: string;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  addToast?: (toast: {
    message: string;
    type: "success" | "error" | "info";
  }) => void;
}

function NewAppointmentModal({
  patient,
  primaryColor,
  secondaryColor,
  onClose,
  onSubmit,
  isLoading: externalLoading = false,
  addToast,
}: NewAppointmentModalProps) {
  useModalBackHandler(onClose);
  const [internalLoading, setInternalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLoading = externalLoading || internalLoading;

  const [formData, setFormData] = useState({
    appointmentMode: "days" as "days" | "date",
    days: "1",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    procedure: "",
    cost: "",
    caseId: "",
    notes: "",
  });

  const calculateAppointmentDate = (): Date => {
    if (formData.appointmentMode === "days") {
      const days = parseInt(formData.days) || 1;
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    } else {
      return new Date(formData.date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // التحقق من صحة البيانات
    if (!formData.procedure.trim()) {
      const errorMsg = "الرجاء إدخال الإجراء";
      setLocalError(errorMsg);
      if (addToast) {
        addToast({
          message: errorMsg,
          type: "error",
        });
      }
      return;
    }

    if (!formData.cost || parseFloat(formData.cost) < 0) {
      const errorMsg = "الرجاء إدخال التكلفة";
      setLocalError(errorMsg);
      if (addToast) {
        addToast({
          message: errorMsg,
          type: "error",
        });
      }
      return;
    }

    setInternalLoading(true);

    try {
      const appointmentDate = calculateAppointmentDate();
      const [hours, minutes] = formData.time.split(":");
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endTime = new Date(appointmentDate.getTime() + 30 * 60000);

      await onSubmit({
        startTime: appointmentDate,
        endTime,
        procedure: formData.procedure || "كشف",
        cost: formData.cost,
        caseId: formData.caseId || undefined,
        notes: formData.notes || undefined,
      });

      if (addToast) {
        addToast({
          message: `تم إضافة موعد للمريض ${patient.fullName} بنجاح`,
          type: "success",
        });
      }

      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || "حدث خطأ أثناء إضافة الموعد";
      setLocalError(errorMessage);
      if (addToast) {
        addToast({
          message: errorMessage,
          type: "error",
        });
      }
    } finally {
      setInternalLoading(false);
    }
  };

  const appointmentDate = calculateAppointmentDate();
  const formattedAppointmentDate = appointmentDate.toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 modal-fullscreen-overlay"
        // onClick={isLoading ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto modal-fullscreen [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3" style={{ background: primaryColor }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <CalendarIcon size={20} />
                موعد جديد
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-white/90 mt-1">للمريض: {patient.fullName}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-3 space-y-3">
            {/* عرض الخطأ المحلي */}
            {localError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle
                  size={20}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-red-800 font-medium text-sm">حدث خطأ</p>
                  <p className="text-red-600 text-sm mt-1">{localError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {/* طريقة تحديد الموعد */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                طريقة تحديد الموعد
              </label>
              <div className="flex gap-4">
                <label
                  className={`flex items-center gap-2 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <input
                    type="radio"
                    value="days"
                    checked={formData.appointmentMode === "days"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointmentMode: e.target.value as "days" | "date",
                      })
                    }
                    disabled={isLoading}
                    className="w-4 h-4"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-gray-700">بعد عدة أيام</span>
                </label>
                <label
                  className={`flex items-center gap-2 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                  <input
                    type="radio"
                    value="date"
                    checked={formData.appointmentMode === "date"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointmentMode: e.target.value as "days" | "date",
                      })
                    }
                    disabled={isLoading}
                    className="w-4 h-4"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-gray-700">تاريخ محدد</span>
                </label>
              </div>
            </div>

            {/* حقل الإدخال حسب الوضع */}
            {formData.appointmentMode === "days" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  بعد كم يوم؟ (1 - 10 أيام)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.days}
                  onChange={(e) =>
                    setFormData({ ...formData, days: e.target.value })
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ "--tw-ring-color": primaryColor } as any}
                />
                <p className="text-sm text-gray-600 mt-2">
                  التاريخ المحدد:{" "}
                  <span className="font-medium">
                    {formattedAppointmentDate}
                  </span>
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر التاريخ
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ "--tw-ring-color": primaryColor } as any}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوقت
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الإجراء
              </label>
              <input
                type="text"
                required
                value={formData.procedure}
                onChange={(e) =>
                  setFormData({ ...formData, procedure: e.target.value })
                }
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
                placeholder="مثال: تنظيف أسنان، حشوة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التكلفة ($)
              </label>
              <input
                type="text"
                inputMode="decimal"
                required
                value={formData.cost || ""}
                onChange={(e) => {
                  // السماح بالأرقام والفاصلة العشرية مع منع التكرار
                  const value = e.target.value
                    .replace(/[^0-9.]/g, "")
                    .replace(/(\..*)\./g, "$1");
                  setFormData({
                    ...formData,
                    cost: value,
                  });
                }}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                disabled={isLoading}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl text-white font-medium transition-all
                        disabled:opacity-70 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2 hover:opacity-90"
                style={{ background: primaryColor }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>جاري الإضافة...</span>
                  </>
                ) : (
                  <span>إضافة الموعد</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </>
  );
}

interface EditPatientModalProps {
  patient: Patient;
  primaryColor: string;
  secondaryColor: string;
  onClose: () => void;
  onSubmit: (patientId: string, data: any) => Promise<void>;
  isLoading?: boolean;
  addToast?: (toast: {
    message: string;
    type: "success" | "error" | "info";
  }) => void;
}

function EditPatientModal({
  patient,
  primaryColor,
  secondaryColor,
  onClose,
  onSubmit,
  isLoading: externalLoading = false,
  addToast,
}: EditPatientModalProps) {
  useModalBackHandler(onClose);
  const [internalLoading, setInternalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLoading = externalLoading || internalLoading;

  const [formData, setFormData] = useState({
    fullName: patient.fullName || "",
    phone: patient.phone || "",
    gender: patient.gender || "male",
    age: patient.age?.toString() || "",
    notes: patient.notes || "",
    plannedProcedure: patient.plannedProcedure || "",
    totalPrice: patient.totalPrice || "",
  });

  const calculateBirthYear = (age: number): number => {
    const currentYear = new Date().getFullYear();
    return currentYear - age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!formData.fullName.trim()) {
      const errorMsg = "الرجاء إدخال اسم المريض";
      setLocalError(errorMsg);
      if (addToast) {
        addToast({ message: errorMsg, type: "error" });
      }
      return;
    }

    if (
      formData.age &&
      (parseInt(formData.age) < 5 || parseInt(formData.age) > 100)
    ) {
      const errorMsg = "الرجاء إدخال عمر صحيح بين 5 و 100";
      setLocalError(errorMsg);
      if (addToast) {
        addToast({ message: errorMsg, type: "error" });
      }
      return;
    }

    setInternalLoading(true);

    try {
      await onSubmit(patient.id, {
        fullName: formData.fullName,
        phone: formData.phone || "",
        gender: formData.gender,
        age: parseInt(formData.age) || undefined,
        notes: formData.notes || undefined,
        plannedProcedure: formData.plannedProcedure || undefined,
        totalPrice: formData.totalPrice || undefined,
      });

      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || "حدث خطأ أثناء تعديل المريض";
      setLocalError(errorMessage);
      if (addToast) {
        addToast({ message: errorMessage, type: "error" });
      }
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-hidden modal-fullscreen-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-fullscreen [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-3" style={{ background: primaryColor }}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Edit size={24} />
                تعديل بيانات المريض
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-white/90 mt-1">المريض: {patient.fullName}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-3 space-y-3">
            {localError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle
                  size={20}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-red-800 font-medium text-sm">حدث خطأ</p>
                  <p className="text-red-600 text-sm mt-1">{localError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}

            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => {
                      const valueWithoutNumbers = e.target.value.replace(
                        /[0-9]/g,
                        "",
                      );
                      setFormData({
                        ...formData,
                        fullName: valueWithoutNumbers,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key >= "0" && e.key <= "9") {
                        e.preventDefault();
                      }
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "--tw-ring-color": primaryColor } as any}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الجوال (واتساب)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      let phoneValue = e.target.value.replace(/[^\d+]/g, "");
                      if (phoneValue.startsWith("0")) {
                        phoneValue = "+963" + phoneValue.slice(2);
                      }
                      setFormData({ ...formData, phone: phoneValue });
                    }}
                    onKeyDown={(e) => {
                      const allowedKeys = [
                        "Backspace",
                        "Delete",
                        "ArrowLeft",
                        "ArrowRight",
                        "Tab",
                        "+",
                      ];
                      if (
                        !allowedKeys.includes(e.key) &&
                        !(e.key >= "0" && e.key <= "9")
                      ) {
                        e.preventDefault();
                      }
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "--tw-ring-color": primaryColor } as any}
                    placeholder="+963........"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العمر
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "--tw-ring-color": primaryColor } as any}
                    placeholder="بين 5 و 100"
                  />
                  {formData.age &&
                    parseInt(formData.age) >= 5 &&
                    parseInt(formData.age) <= 100 && (
                      <p className="text-xs text-gray-500 mt-1">
                        سنة الميلاد تقريباً:{" "}
                        {calculateBirthYear(parseInt(formData.age))}
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنس
                  </label>
                  <div className="flex gap-4">
                    <label
                      className={`flex items-center gap-2 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                      <input
                        type="radio"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={() =>
                          setFormData({ ...formData, gender: "male" })
                        }
                        disabled={isLoading}
                        className="w-4 h-4"
                        style={{ accentColor: primaryColor }}
                      />
                      <span className="text-gray-700">ذكر</span>
                    </label>
                    <label
                      className={`flex items-center gap-2 ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                      <input
                        type="radio"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={() =>
                          setFormData({ ...formData, gender: "female" })
                        }
                        disabled={isLoading}
                        className="w-4 h-4"
                        style={{ accentColor: primaryColor }}
                      />
                      <span className="text-gray-700">أنثى</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الإجراء المخطط
                  </label>
                  <input
                    type="text"
                    value={formData.plannedProcedure}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        plannedProcedure: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "--tw-ring-color": primaryColor } as any}
                    placeholder="مثال: زراعة أسنان، تقويم..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الإجمالي
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.totalPrice}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/(\..*)\./g, "$1");
                      setFormData({ ...formData, totalPrice: value });
                    }}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ "--tw-ring-color": primaryColor } as any}
                    placeholder="0"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  disabled={isLoading}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ "--tw-ring-color": primaryColor } as any}
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-xl text-white font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90"
                style={{ background: primaryColor }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <span>حفظ التعديلات</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </>
  );
}
