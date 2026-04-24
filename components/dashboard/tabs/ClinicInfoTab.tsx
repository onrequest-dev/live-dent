// components/dashboard/tabs/ClinicInfoTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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
} from 'lucide-react';
import { Clinic } from '@/types';
import { updateClinic } from '@/client/helpers/clinic';
import { WorkingHours } from '@/types';
import { handleUploadImage } from '@/client/helpers/upload_image';

// ============================================================
// أيام الأسبوع (0 = السبت, 1 = الأحد, ... , 6 = الجمعة)
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
// الواجهات الداخلية للمكون فقط (للتعديل)
// ============================================================

interface WorkingHourEditItem {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start: string;
  end: string;
  isClosed: boolean;
}

// ============================================================
// دالة مساعدة لتطبيع ساعات العمل (تتعامل مع الكائن والمصفوفة)
// ============================================================

const normalizeWorkingHours = (workingHours: any): WorkingHours[] => {
  if (!workingHours) return [];
  
  // إذا كانت مصفوفة بالفعل
  if (Array.isArray(workingHours)) {
    return workingHours;
  }
  
  // إذا كانت كائن (مثل القادم من Supabase)
  if (typeof workingHours === 'object' && workingHours !== null) {
    return Object.values(workingHours);
  }
  
  return [];
};

// ============================================================
// دالة مساعدة لتحويل ساعات العمل إلى كائن للتخزين
// ============================================================

