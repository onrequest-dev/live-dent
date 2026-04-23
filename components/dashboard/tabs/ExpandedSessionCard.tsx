// ExpandedSessionCard.tsx - النسخة النهائية مع الأيقونات على اليمين
import { X, Calendar, Clock, CreditCard, FileText, Tag, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpandedSessionCardProps {
  session: any;
  patient: any;
  onClose: () => void;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  formatCurrency: (amount: number) => string;
  primaryColor?: string;
  secondaryColor?: string;
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
  secondaryColor = '#6c757d',
  onEditSession,
  onDeleteSession,
}: ExpandedSessionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

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
        return { label: 'مجدول', color: '#F59E0B', bgColor: '#FEF3C7', textColor: '#92400E' };
      case 'completed':
        return { label: 'مكتملة', color: '#10B981', bgColor: '#D1FAE5', textColor: '#065F46' };
      case 'in-progress':
        return { label: 'قيد التنفيذ', color: '#3B82F6', bgColor: '#DBEAFE', textColor: '#1E40AF' };
      case 'cancelled':
        return { label: 'ملغية', color: '#EF4444', bgColor: '#FEE2E2', textColor: '#991B1B' };
      default:
        return { label: 'لم يحضر', color: '#6B7280', bgColor: '#F3F4F6', textColor: '#374151' };
    }
  };

  const statusInfo = getStatusInfo(session.status);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        style={{ 
          '--scrollbar-thumb': primaryColor,
          '--scrollbar-track': `${primaryColor}15`,
        } as any}
      >
        <motion.div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-details-title"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: ${primaryColor}15;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: ${primaryColor}40;
              border-radius: 10px;
              transition: background 0.2s;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${primaryColor}80;
            }
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: ${primaryColor}40 ${primaryColor}15;
            }
          `}</style>

          {/* Header مع الأيقونات على اليمين */}
          <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-5 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              {/* الجزء الأيسر - عنوان البطاقة */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all"
                  style={{ 
                    backgroundColor: `${primaryColor}15`, 
                    color: primaryColor 
                  }}
                >
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 id="session-details-title" className="text-lg font-bold text-gray-900">
                    تفاصيل الجلسة
                  </h3>
                  <p className="text-sm text-gray-600">
                    {patient.fullName}
                  </p>
                </div>
              </div>
              
              {/* الجزء الأيمن - أيقونات الإجراءات */}
              <div className="flex items-center gap-2">
                {onEditSession && (
                  <button
                    onClick={() => {
                      onEditSession(session);
                      onClose();
                    }}
                    className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:shadow-sm"
                    aria-label="تعديل الجلسة"
                    title="تعديل الجلسة"
                  >
                    <Edit size={18} className="text-gray-600" />
                  </button>
                )}
                {onDeleteSession && (
                  <button
                    onClick={() => {
                      onDeleteSession(session.id);
                      onClose();
                    }}
                    className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all hover:shadow-sm"
                    aria-label="حذف الجلسة"
                    title="حذف الجلسة"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:shadow-sm"
                  aria-label="إغلاق"
                  title="إغلاق"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Content - قابل للسكرول */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {/* معلومات الحالة والإجراء */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-4 border border-gray-200"
                   style={{ backgroundColor: `${primaryColor}05` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm"
                       style={{ color: primaryColor }}>
                    <AlertCircle size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">الحالة</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: statusInfo.color }}
                  />
                  <span 
                    className="text-base font-semibold"
                    style={{ color: statusInfo.textColor }}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl p-4 border border-gray-200"
                   style={{ backgroundColor: `${primaryColor}05` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm"
                       style={{ color: primaryColor }}>
                    <Tag size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">الإجراء</span>
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {session.performedProcedure || session.plannedProcedure || 'جلسة'}
                </p>
              </div>
            </div>

            {/* معلومات الوقت والتاريخ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-4 border border-gray-200"
                   style={{ backgroundColor: `${primaryColor}05` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"
                       style={{ color: primaryColor }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">التاريخ</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formatDate(session.startTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-4 border border-gray-200"
                   style={{ backgroundColor: `${primaryColor}05` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"
                       style={{ color: primaryColor }}>
                    <Clock size={20} />
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
            <div className="rounded-2xl p-5 border border-gray-200"
                 style={{ backgroundColor: `${primaryColor}05` }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm"
                     style={{ color: primaryColor }}>
                  <CreditCard size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700">تفاصيل الدفع</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200/60">
                  <span className="text-gray-600">إجمالي التكلفة</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(session.sessionCost)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200/60">
                  <span className="text-gray-600">حالة الدفع</span>
                  {session.isPaid ? (
                    <span 
                      className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                    >
                      ✓ تم الدفع
                    </span>
                  ) : (
                    <span 
                      className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ backgroundColor: '#FED7AA', color: '#9A3412' }}
                    >
                      ⚠ غير مدفوع
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">المبلغ المدفوع</span>
                  <span 
                    className="text-lg font-bold"
                    style={{ color: session.isPaid ? '#10B981' : '#F97316' }}
                  >
                    {formatCurrency(session.isPaid ? session.sessionCost : 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* ملاحظات إضافية */}
            {session.notes && (
              <div className="rounded-2xl p-5 border border-gray-200"
                   style={{ backgroundColor: `${primaryColor}05` }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm"
                       style={{ color: primaryColor }}>
                    <FileText size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">ملاحظات</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {session.notes}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}