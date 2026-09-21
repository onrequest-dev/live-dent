// components/dashboard/tabs/ScheduleTab.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Clock, Coffee, Activity, X, CheckCircle2, Phone,
  Users, Stethoscope, DollarSign, User, Check, AlertCircle,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { updateSession } from "@/client/helpers/session";
import getCurrency from '@/client/helpers/getCurrency';

interface ScheduleTabProps {
  clinicData: any;
  patients?: any[];
  sessions?: any[];
  patientCases?: any[];
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const format12Hour = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

export function ScheduleTab({ clinicData, patients = [], sessions = [], patientCases = [] }: ScheduleTabProps) {
  const primaryColor = clinicData?.settings?.primaryColor || "#528ff7";
  const router = useRouter();
  const params = useParams();
  const clinicId = params?.clinicId as string;

  const [now, setNow] = useState(new Date());
  const [dateOffset, setDateOffset] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [localSessions, setLocalSessions] = useState(sessions);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLocalSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    if (updateMessage) {
      const t = setTimeout(() => setUpdateMessage(null), 2500);
      return () => clearTimeout(t);
    }
  }, [updateMessage]);

  // ✅ تحديث حالة الجلسة
  const handleToggleStatus = useCallback(async (sessionId: string, currentStatus: string) => {
    setUpdatingId(sessionId);
    const newStatus = currentStatus === 'completed' ? 'scheduled' : 'completed';
    
    // ✅ تحديث متفائل
    setLocalSessions(prev => prev.map((s: any) => s.id === sessionId ? { ...s, status: newStatus } : s));
    setSelectedAppointment((prev: any) => prev?.id === sessionId ? { ...prev, status: newStatus } : prev);
    
    try {
      const result = await updateSession(sessionId, { status: newStatus });
      if (!result.success) throw new Error(result.error);
      setUpdateMessage({ type: 'success', text: newStatus === 'completed' ? 'تم إكمال الموعد' : 'تم إعادة الجدولة' });
    } catch (error: any) {
      // ✅ تراجع
      setLocalSessions(prev => prev.map((s: any) => s.id === sessionId ? { ...s, status: currentStatus } : s));
      setSelectedAppointment((prev: any) => prev?.id === sessionId ? { ...prev, status: currentStatus } : prev);
      setUpdateMessage({ type: 'error', text: 'فشل التحديث' });
    } finally {
      setUpdatingId(null);
    }
  }, []);

  // ✅ تحديث حالة الدفع
  const handleTogglePayment = useCallback(async (sessionId: string, currentIsPaid: boolean) => {
    setUpdatingId(sessionId);
    const newIsPaid = !currentIsPaid;
    
    setLocalSessions(prev => prev.map((s: any) => s.id === sessionId ? { ...s, isPaid: newIsPaid } : s));
    setSelectedAppointment((prev: any) => prev?.id === sessionId ? { ...prev, isPaid: newIsPaid } : prev);
    
    try {
      const result = await updateSession(sessionId, { isPaid: newIsPaid, paidAt: newIsPaid ? new Date() : undefined });
      if (!result.success) throw new Error(result.error);
      setUpdateMessage({ type: 'success', text: newIsPaid ? 'تم تحديد كمدفوع' : 'تم تحديد كغير مدفوع' });
    } catch (error: any) {
      setLocalSessions(prev => prev.map((s: any) => s.id === sessionId ? { ...s, isPaid: currentIsPaid } : s));
      setSelectedAppointment((prev: any) => prev?.id === sessionId ? { ...prev, isPaid: currentIsPaid } : prev);
      setUpdateMessage({ type: 'error', text: 'فشل التحديث' });
    } finally {
      setUpdatingId(null);
    }
  }, []);

  const allAppointments = useMemo(() => {
    return localSessions.map((session: any) => {
      const patient = patients.find((p: any) => p.id === session.patientId);
      const startTime = new Date(session.startTime);
      const endTime = new Date(session.endTime || new Date(session.startTime).getTime() + 30 * 60000);
      
      return {
        id: session.id,
        patientId: session.patientId,
        patient_name: patient?.fullName || "غير معروف",
        patient_phone: patient?.phone || "",
        patient_gender: patient?.gender || "",
        appointment_date: startTime.toISOString().split('T')[0],
        appointment_time: `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`,
        end_time: `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`,
        notes: session.plannedProcedure || "",
        status: session.status,
        sessionCost: session.sessionCost || 0,
        isPaid: session.isPaid || false,
      };
    });
  }, [localSessions, patients]);

  const workingHours = useMemo(() => {
    const wh = clinicData?.settings?.workingHours;
    if (!wh) return [];
    if (Array.isArray(wh)) {
      return wh.map((h: any) => ({
        day_of_week: h.day, start_time: h.start || '09:00', end_time: h.end || '17:00',
        break_start: h.breakStart || null, break_end: h.breakEnd || null,
        slot_duration: h.slotDuration || 30, is_working: !h.isClosed,
      }));
    }
    if (typeof wh === 'object') {
      const arr: any[] = [];
      const dayNames = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      dayNames.forEach((dayName, index) => {
        const dayData = wh[dayName] || wh[String(index)] || wh[index];
        if (dayData && typeof dayData === 'object') {
          arr.push({
            day_of_week: index, start_time: dayData.start || '09:00', end_time: dayData.end || '17:00',
            break_start: dayData.breakStart || null, break_end: dayData.breakEnd || null,
            slot_duration: dayData.slotDuration || 30, is_working: !dayData.isClosed,
          });
        }
      });
      return arr;
    }
    return [];
  }, [clinicData]);

  const selectedDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + dateOffset);
    return date;
  }, [dateOffset]);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  // ✅ تحويل يوم JavaScript إلى نظام قاعدة البيانات
