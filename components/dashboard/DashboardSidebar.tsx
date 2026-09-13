// components/dashboard/DashboardSidebar.tsx
"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Menu,
  X,
  TableProperties,
  CalendarDays,
  Stethoscope,
} from "lucide-react";
// ✅ استيراد أيقونات react-icons
import { 
  FaHome, 
  FaUsers, 
  FaCalendarAlt, 
  FaTooth, 
  FaCog 
} from "react-icons/fa";
import { Clinic } from "@/types";

// ✅ التبويبات الظاهرة في القائمة الجانبية (للشاشات الكبيرة)
const visibleMenuItems = [
  { tab: "main", label: "الرئيسية", icon: FaHome },
  { tab: "patients", label: "المرضى", icon: FaUsers },
  { tab: "schedule", label: "مخطط اليوم", icon: FaCalendarAlt },
  { tab: "treatments", label: "العلاجات", icon: FaTooth },
  { tab: "settings", label: "الإعدادات", icon: FaCog },
];

// ✅ التبويبات المخفية (تظهر في الإعدادات فقط)
const hiddenMenuItems = [
  { tab: "clinic", label: "معلومات العيادة", icon: Building2 },
  { tab: "cv", label: "CV الطبيب", icon: UserCircle },
];

// ✅ القائمة السفلية للهاتف - بالترتيب المطلوب من اليمين لليسار
// جدول المرضى - مخطط اليوم - الرئيسية - العلاجات - الإعدادات
const bottomNavItems = [
  { tab: "patients", label: "المرضى", icon: FaUsers },
  { tab: "schedule", label: "مخطط اليوم", icon: FaCalendarAlt },
  { tab: "main", label: "الرئيسية", icon: FaHome, featured: true },
  { tab: "treatments", label: "العلاجات", icon: FaTooth },
  { tab: "settings", label: "الإعدادات", icon: FaCog },
];

interface DashboardSidebarProps {
  clinicData: Clinic | null;
}

