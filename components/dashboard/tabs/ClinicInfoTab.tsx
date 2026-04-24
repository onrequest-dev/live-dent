// components/dashboard/tabs/ClinicInfoTab.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Save,
  X,
  Building2,
  MapPin,
  Clock,
  Calendar,
  Settings,
  Upload,
  Check,
  AlertCircle,
  CreditCard,
  Hash,
  Palette,
  Timer,
  Store,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Clinic } from '@/types';
import { updateClinic } from '@/client/helpers/clinic';
import { WorkingHours } from '@/types';
import { handleUploadImage } from '@/client/helpers/upload_image';

// ============================================================
// أيام الأسبوع
// ============================================================

const DAYS_OF_WEEK = [
  { key: 0, label: 'السبت' },
  { key: 1, label: 'الأحد' },
  { key: 2, label: 'الإثنين' },
  { key: 3, label: 'الثلاثاء' },
  { key: 4, label: 'الأربعاء' },
  { key: 5, label: 'الخميس' },
  { key: 6, label: 'الجمعة' },
] as const;

// ============================================================
// الواجهات
// ============================================================

interface WorkingHourEditItem {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start: string;
  end: string;
  isClosed: boolean;
}

// ============================================================
// دوال مساعدة
// ============================================================

const normalizeWorkingHours = (workingHours: any): WorkingHours[] => {
  if (!workingHours) return [];
  if (Array.isArray(workingHours)) return workingHours;
  if (typeof workingHours === 'object' && workingHours !== null) return Object.values(workingHours);
  return [];
};

const createFormDataFromClinic = (clinic: Clinic | null) => ({
  name: clinic?.name || '',
  logo: clinic?.logo || '',
  address: clinic?.address || '',
  subscriptionStatus: clinic?.subscriptionStatus || 'trial',
  defaultAppointmentDuration: clinic?.settings?.defaultAppointmentDuration || 30,
  primaryColor: clinic?.settings?.primaryColor || '#007bff',
  secondaryColor: clinic?.settings?.secondaryColor || '#6c757d',
});

const createWorkingHoursFromClinic = (clinic: Clinic | null): WorkingHourEditItem[] => {
  if (!clinic) return [];
  const rawWorkingHours = clinic.settings?.workingHours;
  const normalizedHours = normalizeWorkingHours(rawWorkingHours);
  
  return DAYS_OF_WEEK.map(day => {
    const existing = normalizedHours.find((h: WorkingHours) => h.day === day.key);
    const isClosed = existing
      ? (existing.start === '00:00' && existing.end === '00:00')
      : (day.key === 6);
    return {
      day: day.key,
      start: existing?.start || (isClosed ? '00:00' : '09:00'),
      end: existing?.end || (isClosed ? '00:00' : '17:00'),
      isClosed,
    };
  });
};

// ============================================================
// Props
// ============================================================

interface ClinicInfoTabProps {
  clinicData: Clinic | null;
  onClinicUpdate?: (updatedClinic: any) => void;
}

// ============================================================
// المكون الرئيسي
// ============================================================

