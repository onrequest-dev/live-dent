// components/dashboard/tabs/DoctorCVTab.tsx
'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Clinic } from '@/types';
import { updateProfile } from '@/client/helpers/clinic';

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
// Props
// ============================================================

interface DoctorCVTabProps {
  clinicData: Clinic | null;
  onProfileUpdate?: (updatedProfile: any) => void; // دالة لتحديث البيانات في المكون الأب
}

// ============================================================
// المكون الرئيسي
// ============================================================

export function DoctorCVTab({ clinicData, onProfileUpdate }: DoctorCVTabProps) {
  const primaryColor = clinicData?.settings.primaryColor || '#007bff';
  
  // حالات التعديل
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // بيانات النموذج - فقط الحقول الموجودة في DoctorProfile
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    about: '',
    contactEmail: '',
    graduationYear: '',
    university: '',
    photo: '',
  });
  
  // القوائم الديناميكية - تحويل من string[] إلى كائنات للتعديل
  const [education, setEducation] = useState<EducationEditItem[]>([]);
  const [experience, setExperience] = useState<ExperienceEditItem[]>([]);
  
  // صورة مؤقتة للرفع
  const [tempPhoto, setTempPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  // بيانات العرض المباشر (تتزامن مع formData)
  const [displayData, setDisplayData] = useState(formData);
  const [displayEducation, setDisplayEducation] = useState<string[]>([]);
  const [displayExperience, setDisplayExperience] = useState<string[]>([]);

  // ✅ تحميل البيانات الأولية
  useEffect(() => {
    if (clinicData?.doctorProfile) {
      const profile = clinicData.doctorProfile;
      
      const initialData = {
        fullName: profile.fullName || '',
        specialization: profile.specialization || '',
        about: profile.about || '',
        contactEmail: profile.contactEmail || '',
        graduationYear: profile.graduationYear?.toString() || '',
        university: profile.university || '',
        photo: profile.photo || '',
      };
      
      setFormData(initialData);
      setDisplayData(initialData);
      
      // تحويل المصفوفات النصية إلى كائنات مع id للتعديل
      const eduArray = profile.education || [];
      const expArray = profile.experience || [];
      
      setEducation(eduArray.map((edu, index) => ({
        id: `edu-${index}-${Date.now()}`,
        value: edu,
      })));
      setDisplayEducation(eduArray);
      
      setExperience(expArray.map((exp, index) => ({
        id: `exp-${index}-${Date.now()}`,
        value: exp,
      })));
      setDisplayExperience(expArray);
      
      setPhotoPreview(profile.photo || '');
    }
  }, [clinicData]);

  // ✅ إعادة تعيين رسالة الحفظ بعد 3 ثواني
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  // ✅ دالة تحديث العرض المباشر
  const updateDisplayData = (profileData: any) => {
    setDisplayData({
      fullName: profileData.fullName || '',
      specialization: profileData.specialization || '',
      about: profileData.about || '',
      contactEmail: profileData.contactEmail || '',
      graduationYear: profileData.graduationYear?.toString() || '',
      university: profileData.university || '',
      photo: profileData.photo || '',
    });
    setDisplayEducation(profileData.education || []);
    setDisplayExperience(profileData.experience || []);
    if (profileData.photo) {
      setPhotoPreview(profileData.photo);
    }
  };

  // ============================================================
  // معالجات التعديل
  // ============================================================

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempPhoto(file);
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      setHasChanges(true);
    }
  };

  // ============================================================
  // إدارة التعليم
  // ============================================================

  const addEducation = () => {
    setEducation(prev => [...prev, {
      id: `edu-${Date.now()}`,
      value: '',
    }]);
    setHasChanges(true);
  };

  const updateEducation = (id: string, value: string) => {
    setEducation(prev => prev.map(item => 
      item.id === id ? { ...item, value } : item
    ));
    setHasChanges(true);
  };

  const removeEducation = (id: string) => {
    setEducation(prev => prev.filter(item => item.id !== id));
    setHasChanges(true);
  };

  // ============================================================
  // إدارة الخبرات
  // ============================================================

  const addExperience = () => {
    setExperience(prev => [...prev, {
      id: `exp-${Date.now()}`,
      value: '',
    }]);
    setHasChanges(true);
  };

  const updateExperience = (id: string, value: string) => {
    setExperience(prev => prev.map(item => 
      item.id === id ? { ...item, value } : item
    ));
    setHasChanges(true);
  };

  const removeExperience = (id: string) => {
    setExperience(prev => prev.filter(item => item.id !== id));
    setHasChanges(true);
  };

  // ============================================================
  // حفظ التغييرات
  // ============================================================

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // ✅ تجهيز البيانات للإرسال - فقط الحقول الموجودة
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
        const photoUrl = await uploadPhoto(tempPhoto);
        if (photoUrl) {
          updatedProfile.photo = photoUrl;
        }
      }
      
      // ✅ إرسال البيانات إلى API
      console.log(updatedProfile)
      const result = await updateProfile(updatedProfile);
      if(!result.success) return // error 
      console.log(result)

      
      // ✅ تحديث العرض المباشر
      updateDisplayData(updatedProfile);
      
      // ✅ إعلام المكون الأب بالتحديث
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }
      
      setSaveMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح' });
      setIsEditing(false);
      setHasChanges(false);
      setTempPhoto(null);
      
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

  // ✅ دالة مساعدة لرفع الصورة
  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch('/api/v1/upload/photo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'فشل رفع الصورة');
      }
      
      return result.url;
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      return null;
    }
  };

  const handleCancel = () => {
    // إعادة تحميل البيانات الأصلية من displayData
    setFormData(displayData);
    setEducation(displayEducation.map((edu, index) => ({
      id: `edu-${index}-${Date.now()}`,
      value: edu,
    })));
    setExperience(displayExperience.map((exp, index) => ({
      id: `exp-${index}-${Date.now()}`,
      value: exp,
    })));
    setPhotoPreview(displayData.photo || '');
    setTempPhoto(null);
    setIsEditing(false);
    setHasChanges(false);
    setSaveMessage(null);
  };

  // ✅ عرض شاشة تحميل
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

  // استخدام بيانات العرض للواجهة
  const doctor = {
    ...displayData,
    education: displayEducation,
    experience: displayExperience,
    graduationYear: displayData.graduationYear ? parseInt(displayData.graduationYear) : undefined,
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
    isTextarea = false 
  }: { 
    label: string; 
    icon: any; 
    value: string; 
    onChange: (value: string) => void; 
    placeholder: string;
    type?: string;
    isTextarea?: boolean;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Icon size={16} className="text-gray-500" />
        {label}
      </label>
      {isTextarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent resize-none text-gray-800 placeholder:text-gray-400"
          style={{ '--tw-ring-color': primaryColor } as any}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent text-gray-800 placeholder:text-gray-400"
          style={{ '--tw-ring-color': primaryColor } as any}
        />
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* الهيدر مع أزرار التحكم */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">السيرة الذاتية للطبيب</h1>
          <p className="text-gray-500 mt-1">المعلومات المهنية والخبرات</p>
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
            {saveMessage.text}
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
                    alt={displayData.fullName || 'صورة الطبيب'}
                    fill
                    className="object-cover"
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
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Upload size={12} />
                  اضغط على الصورة للتغيير
                </p>
              )}
            </div>

            {/* المعلومات الأساسية */}
            <div className="mt-6 space-y-4">
              {isEditing ? (
                <>
                  <InputField
                    label="الاسم الكامل"
                    icon={User}
                    value={formData.fullName}
                    onChange={(val) => handleInputChange('fullName', val)}
                    placeholder="أدخل الاسم الكامل"
                  />
                  <InputField
                    label="التخصص"
                    icon={Stethoscope}
                    value={formData.specialization}
                    onChange={(val) => handleInputChange('specialization', val)}
                    placeholder="أدخل التخصص"
                  />
                  <InputField
                    label="نبذة عن الطبيب"
                    icon={FileText}
                    value={formData.about}
                    onChange={(val) => handleInputChange('about', val)}
                    placeholder="أكتب نبذة مختصرة عن الطبيب"
                    isTextarea
                  />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 text-center">
                    {doctor.fullName || 'الاسم غير محدد'}
                  </h2>
                  <p className="text-gray-600 text-center font-medium" style={{ color: primaryColor }}>
                    {doctor.specialization || 'التخصص غير محدد'}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {doctor.about || 'لا توجد نبذة'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* معلومات الاتصال والأكاديمية */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                <Mail size={18} className="text-gray-500" />
                معلومات الاتصال
              </h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <InputField
                    label="البريد الإلكتروني"
                    icon={Mail}
                    value={formData.contactEmail}
                    onChange={(val) => handleInputChange('contactEmail', val)}
                    placeholder="example@domain.com"
                    type="email"
                  />
                  <InputField
                    label="الجامعة"
                    icon={Building2}
                    value={formData.university}
                    onChange={(val) => handleInputChange('university', val)}
                    placeholder="اسم الجامعة"
                  />
                  <InputField
                    label="سنة التخرج"
                    icon={Calendar}
                    value={formData.graduationYear}
                    onChange={(val) => handleInputChange('graduationYear', val)}
                    placeholder="مثال: 2010"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {doctor.contactEmail && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail size={18} className="text-gray-500" />
                      <span dir="ltr" className="text-gray-700">{doctor.contactEmail}</span>
                    </div>
                  )}
                  {doctor.university && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Building2 size={18} className="text-gray-500" />
                      <span className="text-gray-700">{doctor.university}</span>
                    </div>
                  )}
                  {doctor.graduationYear && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Calendar size={18} className="text-gray-500" />
                      <span className="text-gray-700">سنة التخرج: {doctor.graduationYear}</span>
                    </div>
                  )}
                  {!doctor.contactEmail && !doctor.university && !doctor.graduationYear && (
                    <p className="text-gray-400 text-center py-4">لا توجد معلومات اتصال</p>
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
                <h3 className="font-semibold text-gray-800 text-lg">المؤهلات التعليمية</h3>
              </div>
              {isEditing && (
                <button
                  onClick={addEducation}
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
                      <label className="text-xs text-gray-500 mb-1 block">المؤهل التعليمي</label>
                      <input
                        type="text"
                        value={edu.value}
                        onChange={(e) => updateEducation(edu.id, e.target.value)}
                        placeholder="مثال: بكالوريوس طب وجراحة الفم والأسنان - جامعة الملك سعود"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent text-gray-800 placeholder:text-gray-400"
                        style={{ '--tw-ring-color': primaryColor } as any}
                      />
                    </div>
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {education.length === 0 && (
                  <p className="text-gray-400 text-center py-8 bg-gray-50 rounded-xl">
                    اضغط على <Plus size={16} className="inline" style={{ color: primaryColor }} /> لإضافة مؤهل تعليمي
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {doctor.education && doctor.education.length > 0 ? (
                  doctor.education.map((edu, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <GraduationCap size={20} className="text-gray-500 mt-0.5" />
                      <p className="text-gray-800">{edu}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8 bg-gray-50 rounded-xl">لا توجد مؤهلات تعليمية</p>
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
                <h3 className="font-semibold text-gray-800 text-lg">الخبرات المهنية</h3>
              </div>
              {isEditing && (
                <button
                  onClick={addExperience}
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
                      <label className="text-xs text-gray-500 mb-1 block">الخبرة المهنية</label>
                      <input
                        type="text"
                        value={exp.value}
                        onChange={(e) => updateExperience(exp.id, e.target.value)}
                        placeholder="مثال: استشاري تركيبات الأسنان - مستشفى الملك فيصل التخصصي (2010-2015)"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent text-gray-800 placeholder:text-gray-400"
                        style={{ '--tw-ring-color': primaryColor } as any}
                      />
                    </div>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {experience.length === 0 && (
                  <p className="text-gray-400 text-center py-8 bg-gray-50 rounded-xl">
                    اضغط على <Plus size={16} className="inline" style={{ color: primaryColor }} /> لإضافة خبرة مهنية
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {doctor.experience && doctor.experience.length > 0 ? (
                  doctor.experience.map((exp, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <Briefcase size={20} className="text-gray-500 mt-0.5" />
                      <p className="text-gray-800">{exp}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8 bg-gray-50 rounded-xl">لا توجد خبرات مهنية</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}