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
import { createPatient } from "@/client/helpers/patient";
import {
  createSession,
  deleteSession,
  updateSession,
} from "@/client/helpers/session";
import { ToastContainer, useToast } from "./Toast";

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
    if (!result || !result.data || !result.data.id) throw new Error("فشل إنشاء المريض");
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
    if (!result || !result.data || !result.data.id) throw new Error("فشل إنشاء الموعد");
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
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SYP",
    }).format(amount);
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
    if(!result.success){
      throw new Error("حدث خطأ ما اثناء التعديل")
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "#007bff", borderTopColor: "transparent" }}
          />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div
        className="min-h-screen p-4 lg:p-6"
        style={{
          background: `linear-gradient(145deg, ${primaryColor}08 0%, ${primaryColor}03 100%)`,
        }}
      >
        {/* شريط العمليات العلوي */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 w-full lg:max-w-md">
              <input
                type="text"
                placeholder="البحث عن مريض بالاسم أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-3.5 bg-white rounded-2xl text-gray-900 placeholder-gray-500 text-base shadow-lg border-0 focus:ring-2 transition-all"
                style={{ "--tw-ring-color": primaryColor } as any}
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTodayOnly(!showTodayOnly)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-medium text-base shadow-lg transition-all"
                style={{
                  background: showTodayOnly ? primaryColor : "white",
                  color: showTodayOnly ? "white" : "#374151",
                }}
              >
                <Users size={18} />
                <span>{showTodayOnly ? "جميع المرضى" : "مرضى اليوم"}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNewPatientModal(true)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl font-medium text-base text-white shadow-lg transition-all"
                style={{ background: primaryColor }}
              >
                <UserPlus size={18} />
                <span className="hidden lg:inline">مريض جديد</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="flex flex-col lg:flex-row gap-0">
          {/* عمود قائمة المرضى */}
          <div
            ref={listRef}
            className={`relative flex-shrink-0 transition-all duration-200 ${
              !selectedPatient ? "flex-1" : ""
            } ${isCollapsed ? "w-20" : ""}`}
            style={
              selectedPatient && !isCollapsed
                ? { width: `${listWidth}px` }
                : undefined
            }
          >
            <div
              className={`bg-white rounded-2xl shadow-sm border border-gray-200 h-full ${isCollapsed ? "px-1" : ""}`}
            >
              {/* Header مع زر الطي/الفرد */}
              <div
                className={`flex items-center ${isCollapsed ? "justify-center py-4" : "px-5 py-4 border-b border-gray-200 bg-gray-50/50"}`}
              >
                {!isCollapsed ? (
                  <>
                    <div className="flex items-center justify-between w-full">
                      <h3 className="font-semibold text-gray-800">
                        {showTodayOnly ? "مرضى اليوم" : "جميع المرضى"}
                        <span className="text-sm font-normal text-gray-500 mr-2">
                          ({patientsWithDetails.length})
                        </span>
                      </h3>
                      {selectedPatient && (
                        <button
                          onClick={() => setIsCollapsed(true)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                          title="طي القائمة"
                        >
                          <PanelLeftClose size={18} className="text-gray-600" />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setIsCollapsed(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="توسيع القائمة"
                  >
                    <PanelLeftOpen size={20} className="text-gray-600" />
                  </button>
                )}
              </div>

              {/* محتوى القائمة */}
              {!isCollapsed ? (
                <div className="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide">
                  <AnimatePresence>
                    {patientsWithDetails.map((patient, index) => {
                      const finance = calculatePatientFinance(patient.id);
                      return (
                        <motion.div
                          key={patient.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => handlePatientSelect(patient)}
                          className={`px-5 py-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150
                            ${selectedPatient?.id === patient.id ? "bg-blue-50/70 border-r-4" : "hover:bg-gray-50 border-r-4 border-r-transparent"}`}
                          style={{
                            borderRightColor:
                              selectedPatient?.id === patient.id
                                ? primaryColor
                                : "transparent",
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900 text-base">
                                {patient.fullName}
                              </h4>
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${patient.gender === "male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}
                              >
                                {patient.gender === "male" ? "ذكر" : "أنثى"}
                              </span>
                              {patient.age && (
                                <span className="text-xs text-gray-500">
                                  {patient.age} سنة
                                </span>
                              )}
                            </div>
                            <ChevronRight
                              size={18}
                              className="text-gray-400"
                              style={{
                                color:
                                  selectedPatient?.id === patient.id
                                    ? primaryColor
                                    : undefined,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1 text-gray-700">
                              <Phone size={14} className="text-gray-400" />
                              <span className="text-sm" dir="ltr">
                                {patient.phone}
                              </span>
                            </div>
                            {patient.todaySession && (
                              <div className="flex items-center gap-1.5">
                                <Clock
                                  size={14}
                                  style={{ color: primaryColor }}
                                />
                                <span
                                  className="text-sm font-medium"
                                  style={{ color: primaryColor }}
                                >
                                  {formatTime(patient.todaySession.startTime)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {patient.todaySession ? (
                                <>
                                  <Stethoscope
                                    size={14}
                                    className="text-gray-400"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {patient.todaySession.plannedProcedure ||
                                      "كشف"}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  لا يوجد موعد اليوم
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) =>
                                handleWhatsApp(patient, patient.todaySession, e)
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all hover:shadow-md active:scale-95"
                              style={{
                                background: "#25D366",
                                boxShadow: "0 2px 4px rgba(37, 211, 102, 0.2)",
                              }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="currentColor"
                              >
                                <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.498 2 2.017 6.477 2.012 11.984c-.001 1.76.46 3.478 1.335 4.992L2 21.991l5.172-1.356c1.46.796 3.104 1.215 4.828 1.216h.004c5.508 0 9.99-4.478 9.995-9.984.002-2.667-1.035-5.175-2.922-7.064zm-7.071 15.355h-.003c-1.507 0-2.985-.405-4.273-1.169l-.306-.181-3.069.805.819-2.991-.202-.32a8.268 8.268 0 0 1-1.267-4.439c.003-4.572 3.724-8.29 8.301-8.29 2.216.001 4.299.865 5.866 2.432a8.238 8.238 0 0 1 2.428 5.873c-.003 4.572-3.724 8.29-8.297 8.29zm4.551-6.208c-.25-.125-1.476-.728-1.705-.812-.229-.083-.396-.124-.562.125-.167.25-.647.812-.793.978-.146.167-.292.187-.542.062-.25-.124-1.054-.389-2.008-1.24-.742-.662-1.243-1.48-1.389-1.729-.146-.25-.015-.385.11-.509.112-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.021-.438-.062-.125-.562-1.355-.771-1.855-.203-.486-.409-.42-.562-.427-.144-.007-.308-.009-.473-.009-.166 0-.437.063-.666.313-.229.25-.874.854-.874 2.083s.895 2.416 1.02 2.583c.125.166 1.761 2.688 4.267 3.77.596.257 1.062.411 1.425.526.599.19 1.144.163 1.575.099.48-.072 1.476-.604 1.684-1.187.208-.583.208-1.083.146-1.187-.062-.104-.229-.167-.479-.292z" />
                              </svg>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {patientsWithDetails.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users size={28} className="text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium mb-1">
                        لا يوجد مرضى
                      </p>
                      <p className="text-gray-500 text-sm">
                        {showTodayOnly
                          ? "لا توجد مواعيد لهذا اليوم"
                          : "ابدأ بإضافة مريض جديد"}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-hide py-2">
                  <div className="flex flex-col items-center gap-1">
                    {patientsWithDetails.map((patient) => {
                      const initials = getInitials(patient.fullName);
                      const isSelected = selectedPatient?.id === patient.id;
                      return (
                        <motion.button
                          key={patient.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePatientSelect(patient)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-medium text-sm transition-all shadow-sm
                            ${isSelected ? "ring-2 ring-offset-1" : "hover:shadow-md"}`}
                          style={{
                            backgroundColor: isSelected
                              ? primaryColor
                              : "#f3f4f6",
                            color: isSelected ? "white" : "#374151",
                          }}
                          title={patient.fullName}
                        >
                          {initials}
                        </motion.button>
                      );
                    })}
                  </div>
                  {patientsWithDetails.length === 0 && (
                    <div className="flex justify-center py-4">
                      <Users size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isCollapsed && selectedPatient && !isMobile && (
              <div
                className="absolute top-0 -left-3 w-6 h-full cursor-col-resize z-10 flex items-center justify-center group"
                onMouseDown={handleMouseDown}
              >
                <div className="w-1 h-12 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors" />
                <GripVertical
                  size={16}
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
                  setIsMobileDrawerOpen(false);
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
  onRequestDeleteSession,
}: PatientDetailsCardProps) {
  const finance = calculateFinance();
  const pastSessions = sessions
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // فرز الجلسات من الأحدث إلى الأقدم
  const sortedSessions = [...pastSessions].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header - معلومات أساسية */}
        <div className="p-6 border-b border-gray-100 relative">
          {/* زر الإغلاق */}
          <button
            onClick={onClose}
            className="absolute left-0 top-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-gray-500 hover:bg-red-500 transition-colors"
          >
            <X size={18} />
          </button>

          {/* الاسم ورقم الهاتف وعدد الجلسات */}
          <div className="flex items-start justify-between mt-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {patient.fullName}
              </h2>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Phone size={16} className="text-gray-400" />
                  <span dir="ltr">{patient.phone}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{sessions.length} جلسة</span>
                </span>
              </div>
            </div>

            {/* زر إضافة موعد جديد */}
            <button
              onClick={onAddAppointment}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium text-sm
                       transition-all hover:shadow-md active:scale-95"
              style={{ background: primaryColor }}
            >
              <Plus size={18} />
              <span>موعد جديد</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* العمر والجنس وسنة الميلاد */}
          <div className="flex items-center gap-6">
            {patient.age && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">العمر:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {patient.age} سنة
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">سنة الميلاد:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {calculateBirthYear(patient.age)} تقريباً
                  </span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">الجنس:</span>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  patient.gender === "male"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-pink-50 text-pink-700"
                }`}
              >
                {patient.gender === "male" ? "ذكر" : "أنثى"}
              </span>
            </div>
          </div>

          {/* ملاحظات إن وجدت */}
          {patient.notes && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-600">{patient.notes}</p>
            </div>
          )}

          {/* جدول المواعيد */}
          {sortedSessions.length > 0 ? (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-base">
                المواعيد
              </h3>

              {/* حاوية قابلة للتمرير الأفقي عند الحاجة */}
              <div className="border border-gray-200 rounded-xl overflow-x-auto">
                {/* جدول بعرض أدنى يضمن ظهور جميع الأعمدة على الشاشات الكبيرة، مع إمكانية التمرير على الصغيرة */}
                <div className="min-w-[900px] lg:min-w-full">
                  {/* رأس الجدول */}
                  <div className="grid grid-cols-[100px_1.5fr_1fr_100px_100px_100px] bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-500 text-right">
                      الحالة
                    </div>
                    <div className="text-sm font-medium text-gray-500 text-right">
                      الإجراء
                    </div>
                    <div className="text-sm font-medium text-gray-500 text-right">
                      التاريخ
                    </div>
                    <div className="text-sm font-medium text-gray-500 text-right">
                      الوقت
                    </div>
                    {/* <div className="text-sm font-medium text-gray-500 text-right">المدفوع</div> */}
                    <div className="text-sm font-medium text-gray-500 text-right">
                      الإجمالي
                    </div>
                    <div className="text-sm font-medium text-gray-500 text-right">
                      إجراءات
                    </div>
                  </div>

                  {/* صفوف الجدول */}
                  <div className="divide-y divide-gray-100">
                    {sortedSessions.map((session) => (
                      <div
                        key={session.id}
                        className="grid grid-cols-[100px_1.5fr_1fr_100px_100px_100px] px-4 py-3 items-center hover:bg-gray-50/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedSession(session)}
                      >
                        {/* حالة الجلسة */}
                        <div className="flex items-center gap-2">
                          {session.status === "scheduled" ? (
                            <>
                              <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                              <span className="text-sm text-yellow-700 truncate">
                                مجدول
                              </span>
                            </>
                          ) : session.status === "completed" ? (
                            <>
                              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                              <span className="text-sm text-green-700 truncate">
                                مكتملة
                              </span>
                            </>
                          ) : session.status === "in-progress" ? (
                            <>
                              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                              <span className="text-sm text-blue-700 truncate">
                                قيد التنفيذ
                              </span>
                            </>
                          ) : session.status === "cancelled" ? (
                            <>
                              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                              <span className="text-sm text-red-700 truncate">
                                ملغية
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 truncate">
                                لم يحضر
                              </span>
                            </>
                          )}
                        </div>

                        {/* الإجراء مع truncate وtitle لإظهار النص الكامل عند التحويم */}
                        <div
                          className="text-sm text-gray-900 font-medium truncate"
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

                        <div className="text-sm text-gray-600 truncate">
                          {formatDate(session.startTime)}
                        </div>

                        <div className="text-sm text-gray-600 truncate">
                          {formatTime(session.startTime)}
                        </div>

                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {formatCurrency(session.sessionCost)}
                        </div>

                        {/* عمود الإجراءات */}
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditSession(session);
                            }}
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
                            title="تعديل الجلسة"
                          >
                            <Edit size={16} className="text-gray-600" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRequestDeleteSession(session.id);
                            }}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors flex-shrink-0"
                            title="حذف الجلسة"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                <History size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">لا توجد جلسات</p>
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

function EditSessionModal({
  session,
  primaryColor,
  onClose,
  onSave,
  onDelete,
  addToast,
}: EditSessionModalProps) {
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
    startTime: new Date(session.startTime).toISOString().slice(0, 16),
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={isLoading ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
                تكلفة الجلسة (ل.س)
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={formData.sessionCost || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setFormData({
                    ...formData,
                    sessionCost: value === "" ? 0 : Number(value),
                  });
                }}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent invalid:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
                placeholder="0"
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
              <button
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
              </button>

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
        onClick={isLoading ? undefined : onClose}
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
    addAppointment: true,
    appointmentMode: "days" as "days" | "date",
    appointment: {
      days: "1",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      procedure: "كشف أولي",
      cost: "200",
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

    if (!formData.phone.trim()) {
      const errorMsg = "الرجاء إدخال رقم الجوال";
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
      !formData.age ||
      parseInt(formData.age) < 5 ||
      parseInt(formData.age) > 100
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
        phone: formData.phone,
        email: formData.email || undefined,
        gender: formData.gender,
        age: parseInt(formData.age) || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
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
          cost: parseInt(formData.appointment.cost) || 0,
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
        onClick={isLoading ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6" style={{ background: primaryColor }}>
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

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              <h3 className="font-bold text-gray-900 text-lg">
                المعلومات الأساسية
              </h3>

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
                    رقم الجوال <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      const phoneValue = e.target.value.replace(/[^\d+]/g, "");
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
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العمر <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
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
                      التكلفة
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formData.appointment.cost}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
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
  const [internalLoading, setInternalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLoading = externalLoading || internalLoading;

  const [formData, setFormData] = useState({
    appointmentMode: "days" as "days" | "date",
    days: "1",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    procedure: "",
    cost: 0,
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

    if (!formData.cost || formData.cost <= 0) {
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={isLoading ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6" style={{ background: primaryColor }}>
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent invalid:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
                placeholder="مثال: تنظيف أسنان، حشوة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التكلفة
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={formData.cost || ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setFormData({
                    ...formData,
                    cost: value === "" ? 0 : Number(value),
                  });
                }}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:border-transparent invalid:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ "--tw-ring-color": primaryColor } as any}
                placeholder="100"
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
