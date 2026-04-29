// components/dashboard/tabs/DoctorCVTab.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Mail,
  GraduationCap,
  Briefcase,
  User,
  Calendar,
  Upload,
  Check,
  AlertCircle,
  Building2,
  Stethoscope,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Clinic } from '@/types';
import { updateProfile } from '@/client/helpers/clinic';
import { handleUploadImage } from '@/client/helpers/upload_image';

// ============================================================
// الواجهات الداخلية للمكون فقط (للتعديل)
// ============================================================

interface EducationEditItem {
  id: string;
  value: string;
}

interface ExperienceEditItem {
  id: string;
  value: string;
}

// ============================================================
// دوال مساعدة
// ============================================================

const createFormDataFromProfile = (profile: any) => ({
  fullName: profile?.fullName || '',
  specialization: profile?.specialization || '',
  about: profile?.about || '',
  contactEmail: profile?.contactEmail || '',
  graduationYear: profile?.graduationYear?.toString() || '',
  university: profile?.university || '',
  photo: profile?.photo || '',
});

const createEducationFromProfile = (profile: any): EducationEditItem[] => {
  const eduArray = profile?.education || [];
  return eduArray.map((edu: string, index: number) => ({
    id: `edu-${index}-${Date.now()}`,
    value: edu,
  }));
};

const createExperienceFromProfile = (profile: any): ExperienceEditItem[] => {
  const expArray = profile?.experience || [];
  return expArray.map((exp: string, index: number) => ({
    id: `exp-${index}-${Date.now()}`,
    value: exp,
  }));
};

// ============================================================
// Props
// ============================================================

interface DoctorCVTabProps {
  clinicData: Clinic | null;
  onProfileUpdate?: (updatedProfile: any) => void;
}

// ============================================================
// المكون الرئيسي
// ============================================================

