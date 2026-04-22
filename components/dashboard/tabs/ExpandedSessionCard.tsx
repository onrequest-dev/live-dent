// ExpandedSessionCard.tsx - مكون البطاقة الموسعة
import { X, Calendar, Clock, User, CreditCard, FileText, Tag, AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ExpandedSessionCardProps {
  session: any; // استبدل بالنوع المناسب
  patient: any; // استبدل بالنوع المناسب
  onClose: () => void;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  formatCurrency: (amount: number) => string;
  primaryColor?: string;
  onEditSession?: (session: any) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export function ExpandedSessionCard({
  session,
  patient,
  onClose,
  formatDate,
  formatTime,
  formatCurrency,
  primaryColor = '#3B82F6',
  onEditSession,
  onDeleteSession,
}: ExpandedSessionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // إغلاق البطاقة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // إغلاق عند الضغط على Escape
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { label: 'مجدول', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400' };
      case 'completed':
        return { label: 'مكتملة', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' };
      case 'in-progress':
        return { label: 'قيد التنفيذ', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' };
      case 'cancelled':
        return { label: 'ملغية', color: 'bg-red-100 text-red-800', dot: 'bg-red-500' };
      default:
        return { label: 'لم يحضر', color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-400' };
    }
  };

  const statusInfo = getStatusInfo(session.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        ref={cardRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${statusInfo.color} flex items-center justify-center`}>
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  تفاصيل الجلسة
                </h3>
                <p className="text-sm text-gray-500">
                  {patient.fullName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* معلومات الحالة والإجراء */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <AlertCircle size={18} className="text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">الحالة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusInfo.dot}`} />
                <span className={`text-lg font-semibold ${statusInfo.color.split(' ')[1]}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <Tag size={18} className="text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">الإجراء</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {session.performedProcedure || session.plannedProcedure || 'جلسة'}
              </p>
            </div>
          </div>

          {/* معلومات الوقت والتاريخ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <Calendar size={20} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">التاريخ</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(session.startTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                  <Clock size={20} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">الوقت</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatTime(session.startTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات الدفع */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <CreditCard size={18} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">تفاصيل الدفع</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">إجمالي التكلفة</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(session.sessionCost)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">حالة الدفع</span>
                {session.isPaid ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    ✓ تم الدفع
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    ⚠ غير مدفوع
                  </span>
                )}
              </div>

              {session.isPaid ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">المبلغ المدفوع</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(session.sessionCost)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">المبلغ المدفوع</span>
                  <span className="text-lg font-bold text-orange-500">
                    {formatCurrency(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ملاحظات إضافية إن وجدت */}
          {session.notes && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <FileText size={18} className="text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">ملاحظات</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {session.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer - أزرار الإجراءات */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-end gap-3">
            {onEditSession && (
              <button
                onClick={() => {
                  onEditSession(session);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium
                         hover:bg-gray-50 transition-colors"
              >
                تعديل الجلسة
              </button>
            )}
            {onDeleteSession && (
              <button
                onClick={() => {
                  onDeleteSession(session.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium
                         hover:bg-red-100 transition-colors"
              >
                حذف الجلسة
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-white font-medium transition-colors"
              style={{ background: primaryColor }}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}