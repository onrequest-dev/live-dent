// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  LogOut,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  MoreVertical,
  Sparkles,
  AlertCircle,
  Activity,
  AlertTriangle,
} from "lucide-react";

// ============================================================
// الأنواع
// ============================================================

interface Stats {
  clinics: {
    total: number;
    active: number;
    trial: number;
    expired: number;
  };
  totals: {
    patients: number;
    sessions: number;
  };
  recent: {
    last30Days: number;
    thisMonth: number;
  };
  growthChart: { date: string; count: number }[];
}

interface Clinic {
  id: string;
  name: string;
  logo?: string;
  address?: string;
  subscriptionStatus: "active" | "expired" | "trial";
  currency?: string;
  createdAt: string;
  patientsCount: number;
  sessionsCount: number;
  DoctorProfile?: {
    fullName: string;
    specialization: string;
    contactEmail: string;
  } | null;
}

type SubscriptionStatus = "active" | "trial" | "expired";

// ============================================================
// إعدادات الحالات
// ============================================================

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  {
    label: string;
    description: string;
    icon: any;
    bg: string;
    color: string;
    border: string;
    solidBg: string;
    hoverBg: string;
  }
> = {
  active: {
    label: "نشط",
    description: "الاشتراك فعّال والطبيب يمكنه استخدام النظام",
    icon: CheckCircle2,
    bg: "bg-emerald-500/10",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    solidBg: "bg-emerald-500",
    hoverBg: "hover:bg-emerald-500/10",
  },
  trial: {
    label: "تجريبي",
    description: "فترة تجريبية مجانية — الطبيب يمكنه الاستخدام لفترة محدودة",
    icon: Clock,
    bg: "bg-blue-500/10",
    color: "text-blue-400",
    border: "border-blue-500/30",
    solidBg: "bg-blue-500",
    hoverBg: "hover:bg-blue-500/10",
  },
  expired: {
    label: "منتهي",
    description: "الاشتراك منتهي — سيتم إيقاف الطبيب عند محاولة الدخول",
    icon: XCircle,
    bg: "bg-red-500/10",
    color: "text-red-400",
    border: "border-red-500/30",
    solidBg: "bg-red-500",
    hoverBg: "hover:bg-red-500/10",
  },
};

