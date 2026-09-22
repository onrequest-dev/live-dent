// components/ToothChart/ToothInfoPanel.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Plus, CalendarPlus, Trash2, AlertTriangle, Clock, CalendarDays } from "lucide-react";
import { ToothData } from "./ToothChart";
import { createBulkSessions } from "@/client/helpers/session";
import { getToothDisplay } from "@/lib/toothNames";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// ============================================================
// الواجهات
// ============================================================

interface TreatmentTemplateSummary {
  id: string;
  name: string;
  color: string;
  totalCost: number;
  appointments: {
    id: string;
    name: string;
    daysFromPrevious: number;
    cost: number;
    time: string;
    notes?: string;
  }[];
}

interface ToothInfoPanelProps {
  tooth: ToothData;
  onUpdate: (updatedTooth: ToothData) => void;
  primaryColor: string;
  editable: boolean;
  isMobile: boolean;
  patientId?: string;
  clinicId?: string;
  patientName?: string;
  patientPhone?: string;
  patientGender?: string;
  clinicName?: string;
  clinicData?: any; // ✅ إضافة
  existingSessions?: any[]; // ✅ إضافة
  onTemplatesApplied?: () => void;
  onSessionsChanged?: () => void;
}
// ============================================================
// دوال ذكية - النسخة المصححة
// ============================================================

interface WorkingHour {
  day: number;
  start: string;
  end: string;
  isClosed: boolean;
}

// ✅ تطبيع ساعات العمل - نسخة محسنة
const normalizeWorkingHours = (workingHours: any): WorkingHour[] => {

  
  if (!workingHours) {

    return [];
  }
  
  // ✅ إذا كانت مصفوفة
  if (Array.isArray(workingHours)) {

    return workingHours
      .filter((wh: any) => wh && typeof wh === 'object')
      .map((wh: any) => ({
        day: wh.day !== undefined ? wh.day : 0,
        start: wh.start || '09:00',
        end: wh.end || '17:00',
        isClosed: wh.isClosed || false,
      }));
  }
  
  // ✅ إذا كانت كائن
  if (typeof workingHours === 'object') {
    const result: WorkingHour[] = [];
    
    // محاولة قراءة المفاتيح الرقمية (0-6)
    for (let i = 0; i <= 6; i++) {
      const dayData = workingHours[String(i)] || workingHours[i];
      if (dayData && typeof dayData === 'object') {
        result.push({
          day: i,
          start: dayData.start || '09:00',
          end: dayData.end || '17:00',
          isClosed: dayData.isClosed || false,
        });
      }
    }
    
    if (result.length > 0) {

      return result;
    }
    
    // محاولة قراءة أسماء الأيام
    const dayNames: { [key: string]: number } = {
      'saturday': 0, 'sunday': 1, 'monday': 2, 'tuesday': 3,
      'wednesday': 4, 'thursday': 5, 'friday': 6,
    };
    
    for (const [dayName, dayIndex] of Object.entries(dayNames)) {
      const dayData = workingHours[dayName];
      if (dayData && typeof dayData === 'object') {
        result.push({
          day: dayIndex,
          start: dayData.start || '09:00',
          end: dayData.end || '17:00',
          isClosed: dayData.isClosed || false,
        });
      }
    }
    
    if (result.length > 0) {

      return result;
    }
  }
  

  
  // ✅ ساعات عمل افتراضية (9-5) إذا فشل كل شيء
  return [
    { day: 0, start: '09:00', end: '17:00', isClosed: false },
    { day: 1, start: '09:00', end: '17:00', isClosed: false },
    { day: 2, start: '09:00', end: '17:00', isClosed: false },
    { day: 3, start: '09:00', end: '17:00', isClosed: false },
    { day: 4, start: '09:00', end: '17:00', isClosed: false },
    { day: 5, start: '09:00', end: '17:00', isClosed: false },
    { day: 6, start: '09:00', end: '17:00', isClosed: true }, // الجمعة عطلة افتراضية
  ];
};