// مكون Skeleton للتحميل
const SidebarSkeleton = ({
  isCollapsed,
  isMobile,
}: {
  isCollapsed: boolean;
  isMobile: boolean;
}) => {
  return (
    <motion.div
      initial={false}
      animate={{
        width: isMobile ? "100%" : isCollapsed ? 90 : 300,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`
        h-screen bg-white shadow-2xl flex flex-col relative border-l-4 border-gray-200
        ${isMobile ? "fixed top-0 right-0 z-40 w-full max-w-[300px]" : ""}
      `}
    >
      <div className="p-6 border-b border-gray-100">
        {!isCollapsed || isMobile ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="relative w-11 h-11 rounded-xl bg-gray-200 animate-pulse" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`
              flex items-center gap-3 px-4 py-3.5 rounded-xl
              ${isCollapsed && !isMobile ? "justify-center" : ""}
            `}
          >
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
            )}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 space-y-1">
        {[1, 2].map((i) => (
          <div
            key={i}
            className={`
              flex items-center gap-3 px-4 py-3 w-full rounded-xl
              ${isCollapsed && !isMobile ? "justify-center" : ""}
            `}
          >
            <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export function DashboardSidebar({ clinicData }: DashboardSidebarProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clinicId = params?.clinicId as string;
  const currentTab = searchParams.get("tab") || "main";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [autoCollapse, setAutoCollapse] = useState(true);

  // ✅ الحالة المتفائلة لتغيير التبويب فور النقر
  const [optimisticTab, setOptimisticTab] = useState<string | null>(null);

  // ✅ التبويب النشط للـ UI (المتفائل إذا كان موجوداً، وإلا الحقيقي)
  const activeTabForUI = optimisticTab ?? currentTab;

  useEffect(() => {
    const savedSettings = localStorage.getItem("dashboard_settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAutoCollapse(settings.autoCollapse ?? true);
      } catch (error) {
        console.error("خطأ في قراءة الإعدادات:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setAutoCollapse(event.detail.autoCollapse);
    };

    window.addEventListener(
      "settingsChanged",
      handleSettingsChange as EventListener,
    );
    return () => {
      window.removeEventListener(
        "settingsChanged",
        handleSettingsChange as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ✅ مزامنة الحالة المتفائلة مع الحالة الحقيقية بعد اكتمال التنقل
  useEffect(() => {
    setOptimisticTab(currentTab);
  }, [currentTab]);

  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    } else if (autoCollapse) {
      if (!isCollapsed) {
        setIsCollapsed(true);
      }
    }
  }, [currentTab, autoCollapse, isMobile]);

  // ✅ دالة تنقل موحدة مع تحديث فوري للواجهة
  const navigateToTab = (tab: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    // تحديث الحالة المتفائلة فوراً
    setOptimisticTab(tab);
    // التنقل الفعلي
    router.push(`/dashboard/${clinicId}?tab=${tab}`);
  };

  if (!mounted) return null;

  if (!clinicData) {
    if (isMobile && !isMobileOpen) {
      return (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-2 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all border border-gray-200 md:hidden"
        >
          <Menu size={16} className="text-gray-400" />
        </motion.button>
      );
    }

    const skeletonContent = (
      <SidebarSkeleton isCollapsed={isCollapsed} isMobile={isMobile} />
    );

    if (isMobile && isMobileOpen) {
      return (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
          {skeletonContent}
        </>
      );
    }

    return skeletonContent;
  }

  const primaryColor = clinicData.settings.primaryColor;
  const secondaryColor = clinicData.settings.secondaryColor;

 const MobileBottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
    <div
      className="relative rounded-t-3xl border-t border-gray-200/60"
      style={{
        background: `linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.98) 100%)`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* الشريط العلوي الملون */}
      <div className="absolute inset-0 rounded-t-3xl overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${primaryColor}60 20%, ${primaryColor} 50%, ${primaryColor}60 80%, transparent 100%)`,
          }}
        />
      </div>

      <div className="flex items-center justify-around px-2 py-2" dir="rtl">
        {bottomNavItems.map((item) => {
          const isActive = activeTabForUI === item.tab;
          const Icon = item.icon;

          return (
            <a
              key={item.tab}
              href={`/dashboard/${clinicId}?tab=${item.tab}`}
              onClick={(e) => navigateToTab(item.tab, e)}
              className="flex-1 flex justify-center"
            >
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="relative flex flex-col items-center justify-center py-1 px-2 min-w-[56px]"
              >
                {/* ✅ خلفية ناعمة للعنصر النشط */}
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveBg"
                    className="absolute inset-0 rounded-2xl"
                    style={{ backgroundColor: `${primaryColor}12` }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* الأيقونة */}
                <Icon
                  size={22}
                  className="relative z-10"
                  style={{
                    color: isActive ? primaryColor : "#94a3b8",
                  }}
                />

                {/* النص */}
                <span
                  className="relative z-10 text-[10px] font-medium mt-0.5"
                  style={{
                    color: isActive ? primaryColor : "#94a3b8",
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </a>
          );
        })}
      </div>

      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </div>
  </nav>
);

  // عرض القائمة الجانبية للشاشات الكبيرة
  const sidebarContent = (
    <motion.div
      initial={false}
      animate={{
        width: isMobile ? "100%" : isCollapsed ? 90 : 300,
        x: isMobile && !isMobileOpen ? "-100%" : 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`
        h-screen bg-white shadow-2xl flex flex-col relative border-l-4
        ${isMobile ? "fixed top-0 right-0 z-40 w-full max-w-[300px]" : ""}
      `}
      style={{ borderLeftColor: primaryColor }}
    >
      <button
        onClick={() => {
          if (isMobile) {
            setIsMobileOpen(false);
          } else {
            setIsCollapsed(!isCollapsed);
          }
        }}
        className="absolute -left-4 top-8 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all z-50 border border-gray-200"
        style={{ color: primaryColor }}
      >
        <motion.div
          animate={{ rotate: isMobile ? 0 : isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isMobile ? (
            <X size={18} />
          ) : isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </motion.div>
      </button>

      <div className="p-6 border-b border-gray-100">
        <AnimatePresence mode="wait">
          {!isCollapsed || isMobile ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-white"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {clinicData.logo?.startsWith("/") ||
                  clinicData.logo?.startsWith("http") ? (
                    <div className="relative w-full h-full p-1.5">
                      <Image
                        src={clinicData.logo}
                        alt={clinicData.name}
                        fill
                        className="object-contain"
                        sizes="48px"
                        priority
                      />
                    </div>
                  ) : (
                    <span className="text-3xl">{clinicData.logo || "🦷"}</span>
                  )}
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {clinicData.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {clinicData.doctorProfile.fullName}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              <motion.div
                className="relative w-11 h-11 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-white"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {clinicData.logo?.startsWith("/") ||
                clinicData.logo?.startsWith("http") ? (
                  <div className="relative w-full h-full p-1.5">
                    <Image
                      src={clinicData.logo}
                      alt={clinicData.name}
                      fill
                      className="object-contain"
                      sizes="44px"
                      priority
                    />
                  </div>
                ) : (
                  <span className="text-2xl">{clinicData.logo || "🦷"}</span>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const isActive = activeTabForUI === item.tab;
          const Icon = item.icon;

          return (
            <a
              key={item.tab}
              href={`/dashboard/${clinicId}?tab=${item.tab}`}
              onClick={(e) => navigateToTab(item.tab, e)}
              style={{ textDecoration: "none" }}
            >
              <motion.div
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium
                  transition-all duration-200 relative
                  ${isCollapsed && !isMobile ? "justify-center" : ""}
                `}
                style={{
                  color: isActive ? primaryColor : "#64748b",
                  backgroundColor: isActive ? "#ffffff" : "transparent",
                  boxShadow: isActive ? `0 4px 12px ${primaryColor}20` : "none",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBackground"
                    className="absolute inset-0 rounded-xl -z-0"
                    style={{ backgroundColor: `${primaryColor}10` }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                <Icon size={isCollapsed && !isMobile ? 22 : 20} />

                <AnimatePresence mode="wait">
                  {(!isCollapsed || isMobile) && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </a>
          );
        })}
      </nav>
    </motion.div>
  );

  // ✨ الريندر النهائي
  return (
    <>
      {/* الشاشات الكبيرة: القائمة الجانبية */}
      {!isMobile && sidebarContent}

      {/* الهاتف: شريط سفلي + القائمة الجانبية عند الفتح */}
      {isMobile && (
        <>
          <MobileBottomNav />
          {isMobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 z-30 md:hidden"
                onClick={() => setIsMobileOpen(false)}
              />
              {sidebarContent}
            </>
          )}
        </>
      )}
    </>
  );
}