// JS: 0=الأحد, 1=الاثنين, ..., 6=السبت
// DB: 0=السبت, 1=الأحد, 2=الاثنين, ..., 6=الجمعة
const convertJsDayToDbDay = (jsDay: number): number => {
  const map: { [key: number]: number } = {
    0: 1, // الأحد
    1: 2, // الاثنين
    2: 3, // الثلاثاء
    3: 4, // الأربعاء
    4: 5, // الخميس
    5: 6, // الجمعة
    6: 0, // السبت
  };
  return map[jsDay];
};

const selectedDayOfWeek = convertJsDayToDbDay(selectedDate.getDay());

  const selectedAppointments = useMemo(() => {
    return allAppointments
      .filter(app => app.appointment_date === selectedDateStr)
      .sort((a, b) => timeToMinutes(a.appointment_time) - timeToMinutes(b.appointment_time));
  }, [allAppointments, selectedDateStr]);

  const selectedWorkingHours = workingHours.find(wh => wh.day_of_week === selectedDayOfWeek);

  const totalWorkingMinutes = selectedWorkingHours?.is_working
    ? timeToMinutes(selectedWorkingHours.end_time) - timeToMinutes(selectedWorkingHours.start_time) -
      (selectedWorkingHours.break_start && selectedWorkingHours.break_end
        ? timeToMinutes(selectedWorkingHours.break_end) - timeToMinutes(selectedWorkingHours.break_start) : 0)
    : 0;

  const bookedMinutes = selectedAppointments.length * (selectedWorkingHours?.slot_duration || 30);
  const freeMinutes = Math.max(0, totalWorkingMinutes - bookedMinutes);
  const occupancyRate = totalWorkingMinutes > 0 ? Math.round((bookedMinutes / totalWorkingMinutes) * 100) : 0;

  const revenue = selectedAppointments.filter(a => a.isPaid).reduce((s, a) => s + a.sessionCost, 0);
  const pendingRevenue = selectedAppointments.filter(a => !a.isPaid).reduce((s, a) => s + a.sessionCost, 0);

  return (
    <div className="space-y-4 pb-24" dir="rtl">
      {/* ✅ رسالة التحديث */}
      <AnimatePresence>
        {updateMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`p-3 rounded-xl text-sm flex items-center gap-2 ${
              updateMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
            {updateMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {updateMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ شريط الأيام */}
      <div className="p-1.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((offset) => {
            const date = new Date();
            date.setDate(date.getDate() + offset);
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = offset === dateOffset;
            const dayWh = workingHours.find(wh => wh.day_of_week === convertJsDayToDbDay(date.getDay()));
            const dayApps = allAppointments.filter(a => a.appointment_date === dateStr);

            return (
              <button key={offset} onClick={() => { setDateOffset(offset); setSelectedAppointment(null); }}
                className={`relative px-2 py-3 rounded-xl text-center transition-all ${
                  isSelected ? 'text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                style={isSelected ? { backgroundColor: primaryColor, boxShadow: `0 4px 15px ${primaryColor}30` } : undefined}>
                <p className="text-sm font-bold">{offset === 0 ? 'اليوم' : offset === 1 ? 'غداً' : 'بعد غد'}</p>
                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                  {date.getDate()}/{date.getMonth() + 1}
                </p>
                {!dayWh?.is_working ? (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>عطلة</span>
                ) : dayApps.length > 0 ? (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>{dayApps.length} مواعيد</span>
                ) : (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${isSelected ? 'bg-white/20 text-white/80' : 'bg-green-50 text-green-600'}`}>متاح</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

{/* ✅ إحصائيات */}
<div className="grid grid-cols-4 gap-2">
  {/* نسبة الإشغال */}
  <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 -rotate-90">
        <circle cx="24" cy="24" r="20" fill="none" stroke="#F1F5F9" strokeWidth="4" />
        <motion.circle
          cx="24" cy="24" r="20" fill="none"
          stroke={primaryColor} strokeWidth="4" strokeLinecap="round"
          initial={{ strokeDasharray: "0 125" }}
          animate={{ strokeDasharray: `${occupancyRate * 1.25} 125` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-800">
        {occupancyRate}%
      </span>
    </div>
    <p className="text-[9px] text-gray-400 mt-1">الإشغال</p>
  </div>

  {/* عدد المواعيد */}
  <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
    <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
      <Users size={16} style={{ color: primaryColor }} />
    </div>
    <p className="text-base font-bold text-gray-900 mt-1">{selectedAppointments.length}</p>
    <p className="text-[9px] text-gray-400">مواعيد</p>
  </div>

  {/* الإيراد المدفوع */}
  <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
    <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
      <DollarSign size={16} className="text-emerald-600" />
    </div>
    <p className="text-base font-bold text-emerald-600 mt-1">{revenue}{getCurrency()}</p>
    <p className="text-[9px] text-gray-400">مدفوع</p>
  </div>

  {/* الوقت المتاح */}
  <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
    <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
      <Clock size={16} className="text-amber-600" />
    </div>
    <p className="text-sm font-bold text-gray-700 mt-1">
      {freeMinutes > 0 ? `${Math.floor(freeMinutes / 60)}س` : '-'}
    </p>
    <p className="text-[9px] text-gray-400">متاح</p>
  </div>
</div>

      {/* ✅ عطلة */}
      {!selectedWorkingHours?.is_working ? (
        <div className="text-center py-16 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <Coffee size={48} className="mx-auto text-amber-400 mb-3" />
          <h2 className="text-xl font-bold text-gray-800">يوم عطلة</h2>
          <p className="text-sm text-gray-500 mt-1">استمتع بيوم راحتك</p>
        </div>
      ) : (
        <>
          {/* ✅ المخطط */}
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Activity size={15} style={{ color: primaryColor }} />
                المخطط الزمني
              </h2>
              <span className="text-[10px] text-gray-500">
                {format12Hour(selectedWorkingHours.start_time)} - {format12Hour(selectedWorkingHours.end_time)}
              </span>
            </div>
            <TimelineChart
              workingHours={selectedWorkingHours}
              appointments={selectedAppointments}
              isToday={dateOffset === 0}
              primaryColor={primaryColor}
              onAppointmentClick={setSelectedAppointment}
              selectedAppointmentId={selectedAppointment?.id}
            />
          </div>

          {/* ✅ تفاصيل الموعد */}
          <AnimatePresence>
            {selectedAppointment && (
              <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }} className="overflow-hidden">
                <AppointmentDetails
                  appointment={selectedAppointment}
                  primaryColor={primaryColor}
                  onClose={() => setSelectedAppointment(null)}
                  onOpenPatient={() => router.push(`/dashboard/${clinicId}?tab=main&patient=${selectedAppointment.patientId}`)}
                  onToggleStatus={() => handleToggleStatus(selectedAppointment.id, selectedAppointment.status)}
                  onTogglePayment={() => handleTogglePayment(selectedAppointment.id, selectedAppointment.isPaid)}
                  isUpdating={updatingId === selectedAppointment.id}
                />
              </motion.div>
            )}
          </AnimatePresence>
<div className="p-3 sm:p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
  <h2 className="text-xs sm:text-sm font-bold text-gray-800 mb-2.5 sm:mb-3">
    المواعيد ({selectedAppointments.length})
  </h2>

  {selectedAppointments.length === 0 ? (
    <div className="text-center py-10">
      <CalendarDays size={32} className="mx-auto text-gray-200 mb-2" />
      <p className="text-sm text-gray-400">لا توجد مواعيد</p>
    </div>
  ) : (
    <div className="space-y-1.5 sm:space-y-2">
      {selectedAppointments.map((app, index) => (
        <motion.div
          key={app.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          onClick={() => setSelectedAppointment(selectedAppointment?.id === app.id ? null : app)}
          className={`p-2.5 sm:p-3.5 rounded-xl cursor-pointer transition-all ${
            selectedAppointment?.id === app.id
              ? 'bg-blue-50'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-4">
            {/* ✅ الوقت */}
            <div className="text-center min-w-[46px] sm:min-w-[65px] shrink-0">
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                {format12Hour(app.appointment_time)}
              </p>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-0.5">
                {format12Hour(app.end_time)}
              </p>
            </div>

            {/* ✅ خط فاصل */}
            <div className="w-px h-8 sm:h-10 bg-gray-200 shrink-0" />

            {/* ✅ معلومات المريض */}
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                {app.patient_name}
              </p>
              {app.notes && (
                <p className="text-[9px] sm:text-[11px] text-gray-400 truncate mt-0.5">
                  {app.notes}
                </p>
              )}
            </div>

            {/* ✅ أزرار نصية - عمودية على الهاتف، أفقية على الشاشات الكبيرة */}
            <div className="flex flex-col sm:flex-row gap-0.5 sm:gap-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleStatus(app.id, app.status); }}
                disabled={updatingId === app.id}
                className={`px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  app.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {app.status === 'completed' ? '✓ مكتمل' : 'مجدول'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleTogglePayment(app.id, app.isPaid); }}
                disabled={updatingId === app.id}
                className={`px-1.5 sm:px-3 py-0.5 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  app.isPaid
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {app.isPaid ? `✓ ${app.sessionCost} ${getCurrency()}` : `${app.sessionCost} ${getCurrency()}`}
              </button>
            </div>

            {/* ✅ واتساب */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const message = `مرحباً ${app.patient_name}،\n\nتذكير بموعدك.\n${app.appointment_date}\n${format12Hour(app.appointment_time)}`;
                const cleanPhone = app.patient_phone.replace(/[^0-9]/g, '');
                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="p-1.5 sm:p-2.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
              title="إرسال تذكير واتساب"
            >
              <FaWhatsapp size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )}
</div>
        </>
      )}
    </div>
  );
}

// ============================================
// تفاصيل الموعد - مع أزرار تعديل
// ============================================
function AppointmentDetails({ appointment, primaryColor, onClose, onOpenPatient, onToggleStatus, onTogglePayment, isUpdating }: {
  appointment: any;
  primaryColor: string;
  onClose: () => void;
  onOpenPatient: () => void;
  onToggleStatus: () => void;
  onTogglePayment: () => void;
  isUpdating: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border-2 shadow-lg p-4" style={{ borderColor: `${primaryColor}30` }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">تفاصيل الموعد</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} className="text-gray-400" /></button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
            <User size={18} style={{ color: primaryColor }} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">{appointment.patient_name}</p>
            <p className="text-xs text-gray-500">{appointment.patient_phone}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock size={14} className="text-gray-400" />
          {format12Hour(appointment.appointment_time)} - {format12Hour(appointment.end_time)}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Stethoscope size={14} className="text-gray-400" />
          {appointment.notes || "كشف"}
        </div>

        {/* ✅ أزرار التعديل */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onToggleStatus} disabled={isUpdating}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              appointment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
            {appointment.status === 'completed' ? <Check size={14} /> : <Clock size={14} />}
            {appointment.status === 'completed' ? 'مكتمل' : 'مجدول'}
          </button>
          <button onClick={onTogglePayment} disabled={isUpdating}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              appointment.isPaid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
            <DollarSign size={14} />
            {appointment.isPaid ? 'مدفوع' : 'غير مدفوع'} - {appointment.sessionCost} {getCurrency()}
          </button>
        </div>
      </div>
    </div>
  );
}
function TimelineChart({ 
  workingHours, appointments, isToday, primaryColor, 
  onAppointmentClick, selectedAppointmentId 
}: {
  workingHours: any;
  appointments: any[];
  isToday: boolean;
  primaryColor: string;
  onAppointmentClick: (appointment: any) => void;
  selectedAppointmentId?: string;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  const startMinutes = timeToMinutes(workingHours.start_time);
  const endMinutes = timeToMinutes(workingHours.end_time);
  const totalMinutes = endMinutes - startMinutes;

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const isNowInRange = isToday && nowMinutes >= startMinutes && nowMinutes <= endMinutes;
  const nowPositionPercent = isNowInRange
    ? ((nowMinutes - startMinutes) / totalMinutes) * 100
    : 0;

  function formatSlotTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h >= 12 ? 'م' : 'ص';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }

  // ============================================================
  // ✅ حساب موضع وعرض كل موعد بشكل نسبي
  // ============================================================
  const appointmentsWithPosition = useMemo(() => {
    return appointments.map((app) => {
      const appStart = timeToMinutes(app.appointment_time);
      const appEnd = timeToMinutes(app.end_time);
      const duration = Math.max(appEnd - appStart, 5); // على الأقل 5 دقائق للعرض

      const leftPercent = ((appStart - startMinutes) / totalMinutes) * 100;
      const widthPercent = (duration / totalMinutes) * 100;

      return {
        ...app,
        leftPercent: Math.max(0, leftPercent),
        widthPercent: Math.min(100 - leftPercent, widthPercent),
      };
    });
  }, [appointments, startMinutes, totalMinutes]);

  // ============================================================
  // ✅ توليد خطوط الشبكة كل 30 دقيقة (اختياري - للتوضيح البصري)
  // ============================================================
  const gridLines = useMemo(() => {
    const lines: number[] = [];
    for (let m = startMinutes + 30; m < endMinutes; m += 30) {
      lines.push(((m - startMinutes) / totalMinutes) * 100);
    }
    return lines;
  }, [startMinutes, endMinutes, totalMinutes]);

  return (
    <div>
      {/* المسطرة الأفقية */}
      <div className="relative">
        <div
          className="relative h-14 rounded-xl overflow-hidden bg-gray-50"
          dir="ltr"
        >
          {/* خطوط الشبكة الخفيفة كل 30 دقيقة */}
          {gridLines.map((left, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-gray-200/60"
              style={{ left: `${left}%` }}
            />
          ))}

          {/* المواعيد كعرض نسبي */}
          {appointmentsWithPosition.map((app) => {
            const isSelected = selectedAppointmentId === app.id;
            const isCompleted = app.status === 'completed';

            return (
              <button
                key={app.id}
                onClick={() => onAppointmentClick(app)}
                className="absolute top-1 bottom-1 rounded-lg transition-all hover:opacity-80 flex items-center justify-center px-1 overflow-hidden"
                style={{
                  left: `${app.leftPercent}%`,
                  width: `${app.widthPercent}%`,
                  backgroundColor: isCompleted
                    ? '#A7F3D0'
                    : isSelected
                      ? primaryColor
                      : `${primaryColor}40`,
                  minWidth: '20px',
                }}
                title={`${app.patient_name} - ${app.appointment_time} (${app.widthPercent.toFixed(1)}%)`}
              >
                <span
                  className="text-[8px] font-bold truncate"
                  style={{
                    color: isSelected
                      ? 'white'
                      : isCompleted
                        ? '#065F46'
                        : '#374151',
                  }}
                >
                  {app.patient_name?.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* مؤشر الوقت الحالي */}
        {isNowInRange && (
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{ left: `${nowPositionPercent}%`, transform: 'translateX(-50%)' }}
          >
            <div className="relative w-[2px] h-full bg-red-500 shadow-lg">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* التسميات */}
      <div className="relative h-5 mt-1" dir="ltr">
        <span className="absolute left-0 text-[9px] font-bold text-gray-500">
          {formatSlotTime(startMinutes)}
        </span>
        <span className="absolute right-0 text-[9px] font-bold text-gray-500">
          {formatSlotTime(endMinutes)}
        </span>
        {isNowInRange && (
          <span
            className="absolute -translate-x-1/2 text-[9px] font-bold text-red-500 bg-white px-1 rounded"
            style={{ left: `${nowPositionPercent}%` }}
          >
            {formatSlotTime(nowMinutes)}
          </span>
        )}
      </div>

      {/* الإيضاح */}
      <div className="flex items-center gap-4 mt-1 flex-wrap">
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: `${primaryColor}40` }} />
          محجوز
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-emerald-200" />
          مكتمل
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-gray-100" />
          فارغ
        </span>
        {isToday && (
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="w-0.5 h-3 bg-red-500" />
            الآن
          </span>
        )}
      </div>
    </div>
  );
}