// ✅ تحويل يوم JS إلى نظامنا
const convertJsDayToOurDay = (jsDay: number): number => {
  // JS: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  // نظامنا: 0=Saturday, 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday
  const map: { [key: number]: number } = {
    0: 1, // Sunday -> 1
    1: 2, // Monday -> 2
    2: 3, // Tuesday -> 3
    3: 4, // Wednesday -> 4
    4: 5, // Thursday -> 5
    5: 6, // Friday -> 6
    6: 0, // Saturday -> 0
  };
  return map[jsDay];
};

// ✅ التحقق إذا كان اليوم عطلة
const isDayClosed = (date: Date, workingHours: WorkingHour[]): boolean => {
  if (!workingHours || workingHours.length === 0) return false;
  
  const ourDay = convertJsDayToOurDay(date.getDay());
  const wh = workingHours.find((h) => h.day === ourDay);
  
  
  return !wh || wh.isClosed;
};

// ✅ الحصول على أول وقت متاح في يوم معين
const getFirstAvailableTime = (
  date: Date,
  workingHours: WorkingHour[],
  bookedSessions: { startTime: Date; endTime: Date }[],
  appointmentDuration: number = 30,
): Date | null => {
  const ourDay = convertJsDayToOurDay(date.getDay());
  const wh = workingHours.find((h) => h.day === ourDay);
  
  if (!wh || wh.isClosed) {
    return null;
  }

  const [startHour, startMinute] = wh.start.split(":").map(Number);
  const [endHour, endMinute] = wh.end.split(":").map(Number);
  const workStart = new Date(date);
  workStart.setHours(startHour, startMinute, 0, 0);

  const workEnd = new Date(date);
  workEnd.setHours(endHour, endMinute, 0, 0);

  const now = new Date();
  let currentSlot = new Date(workStart);
  
  // ✅ إذا كان اليوم هو اليوم الحالي - ابدأ من الساعة الحالية
  if (date.toDateString() === now.toDateString()) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const roundedMinutes = Math.ceil(currentMinutes / appointmentDuration) * appointmentDuration;
    const roundedDate = new Date(date);
    roundedDate.setHours(Math.floor(roundedMinutes / 60), roundedMinutes % 60, 0, 0);
    if (roundedDate > workStart) {
      currentSlot = new Date(roundedDate);
    }
  }

  // ✅ البحث عن أول وقت متاح
  while (currentSlot < workEnd) {
    const slotEnd = new Date(currentSlot.getTime() + appointmentDuration * 60000);
    
    if (slotEnd > workEnd) break;

    let isAvailable = true;
    for (const booked of bookedSessions) {
      if (
        (currentSlot >= booked.startTime && currentSlot < booked.endTime) ||
        (slotEnd > booked.startTime && slotEnd <= booked.endTime) ||
        (currentSlot <= booked.startTime && slotEnd >= booked.endTime)
      ) {
        isAvailable = false;
        break;
      }
    }

    if (isAvailable) {
      return currentSlot;
    }

    currentSlot = new Date(currentSlot.getTime() + appointmentDuration * 60000);
  }

  return null;
};

// ✅ البحث عن أول يوم متاح
const getNextAvailableDate = (
  startDate: Date,
  workingHours: WorkingHour[],
  bookedSessions: { startTime: Date; endTime: Date }[],
  appointmentDuration: number = 30,
): { date: Date; time: Date } | null => {
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);


  for (let i = 0; i < 365; i++) {
    
    if (!isDayClosed(currentDate, workingHours)) {
      const availableTime = getFirstAvailableTime(
        currentDate,
        workingHours,
        bookedSessions,
        appointmentDuration,
      );
      
      if (availableTime) {
        return { date: new Date(currentDate), time: availableTime };
      }
    }
    
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }
  
  return null;
};

