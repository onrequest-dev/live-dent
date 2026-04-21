// components/dashboard/DashboardSidebar.tsx
'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCircle,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { Clinic } from '@/types';

// ✅ 1. إضافة الإعدادات إلى القائمة مباشرة (بدون تكرار)
const menuItems = [
  { tab: 'main', label: 'الرئيسية', icon: LayoutDashboard },
  { tab: 'patients', label: 'جدول المرضى', icon: Users },
  { tab: 'clinic', label: 'معلومات العيادة', icon: Building2 },
  { tab: 'cv', label: 'CV الطبيب', icon: UserCircle },
  // { tab: 'messages', label: 'إعدادات المراسلة', icon: MessageSquareText },
  { tab: 'settings', label: 'الإعدادات', icon: Settings }, 
];

interface DashboardSidebarProps {
  clinicData: Clinic | null;
}

// مكون Skeleton للتحميل (لحالة عدم وجود بيانات)
const SidebarSkeleton = ({ isCollapsed, isMobile }: { isCollapsed: boolean; isMobile: boolean }) => {
  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isMobile ? '100%' : (isCollapsed ? 90 : 300),
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`
        h-screen bg-white shadow-2xl flex flex-col relative border-l-4 border-gray-200
        ${isMobile ? 'fixed top-0 right-0 z-40 w-full max-w-[300px]' : ''}
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
              ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
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
              ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
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
  const clinicId = params?.clinicId as string;
  const currentTab = searchParams.get('tab') || 'main';
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [autoCollapse, setAutoCollapse] = useState(true); // ✅ القيمة الافتراضية true

  // ✅ 2. تحميل الإعدادات من localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboard_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAutoCollapse(settings.autoCollapse ?? true);
      } catch (error) {
        console.error('خطأ في قراءة الإعدادات:', error);
      }
    }
  }, []);

  // ✅ 3. الاستماع لتغييرات الإعدادات
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      setAutoCollapse(event.detail.autoCollapse);
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

// ✅ تعديل useEffect للإغلاق التلقائي - إغلاق دائم في حالة الهاتف
useEffect(() => {
  // في حالة الهاتف: نغلق القائمة دائماً عند التنقل
  if (isMobile) {
    setIsMobileOpen(false);
  } 
  // في حالة سطح المكتب: نطبق إعدادات autoCollapse
  else if (autoCollapse) {
    if (!isCollapsed) {
      setIsCollapsed(true);
    }
  }
}, [currentTab, autoCollapse, isMobile]); // ✅ إضافة isMobile للتبعيات

  if (!mounted) return null;

  // ✅ عرض Skeleton إذا لم تصل البيانات بعد
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

    const skeletonContent = <SidebarSkeleton isCollapsed={isCollapsed} isMobile={isMobile} />;
    
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

  // حالة الهاتف: عرض زر الفتح فقط
  if (isMobile && !isMobileOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-2 left-4 z-50 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:shadow-xl transition-all border border-gray-200 md:hidden"
        style={{ color: primaryColor }}
      >
        <Menu size={16} />
      </motion.button>
    );
  }

  // عرض القائمة الجانبية
  const sidebarContent = (
    <motion.div
      initial={false}
      animate={{ 
        width: isMobile ? '100%' : (isCollapsed ? 90 : 300),
        x: isMobile && !isMobileOpen ? '-100%' : 0
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`
        h-screen bg-white shadow-2xl flex flex-col relative border-l-4
        ${isMobile ? 'fixed top-0 right-0 z-40 w-full max-w-[300px]' : ''}
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
          animate={{ rotate: isMobile ? 0 : (isCollapsed ? 180 : 0) }}
          transition={{ duration: 0.3 }}
        >
          {isMobile ? (
            <X size={18} />
          ) : (
            isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />
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
                  {clinicData.logo?.startsWith('/') || clinicData.logo?.startsWith('http') ? (
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
                    <span className="text-3xl">{clinicData.logo || '🦷'}</span>
                  )}
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{clinicData.name}</h2>
                  <p className="text-sm text-gray-500">{clinicData.doctorProfile.fullName}</p>
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
                {clinicData.logo?.startsWith('/') || clinicData.logo?.startsWith('http') ? (
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
                  <span className="text-2xl">{clinicData.logo || '🦷'}</span>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ 5. استخدام menuItems مباشرة (بدون updatedMenuItems) */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const href = `/dashboard/${clinicId}?tab=${item.tab}`;
          const isActive = currentTab === item.tab;
          const Icon = item.icon;

          return (
            <Link key={item.tab} href={href}>
              <motion.div
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium
                  transition-all duration-200 relative
                  ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
                `}
                style={{
                  color: isActive ? primaryColor : '#64748b',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  boxShadow: isActive ? `0 4px 12px ${primaryColor}20` : 'none',
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
                
                <Icon size={(isCollapsed && !isMobile) ? 22 : 20} />
                
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
            </Link>
          );
        })}
      </nav>

      {/* ✅ 6. حذف أزرار الإعدادات وتسجيل الخروج من الأسفل (لأن الإعدادات أصبحت في القائمة) */}
      <div className="p-3 border-t border-gray-100">
        <motion.button
          whileHover={{ x: -4 }}
          className={`
            flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium
            text-red-500 hover:bg-red-50 transition-all
            ${(isCollapsed && !isMobile) ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} />
          <AnimatePresence mode="wait">
            {(!isCollapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                تسجيل الخروج
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
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
        {sidebarContent}
      </>
    );
  }

  return sidebarContent;
}