// ============================================================
// المكون الرئيسي
// ============================================================

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | SubscriptionStatus
  >("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ✅ حالة الـ Confirmation Modal
  const [confirmChange, setConfirmChange] = useState<{
    clinic: Clinic;
    newStatus: SubscriptionStatus;
  } | null>(null);
  // ✅ كشف حجم الشاشة
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);
  // ============================================================
  // جلب البيانات
  // ============================================================

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, clinicsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/clinics"),
      ]);

      if (statsRes.status === 401 || clinicsRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      const statsData = await statsRes.json();
      const clinicsData = await clinicsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (clinicsData.success) setClinics(clinicsData.data);
    } catch (error) {
      console.error("Fetch error:", error);
      showToast("error", "فشل جلب البيانات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============================================================
  // Toast
  // ============================================================

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  // ============================================================
  // إغلاق القوائم عند النقر خارجها
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-dropdown]")) return;
      setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================
  // تغيير حالة الاشتراك
  // ============================================================

  const changeStatus = async (
    clinicId: string,
    newStatus: SubscriptionStatus
  ) => {
    setUpdatingId(clinicId);
    setOpenDropdown(null);
    setConfirmChange(null);

    try {
      const res = await fetch(`/api/admin/clinics/${clinicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionStatus: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        setClinics((prev) =>
          prev.map((c) =>
            c.id === clinicId ? { ...c, subscriptionStatus: newStatus } : c
          )
        );
        showToast("success", `تم التغيير إلى "${STATUS_CONFIG[newStatus].label}"`);
        fetchData(true);
      } else {
        showToast("error", data.error || "فشل التحديث");
      }
    } catch {
      showToast("error", "حدث خطأ في الاتصال");
    } finally {
      setUpdatingId(null);
    }
  };

  // ============================================================
  // تسجيل الخروج
  // ============================================================

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  // ============================================================
  // تصفية العيادات
  // ============================================================

  const filteredClinics = clinics.filter((clinic) => {
    const matchesSearch =
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.DoctorProfile?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || clinic.subscriptionStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // ============================================================
  // تنسيق التاريخ
  // ============================================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ============================================================
  // Rendering
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full mx-auto mb-4"
          />
          <p className="text-white/60 text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* ============ Header ============ */}
      <header className="sticky top-0 z-40 bg-[#0F1F35]/95 backdrop-blur-xl border-b border-teal-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <span className="text-sm sm:text-base font-bold">LD</span>
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold">
                  لوحة التحكم
                </h1>
                <p className="text-[10px] sm:text-xs text-white/50 hidden sm:block">
                  LiveDent Admin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs sm:text-sm font-medium transition-all"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============ Content ============ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="إجمالي العيادات"
                value={stats.clinics.total}
                icon={Building2}
                gradient="from-teal-500/20 to-cyan-500/10"
                borderColor="border-teal-500/30"
                iconColor="text-teal-400"
              />
              <StatCard
                label="نشطة"
                value={stats.clinics.active}
                icon={CheckCircle2}
                gradient="from-emerald-500/20 to-teal-500/10"
                borderColor="border-emerald-500/30"
                iconColor="text-emerald-400"
              />
              <StatCard
                label="تجريبية"
                value={stats.clinics.trial}
                icon={Clock}
                gradient="from-blue-500/20 to-cyan-500/10"
                borderColor="border-blue-500/30"
                iconColor="text-blue-400"
              />
              <StatCard
                label="منتهية"
                value={stats.clinics.expired}
                icon={XCircle}
                gradient="from-red-500/20 to-rose-500/10"
                borderColor="border-red-500/30"
                iconColor="text-red-400"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="إجمالي المرضى"
                value={stats.totals.patients.toLocaleString()}
                icon={Users}
                gradient="from-purple-500/20 to-fuchsia-500/10"
                borderColor="border-purple-500/30"
                iconColor="text-purple-400"
              />
              <StatCard
                label="إجمالي الجلسات"
                value={stats.totals.sessions.toLocaleString()}
                icon={Calendar}
                gradient="from-amber-500/20 to-orange-500/10"
                borderColor="border-amber-500/30"
                iconColor="text-amber-400"
              />
              <StatCard
                label="آخر 30 يوم"
                value={`+${stats.recent.last30Days}`}
                subtitle="عيادة جديدة"
                icon={TrendingUp}
                gradient="from-cyan-500/20 to-blue-500/10"
                borderColor="border-cyan-500/30"
                iconColor="text-cyan-400"
              />
              <StatCard
                label="هذا الشهر"
                value={`+${stats.recent.thisMonth}`}
                subtitle="عيادة جديدة"
                icon={Activity}
                gradient="from-pink-500/20 to-rose-500/10"
                borderColor="border-pink-500/30"
                iconColor="text-pink-400"
              />
            </div>

            <GrowthChart data={stats.growthChart} />
          </>
        )}

        {/* ============ Clinics List ============ */}
        <div className="bg-[#0F1F35] rounded-2xl border border-teal-500/10">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-teal-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-teal-400" />
                <h2 className="text-base sm:text-lg font-bold">
                  قائمة العيادات
                </h2>
                <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                  {filteredClinics.length}
                </span>
              </div>
              <button
                onClick={() => router.push("/admin/create-clinic")}
                className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-[#0A1628] font-bold text-xs sm:text-sm transition-all hover:shadow-lg hover:shadow-teal-500/30"
              >
                <Plus size={14} />
                عيادة جديدة
              </button>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  placeholder="ابحث عن عيادة أو طبيب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-[#1A2A44] border border-teal-500/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-teal-500/30 transition-all"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {(["all", "active", "trial", "expired"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      filterStatus === s
                        ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                        : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"
                    }`}
                  >
                    {s === "all"
                      ? "الكل"
                      : STATUS_CONFIG[s as SubscriptionStatus].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-teal-500/5">
            {filteredClinics.length === 0 ? (
              <div className="text-center py-12">
                <Building2 size={32} className="mx-auto text-white/20 mb-3" />
                <p className="text-sm text-white/50">لا توجد عيادات</p>
              </div>
            ) : (
              filteredClinics.map((clinic, index) => {
                const statusInfo =
                  STATUS_CONFIG[clinic.subscriptionStatus];
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={clinic.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    className="p-4 hover:bg-white/[0.02] transition-colors relative"
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo */}
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                        {clinic.logo &&
                        clinic.logo !== "/logos/placeholder" ? (
                          <img
                            src={clinic.logo}
                            alt={clinic.name}
                            className="w-full h-full object-contain rounded-xl p-1"
                          />
                        ) : (
                          <Building2 size={20} className="text-teal-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-sm sm:text-base truncate">
                              {clinic.name}
                            </h3>
                            {clinic.DoctorProfile?.fullName && (
                              <p className="text-xs text-white/60 truncate mt-0.5">
                                {clinic.DoctorProfile.fullName}
                                {clinic.DoctorProfile.specialization &&
                                  ` · ${clinic.DoctorProfile.specialization}`}
                              </p>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium ${statusInfo.bg} ${statusInfo.color} border ${statusInfo.border} flex-shrink-0`}
                          >
                            <StatusIcon size={11} />
                            {statusInfo.label}
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] sm:text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <Users size={10} />
                            {clinic.patientsCount} مريض
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={10} />
                            {clinic.sessionsCount} جلسة
                          </span>
                          <span className="hidden sm:flex items-center gap-1">
                            <Clock size={10} />
                            {formatDate(clinic.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions Dropdown */}
                      {/* Actions - زر بسيط فقط */}
<div className="relative flex-shrink-0">
  <button
  data-dropdown
  onMouseDown={(e) => e.stopPropagation()}
  onClick={(e) => {
    e.stopPropagation();
    setOpenDropdown(
      openDropdown === clinic.id ? null : clinic.id
    );
  }}
  disabled={updatingId === clinic.id}
  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
>
    {updatingId === clinic.id ? (
      <RefreshCw size={14} className="animate-spin text-teal-400" />
    ) : (
      <MoreVertical size={14} className="text-white/60" />
    )}
  </button>
</div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
                  {/* ============ Status Picker (Mobile: BottomSheet / Desktop: Dropdown) ============ */}
      <StatusPicker
        clinicId={openDropdown}
        clinics={clinics}
        isMobile={isMobile}
        onSelect={(clinic, status) => {
          if (clinic.subscriptionStatus === status) return;
          setConfirmChange({ clinic, newStatus: status });
          setOpenDropdown(null);
        }}
        onClose={() => setOpenDropdown(null)}
      />

      {/* ============ Toast ============ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F1F35] border border-teal-500/20 shadow-2xl"
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="text-red-400" />
            )}
            <span className="text-sm">{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
        
      {/* ============ Confirmation Modal ============ */}
      <ConfirmChangeModal
        open={!!confirmChange}
        clinic={confirmChange?.clinic || null}
        newStatus={confirmChange?.newStatus || null}
        onConfirm={() => {
          if (confirmChange) {
            changeStatus(confirmChange.clinic.id, confirmChange.newStatus);
          }
        }}
        onClose={() => setConfirmChange(null)}
      />
    </div>
  );
}

// ============================================================
// ConfirmChangeModal
// ============================================================

function ConfirmChangeModal({
  open,
  clinic,
  newStatus,
  onConfirm,
  onClose,
}: {
  open: boolean;
  clinic: Clinic | null;
  newStatus: SubscriptionStatus | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!clinic || !newStatus) return null;

  const cfg = STATUS_CONFIG[newStatus];
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-[#0F1F35] rounded-2xl border border-teal-500/20 shadow-2xl overflow-hidden"
          >
            {/* Header accent */}
            <div className={`h-1 w-full ${cfg.solidBg}`} />

            <div className="p-6">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 12,
                  stiffness: 200,
                  delay: 0.1,
                }}
                className={`w-14 h-14 mx-auto rounded-full ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center mb-4`}
              >
                <Icon size={26} className={cfg.color} />
              </motion.div>

              {/* Title */}
              <h3 className="text-center text-lg font-bold text-white mb-2">
                تأكيد تغيير الحالة
              </h3>

              {/* Message */}
              <p className="text-center text-sm text-white/60 leading-relaxed mb-5">
                هل أنت متأكد من تغيير حالة اشتراك
                <br />
                <span className="font-bold text-white/90">
                  {clinic.name}
                </span>
                <br />
                إلى{" "}
                <span className={`font-bold ${cfg.color}`}>
                  {cfg.label}
                </span>
                ؟
              </p>

              {/* Description */}
              <div
                className={`px-3.5 py-3 rounded-xl ${cfg.bg} border ${cfg.border} mb-5`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={14}
                    className={`${cfg.color} flex-shrink-0 mt-0.5`}
                  />
                  <p className={`text-xs ${cfg.color} leading-relaxed`}>
                    {cfg.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-medium text-sm transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all ${cfg.solidBg} hover:opacity-90 shadow-lg`}
                >
                  تأكيد التغيير
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
// ============================================================
// StatusPicker — Bottom Sheet على الهاتف، Dropdown على Desktop
// ============================================================

function StatusPicker({
  clinicId,
  clinics,
  isMobile,
  onSelect,
  onClose,
}: {
  clinicId: string | null;
  clinics: Clinic[];
  isMobile: boolean;
  onSelect: (clinic: Clinic, status: SubscriptionStatus) => void;
  onClose: () => void;
}) {
  const clinic = clinics.find((c) => c.id === clinicId);

  useEffect(() => {
    if (clinicId) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [clinicId]);

  // ✅ على Desktop: قائمة منسدلة عائمة وسط الشاشة
  if (!clinic) return null;

  return (
    <AnimatePresence>
      {clinicId && (
        <>
          {/* Backdrop */}
<motion.div
  data-dropdown
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
  className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm"
  onMouseDown={(e) => e.stopPropagation()}
  onClick={onClose}
/>

          {/* على الهاتف: Bottom Sheet */}
          {isMobile ? (
<motion.div
  data-dropdown
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 30, stiffness: 300 }}
  onMouseDown={(e) => e.stopPropagation()}
  onClick={(e) => e.stopPropagation()}
  className="fixed bottom-0 left-0 right-0 z-[150] bg-[#0F1F35] rounded-t-3xl border-t border-teal-500/20 shadow-2xl overflow-hidden max-h-[85vh]"
>
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-5 py-4 border-b border-teal-500/10">
                <h3 className="text-base font-bold text-white">
                  تغيير حالة الاشتراك
                </h3>
                <p className="text-xs text-white/50 mt-1 truncate">
                  {clinic.name}
                </p>
              </div>

              {/* Options */}
              <div className="p-3 space-y-2 max-h-[55vh] overflow-y-auto">
                {(["active", "trial", "expired"] as const).map(
                  (status) => {
                    const cfg = STATUS_CONFIG[status];
                    const Icon = cfg.icon;
                    const isCurrent =
                      clinic.subscriptionStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => onSelect(clinic, status)}
                        disabled={isCurrent}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-right ${
                          isCurrent
                            ? `${cfg.bg} ${cfg.border} cursor-not-allowed`
                            : `bg-white/5 border-transparent hover:bg-white/10 active:scale-[0.98]`
                        }`}
                      >
                        <div
                          className={`w-11 h-11 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon size={20} className={cfg.color} />
                        </div>
                        <div className="flex-1 text-right min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-white">
                              {cfg.label}
                            </p>
                            {isCurrent && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                              >
                                الحالية
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                            {cfg.description}
                          </p>
                        </div>
                        {isCurrent && (
                          <CheckCircle2
                            size={20}
                            className={`${cfg.color} flex-shrink-0`}
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Cancel */}
              <div className="p-4 border-t border-teal-500/10">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-medium text-sm transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          ) : (
            // ✅ على Desktop: قائمة منسدلة عائمة وسط الشاشة
// ✅ على Desktop: حاوية wrapper للتمركز
            <div
  data-dropdown
  className="fixed inset-0 z-[150] flex items-center justify-center p-4 pointer-events-none"
  onMouseDown={(e) => e.stopPropagation()}
>
  <motion.div
    data-dropdown
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 10 }}
    transition={{ type: "spring", damping: 25, stiffness: 300 }}
    onMouseDown={(e) => e.stopPropagation()}
    onClick={(e) => e.stopPropagation()}
    className="w-full max-w-md bg-[#0F1F35] rounded-2xl border border-teal-500/20 shadow-2xl overflow-hidden pointer-events-auto"
  >
              {/* Header */}
              <div className="px-5 py-4 border-b border-teal-500/10">
                <h3 className="text-base font-bold text-white">
                  تغيير حالة الاشتراك
                </h3>
                <p className="text-xs text-white/50 mt-1 truncate">
                  {clinic.name}
                </p>
              </div>

              {/* Options */}
              <div className="p-3 space-y-2">
                {(["active", "trial", "expired"] as const).map(
                  (status) => {
                    const cfg = STATUS_CONFIG[status];
                    const Icon = cfg.icon;
                    const isCurrent =
                      clinic.subscriptionStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => onSelect(clinic, status)}
                        disabled={isCurrent}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-right ${
                          isCurrent
                            ? `${cfg.bg} ${cfg.border} cursor-not-allowed`
                            : `bg-white/5 border-transparent ${cfg.hoverBg} active:scale-[0.98]`
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon size={18} className={cfg.color} />
                        </div>
                        <div className="flex-1 text-right min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-white">
                              {cfg.label}
                            </p>
                            {isCurrent && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}
                              >
                                الحالية
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">
                            {cfg.description}
                          </p>
                        </div>
                        {isCurrent && (
                          <CheckCircle2
                            size={18}
                            className={`${cfg.color} flex-shrink-0`}
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Cancel */}
              <div className="p-3 border-t border-teal-500/10">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 font-medium text-sm transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
// ============================================================
// StatCard
// ============================================================

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  gradient,
  borderColor,
  iconColor,
}: {
  label: string;
  value: number | string;
  subtitle?: string;
  icon: any;
  gradient: string;
  borderColor: string;
  iconColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl bg-[#0F1F35] border ${borderColor} p-3 sm:p-4`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <Icon size={16} className={iconColor} />
        </div>
        <p className="text-2xl sm:text-3xl font-bold leading-none">
          {value}
        </p>
        <p className="text-[10px] sm:text-xs text-white/60 mt-1.5">
          {label}
        </p>
        {subtitle && (
          <p className="text-[9px] text-white/40 mt-0.5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================
// GrowthChart
// ============================================================

function GrowthChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-[#0F1F35] rounded-2xl border border-teal-500/10 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-teal-400" />
        <h2 className="text-sm sm:text-base font-bold">
          نمو العيادات — آخر 30 يوم
        </h2>
      </div>

      <div className="flex items-end gap-0.5 sm:gap-1 h-24 sm:h-32">
        {data.map((item, i) => {
          const height = item.count > 0 ? (item.count / max) * 100 : 2;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              {item.count > 0 && (
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-teal-500 text-[#0A1628] text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                  +{item.count}
                </div>
              )}
              <div
                className={`w-full rounded-t transition-all ${
                  item.count > 0
                    ? "bg-gradient-to-t from-teal-500 to-cyan-400"
                    : "bg-white/5"
                }`}
                style={{ height: `${height}%`, minHeight: "2px" }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-2 text-[9px] text-white/40">
        <span>منذ 30 يوم</span>
        <span>اليوم</span>
      </div>
    </div>
  );
}