export function ToothInfoPanel({
  tooth,
  onUpdate,
  primaryColor,
  editable,
  isMobile,
  patientId,
  clinicId,
  patientName,
  patientPhone,
  patientGender,
  clinicName,
  clinicData,
  existingSessions = [],
  onTemplatesApplied,
  onSessionsChanged,
}: ToothInfoPanelProps) {
  const [localTreatments, setLocalTreatments] = useState<string[]>([]);
  const [assignedTemplate, setAssignedTemplate] = useState<TreatmentTemplateSummary | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<TreatmentTemplateSummary[]>([]);
  const [showTemplateList, setShowTemplateList] = useState(false);
  const [showConfirmApply, setShowConfirmApply] = useState<TreatmentTemplateSummary | null>(null);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [displayPreference, setDisplayPreference] = useState<"number" | "name" | "both">("number");
  // ✅ جديد - للتنقل بين التبويبات
const router = useRouter();
const pathname = usePathname();
const searchParams = useSearchParams();
useEffect(() => {
  const saved = localStorage.getItem('tooth_display_preference');
  if (saved === 'number' || saved === 'name' || saved === 'both') {
    setDisplayPreference(saved);
  }
  
  const handleChange = (e: Event) => {
    const customEvent = e as CustomEvent;
    setDisplayPreference(customEvent.detail);
  };
  
  window.addEventListener('toothDisplayPreferenceChanged', handleChange);
  return () => window.removeEventListener('toothDisplayPreferenceChanged', handleChange);
}, []);
  // ✅ مفتاح التخزين الخاص بالمريض
  const getStorageKey = () => {
    return patientId ? `tooth_template_assignments_${patientId}` : null;
  };

  // ✅ قراءة القالب المعين لهذا السن (لهذا المريض)
  const loadAssignedTemplate = () => {
    const storageKey = getStorageKey();
    if (!storageKey) {
      setAssignedTemplate(null);
      return;
    }

    const savedAssignments = localStorage.getItem(storageKey);
    const savedTemplates = localStorage.getItem("treatment_templates");
    
    if (savedAssignments && savedTemplates) {
      try {
        const assignments = JSON.parse(savedAssignments);
        const templates = JSON.parse(savedTemplates);
        
        const toothAssignment = assignments.find(
          (a: any) => a.toothNumber === tooth.id
        );
        
        if (toothAssignment) {
          const template = templates.find((t: any) => t.id === toothAssignment.templateId);
          setAssignedTemplate(template || null);
        } else {
          setAssignedTemplate(null);
        }
      } catch (e) {
        console.error("خطأ في قراءة التعيينات:", e);
        setAssignedTemplate(null);
      }
    } else {
      setAssignedTemplate(null);
    }
  };

  // ✅ قراءة القوالب المتاحة
  const loadAvailableTemplates = () => {
    const savedTemplates = localStorage.getItem("treatment_templates");
    if (savedTemplates) {
      try {
        const templates = JSON.parse(savedTemplates);
        if (Array.isArray(templates)) {
          setAvailableTemplates(templates);
        }
      } catch (e) {
        console.error("خطأ في قراءة القوالب:", e);
      }
    }
  };


  // ✅ حساب المواعيد المتوقعة للعرض في المودال
const calculateExpectedAppointments = (): { 
  appointment: any; 
  date: Date; 
  time: string; 
  dayName: string;
  dateStr: string;
}[] => {
  if (!showConfirmApply) return [];

  const workingHours = normalizeWorkingHours(clinicData?.settings?.workingHours);
  const appointmentDuration = clinicData?.settings?.defaultAppointmentDuration || 30;

  // ✅ تحميل المواعيد المحجوزة
  const bookedSessions: { startTime: Date; endTime: Date }[] = [];
  
  if (existingSessions && existingSessions.length > 0) {
    for (const session of existingSessions) {
      if (session.status === "scheduled") {
        bookedSessions.push({
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime || new Date(new Date(session.startTime).getTime() + appointmentDuration * 60000)),
        });
      }
    }
  }

  const expectedAppointments: any[] = [];
  let currentDate = new Date();

  for (const appointment of showConfirmApply.appointments) {
    currentDate = new Date(currentDate.getTime() + appointment.daysFromPrevious * 24 * 60 * 60 * 1000);

    const availableSlot = getNextAvailableDate(
      currentDate,
      workingHours,
      bookedSessions,
      appointmentDuration,
    );

    if (availableSlot) {
      const startTime = availableSlot.time;
      const endTime = new Date(startTime.getTime() + appointmentDuration * 60000);
      
      // ✅ إضافة للمحجوزات
      bookedSessions.push({ startTime, endTime });

      const dayName = startTime.toLocaleDateString("ar-SA", { weekday: "long" });
      const dayNumber = String(startTime.getDate()).padStart(2, "0");
      const monthNumber = String(startTime.getMonth() + 1).padStart(2, "0");
      const yearNumber = startTime.getFullYear();
      const dateStr = `${dayNumber}/${monthNumber}/${yearNumber}`;

      const hours = startTime.getHours();
      const minutes = startTime.getMinutes();
      const period = hours >= 12 ? "م" : "ص";
      const displayHours = hours % 12 || 12;
      const timeStr = `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;

      expectedAppointments.push({
        appointment,
        date: startTime,
        dayName,
        dateStr,
        time: timeStr,
      });
    } else {
      expectedAppointments.push({
        appointment,
        date: null,
        dayName: "غير متاح",
        dateStr: "لا يوجد وقت متاح",
        time: "-",
      });
    }
  }

  return expectedAppointments;
};
// ✅ تحويل "HH:MM" إلى "HH:MM ص/م"
const formatTimeFromString = (time: string): string => {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time;
  const period = hours >= 12 ? "م" : "ص";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};
  useEffect(() => {
    setLocalTreatments(tooth.treatments.filter(t => t.trim()));
    loadAssignedTemplate();
    loadAvailableTemplates();
  }, [tooth.id, patientId]);

  useEffect(() => {
    const handleChange = () => {
      loadAssignedTemplate();
      loadAvailableTemplates();
    };
    window.addEventListener("toothAssignmentsChanged", handleChange);
    window.addEventListener("treatmentTemplatesChanged", handleChange);
    return () => {
      window.removeEventListener("toothAssignmentsChanged", handleChange);
      window.removeEventListener("treatmentTemplatesChanged", handleChange);
    };
  }, [tooth.id, patientId]);

  useEffect(() => {
    if (applyMessage) {
      const timer = setTimeout(() => setApplyMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [applyMessage]);

  const saveTreatmentsToParent = (newTreatments: string[]) => {
    const padded = [...newTreatments];
    while (padded.length < 10) padded.push("");
    onUpdate({ ...tooth, treatments: padded });
  };

  // ✅ تطبيق القالب - تحديث فوري بدون إعادة تحميل
  // ✅ تطبيق القالب - مع الذكاء
// ✅ تطبيق القالب - إنشاء كل المواعيد بطلب واحد
const handleConfirmApply = async () => {
  if (!showConfirmApply || !patientId || !clinicId) return;
  
  sessionStorage.setItem("refresh_tooth_chart", "true");
  sessionStorage.setItem("lastPatientId", patientId);
  sessionStorage.setItem("lastActiveTab", "chart");
  sessionStorage.setItem("lastSelectedToothId", tooth.id.toString());
  
  setIsApplying(true);
  setApplyMessage(null);

  try {
    const workingHours = normalizeWorkingHours(clinicData?.settings?.workingHours);
    const appointmentDuration = clinicData?.settings?.defaultAppointmentDuration || 30;

    console.log('📋 ساعات العمل:', workingHours);
    console.log('⏱️ مدة الموعد:', appointmentDuration);

    // ✅ تحميل المواعيد المحجوزة
    const bookedSessions: { startTime: Date; endTime: Date }[] = [];
    
    if (existingSessions && existingSessions.length > 0) {
      for (const session of existingSessions) {
        if (session.status === "scheduled") {
          bookedSessions.push({
            startTime: new Date(session.startTime),
            endTime: new Date(session.endTime || new Date(new Date(session.startTime).getTime() + appointmentDuration * 60000)),
          });
        }
      }
    }

    console.log('📅 المواعيد المحجوزة:', bookedSessions.length);

    // ✅ تجهيز مصفوفة الجلسات للإرسال
    const sessionsToCreate: any[] = [];
    let currentDate = new Date();

    for (const appointment of showConfirmApply.appointments) {
      currentDate = new Date(currentDate.getTime() + appointment.daysFromPrevious * 24 * 60 * 60 * 1000);
      
      console.log(`🔍 البحث عن موعد: ${appointment.name} - ابتداء من ${currentDate.toLocaleDateString('ar-SA')}`);

      const availableSlot = getNextAvailableDate(
        currentDate,
        workingHours,
        bookedSessions,
        appointmentDuration,
      );

      if (!availableSlot) {
        throw new Error(`لا توجد أوقات متاحة للموعد: ${appointment.name}`);
      }

      const startTime = availableSlot.time;
      const endTime = new Date(startTime.getTime() + appointmentDuration * 60000);

      console.log(`✅ تم العثور على موعد: ${startTime.toLocaleString('ar-SA')}`);

      // ✅ إضافة للمحجوزات
      bookedSessions.push({ startTime, endTime });

      const combinedProcedureName = `${getToothDisplay(tooth.id, displayPreference)} - ${appointment.name}`;

      // ✅ تجهيز الجلسة للإرسال
      sessionsToCreate.push({
        patientId,
        startTime,
        endTime,
        status: "scheduled",
        plannedProcedure: combinedProcedureName,
        sessionCost: appointment.cost,
        isPaid: false,
        notes: `${getToothDisplay(tooth.id, displayPreference)} - ${showConfirmApply.name}${appointment.notes ? ' - ' + appointment.notes : ''}`,
        info: {
          clinicName: clinicName || "",
          patientName: patientName || "",
          phoneNumber: patientPhone || "",
          gender: patientGender || "",
          prevent_auto_messages: false,
        },
      });

      // ✅ تحديث currentDate
      currentDate = new Date(startTime);
    }

    // ✅ إنشاء كل المواعيد بطلب واحد
    const result = await createBulkSessions(sessionsToCreate);
    
    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error(result.error || 'فشل إنشاء المواعيد');
    }

    console.log(`✅ تم إنشاء ${result.data.length} مواعيد بطلب واحد`);

    // ✅ حفظ التعيين
    const storageKey = `tooth_template_assignments_${patientId}`;
    const savedAssignments = localStorage.getItem(storageKey);
    const assignments = savedAssignments ? JSON.parse(savedAssignments) : [];
    
    const filtered = assignments.filter((a: any) => a.toothNumber !== tooth.id);
    filtered.push({
      toothNumber: tooth.id,
      templateId: showConfirmApply.id,
      assignedAt: new Date().toISOString(),
    });
    
    localStorage.setItem(storageKey, JSON.stringify(filtered));

    // ✅ تحديث السن فوراً
    const updatedTooth: ToothData = {
      ...tooth,
      color: showConfirmApply.color,
      procedure: "custom",
      customProcedure: showConfirmApply.name,
    };
    
    onUpdate(updatedTooth);
    setAssignedTemplate(showConfirmApply);
    setShowConfirmApply(null);
    setShowTemplateList(false);
    
    setApplyMessage({ 
      type: 'success', 
      text: `تم تطبيق "${showConfirmApply.name}" وإنشاء ${result.data.length} مواعيد` 
    });
    
    if (onSessionsChanged) {
      onSessionsChanged();
    }
    
    if (onTemplatesApplied) {
      onTemplatesApplied();
    }
    
    window.dispatchEvent(new CustomEvent("toothAssignmentsChanged"));
    
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    
  } catch (error: any) {
    console.error('❌ خطأ:', error);
    setApplyMessage({ 
      type: 'error', 
      text: error?.message || 'فشل تطبيق القالب' 
    });
    setShowConfirmApply(null);
  } finally {
    setIsApplying(false);
  }
};

  // ✅ إزالة القالب مع تأكيد
  const handleConfirmRemove = () => {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    const savedAssignments = localStorage.getItem(storageKey);
    const assignments = savedAssignments ? JSON.parse(savedAssignments) : [];
    const updated = assignments.filter((a: any) => a.toothNumber !== tooth.id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    
    setAssignedTemplate(null);
    setShowConfirmRemove(false);
    window.dispatchEvent(new CustomEvent("toothAssignmentsChanged"));
    
    setApplyMessage({ 
      type: 'success', 
      text: 'تم إزالة القالب. المواعيد السابقة ستبقى موجودة.' 
    });
  };

  const hasTreatments = localTreatments.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">
            {getToothDisplay(tooth.id, displayPreference)}
          </span>
          {assignedTemplate && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ backgroundColor: `${assignedTemplate.color}15` }}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: assignedTemplate.color }} />
              <span className="text-xs font-medium" style={{ color: assignedTemplate.color }}>
                {assignedTemplate.name}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* رسالة */}
        <AnimatePresence>
          {applyMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
                applyMessage.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {applyMessage.type === 'success' ? <Check size={16} /> : <X size={16} />}
              {applyMessage.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* قالب معين أو زر اختيار */}
        {assignedTemplate ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              القالب العلاجي المعين
            </p>
            <div
              className="p-4 rounded-xl border"
              style={{
                borderColor: `${assignedTemplate.color}40`,
                backgroundColor: `${assignedTemplate.color}08`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: assignedTemplate.color }} />
                  <span className="font-bold text-gray-800">{assignedTemplate.name}</span>
                </div>
                <button
                  onClick={() => setShowConfirmRemove(true)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="إزالة القالب"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
              
              <div className="space-y-2">
                {assignedTemplate.appointments.map((appt, index) => (
                  <div key={appt.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: assignedTemplate.color }}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium">{appt.name}</span>
                    <span className="text-gray-400">•</span>
                    <span>بعد {appt.daysFromPrevious} يوم</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          editable && patientId && clinicId && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                تطبيق قالب علاجي
              </p>
              
              {!showTemplateList ? (
                <button
                  onClick={() => setShowTemplateList(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-600 transition-colors"
                >
                  <CalendarPlus size={18} />
                  <span>اختيار قالب من القوالب العلاجية</span>
                </button>
              ) : (
                <div className="space-y-2">
                  {availableTemplates.length === 0 ? (
  <div className="py-3 space-y-3">
    <p className="text-sm text-gray-400">
      راجع القوالب العلاجية وتأكد أنها ملائمة لأسعارك ومواعيدك
    </p>

    <motion.button
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", "treatments");
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
      style={{
        backgroundColor: `${primaryColor}10`,
        border: `1.5px solid ${primaryColor}30`,
        color: primaryColor,
      }}
    >
      <span>الذهاب إلى العلاجات</span>
    </motion.button>
  </div>
                  ) : (
                    availableTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setShowConfirmApply(template)}
                        className="w-full p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-right"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: template.color }} />
                            <span className="font-medium text-gray-800 text-sm">{template.name}</span>
                          </div>
                          <span className="text-xs text-gray-500">{template.appointments.length} مواعيد</span>
                        </div>
                      </button>
                    ))
                  )}
                  
                  <button
                    onClick={() => setShowTemplateList(false)}
                    className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {/* فاصل */}
        <div className="h-px bg-gray-100" />

        {/* الأعمال المنفذة */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              الأعمال المنفذة
            </p>
          </div>

          <div className="space-y-2">
            {localTreatments.map((treatment, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-300 w-5 text-center">{index + 1}</span>
                <input
                  type="search"
                  value={treatment}
                  onChange={(e) => {
                    const newTreatments = [...localTreatments];
                    newTreatments[index] = e.target.value;
                    setLocalTreatments(newTreatments);
                    saveTreatmentsToParent(newTreatments);
                  }}
                  disabled={!editable}
                  placeholder={`عمل ${index + 1}...`}
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 disabled:opacity-50 transition-all"
                />
                {editable && (
                  <button
                    onClick={() => {
                      const newTreatments = localTreatments.filter((_, i) => i !== index);
                      setLocalTreatments(newTreatments);
                      saveTreatmentsToParent(newTreatments);
                    }}
                    className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-gray-400"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}
            
            {!hasTreatments && (
              <p className="text-sm text-gray-300 py-4 text-center">لا توجد أعمال مسجلة</p>
            )}
            
            {editable && localTreatments.length < 10 && (
              <button
                onClick={() => {
                  const newTreatments = [...localTreatments, ""];
                  setLocalTreatments(newTreatments);
                  saveTreatmentsToParent(newTreatments);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-gray-300"
              >
                <Plus size={16} />
                <span>إضافة عمل</span>
              </button>
            )}
          </div>
        </div>

        {/* فاصل */}
        <div className="h-px bg-gray-100" />

        {/* الملاحظات */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ملاحظات</p>
          <textarea
            value={tooth.notes}
            onChange={(e) => onUpdate({ ...tooth, notes: e.target.value })}
            disabled={!editable}
            rows={2}
            placeholder="ملاحظات عن هذا السن..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 resize-none disabled:opacity-50 transition-all"
          />
        </div>
      </div>

      {/* ✅ مودال تأكيد التطبيق */}
<AnimatePresence>
  {showConfirmApply && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
      onClick={() => !isApplying && setShowConfirmApply(null)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">تأكيد تطبيق القالب</h3>
        <p className="text-gray-600 mb-4">
          سيتم تطبيق قالب{" "}
          <span className="font-bold" style={{ color: showConfirmApply.color }}>
            {showConfirmApply.name}
          </span>{" "}
          على {getToothDisplay(tooth.id, displayPreference)} وإنشاء{" "}
          {showConfirmApply.appointments.length} مواعيد.
        </p>

        {/* ✅ قائمة المواعيد مع التاريخ والوقت المحسوبين */}
        <div className="space-y-3 mb-6">
          {calculateExpectedAppointments().map((item, index) => (
            <div
              key={item.appointment.id}
              className="p-3 rounded-xl border"
              style={{
                borderColor: item.date ? `${showConfirmApply.color}30` : "#FCA5A5",
                backgroundColor: item.date ? `${showConfirmApply.color}05` : "#FEF2F2",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: item.date ? showConfirmApply.color : "#EF4444" }}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-800 text-sm">
                    {item.appointment.name}
                  </span>
                </div>
                {item.appointment.cost > 0 && (
                  <span className="text-xs font-bold text-gray-700">
                    {item.appointment.cost}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2 text-xs">
                <CalendarDays size={12} className={item.date ? "text-gray-400" : "text-red-400"} />
                <span className={item.date ? "text-gray-600" : "text-red-500 font-medium"}>
                  {item.dayName} {item.dateStr}
                </span>
                <span className="text-gray-300">•</span>
                <Clock size={12} className={item.date ? "text-gray-400" : "text-red-400"} />
                <span className={item.date ? "text-gray-600 font-medium" : "text-red-500 font-medium"}>
                  {item.time}
                </span>
              </div>

              {item.appointment.notes && (
                <p className="text-xs text-gray-400 mt-1">{item.appointment.notes}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleConfirmApply}
            disabled={isApplying}
            className="flex-1 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
            style={{ backgroundColor: showConfirmApply.color }}
          >
            {isApplying ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري التطبيق...
              </>
            ) : (
              <>
                <Check size={18} />
                تأكيد التطبيق
              </>
            )}
          </button>
          <button
            onClick={() => setShowConfirmApply(null)}
            disabled={isApplying}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
          >
            إلغاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* ✅ مودال تأكيد الإزالة */}
      <AnimatePresence>
        {showConfirmRemove && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
            onClick={() => setShowConfirmRemove(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">إزالة القالب</h3>
              </div>
              
              <p className="text-gray-600 mb-4">
                سيتم إزالة القالب من هذا السن. <br />
                <span className="font-medium">المواعيد التي تم إنشاؤها سابقاً ستبقى موجودة.</span> <br />
                يمكنك تعيين قالب آخر مكانه.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmRemove}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium"
                >
                  إزالة القالب
                </button>
                <button
                  onClick={() => setShowConfirmRemove(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}