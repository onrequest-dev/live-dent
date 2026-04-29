// components/dashboard/tabs/SettingsTab.tsx
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  MessageCircle,
  Share2,
  Building2,
  UserCircle,
  RefreshCw,
  LogOut,
  Download,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { usePWAInstall } from "@/hooks/usePWAInstall";

interface SettingsTabProps {
  clinicData: any;
}

export function SettingsTab({ clinicData }: SettingsTabProps) {
  const params = useParams();
  const clinicId = params?.clinicId as string;
  const [autoCollapse, setAutoCollapse] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // استخدام hook تثبيت PWA
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  // تحميل الإعدادات
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

  // حفظ الإعدادات
  const handleAutoCollapseChange = (checked: boolean) => {
    setAutoCollapse(checked);
    localStorage.setItem(
      "dashboard_settings",
      JSON.stringify({ autoCollapse: checked }),
    );
    window.dispatchEvent(
      new CustomEvent("settingsChanged", { detail: { autoCollapse: checked } }),
    );
  };

  // معالج تثبيت التطبيق
  const handleInstallApp = async () => {
    setIsInstalling(true);
    try {
      const success = await installApp();
      if (success) {
        setShowInstallPrompt(false);
      }
    } catch (error) {
      console.error("فشل تثبيت التطبيق:", error);
    } finally {
      setIsInstalling(false);
    }
  };

  // مشاركة
  const handleShare = async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.error("فشل المشاركة:", err);
      }
    } else {
      window.open(url, "_blank");
    }
  };

  const primaryColor = clinicData?.settings?.primaryColor || "#3B82F6";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

  const clinicUrl = `${baseUrl}/public-clinic/${clinicId}`;
  const doctorCVUrl = `${baseUrl}/public-clinic/${clinicId}/doctor-cv`;
  const whatsappUrl = `https://wa.me/79610195064`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* الرأس */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${primaryColor}1` }}
          >
            <Settings size={24} style={{ color: primaryColor }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">الإعدادات</h1>
        </div>
      </div>

      <div className="space-y-6">
        {/* إعدادات السلوك */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">السلوك</h2>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-lg font-medium text-gray-700">
                  إغلاق تلقائي للقائمة
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  إغلاق القائمة عند التنقل بين التبويبات
                </p>
              </div>

              <button
                onClick={() => handleAutoCollapseChange(!autoCollapse)}
                className="relative"
              >
                <div
                  className={`w-14 h-7 rounded-full transition-all ${
                    autoCollapse ? "" : "bg-gray-300"
                  }`}
                  style={{
                    backgroundColor: autoCollapse ? primaryColor : undefined,
                  }}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                      autoCollapse ? "right-1" : "right-8"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* إضافة إلى الشاشة الرئيسية - القسم المعدل */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Smartphone size={20} style={{ color: primaryColor }} />
              <h2 className="text-xl font-semibold text-gray-800">
                إضافة إلى الشاشة الرئيسية
              </h2>
            </div>
          </div>

          <div className="p-6">
            {!isInstalled ? (
              // حالة عدم التثبيت - زر التفعيل
              <div>
                {!showInstallPrompt ? (
                  // الحالة الافتراضية - عرض زر التثبيت
                  <div className="space-y-4">
                    <div>
                      <label className="text-lg font-medium text-gray-700">
                        اضافة الى سطح المكتب
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        اضف LiveDent الى سطح المكتب لتسهيل الوصول اليه
                      </p>
                    </div>

                    <button
                      onClick={() => setShowInstallPrompt(true)}
                      disabled={!isInstallable}
                      className="px-6 py-3 text-sm font-medium text-white rounded-xl transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      style={{
                        backgroundColor: isInstallable
                          ? primaryColor
                          : "#9CA3AF",
                        boxShadow: isInstallable
                          ? `0 4px 12px ${primaryColor}40`
                          : "none",
                      }}
                    >
                      <Download size={18} />
                      {isInstallable
                        ? "تثبيت التطبيق"
                        : "التطبيق غير قابل للتثبيت حالياً"}
                    </button>

                    {!isInstallable && (
                      <p className="text-xs text-gray-400">
                        * تأكد من فتح الموقع عبر متصفح مدعوم (Chrome, Edge,
                        Safari)
                      </p>
                    )}
                  </div>
                ) : (
                  // حالة عرض Prompt التثبيت
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2"
                    style={{ borderColor: `${primaryColor}30` }}
                  >
                    <div className="text-center mb-6">
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4"
                        style={{ boxShadow: `0 8px 25px ${primaryColor}20` }}
                      >
                        <Download size={36} style={{ color: primaryColor }} />
                      </motion.div>

                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        تثبيت التطبيق على الشاشة الرئيسية
                      </h3>
                      <p className="text-sm text-gray-600 max-w-md mx-auto">
                        سيتم إضافة اختصار للتطبيق على شاشتك الرئيسية للوصول
                        السريع والمباشر
                      </p>
                    </div>

                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleInstallApp}
                        disabled={isInstalling}
                        className="w-full py-3.5 px-6 text-base font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        style={{
                          backgroundColor: primaryColor,
                          boxShadow: `0 8px 25px ${primaryColor}40`,
                        }}
                      >
                        {isInstalling ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            جاري التثبيت...
                          </>
                        ) : (
                          <>
                            <Download size={20} />
                            تثبيت الآن
                          </>
                        )}
                      </motion.button>

                      <button
                        onClick={() => setShowInstallPrompt(false)}
                        className="w-full py-3 px-6 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Smartphone size={14} />
                      <span>متوافق مع جميع الأجهزة والمتصفحات</span>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              // حالة التثبيت الناجح - زر مفعل مع علامة صح
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle2 size={24} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">
                        تم التثبيت بنجاح ✓
                      </h3>
                      <p className="text-sm text-green-600">
                        التطبيق مثبت على شاشتك الرئيسية
                      </p>
                    </div>
                  </div>

                  {/* زر تفعيل يظهر حالة النجاح */}
                  <div className="relative">
                    <div className="w-14 h-7 rounded-full bg-green-500">
                      <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-md" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* المشاركة */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">مشاركة</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* مشاركة العيادة */}
              <button
                onClick={() =>
                  handleShare(clinicUrl, clinicData?.name || "صفحة العيادة")
                }
                className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <Building2 size={20} style={{ color: primaryColor }} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-medium text-gray-800">
                      مشاركة صفحة العيادة
                    </p>
                    <p className="text-xs text-gray-500">
                      مشاركة الرابط مع المرضى
                    </p>
                  </div>
                  <Share2 size={18} className="text-gray-400" />
                </div>
              </button>

              {/* مشاركة الطبيب */}
              <button
                onClick={() =>
                  handleShare(
                    doctorCVUrl,
                    `CV ${clinicData?.doctorProfile?.fullName || "الطبيب"}`,
                  )
                }
                className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <UserCircle size={20} style={{ color: primaryColor }} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-medium text-gray-800">
                      مشاركة صفحة الطبيب
                    </p>
                    <p className="text-xs text-gray-500">
                      مشاركة السيرة الذاتية
                    </p>
                  </div>
                  <Share2 size={18} className="text-gray-400" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* الدعم والحساب */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">
              الدعم والحساب
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* خدمة العملاء */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: "#25D36615" }}
                  >
                    <MessageCircle size={20} style={{ color: "#25D366" }} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-medium text-gray-800">خدمة العملاء</p>
                    <p className="text-xs text-gray-500">تواصل عبر واتساب</p>
                  </div>
                </div>
              </a>

              {/* تسجيل الخروج */}
              <button className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: "#EF444415" }}
                  >
                    <LogOut size={20} style={{ color: "#EF4444" }} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-medium text-gray-800">تسجيل الخروج</p>
                    <p className="text-xs text-gray-500">الخروج من الحساب</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* الشعارات */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-col items-center justify-center">
            {/* الشعارات مع تأثير hover */}
            <div className="flex items-center justify-center gap-6 mb-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <Image
                  src="/logo.png"
                  alt="LiveDent"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <Image
                  src="/onrequs1t.jpg.png"
                  alt="OnRequest"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </motion.div>
            </div>

            {/* النص مع تدرج لوني */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-blue-950">LiveDent</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  OnRequest
                </span>
                <span className="text-xs font-medium text-gray-900 uppercase tracking-wider">
                  BY
                </span>
              </div>
            </div>

            {/* حقوق النشر */}
            <p className="text-xs text-gray-900 mt-4">
              © 2026 جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
