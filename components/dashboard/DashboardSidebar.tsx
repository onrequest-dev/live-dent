// components/dashboard/DashboardSidebar.tsx
'use client';

import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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
import { AccountSwitcher } from './AccountSwitcher';

// ✅ ترتيب الأيقونات للقائمة السفلية (من اليمين لليسار)
const bottomNavItems = [
  { tab: 'cv', label: 'CV الطبيب', icon: UserCircle },
  { tab: 'clinic', label: 'العيادة', icon: Building2 },
  { tab: 'main', label: 'الرئيسية', icon: LayoutDashboard, featured: true },
  { tab: 'patients', label: 'المرضى', icon: Users },
  { tab: 'settings', label: 'الإعدادات', icon: Settings },
];

const menuItems = [
  { tab: 'main', label: 'الرئيسية', icon: LayoutDashboard },
  { tab: 'patients', label: 'جدول المرضى', icon: Users },
  { tab: 'clinic', label: 'معلومات العيادة', icon: Building2 },
  { tab: 'cv', label: 'CV الطبيب', icon: UserCircle },
  { tab: 'settings', label: 'الإعدادات', icon: Settings }, 
];

interface DashboardSidebarProps {
  clinicData: Clinic | null;
}

// مكون Skeleton للتحميل
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
  const router = useRouter();
  const clinicId = params?.clinicId as string;
  const currentTab = searchParams.get('tab') || 'main';
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [autoCollapse, setAutoCollapse] = useState(true);

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

  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    } else if (autoCollapse) {
      if (!isCollapsed) {
        setIsCollapsed(true);
      }
    }
  }, [currentTab, autoCollapse, isMobile]);

  const handlePatientsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/dashboard/${clinicId}?tab=patients`);
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

// ✨ شريط التنقل السفلي للهاتف - تصميم أنيق وناعم
const MobileBottomNav = () => (
  <motion.nav
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
  >
    <div className="relative">
<div 
  className="
    rounded-[32px] 
    shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]
    border border-white/50
    p-1.5
  "
  style={{
    background: `linear-gradient(180deg, rgba(255, 255, 255, 0.27) 0%, ${primaryColor}08 50%, rgba(255, 255, 255, 0.34) 100%)`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  }}
>
        <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-2/3 h-[3px] rounded-full"
          style={{ 
            background: `linear-gradient(90deg, transparent 0%, ${primaryColor}90 10%, ${primaryColor} 50%, ${primaryColor}90 90%, transparent 100%)` 
          }}
        />
        
        <div className="flex items-center justify-around px-1">
          {bottomNavItems.map((item) => {
            const isActive = currentTab === item.tab;
            const Icon = item.icon;
            const isFeatured = item.featured;

            const IconWrapper = ({ children }: { children: React.ReactNode }) => (
              <div className="relative flex flex-col items-center justify-center">
                {children}
              </div>
            );

            const content = (
              <>
                {!isFeatured ? (
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    className="relative flex items-center justify-center w-12 h-12"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveBg"
                        className="absolute inset-0 rounded-2xl"
                        style={{ 
                          background: `linear-gradient(135deg, ${primaryColor}15, ${primaryColor}08)` 
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    <Icon 
                      size={21} 
                      className="relative z-10 transition-all duration-300"
                      style={{ 
                        color: isActive ? primaryColor : '#475569', // ✅ لون داكن للأيقونات غير النشطة
                      }}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                    
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveDot"
                        className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    whileTap={{ scale: 0.92 }}
                    className="relative flex items-center justify-center -mt-6"
                  >
                    <motion.div
                      whileHover={{ 
                        scale: 1.08,
                        boxShadow: `0 12px 28px ${primaryColor}35`
                      }}
                      className="
                        w-[52px] h-[52px] rounded-[20px] flex items-center justify-center
                        shadow-[0_8px_24px_-6px_rgba(0,0,0,0.15)]
                        transition-all duration-300
                        border-[3px] border-white
                      "
                      style={{
                        background: isActive 
                          ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` 
                          : `linear-gradient(135deg, #ffffff, #f8fafc)`,
                        boxShadow: isActive 
                          ? `0 12px 28px ${primaryColor}40, 0 0 0 4px ${primaryColor}20`
                          : `0 8px 24px -6px rgba(0,0,0,0.12), 0 0 0 2px ${primaryColor}15`,
                      }}
                    >
                      <Icon 
                        size={23} 
                        className="transition-all duration-300"
                        style={{ 
                          color: isActive ? '#ffffff' : primaryColor,
                        }}
                        strokeWidth={2.2}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </>
            );

            if (item.tab === 'patients') {
              return (
                <a
                  key={item.tab}
                  href={`/dashboard/${clinicId}?tab=patients`}
                  onClick={handlePatientsClick}
                  className="flex-1 flex justify-center"
                >
                  <IconWrapper>{content}</IconWrapper>
                </a>
              );
            }

            return (
              <Link
                key={item.tab}
                href={`/dashboard/${clinicId}?tab=${item.tab}`}
                className="flex-1 flex justify-center"
              >
                <IconWrapper>{content}</IconWrapper>
              </Link>
            );
          })}
        </div>
      </div>
      
      <div className="h-[env(safe-area-inset-bottom,8px)]" />
    </div>
  </motion.nav>
);

  // عرض القائمة الجانبية للشاشات الكبيرة
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

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = currentTab === item.tab;
          const Icon = item.icon;

          if (item.tab === 'patients') {
            return (
              <a
                key={item.tab}
                href={`/dashboard/${clinicId}?tab=patients`}
                onClick={handlePatientsClick}
                style={{ textDecoration: 'none' }}
              >
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
              </a>
            );
          }

          const href = `/dashboard/${clinicId}?tab=${item.tab}`;
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

      {/* <div className="p-3 border-t border-gray-100">
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
      </div> */}
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