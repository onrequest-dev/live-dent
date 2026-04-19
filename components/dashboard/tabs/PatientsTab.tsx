// components/dashboard/tabs/PatientsTab.tsx
'use client';

import { useState, useMemo } from 'react';
import { Download, Calendar, ChevronLeft, ChevronRight, List } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Clinic, Patient, PatientCase, Session } from '@/types';

type ViewMode = 'day' | 'all';

// ✅ واجهة Props الجديدة
interface PatientsTabProps {
  clinicData: Clinic | null;
  patients: Patient[];
  patientCases: PatientCase[];
  sessions: Session[];
}

export function PatientsTab({ 
  clinicData, 
  patients, 
  patientCases, 
  sessions 
}: PatientsTabProps) {
  // ✅ استخدام البيانات الحقيقية
  const clinicColor = clinicData?.settings.primaryColor || '#8385da';
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // ✅ تجميع الجلسات حسب التاريخ باستخدام البيانات الحقيقية
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, Session[]> = {};
    
    sessions.forEach(session => {
      const dateKey = new Date(session.startTime).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });

    // ترتيب الجلسات داخل كل يوم حسب الوقت
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    return grouped;
  }, [sessions]);

  // ✅ جميع الجلسات مرتبة حسب التاريخ والوقت
  const allSessionsSorted = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const dateCompare = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      return dateCompare;
    });
  }, [sessions]);

  // التواريخ المتاحة
  const availableDates = useMemo(() => {
    return Object.keys(sessionsByDate).sort((a, b) => b.localeCompare(a));
  }, [sessionsByDate]);

  // الجلسات المعروضة حسب وضع العرض
  const displayedSessions = useMemo(() => {
    if (viewMode === 'day') {
      return sessionsByDate[selectedDate] || [];
    }
    return allSessionsSorted;
  }, [viewMode, selectedDate, sessionsByDate, allSessionsSorted]);

  // ✅ الحصول على بيانات المريض من البيانات الحقيقية
  const getPatientData = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  // تنسيق التاريخ للعرض
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // الحصول على اسم اليوم بالعربية
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  // تنسيق الوقت
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // استخراج التاريخ من كائن Date
  const getDateString = (date: Date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  // التنقل بين الأيام
  const goToPreviousDay = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex < availableDates.length - 1) {
      setSelectedDate(availableDates[currentIndex + 1]);
    }
  };

  const goToNextDay = () => {
    const currentIndex = availableDates.indexOf(selectedDate);
    if (currentIndex > 0) {
      setSelectedDate(availableDates[currentIndex - 1]);
    }
  };

  // ✅ تصدير جميع البيانات إلى Excel باستخدام البيانات الحقيقية
  const exportToExcel = () => {
    const clinicName = clinicData?.name || 'عيادة الأسنان';
    
    // إعداد بيانات التصدير
    const excelData: any[][] = [];
    
    // الصف الأول: اسم العيادة (دمج 11 عمود)
    excelData.push([clinicName]);
    
    // الصف الثاني: عناوين الأعمدة
    excelData.push([
      'اليوم', 
      'التاريخ', 
      'الاسم', 
      'الرقم', 
      'العمر', 
      'الجنس',
      'الجلسة', 
      'الوقت', 
      'التكلفة', 
      'المدفوع', 
      'الحالة'
    ]);
    
    // إضافة جميع الجلسات مرتبة حسب التاريخ
    allSessionsSorted.forEach(session => {
      const dateStr = getDateString(session.startTime);
      const dayName = getDayName(dateStr);
      const formattedDate = formatDisplayDate(dateStr);
      const patient = getPatientData(session.patientId);
      const isCompleted = session.isPaid;
      const genderArabic = patient?.gender === 'male' ? 'ذكر' : patient?.gender === 'female' ? 'أنثى' : '-';
      
      excelData.push([
        dayName,
        formattedDate,
        patient?.fullName || session.patientSnapshot?.name || '-',
        patient?.phone || session.patientSnapshot?.phone || '-',
        patient?.age || '-',
        genderArabic,
        session.plannedProcedure || session.performedProcedure || '-',
        formatTime(session.startTime),
        session.sessionCost || 0,
        session.isPaid ? session.sessionCost : 0,
        isCompleted ? 'مكتمل' : 'غير مكتمل'
      ]);
    });
    
    // إضافة صف ملخص في النهاية
    const totalCost = allSessionsSorted.reduce((sum, s) => sum + (s.sessionCost || 0), 0);
    const totalPaid = allSessionsSorted.reduce((sum, s) => sum + (s.isPaid ? s.sessionCost || 0 : 0), 0);
    
    excelData.push([]);
    excelData.push(['', '', '', '', '', '', '', '', 'الإجمالي:', totalCost, totalPaid, '']);
    
    // إنشاء ورقة العمل
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // دمج خلايا عنوان العيادة (11 عمود)
    const mergeRange = { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } };
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push(mergeRange);
    
    // تطبيق التنسيقات
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:K1');
    
    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        
        // تنسيق خلية عنوان العيادة (الصف 0)
        if (R === 0) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 18, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: clinicColor.replace('#', '') } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: 'DDDDDD' } },
              bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
              left: { style: 'thin', color: { rgb: 'DDDDDD' } },
              right: { style: 'thin', color: { rgb: 'DDDDDD' } }
            }
          };
        }
        
        // تنسيق صف العناوين (الصف 1)
        if (R === 1) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: clinicColor.replace('#', '') } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: 'DDDDDD' } },
              bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
              left: { style: 'thin', color: { rgb: 'DDDDDD' } },
              right: { style: 'thin', color: { rgb: 'DDDDDD' } }
            }
          };
        }
        
        // تنسيق خلايا الحالة (العمود 10 - K)
        if (R > 1 && excelData[R] && C === 10) {
          const statusValue = excelData[R][10];
          if (statusValue === 'مكتمل') {
            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              fill: { fgColor: { rgb: 'C8E6C9' } },
              font: { color: { rgb: '2E7D32' }, bold: true },
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          } else if (statusValue === 'غير مكتمل') {
            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              fill: { fgColor: { rgb: 'FFCDD2' } },
              font: { color: { rgb: 'C62828' }, bold: true },
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          }
        }
        
        // تنسيق صف الإجمالي
        if (excelData[R] && excelData[R][8] === 'الإجمالي:') {
          ws[cellAddress].s = {
            font: { bold: true, sz: 12 },
            fill: { fgColor: { rgb: 'F3F4F6' } },
            border: {
              top: { style: 'thin', color: { rgb: 'DDDDDD' } },
              bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
              left: { style: 'thin', color: { rgb: 'DDDDDD' } },
              right: { style: 'thin', color: { rgb: 'DDDDDD' } }
            }
          };
        }
        
        // إضافة حدود لجميع الخلايا التي تحتوي على بيانات
        if (R > 1 && excelData[R] && excelData[R].some(cell => cell !== '')) {
          if (!ws[cellAddress].s) {
            ws[cellAddress].s = {};
          }
          ws[cellAddress].s.border = {
            top: { style: 'thin', color: { rgb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
            left: { style: 'thin', color: { rgb: 'E5E7EB' } },
            right: { style: 'thin', color: { rgb: 'E5E7EB' } }
          };
        }
      }
    }
    
    // تعيين عرض الأعمدة
    ws['!cols'] = [
      { wch: 12 }, // اليوم
      { wch: 14 }, // التاريخ
      { wch: 25 }, // الاسم
      { wch: 16 }, // الرقم
      { wch: 8 },  // العمر
      { wch: 8 },  // الجنس
      { wch: 28 }, // الجلسة
      { wch: 12 }, // الوقت
      { wch: 12 }, // التكلفة
      { wch: 12 }, // المدفوع
      { wch: 14 }  // الحالة
    ];
    
    // تنسيق من اليمين لليسار
    ws['!rtl'] = true;
    
    XLSX.utils.book_append_sheet(wb, ws, 'جدول المرضى');
    
    // تصدير الملف
    const fileName = `جدول_المرضى_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ✅ عرض شاشة تحميل إذا لم تصل البيانات بعد
  if (!clinicData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: '#8385da', borderTopColor: 'transparent' }}
          />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* الهيدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">جدول المرضى</h1>
          <p className="text-gray-500 mt-1">
            {viewMode === 'all' 
              ? 'جميع الجلسات'
              : today.toLocaleDateString('ar-SA', { 
                  month: 'long', 
                  year: 'numeric' 
                })
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* تبديل وضع العرض */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar size={16} className="inline ml-1" />
              يوم محدد
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List size={16} className="inline ml-1" />
              عرض الكل
            </button>
          </div>
          
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 shadow-md"
            style={{ backgroundColor: clinicColor }}
          >
            <Download size={18} />
            <span>تحميل Excel</span>
          </button>
        </div>
      </div>

      {/* متصفح التاريخ - يظهر فقط في وضع اليوم المحدد */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousDay}
              disabled={availableDates.indexOf(selectedDate) === availableDates.length - 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ color: clinicColor }}
            >
              <ChevronRight size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              <Calendar size={20} style={{ color: clinicColor }} />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer text-gray-700"
                style={{ direction: 'rtl' }}
              >
                {availableDates.map(date => (
                  <option key={date} value={date}>
                    {getDayName(date)} - {formatDisplayDate(date)}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={goToNextDay}
              disabled={availableDates.indexOf(selectedDate) === 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ color: clinicColor }}
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>
      )}

      {/* إحصائيات سريعة في وضع الكل */}
      {viewMode === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">إجمالي الجلسات</p>
            <p className="text-2xl font-bold text-gray-800">{allSessionsSorted.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">إجمالي التكلفة</p>
            <p className="text-2xl font-bold text-gray-800">
              {allSessionsSorted.reduce((sum, s) => sum + (s.sessionCost || 0), 0)} ل.س
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">إجمالي المدفوع</p>
            <p className="text-2xl font-bold text-green-600">
              {allSessionsSorted.reduce((sum, s) => sum + (s.isPaid ? s.sessionCost || 0 : 0), 0)} ل.س 
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-sm text-gray-500">المتبقي</p>
            <p className="text-2xl font-bold text-red-600">
              {allSessionsSorted.reduce((sum, s) => sum + (s.sessionCost || 0), 0) - 
               allSessionsSorted.reduce((sum, s) => sum + (s.isPaid ? s.sessionCost || 0 : 0), 0)} ل.س
            </p>
          </div>
        </div>
      )}

      {/* جدول البيانات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* عنوان العيادة */}
        <div 
          className="py-4 px-6 text-center"
          style={{ backgroundColor: clinicColor }}
        >
          <h2 className="text-xl font-bold text-white">{clinicData.name}</h2>
          {viewMode === 'all' && (
            <p className="text-white/80 text-sm mt-1">جميع الجلسات</p>
          )}
        </div>
        
        {displayedSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">اليوم</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">الاسم</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">الرقم</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">العمر</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">الجنس</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">الجلسة</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">الوقت</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">التكلفة</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">المدفوع</th>
                  <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {displayedSessions.map((session, index) => {
                  const dateStr = getDateString(session.startTime);
                  const patient = getPatientData(session.patientId);
                  const isCompleted = session.isPaid;
                  const genderArabic = patient?.gender === 'male' ? 'ذكر' : patient?.gender === 'female' ? 'أنثى' : '-';
                  
                  return (
                    <tr 
                      key={session.id} 
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {getDayName(dateStr)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {formatDisplayDate(dateStr)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {patient?.fullName || session.patientSnapshot?.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600" dir="ltr">
                        {patient?.phone || session.patientSnapshot?.phone}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {patient?.age || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {genderArabic}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {session.plannedProcedure || session.performedProcedure || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatTime(session.startTime)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {session.sessionCost} ل.س
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {session.isPaid ? session.sessionCost : 0} ل.س 
                      </td>
                      <td className="py-3 px-4">
                        <span 
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isCompleted ? 'مكتمل' : 'غير مكتمل'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* ملخص */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  عدد الجلسات: {displayedSessions.length}
                </span>
                <div className="flex gap-6">
                  <span className="text-sm text-gray-600">
                    إجمالي التكلفة: {displayedSessions.reduce((sum, s) => sum + (s.sessionCost || 0), 0)} ل.س  
                  </span>
                  <span className="text-sm text-gray-600">
                    إجمالي المدفوع: {displayedSessions.reduce((sum, s) => sum + (s.isPaid ? s.sessionCost || 0 : 0), 0)} ل.س
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-400">لا توجد جلسات مجدولة</p>
          </div>
        )}
      </div>
    </div>
  );
}