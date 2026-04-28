// components/dashboard/tabs/SettingsTab.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Settings, 
  MessageCircle, 
  Share2, 
  Building2, 
  UserCircle,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface SettingsTabProps {
  clinicData: any;
}

export function SettingsTab({ clinicData }: SettingsTabProps) {
  const params = useParams();
  const clinicId = params?.clinicId as string;
  const [autoCollapse, setAutoCollapse] = useState(true);

  // تحميل الإعدادات
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

  // حفظ الإعدادات
  const handleAutoCollapseChange = (checked: boolean) => {
    setAutoCollapse(checked);
    localStorage.setItem('dashboard_settings', JSON.stringify({ autoCollapse: checked }));
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: { autoCollapse: checked } }));
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
        console.error('فشل المشاركة:', err);
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const primaryColor = clinicData?.settings?.primaryColor || '#3B82F6';
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
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${primaryColor}1` }}>
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
                    autoCollapse ? '' : 'bg-gray-300'
                  }`}
                  style={{ backgroundColor: autoCollapse ? primaryColor : undefined }}
                >
                  <div 
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                      autoCollapse ? 'right-1' : 'right-8'
                    }`} 
                  />
                </div>
              </button>
            </div>
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
                onClick={() => handleShare(clinicUrl, clinicData?.name || 'صفحة العيادة')}
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
                    <p className="font-medium text-gray-800">مشاركة صفحة العيادة</p>
                    <p className="text-xs text-gray-500">مشاركة الرابط مع المرضى</p>
                  </div>
                  <Share2 size={18} className="text-gray-400" />
                </div>
              </button>

              {/* مشاركة الطبيب */}
              <button
                onClick={() => handleShare(doctorCVUrl, `CV ${clinicData?.doctorProfile?.fullName || 'الطبيب'}`)}
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
                    <p className="font-medium text-gray-800">مشاركة صفحة الطبيب</p>
                    <p className="text-xs text-gray-500">مشاركة السيرة الذاتية</p>
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
            <h2 className="text-xl font-semibold text-gray-800">الدعم والحساب</h2>
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
                    style={{ backgroundColor: '#25D36615' }}
                  >
                    <MessageCircle size={20} style={{ color: '#25D366' }} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-medium text-gray-800">خدمة العملاء</p>
                    <p className="text-xs text-gray-500">تواصل عبر واتساب</p>
                  </div>
                </div>
              </a>

              {/* تجديد الاشتراك */}
              {/* <Link
                href="/pricing"
                className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: '#8B5CF615' }}
                  >
                    <RefreshCw size={20} style={{ color: '#8B5CF6' }} />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-medium text-gray-800">تجديد الاشتراك</p>
                    <p className="text-xs text-gray-500">اطلب تجديد الاشتراك للشهر المقبل</p>
                  </div>
                </div>
              </Link> */}

              {/* تسجيل الخروج */}
              <button
                className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: '#EF444415' }}
                  >
                    <LogOut size={20} style={{ color: '#EF4444' }} />
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
      <h3 className="text-xl font-bold text-blue-950">
        LiveDent
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          OnRequest
        </span>
        <span className="text-xs font-medium text-gray-900 uppercase tracking-wider">BY</span>
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