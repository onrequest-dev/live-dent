// components/dashboard/tabs/SettingsTab.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  MessageCircle,
  Share2,
  Building2,
  UserCircle,
  LogOut,
  Download,
  Smartphone,
  CheckCircle2,
  Lock,
  Stethoscope,
  Palette,
  Bell,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { AccountSwitcher } from "../AccountSwitcher";
import { ChangePasswordModal } from "./ChangePasswordModal";

interface SettingsTabProps {
  clinicData: any;
}

// ============================================================
// أنواع التبويبات الداخلية
// ============================================================

type SettingsSection = "clinic" | "appearance" | "notifications";

export function SettingsTab({ clinicData }: SettingsTabProps) {
  const params = useParams();
  const router = useRouter();
  const clinicId = params?.clinicId as string;
  
  // ✅ التبويب النشط
  const [activeSection, setActiveSection] = useState<SettingsSection>("clinic");
  
  // ✅ الحالات
  const [autoCollapse, setAutoCollapse] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [numberingSystem, setNumberingSystem] = useState<'universal' | 'fdi' | 'palmer'>('universal');
  const [toothDisplayPreference, setToothDisplayPreference] = useState<'number' | 'name' | 'both'>('number');
  const [autoNotify, setAutoNotify] = useState(true);
  
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // ✅ تحميل الإعدادات
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

    const savedNumbering = localStorage.getItem('tooth_numbering_system');
    if (savedNumbering === 'universal' || savedNumbering === 'fdi' || savedNumbering === 'palmer') {
      setNumberingSystem(savedNumbering);
    }

    const savedDisplayPref = localStorage.getItem('tooth_display_preference');
    if (savedDisplayPref === 'number' || savedDisplayPref === 'name' || savedDisplayPref === 'both') {
      setToothDisplayPreference(savedDisplayPref);
    }

    const preventAutoMessages = localStorage.getItem('prevent_auto_messages');
    setAutoNotify(preventAutoMessages !== 'true');
  }, []);

  // ✅ المعالجات
  const handleNumberingSystemChange = (system: 'universal' | 'fdi' | 'palmer') => {
    setNumberingSystem(system);
    localStorage.setItem('tooth_numbering_system', system);
    window.dispatchEvent(new CustomEvent('numberingSystemChanged', { detail: system }));
  };

  const handleToothDisplayChange = (pref: 'number' | 'name' | 'both') => {
    setToothDisplayPreference(pref);
    localStorage.setItem('tooth_display_preference', pref);
    window.dispatchEvent(new CustomEvent('toothDisplayPreferenceChanged', { detail: pref }));
  };

  const handleAutoNotifyChange = (checked: boolean) => {
    setAutoNotify(checked);
    if (checked) {
      localStorage.removeItem('prevent_auto_messages');
    } else {
      localStorage.setItem('prevent_auto_messages', 'true');
    }
    window.dispatchEvent(new CustomEvent("autoNotifyChanged", { detail: { enabled: checked } }));
  };

  const handleAutoCollapseChange = (checked: boolean) => {
    setAutoCollapse(checked);
    localStorage.setItem("dashboard_settings", JSON.stringify({ autoCollapse: checked }));
    window.dispatchEvent(new CustomEvent("settingsChanged", { detail: { autoCollapse: checked } }));
  };

  const handleInstallApp = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) setShowInstallPrompt(false);
    } catch (error) {
      console.error("فشل تثبيت التطبيق:", error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleShare = async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.error("فشل المشاركة:", err);
      }
    } else {
      window.open(url, "_blank");
    }
  };

  const primaryColor = clinicData?.settings?.primaryColor || "#528ff7";
  const clinicEmail = clinicData?.doctorProfile?.contactEmail || 
                    clinicData?.settings?.contactEmail || 
                    clinicData?.doctorProfile?.email;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  const clinicUrl = `${baseUrl}/public-clinic/${clinicId}`;
  const doctorCVUrl = `${baseUrl}/public-clinic/${clinicId}/doctor-cv`;
  const whatsappUrl = `https://wa.me/+963982719525`;

  // ✅ تعريف التبويبات