const workingHoursToObject = (workingHours: WorkingHourEditItem[]): Record<string, WorkingHourEditItem> => {
  const obj: Record<string, WorkingHourEditItem> = {};
  workingHours.forEach(wh => {
    obj[wh.day.toString()] = wh;
  });
  return obj;
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
  const primaryColor = clinicData?.settings?.primaryColor || '#007bff';
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    address: '',
    subscriptionStatus: '',
    defaultAppointmentDuration: 30,
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
  });
  
  const [workingHours, setWorkingHours] = useState<WorkingHourEditItem[]>([]);
  
  const [tempLogo, setTempLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // بيانات العرض المباشر
  const [displayData, setDisplayData] = useState(formData);
  const [displayWorkingHours, setDisplayWorkingHours] = useState<WorkingHourEditItem[]>([]);

  // ✅ تحميل البيانات الأولية
    useEffect(() => {
    if (clinicData) {
      const newFormData = {
        name: clinicData.name || '',
        logo: clinicData.logo || '',
        address: clinicData.address || '',
        subscriptionStatus: clinicData.subscriptionStatus || 'trial',
        defaultAppointmentDuration: clinicData.settings?.defaultAppointmentDuration || 30,
        primaryColor: clinicData.settings?.primaryColor || '#007bff',
        secondaryColor: clinicData.settings?.secondaryColor || '#6c757d',
      };

      // تحديث بيانات العرض المباشر (دائمًا)
      setDisplayData(newFormData);
      setLogoPreview(clinicData.logo || '');

      // تطبيع ساعات العمل للعرض
      const rawWorkingHours = clinicData.settings?.workingHours;
      const normalizedHours = normalizeWorkingHours(rawWorkingHours);
      const formattedHours: WorkingHourEditItem[] = DAYS_OF_WEEK.map(day => {
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
      setDisplayWorkingHours(formattedHours);

      // تحديث بيانات التعديل فقط إذا لم يكن في وضع التعديل
      if (!isEditing) {
        setFormData(newFormData);
        setWorkingHours(formattedHours);
      }
    }
  }, [clinicData, isEditing]);

  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  // ✅ دالة تحديث العرض المباشر
  const updateDisplayData = (updatedClinic: any) => {
    setDisplayData({
      name: updatedClinic.name || '',
      logo: updatedClinic.logo || '',
      address: updatedClinic.address || '',
      subscriptionStatus: updatedClinic.subscriptionStatus || 'trial',
      defaultAppointmentDuration: updatedClinic.settings?.defaultAppointmentDuration || 30,
      primaryColor: updatedClinic.settings?.primaryColor || '#007bff',
      secondaryColor: updatedClinic.settings?.secondaryColor || '#6c757d',
    });
    
    // تطبيع ساعات العمل من البيانات المحدثة
    const rawWorkingHours = updatedClinic.settings?.workingHours;
    const normalizedHours = normalizeWorkingHours(rawWorkingHours);
    
    const formattedHours: WorkingHourEditItem[] = DAYS_OF_WEEK.map(day => {
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
    
    setDisplayWorkingHours(formattedHours);
    if (updatedClinic.logo) {
      setLogoPreview(updatedClinic.logo);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempLogo(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
      setFormData(prev => ({ ...prev, logo: preview }));
      setHasChanges(true);
    }
  };

  const handleWorkingHourChange = (dayKey: number, field: keyof WorkingHourEditItem, value: string | boolean) => {
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
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // تحويل workingHours إلى المصفوفة للإرسال
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
          ...clinicData?.settings,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          defaultAppointmentDuration: formData.defaultAppointmentDuration,
          workingHours: workingHoursToSend, // نرسل كمصفوفة
        },
      };
      
      let finalLogo = formData.logo;
      if (tempLogo) {
        const logoUrl = await handleUploadImage(tempLogo, 'logo', clinicData?.id);
        if (logoUrl) {
          finalLogo = logoUrl;
          updatedClinic.logo = logoUrl;
        }
      }
      
      const result = await updateClinic(updatedClinic);
      
      // تحديث العرض المباشر
      const updatedFullClinic = {
        ...clinicData,
        ...updatedClinic,
        logo: finalLogo,
      };
      updateDisplayData(updatedFullClinic);
      
      // إعلام المكون الأب بالتحديث
      if (onClinicUpdate) {
        onClinicUpdate(updatedFullClinic);
      }
      
      setSaveMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح' });
      setIsEditing(false);
      setHasChanges(false);
      setTempLogo(null);
      
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      setSaveMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'فشل حفظ التغييرات' 
      });
    } finally {
      setIsSaving(false);
    }
  };



  const handleCancel = () => {
    // إعادة تحميل البيانات من displayData
    setFormData(displayData);
    setWorkingHours(displayWorkingHours);
    setLogoPreview(displayData.logo || '');
    setTempLogo(null);
    setIsEditing(false);
    setHasChanges(false);
    setSaveMessage(null);
  };

  // ============================================================
  // مكون حقل الإدخال مع العنوان
  // ============================================================
  const InputField = ({ 
    label, 
    icon: Icon, 
    value, 
    onChange, 
    placeholder, 
    type = 'text',
    isTextarea = false,
    min,
    max,
    step,
  }: { 
    label: string; 
    icon: any; 
    value: string | number; 
    onChange: (value: any) => void; 
    placeholder: string;
    type?: string;
    isTextarea?: boolean;
    min?: number;
    max?: number;
    step?: number;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Icon size={16} className="text-gray-500" />
        {label}
      </label>
      {isTextarea ? (
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent resize-none text-gray-800 placeholder:text-gray-400"
          style={{ '--tw-ring-color': primaryColor } as any}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseInt(e.target.value) : e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent text-gray-800 placeholder:text-gray-400"
          style={{ '--tw-ring-color': primaryColor } as any}
        />
      )}
    </div>
  );

  if (!clinicData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
               style={{ borderColor: '#007bff', borderTopColor: 'transparent' }} />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const getSubscriptionStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'نشط',
      'trial': 'تجريبي',
      'expired': 'منتهي',
      'cancelled': 'ملغي',
      'pending': 'قيد الانتظار',
    };
    return statusMap[status] || status;
  };

  const getSubscriptionStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'trial': 'bg-blue-100 text-blue-800 border-blue-200',
      'expired': 'bg-red-100 text-red-800 border-red-200',
      'cancelled': 'bg-gray-100 text-gray-800 border-gray-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">معلومات العيادة</h1>
          <p className="text-gray-500 mt-1">إعدادات العيادة ومعلومات الاتصال</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
              >
                <X size={18} />
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all disabled:opacity-50 font-medium shadow-sm hover:shadow-md"
                style={{ backgroundColor: primaryColor }}
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
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90 font-medium shadow-sm hover:shadow-md"
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
            {saveMessage.text}
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
              <h2 className="text-xl font-semibold text-gray-800">المعلومات الأساسية</h2>
            </div>
            
            <div className="space-y-5">
              {/* الشعار */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building2 size={16} className="text-gray-500" />
                  شعار العيادة
                </label>
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300">
                    {logoPreview ? (
                      logoPreview.startsWith('/') || logoPreview.startsWith('http') || logoPreview.startsWith('blob:') ? (
                        <Image
                          src={logoPreview}
                          alt="شعار العيادة"
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          {logoPreview}
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
                      <input
                        type="text"
                        value={formData.logo}
                        onChange={(e) => handleInputChange('logo', e.target.value)}
                        placeholder="أو أدخل رمز تعبيري (🦷)"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent text-gray-800 placeholder:text-gray-400"
                        style={{ '--tw-ring-color': primaryColor } as any}
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Upload size={12} />
                        يمكنك رفع صورة أو إدخال رمز تعبيري
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* اسم العيادة */}
              {isEditing ? (
                <InputField
                  label="اسم العيادة"
                  icon={Store}
                  value={formData.name}
                  onChange={(val) => handleInputChange('name', val)}
                  placeholder="أدخل اسم العيادة"
                />
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Store size={16} className="text-gray-500" />
                    اسم العيادة
                  </label>
                  <p className="text-gray-800 font-medium text-lg">{displayData.name}</p>
                </div>
              )}
              
              {/* العنوان */}
              {isEditing ? (
                <InputField
                  label="العنوان"
                  icon={MapPin}
                  value={formData.address}
                  onChange={(val) => handleInputChange('address', val)}
                  placeholder="أدخل عنوان العيادة"
                  isTextarea
                />
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin size={16} className="text-gray-500" />
                    العنوان
                  </label>
                  <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                    {displayData.address || 'غير محدد'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* الإعدادات */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                <Settings size={22} style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">الإعدادات</h2>
            </div>
            
            <div className="space-y-5">
              {/* حالة الاشتراك */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <CreditCard size={16} className="text-gray-500" />
                  حالة الاشتراك
                </label>
                <p className="text-gray-600">
                  <span className={`inline-flex px-4 py-2 rounded-xl text-sm font-medium border ${getSubscriptionStatusColor(displayData.subscriptionStatus)}`}>
                    {getSubscriptionStatusText(displayData.subscriptionStatus)}
                  </span>
                </p>
              </div>
              
              {/* مدة الموعد */}
              {isEditing ? (
                <InputField
                  label="مدة الموعد الافتراضية (دقيقة)"
                  icon={Timer}
                  value={formData.defaultAppointmentDuration}
                  onChange={(val) => handleInputChange('defaultAppointmentDuration', val)}
                  placeholder="30"
                  type="number"
                  min={15}
                  max={120}
                  step={15}
                />
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Timer size={16} className="text-gray-500" />
                    مدة الموعد الافتراضية
                  </label>
                  <p className="text-gray-700 bg-gray-50 rounded-xl p-3 inline-block">
                    {displayData.defaultAppointmentDuration} دقيقة
                  </p>
                </div>
              )}
              
              {/* الألوان */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Palette size={16} className="text-gray-500" />
                  ألوان العيادة
                </label>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* اللون الأساسي */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">اللون الأساسي</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-12 h-11 rounded-xl border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-gray-800"
                          style={{ '--tw-ring-color': primaryColor } as any}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: displayData.primaryColor }} />
                        <span className="text-gray-700 font-mono">{displayData.primaryColor}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* اللون الثانوي */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">اللون الثانوي</label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          className="w-12 h-11 rounded-xl border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.secondaryColor}
                          onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-xl text-gray-800"
                          style={{ '--tw-ring-color': primaryColor } as any}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg shadow-sm" style={{ backgroundColor: displayData.secondaryColor }} />
                        <span className="text-gray-700 font-mono">{displayData.secondaryColor}</span>
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
              <h2 className="text-xl font-semibold text-gray-800">ساعات العمل</h2>
            </div>
            
            <div className="space-y-2">
              {(isEditing ? workingHours : displayWorkingHours).map((wh) => {
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
                          className="w-5 h-5 rounded border-gray-300"
                          style={{ accentColor: primaryColor }}
                        />
                        <span className="w-20 text-gray-800 font-medium">{dayInfo?.label}</span>
                        
                        {!wh.isClosed && (
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="time"
                              value={wh.start}
                              onChange={(e) => handleWorkingHourChange(wh.day, 'start', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800"
                            />
                            <span className="text-gray-400 font-medium">-</span>
                            <input
                              type="time"
                              value={wh.end}
                              onChange={(e) => handleWorkingHourChange(wh.day, 'end', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-xl text-sm text-gray-800"
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
                        <span className="w-20 text-gray-800 font-medium">{dayInfo?.label}</span>
                        <span className={`flex-1 font-medium ${!wh.isClosed ? 'text-gray-700' : 'text-red-600'}`}>
                          {!wh.isClosed ? `${wh.start} - ${wh.end}` : 'مغلق'}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            
            {isEditing && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-800 flex items-center gap-2">
                  <Clock size={14} />
                  الأوقات بنظام 24 ساعة - الأيام المغلقة ستكون 00:00 - 00:00
                </p>
              </div>
            )}
          </div>
          
          {/* معلومات إضافية */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                <Hash size={22} style={{ color: primaryColor }} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">معلومات إضافية</h2>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Hash size={16} className="text-gray-500" />
                  معرف العيادة
                </label>
                <p className="text-gray-700 font-mono text-sm bg-gray-50 p-4 rounded-xl break-all border border-gray-200">
                  {clinicData.id}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar size={16} className="text-gray-500" />
                  تاريخ الإنشاء
                </label>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">
                  {clinicData.createdAt 
                    ? new Date(clinicData.createdAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
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