export function ClinicInfoTab({ clinicData, onClinicUpdate }: ClinicInfoTabProps) {
  const router = useRouter();
  const primaryColor = clinicData?.settings?.primaryColor || '#007bff';
  const secondaryColor = clinicData?.settings?.secondaryColor || '#6c757d';
  
  // ✅ استخدام ref لتجنب إعادة التهيئة غير الضرورية
  const initializedRef = useRef(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // ✅ تهيئة الحالة مرة واحدة فقط
  const [formData, setFormData] = useState(() => createFormDataFromClinic(clinicData));
  const [workingHours, setWorkingHours] = useState(() => createWorkingHoursFromClinic(clinicData));
  const [tempLogo, setTempLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(clinicData?.logo || '');

  // ✅ تحديث البيانات فقط عند تغيير clinicData من الخارج ولسنا في وضع التعديل
  useEffect(() => {
    if (!clinicData) return;
    
    // إذا كانت هذه أول مرة، تجاهل التحديث
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    
    // تحديث البيانات فقط إذا لم نكن في وضع التعديل
    if (!isEditing) {
      setFormData(createFormDataFromClinic(clinicData));
      setWorkingHours(createWorkingHoursFromClinic(clinicData));
      setLogoPreview(clinicData.logo || '');
      setTempLogo(null);
      setHasChanges(false);
    }
  }, [clinicData, isEditing]);

  // ✅ تنظيف رسالة الحفظ
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => {
      if (prev[field as keyof typeof prev] === value) return prev;
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSaveMessage({ type: 'error', text: 'حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت' });
        return;
      }
      
      setTempLogo(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      setFormData(prev => ({ ...prev, logo: preview }));
      setHasChanges(true);
    }
  }, []);

  const handleWorkingHourChange = useCallback((dayKey: number, field: keyof WorkingHourEditItem, value: string | boolean) => {
    setWorkingHours(prev => prev.map(wh => {
      if (wh.day !== dayKey) return wh;
      
      const updated = { ...wh, [field]: value };
      
      if (field === 'isClosed') {
        if (value === true) {
          updated.start = '00:00';
          updated.end = '00:00';
        } else {
          updated.start = '09:00';
          updated.end = '17:00';
        }
      }
      
      return updated;
    }));
    setHasChanges(true);
  }, []);

  const handleEdit = useCallback(() => {
    if (!clinicData) return;
    
    setFormData(createFormDataFromClinic(clinicData));
    setWorkingHours(createWorkingHoursFromClinic(clinicData));
    setLogoPreview(clinicData.logo || '');
    setTempLogo(null);
    setHasChanges(false);
    setSaveMessage(null);
    setIsEditing(true);
  }, [clinicData]);

  const handleCancel = useCallback(() => {
    if (!clinicData) return;
    
    setFormData(createFormDataFromClinic(clinicData));
    setWorkingHours(createWorkingHoursFromClinic(clinicData));
    setLogoPreview(clinicData.logo || '');
    setTempLogo(null);
    setHasChanges(false);
    setSaveMessage(null);
    setIsEditing(false);
  }, [clinicData]);

  // ✅ دالة حفظ التعديلات مع تحديث كامل للصفحة
  const handleSave = async () => {
    if (!hasChanges || !clinicData) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const workingHoursToSend: WorkingHours[] = workingHours.map(wh => ({
        day: wh.day,
        start: wh.start,
        end: wh.end,
        isClosed: wh.isClosed,
      }));

      const updatedClinic = {
        name: formData.name,
        logo: formData.logo,
        address: formData.address,
        settings: {
          ...clinicData.settings,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          defaultAppointmentDuration: formData.defaultAppointmentDuration,
          workingHours: workingHoursToSend,
        },
      };
      
      let finalLogo = formData.logo;
      if (tempLogo) {
        try {
          const logoUrl = await handleUploadImage(tempLogo, 'logo', clinicData.id);
          if (logoUrl) {
            finalLogo = logoUrl;
            updatedClinic.logo = logoUrl;
          }
        } catch (uploadError) {
          console.error('خطأ في رفع الشعار:', uploadError);
          setSaveMessage({ type: 'error', text: 'فشل رفع الشعار. يرجى المحاولة مرة أخرى.' });
          setIsSaving(false);
          return;
        }
      }
      
      const result = await updateClinic(updatedClinic);
      
      if (!result) {
        throw new Error('فشل حفظ التغييرات');
      }
      
      const updatedFullClinic = {
        ...clinicData,
        ...updatedClinic,
        logo: finalLogo,
      };
      
      // إعلام المكون الأب بالتحديث
      if (onClinicUpdate) {
        onClinicUpdate(updatedFullClinic);
      }
      
      setSaveMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح' });
      
      // الخروج من وضع التعديل
      setIsEditing(false);
      setHasChanges(false);
      setTempLogo(null);
      
      // ✅ تحديث كامل للصفحة
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      setSaveMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'فشل حفظ التغييرات' 
      });
      setIsSaving(false);
    }
  };

  // ============================================================
  // دوال مساعدة للعرض
  // ============================================================

  const getSubscriptionStatusText = (status: string) => {
    const map: Record<string, string> = {
      'active': 'نشط',
      'trial': 'تجريبي',
      'expired': 'منتهي',
      'cancelled': 'ملغي',
      'pending': 'قيد الانتظار',
    };
    return map[status] || status;
  };

  const getSubscriptionStatusColor = (status: string) => {
    const map: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 border border-green-200',
      'trial': 'bg-blue-100 text-blue-800 border border-blue-200',
      'expired': 'bg-red-100 text-red-800 border border-red-200',
      'cancelled': 'bg-gray-100 text-gray-800 border border-gray-200',
      'pending': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    };
    return map[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };
  const formatTimeTo12Hour = (time24: string): string => {
  if (!time24 || time24 === '00:00') return '12:00 ص';
  
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const hours12 = hours % 12 || 12; // تحويل 0 إلى 12
  const formattedHours = hours12.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes} ${period}`;
};

  // ✅ أنماط CSS للتأكد من ظهور النصوص
  const inputClassName = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white";
  const labelClassName = "flex items-center gap-2 text-sm font-medium text-gray-900";
  const displayValueClassName = "text-gray-900";

  if (!clinicData) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
               style={{ borderColor: '#007bff', borderTopColor: 'transparent' }} />
          <p className="text-gray-900 font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  // ✅ البيانات المعروضة
  const displayWorkingHours = isEditing ? workingHours : createWorkingHoursFromClinic(clinicData);

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">معلومات العيادة</h1>
          <p className="text-gray-600 mt-1">إعدادات العيادة ومعلومات الاتصال</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel} 
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
              >
                <X size={18} />
                إلغاء
              </button>
              <button 
                onClick={handleSave} 
                disabled={!hasChanges || isSaving} 
                type="button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all disabled:opacity-50 font-medium shadow-sm"
                style={{ backgroundColor: hasChanges ? primaryColor : '#9ca3af' }}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    حفظ التغييرات
                  </>
                )}
              </button>
            </>
          ) : (
            <button 
              onClick={handleEdit} 
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white hover:opacity-90 font-medium shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              <Edit size={18} />
              تعديل المعلومات
            </button>
          )}
        </div>
      </div>

      {/* رسالة الحفظ */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl flex items-center gap-3 ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <Check size={20} className="text-green-600" />
            ) : (
              <AlertCircle size={20} className="text-red-600" />
            )}
            <span className="flex-1 font-medium">{saveMessage.text}</span>
            {saveMessage.type === 'success' && (
              <RefreshCw size={16} className="animate-spin text-green-600" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* العمود الأيمن */}
        <div className="space-y-6">
          {/* المعلومات الأساسية */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                <Store size={22} style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">المعلومات الأساسية</h2>
            </div>
            
            <div className="space-y-5">
              {/* الشعار */}
              <div className="space-y-2">
                <label className={labelClassName}>
                  <Building2 size={16} className="text-gray-600" />
                  شعار العيادة
                </label>
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300">
                    {(logoPreview || clinicData.logo) ? (
                      (logoPreview || clinicData.logo)!.startsWith('/') || 
                      (logoPreview || clinicData.logo)!.startsWith('http') || 
                      (logoPreview || clinicData.logo)!.startsWith('blob:') ? (
                        <Image 
                          src={logoPreview || clinicData.logo || ''} 
                          alt="شعار العيادة" 
                          fill 
                          className="object-contain p-2"
                          unoptimized={(logoPreview || '').startsWith('blob:')} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          {logoPreview || clinicData.logo}
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={40} className="text-gray-400" />
                      </div>
                    )}
                    
                    {isEditing && (
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload} 
                          className="hidden" 
                        />
                        <Upload size={24} className="text-white" />
                      </label>
                    )}
                  </div>
                  
                  {isEditing && (
                    <div className="flex-1">
                      {/* <input
                        type="text"
                        value={formData.logo}
                        onChange={(e) => handleInputChange('logo', e.target.value)}
                        placeholder="أو أدخل رمز تعبيري (🦷)"
                        className={inputClassName}
                      /> */}
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                        <Upload size={14} />
                        يمكنك النقر على الصورة لتغيرها
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* اسم العيادة */}
              <div className="space-y-2">
                <label className={labelClassName}>
                  <Store size={16} className="text-gray-600" />
                  اسم العيادة
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="أدخل اسم العيادة"
                    className={inputClassName}
                  />
                ) : (
                  <p className={`${displayValueClassName} font-medium text-lg`}>
                    {clinicData.name || 'غير محدد'}
                  </p>
                )}
              </div>
              
              {/* العنوان */}
              <div className="space-y-2">
                <label className={labelClassName}>
                  <MapPin size={16} className="text-gray-600" />
                  العنوان
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="أدخل عنوان العيادة"
                    rows={3}
                    className={inputClassName}
                  />
                ) : (
                  <p className={`${displayValueClassName} bg-gray-50 rounded-xl p-4`}>
                    {clinicData.address || 'غير محدد'}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* الإعدادات */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                <Settings size={22} style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">الإعدادات</h2>
            </div>
            
            <div className="space-y-5">
              {/* حالة الاشتراك */}
              <div className="space-y-2">
                <label className={labelClassName}>
                  <CreditCard size={16} className="text-gray-600" />
                  حالة الاشتراك
                </label>
                <div>
                  <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-medium ${getSubscriptionStatusColor(clinicData.subscriptionStatus || 'trial')}`}>
                    {getSubscriptionStatusText(clinicData.subscriptionStatus || 'trial')}
                  </span>
                </div>
              </div>
              
              {/* مدة الموعد */}
              <div className="space-y-2">
                <label className={labelClassName}>
                  <Timer size={16} className="text-gray-600" />
                  مدة الموعد الافتراضية (دقيقة)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.defaultAppointmentDuration}
                    onChange={(e) => handleInputChange('defaultAppointmentDuration', parseInt(e.target.value) || 30)}
                    min={15}
                    max={120}
                    step={15}
                    className={inputClassName}
                  />
                ) : (
                  <p className={`${displayValueClassName} bg-gray-50 rounded-xl p-3 inline-block`}>
                    {clinicData.settings?.defaultAppointmentDuration || 30} دقيقة
                  </p>
                )}
              </div>
              
              {/* الألوان */}
              <div className="space-y-4">
                <label className={labelClassName}>
                  <Palette size={16} className="text-gray-600" />
                  ألوان العيادة
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* اللون الأساسي */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">اللون الأساسي</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-12 h-11 rounded-xl border border-gray-300 cursor-pointer"
                        />
                        {/* <input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className={`${inputClassName} flex-1`}
                        /> */}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg shadow-sm border border-gray-300" 
                          style={{ backgroundColor: clinicData.settings?.primaryColor || '#007bff' }} 
                        />
                        <span className="text-gray-900 font-mono font-medium">
                          {clinicData.settings?.primaryColor || '#007bff'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* اللون الثانوي */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">اللون الثانوي</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          className="w-12 h-11 rounded-xl border border-gray-300 cursor-pointer"
                        />
                        {/* <input
                          type="text"
                          value={formData.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          className={`${inputClassName} flex-1`}
                        /> */}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-lg shadow-sm border border-gray-300" 
                          style={{ backgroundColor: clinicData.settings?.secondaryColor || '#6c757d' }} 
                        />
                        <span className="text-gray-900 font-mono font-medium">
                          {clinicData.settings?.secondaryColor || '#6c757d'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* العمود الأيسر */}
        <div className="space-y-6">
          {/* ساعات العمل */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                <Clock size={22} style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">ساعات العمل</h2>
            </div>
            
            <div className="space-y-2">
  {displayWorkingHours.map((wh) => {
    const dayInfo = DAYS_OF_WEEK.find(d => d.key === wh.day);
    return (
      <div 
        key={wh.day} 
        className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
          !wh.isClosed ? 'bg-gray-50 hover:bg-gray-100' : 'bg-red-50/50'
        }`}
      >
        {isEditing ? (
          <>
            <input
              type="checkbox"
              checked={!wh.isClosed}
              onChange={(e) => handleWorkingHourChange(wh.day, 'isClosed', !e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 cursor-pointer"
              style={{ accentColor: primaryColor }}
            />
            <span className="w-20 text-gray-900 font-medium">{dayInfo?.label}</span>
            
            {!wh.isClosed && (
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="time"
                  value={wh.start}
                  onChange={(e) => handleWorkingHourChange(wh.day, 'start', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-600 font-medium">-</span>
                <input
                  type="time"
                  value={wh.end}
                  onChange={(e) => handleWorkingHourChange(wh.day, 'end', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            
            {wh.isClosed && (
              <span className="text-red-600 text-sm font-medium flex-1">مغلق</span>
            )}
          </>
        ) : (
          <>
            <div className={`w-3 h-3 rounded-full ${!wh.isClosed ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="w-20 text-gray-900 font-medium">{dayInfo?.label}</span>
            <span className={`flex-1 font-medium ${!wh.isClosed ? 'text-gray-900' : 'text-red-600'}`}>
              {!wh.isClosed ? `${formatTimeTo12Hour(wh.start)} - ${formatTimeTo12Hour(wh.end)}` : 'مغلق'}
            </span>
          </>
        )}
      </div>
    );
  })}
</div>
          </div>
          
          {/* معلومات إضافية */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                <Hash size={22} style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">معلومات إضافية</h2>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className={labelClassName}>
                  <Hash size={16} className="text-gray-600" />
                  معرف العيادة
                </label>
                <p className="text-gray-900 font-mono text-sm bg-gray-50 p-4 rounded-xl break-all border border-gray-200">
                  {clinicData.id}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className={labelClassName}>
                  <Calendar size={16} className="text-gray-600" />
                  تاريخ الإنشاء
                </label>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-xl">
                  {clinicData.createdAt 
                    ? new Date(clinicData.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'غير محدد'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}