const sections: { id: SettingsSection; label: string; icon: any }[] = [
  { id: "clinic", label: "العيادة والحساب", icon: Building2 },
  { id: "appearance", label: "المظهر والأسنان", icon: Palette },
  { id: "notifications", label: "التنبيهات", icon: Bell },
];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-1 pb-20"
      dir="rtl"
    >
      {/* الرأس */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
            <Settings size={24} style={{ color: primaryColor }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">الإعدادات</h1>
        </div>
      </div>

      {/* ✅ شريط التبويبات */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl min-w-max">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={16} className={isActive ? "" : "text-gray-400"} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ محتوى التبويب */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* ============================================================ */}
          {/* تبويب العيادة */}
          {/* ============================================================ */}
{activeSection === "clinic" && (
  <>
    <AccountSwitcher />

    {/* ✅ أزرار المشاركة - أعلى القسم */}
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => handleShare(clinicUrl, clinicData?.name || "صفحة العيادة")}
        className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-right"
      >
        <div className="flex items-center gap-2">
          <Share2 size={16} style={{ color: primaryColor }} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">مشاركة العيادة</p>
            <p className="text-[10px] text-gray-500">رابط صفحة العيادة</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => handleShare(doctorCVUrl, `CV ${clinicData?.doctorProfile?.fullName || "الطبيب"}`)}
        className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-right"
      >
        <div className="flex items-center gap-2">
          <Share2 size={16} style={{ color: primaryColor }} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">مشاركة الطبيب</p>
            <p className="text-[10px] text-gray-500">رابط السيرة الذاتية</p>
          </div>
        </div>
      </button>
    </div>

    <SectionCard title="إدارة العيادة" icon={Building2} primaryColor={primaryColor}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => router.push(`/dashboard/${clinicId}?tab=clinic`)}
          className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-right"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
              <Building2 size={20} style={{ color: primaryColor }} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">معلومات العيادة</p>
              <p className="text-xs text-gray-500">تعديل بيانات العيادة وساعات العمل</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push(`/dashboard/${clinicId}?tab=cv`)}
          className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-right"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
              <UserCircle size={20} style={{ color: primaryColor }} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">CV الطبيب</p>
              <p className="text-xs text-gray-500">تعديل السيرة الذاتية</p>
            </div>
          </div>
        </button>
      </div>
    </SectionCard>

    {/* ✅ قسم الحساب - مدمج */}
    <SectionCard title="الحساب والدعم" icon={UserCircle} primaryColor={primaryColor}>
      <div className="grid grid-cols-1 gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "#25D36615" }}>
              <MessageCircle size={20} style={{ color: "#25D366" }} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">خدمة العملاء</p>
              <p className="text-xs text-gray-500">تواصل عبر واتساب</p>
            </div>
          </div>
        </a>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-right"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
              <Lock size={20} style={{ color: primaryColor }} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800">تغيير كلمة المرور</p>
              <p className="text-xs text-gray-500">إعادة تعيين كلمة المرور</p>
            </div>
          </div>
        </button>

        <button className="p-4 rounded-xl border border-red-200 hover:bg-red-50 transition-all text-right">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: "#EF444415" }}>
              <LogOut size={20} style={{ color: "#EF4444" }} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-red-600">تسجيل الخروج</p>
              <p className="text-xs text-gray-500">الخروج من الحساب</p>
            </div>
          </div>
        </button>
      </div>
    </SectionCard>

    <FooterLogos />
  </>
)}

          {/* ============================================================ */}
          {/* تبويب المظهر والأسنان */}
          {/* ============================================================ */}
          {activeSection === "appearance" && (
            <>
              <SectionCard title="نظام ترقيم الأسنان" icon={Stethoscope} primaryColor={primaryColor}>
                <div className="space-y-3">
                  {[
                    { value: 'universal' as const, label: 'النظام العالمي (Universal)' },
                    { value: 'fdi' as const, label: 'نظام FDI' },
                    { value: 'palmer' as const, label: 'نظام Palmer' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleNumberingSystemChange(option.value)}
                      className="w-full p-4 rounded-xl border-2 transition-all text-right flex items-center justify-between"
                      style={{
                        borderColor: numberingSystem === option.value ? primaryColor : '#E5E7EB',
                        backgroundColor: numberingSystem === option.value ? `${primaryColor}10` : 'white',
                      }}
                    >
                      <span className="font-medium text-gray-800">{option.label}</span>
                      {numberingSystem === option.value && (
                        <CheckCircle2 size={20} style={{ color: primaryColor }} />
                      )}
                    </button>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="عرض معلومات الأسنان" icon={LayoutGrid} primaryColor={primaryColor}>
                <div className="space-y-3">
                  {[
                    { value: 'number' as const, label: 'الرقم فقط', example: 'مثال: السن 14' },
                    { value: 'name' as const, label: 'الاسم العربي', example: 'مثال: الضرس الأول العلوي الأيسر' },
                    { value: 'both' as const, label: 'الرقم والاسم معاً', example: 'مثال: السن 14 - الضرس الأول العلوي الأيسر' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleToothDisplayChange(option.value)}
                      className="w-full p-4 rounded-xl border-2 transition-all text-right"
                      style={{
                        borderColor: toothDisplayPreference === option.value ? primaryColor : '#E5E7EB',
                        backgroundColor: toothDisplayPreference === option.value ? `${primaryColor}10` : 'white',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{option.label}</p>
                          <p className="text-xs text-gray-500 mt-1">{option.example}</p>
                        </div>
                        {toothDisplayPreference === option.value && (
                          <CheckCircle2 size={20} style={{ color: primaryColor }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </SectionCard>
<div className="hidden md:block">
  <SectionCard title="سلوك القائمة" icon={Settings} primaryColor={primaryColor}>
    <div className="flex items-center justify-between">
      <div>
        <label className="text-lg font-medium text-gray-700">إغلاق تلقائي للقائمة</label>
        <p className="text-sm text-gray-500 mt-1">إغلاق القائمة عند التنقل بين التبويبات</p>
      </div>
      <ToggleSwitch checked={autoCollapse} onChange={handleAutoCollapseChange} primaryColor={primaryColor} />
    </div>
  </SectionCard>
</div>
              <SectionCard title="تطبيق الهاتف" icon={Smartphone} primaryColor={primaryColor}>
                <PWAInstallSection
                  isInstalled={isInstalled}
                  isInstallable={isInstallable}
                  showInstallPrompt={showInstallPrompt}
                  isInstalling={isInstalling}
                  primaryColor={primaryColor}
                  onShowPrompt={() => setShowInstallPrompt(true)}
                  onCancelPrompt={() => setShowInstallPrompt(false)}
                  onInstall={handleInstallApp}
                />
              </SectionCard>
            </>
          )}

          {/* ============================================================ */}
          {/* تبويب التنبيهات */}
          {/* ============================================================ */}
          {activeSection === "notifications" && (
            <SectionCard title="التنبيه التلقائي" icon={Bell} primaryColor={primaryColor}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-base font-medium text-gray-700">تنبيه تلقائي للمواعيد</label>
                  <p className="text-xs text-gray-500 mt-1">
                    {autoNotify 
                      ? "سيتم إبلاغ المريض بالمواعيد الجديدة تلقائياً" 
                      : "لن يتم إرسال تنبيهات تلقائية"}
                  </p>
                </div>
                <ToggleSwitch checked={autoNotify} onChange={handleAutoNotifyChange} primaryColor={primaryColor} />
              </div>
            </SectionCard>
          )}
        </motion.div>
      </AnimatePresence>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        clinicId={clinicId}
        clinicName={clinicData?.name}
        clinicEmail={clinicEmail}
        primaryColor={primaryColor}
      />
    </motion.div>
  );
}

// ============================================================
// مكونات مساعدة
// ============================================================

function SectionCard({ title, icon: Icon, primaryColor, children }: {
  title: string;
  icon: any;
  primaryColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Icon size={20} style={{ color: primaryColor }} />
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, primaryColor }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  primaryColor: string;
}) {
  return (
<button
  onClick={() => onChange(!checked)}
  className="relative flex-shrink-0 inline-flex items-center"
  style={{ lineHeight: 0 }}
>
  <div
    className={`relative w-14 h-7 rounded-full transition-all ${
      checked ? "" : "bg-gray-300"
    }`}
    style={{ backgroundColor: checked ? primaryColor : undefined }}
  >
    <div
      className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
        checked ? "right-1" : "left-1"
      }`}
    />
  </div>
</button>
  );
}

function PWAInstallSection({ isInstalled, isInstallable, showInstallPrompt, isInstalling, primaryColor, onShowPrompt, onCancelPrompt, onInstall }: {
  isInstalled: boolean;
  isInstallable: boolean;
  showInstallPrompt: boolean;
  isInstalling: boolean;
  primaryColor: string;
  onShowPrompt: () => void;
  onCancelPrompt: () => void;
  onInstall: () => void;
}) {
  if (isInstalled) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={24} className="text-green-600" />
          <div>
            <p className="font-semibold text-green-800">تم التثبيت بنجاح ✓</p>
            <p className="text-sm text-green-600">التطبيق مثبت على شاشتك الرئيسية</p>
          </div>
        </div>
      </div>
    );
  }

  if (showInstallPrompt) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          سيتم إضافة اختصار للتطبيق على شاشتك الرئيسية
        </p>
        <div className="flex gap-3">
          <button
            onClick={onInstall}
            disabled={isInstalling}
            className="flex-1 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            {isInstalling ? "جاري التثبيت..." : "تثبيت الآن"}
          </button>
          <button
            onClick={onCancelPrompt}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
          >
            إلغاء
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onShowPrompt}
        disabled={!isInstallable}
        className="px-6 py-3 text-sm font-medium text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
        style={{ backgroundColor: isInstallable ? primaryColor : "#9CA3AF" }}
      >
        <Download size={18} />
        {isInstallable ? "تثبيت التطبيق" : "غير قابل للتثبيت"}
      </button>
    </div>
  );
}

function FooterLogos() {
  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center gap-6 mb-4">
          <Image src="/logo.png" alt="LiveDent" width={40} height={40} className="object-contain" />
          <Image src="/onrequs1t.jpg.png" alt="OnRequest" width={40} height={40} className="object-contain" />
        </div>
        <h3 className="text-lg font-bold text-blue-950">LiveDent</h3>
        <p className="text-xs text-gray-500 mt-2">© 2026 جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}