export function DoctorCVTab({ clinicData, onProfileUpdate }: DoctorCVTabProps) {
  const primaryColor = clinicData?.settings?.primaryColor || '#007bff';
  
  // ✅ استخدام ref لتجنب إعادة التهيئة غير الضرورية
  const initializedRef = useRef(false);
  
  // حالات التعديل
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // ✅ تهيئة الحالة مرة واحدة فقط
  const [formData, setFormData] = useState(() => 
    createFormDataFromProfile(clinicData?.doctorProfile)
  );
  const [education, setEducation] = useState<EducationEditItem[]>(() => 
    createEducationFromProfile(clinicData?.doctorProfile)
  );
  const [experience, setExperience] = useState<ExperienceEditItem[]>(() => 
    createExperienceFromProfile(clinicData?.doctorProfile)
  );
  
  // صورة مؤقتة للرفع
  const [tempPhoto, setTempPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(clinicData?.doctorProfile?.photo || '');

  // ✅ تحديث البيانات فقط عند تغيير clinicData من الخارج ولسنا في وضع التعديل
  useEffect(() => {
    if (!clinicData?.doctorProfile) return;
    
    // إذا كانت هذه أول مرة، تجاهل التحديث
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    
    // تحديث البيانات فقط إذا لم نكن في وضع التعديل
    if (!isEditing) {
      const profile = clinicData.doctorProfile;
      setFormData(createFormDataFromProfile(profile));
      setEducation(createEducationFromProfile(profile));
      setExperience(createExperienceFromProfile(profile));
      setPhotoPreview(profile.photo || '');
      setTempPhoto(null);
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

  // ============================================================
  // معالجات التعديل
  // ============================================================

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => {
      if (prev[field as keyof typeof prev] === value) return prev;
      return { ...prev, [field]: value };
    });
    setHasChanges(true);
  }, []);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSaveMessage({ type: 'error', text: 'حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت' });
        return;
      }
      
      setTempPhoto(file);
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      setHasChanges(true);
    }
  }, []);

  // ============================================================
  // إدارة التعليم
  // ============================================================

  const addEducation = useCallback(() => {
    setEducation(prev => [...prev, {
      id: `edu-${Date.now()}`,
      value: '',
    }]);
    setHasChanges(true);
  }, []);

  const updateEducation = useCallback((id: string, value: string) => {
    setEducation(prev => prev.map(item => 
      item.id === id ? { ...item, value } : item
    ));
    setHasChanges(true);
  }, []);

  const removeEducation = useCallback((id: string) => {
    setEducation(prev => prev.filter(item => item.id !== id));
    setHasChanges(true);
  }, []);

  // ============================================================
  // إدارة الخبرات
  // ============================================================

  const addExperience = useCallback(() => {
    setExperience(prev => [...prev, {
      id: `exp-${Date.now()}`,
      value: '',
    }]);
    setHasChanges(true);
  }, []);

  const updateExperience = useCallback((id: string, value: string) => {
    setExperience(prev => prev.map(item => 
      item.id === id ? { ...item, value } : item
    ));
    setHasChanges(true);
  }, []);

  const removeExperience = useCallback((id: string) => {
    setExperience(prev => prev.filter(item => item.id !== id));
    setHasChanges(true);
  }, []);

  // ============================================================
  // دخول وإلغاء وضع التعديل
  // ============================================================

  const handleEdit = useCallback(() => {
    if (!clinicData?.doctorProfile) return;
    
    const profile = clinicData.doctorProfile;
    setFormData(createFormDataFromProfile(profile));
    setEducation(createEducationFromProfile(profile));
    setExperience(createExperienceFromProfile(profile));
    setPhotoPreview(profile.photo || '');
    setTempPhoto(null);
    setHasChanges(false);
    setSaveMessage(null);
    setIsEditing(true);
  }, [clinicData]);

  const handleCancel = useCallback(() => {
    if (!clinicData?.doctorProfile) return;
    
    const profile = clinicData.doctorProfile;
    setFormData(createFormDataFromProfile(profile));
    setEducation(createEducationFromProfile(profile));
    setExperience(createExperienceFromProfile(profile));
    setPhotoPreview(profile.photo || '');
    setTempPhoto(null);
    setHasChanges(false);
    setSaveMessage(null);
    setIsEditing(false);
  }, [clinicData]);

  // ============================================================
  // حفظ التغييرات
  // ============================================================

  const handleSave = async () => {
    if (!hasChanges || !clinicData) return;
    
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // ✅ تجهيز البيانات للإرسال
      const updatedProfile = {
        ...formData,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : undefined,
        education: education
          .filter(e => e.value.trim())
          .map(e => e.value.trim()),
        experience: experience
          .filter(e => e.value.trim())
          .map(e => e.value.trim()),
      };
      
      // ✅ رفع الصورة إذا تم تغييرها
      if (tempPhoto) {
        try {
          const photoUrl = await handleUploadImage(tempPhoto, "pfp", clinicData.id);
          if (photoUrl) {
            updatedProfile.photo = photoUrl;
          }
        } catch (uploadError) {
          console.error('خطأ في رفع الصورة:', uploadError);
          setSaveMessage({ type: 'error', text: 'فشل رفع الصورة. يرجى المحاولة مرة أخرى.' });
          setIsSaving(false);
          return;
        }
      }
      
      // ✅ إرسال البيانات إلى API
      const result = await updateProfile(updatedProfile);
      
      if (!result || !result.success) {
        throw new Error(result?.error || 'فشل حفظ التغييرات');
      }
      
      // ✅ إعلام المكون الأب بالتحديث
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
      
      setSaveMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح' });
      
      // الخروج من وضع التعديل
      setIsEditing(false);
      setHasChanges(false);
      setTempPhoto(null);
      
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

  // ✅ عرض شاشة تحميل
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
  const profile = clinicData.doctorProfile;
  const displayFormData = isEditing ? formData : createFormDataFromProfile(profile);
  const displayEducation = isEditing ? education.map(e => e.value).filter(Boolean) : (profile?.education || []);
  const displayExperience = isEditing ? experience.map(e => e.value).filter(Boolean) : (profile?.experience || []);

  // ✅ أنماط CSS للتأكد من ظهور النصوص
  const inputClassName = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 bg-white";
  const labelClassName = "flex items-center gap-2 text-sm font-medium text-gray-900";

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* الهيدر مع أزرار التحكم */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">السيرة الذاتية للطبيب</h1>
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
              تعديل الملف
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* العمود الأيسر - الصورة والمعلومات الأساسية */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
            {/* الصورة الشخصية */}
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-lg">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt={displayFormData.fullName || 'صورة الطبيب'}
                    fill
                    className="object-cover"
                    unoptimized={photoPreview.startsWith('blob:')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
                
                {isEditing && (
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Upload size={24} className="text-white" />
                  </label>
                )}
              </div>
              
              {isEditing && (
                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                  <Upload size={14} />
                  اضغط على الصورة للتغيير
                </p>
              )}
            </div>

            {/* المعلومات الأساسية */}
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className={labelClassName}>
                  <User size={16} className="text-gray-600" />
                  الاسم الكامل
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="أدخل الاسم الكامل"
                    className={inputClassName}
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900 text-center">
                    {profile?.fullName || 'الاسم غير محدد'}
                  </h2>
                )}
              </div>
              
              <div className="space-y-2">
                <label className={labelClassName}>
                  <Stethoscope size={16} className="text-gray-600" />
                  التخصص
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    placeholder="أدخل التخصص"
                    className={inputClassName}
                  />
                ) : (
                  <p className="text-gray-900 text-center font-medium" style={{ color: primaryColor }}>
                    {profile?.specialization || 'التخصص غير محدد'}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className={labelClassName}>
                  <FileText size={16} className="text-gray-600" />
                  نبذة عن الطبيب
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.about}
                    onChange={(e) => handleInputChange('about', e.target.value)}
                    placeholder="أكتب نبذة مختصرة عن الطبيب"
                    rows={4}
                    className={inputClassName}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-900 text-sm leading-relaxed">
                      {profile?.about || 'لا توجد نبذة'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* معلومات الاتصال والأكاديمية */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                <Mail size={18} className="text-gray-600" />
                معلومات الاتصال
              </h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={labelClassName}>
                      <Mail size={16} className="text-gray-600" />
                      البريد الإلكتروني او رقم الهاتف 
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="example@domain.com"
                      className={inputClassName}
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className={labelClassName}>
                      <Building2 size={16} className="text-gray-600" />
                      الجامعة
                    </label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => handleInputChange('university', e.target.value)}
                      placeholder="اسم الجامعة"
                      className={inputClassName}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className={labelClassName}>
                      <Calendar size={16} className="text-gray-600" />
                      سنة التخرج
                    </label>
                    <input
                      type="text"
                      value={formData.graduationYear}
                      onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                      placeholder="مثال: 2010"
                      className={inputClassName}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile?.contactEmail && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail size={18} className="text-gray-600" />
                      <span dir="ltr" className="text-gray-900">{profile.contactEmail}</span>
                    </div>
                  )}
                  {profile?.university && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Building2 size={18} className="text-gray-600" />
                      <span className="text-gray-900">{profile.university}</span>
                    </div>
                  )}
                  {profile?.graduationYear && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Calendar size={18} className="text-gray-600" />
                      <span className="text-gray-900">سنة التخرج: {String(profile.graduationYear)}</span>
                    </div>
                  )}
                  {!profile?.contactEmail && !profile?.university && !profile?.graduationYear && (
                    <p className="text-gray-500 text-center py-4">لا توجد معلومات اتصال</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* العمود الأيمن - التفاصيل المهنية */}
        <div className="lg:col-span-2 space-y-6">
          {/* التعليم */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                  <GraduationCap size={22} style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">المؤهلات التعليمية</h3>
              </div>
              {isEditing && (
                <button
                  onClick={addEducation}
                  type="button"
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  style={{ color: primaryColor }}
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-sm text-gray-700 mb-1 block">المؤهل التعليمي</label>
                      <input
                        type="text"
                        value={edu.value}
                        onChange={(e) => updateEducation(edu.id, e.target.value)}
                        placeholder="مثال: بكالوريوس طب وجراحة الفم والأسنان - جامعة الملك سعود"
                        className={inputClassName}
                      />
                    </div>
                    <button
                      onClick={() => removeEducation(edu.id)}
                      type="button"
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {education.length === 0 && (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                    اضغط على <Plus size={16} className="inline" style={{ color: primaryColor }} /> لإضافة مؤهل تعليمي
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {displayEducation.length > 0 ? (
                  displayEducation.map((edu, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <GraduationCap size={20} className="text-gray-600 mt-0.5" />
                      <p className="text-gray-900">{edu}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">لا توجد مؤهلات تعليمية</p>
                )}
              </div>
            )}
          </div>

          {/* الخبرات */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Briefcase size={22} style={{ color: primaryColor }} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">الخبرات المهنية</h3>
              </div>
              {isEditing && (
                <button
                  onClick={addExperience}
                  type="button"
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  style={{ color: primaryColor }}
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                {experience.map((exp) => (
                  <div key={exp.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-sm text-gray-700 mb-1 block">الخبرة المهنية</label>
                      <input
                        type="text"
                        value={exp.value}
                        onChange={(e) => updateExperience(exp.id, e.target.value)}
                        placeholder="مثال: استشاري تركيبات الأسنان - مستشفى الملك فيصل التخصصي (2010-2015)"
                        className={inputClassName}
                      />
                    </div>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      type="button"
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {experience.length === 0 && (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">
                    اضغط على <Plus size={16} className="inline" style={{ color: primaryColor }} /> لإضافة خبرة مهنية
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {displayExperience.length > 0 ? (
                  displayExperience.map((exp, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <Briefcase size={20} className="text-gray-600 mt-0.5" />
                      <p className="text-gray-900">{exp}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-xl">لا توجد خبرات مهنية</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}