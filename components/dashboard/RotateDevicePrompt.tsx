// components/dashboard/RotateDevicePrompt.tsx
"use client";

import { motion } from "framer-motion";

interface RotateDevicePromptProps {
  onTryAutoRotate: () => void;
}

export function RotateDevicePrompt({ onTryAutoRotate }: RotateDevicePromptProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-sm w-full">
        {/* أيقونة الهاتف */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ rotate: 90 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
            className="relative"
            style={{ width: 80, height: 140 }}
          >
            {/* الإطار الخارجي */}
            <div className="absolute inset-0 bg-gray-800 rounded-2xl border-2 border-gray-600">
              {/* الكاميرا/النوتش */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1.5 bg-gray-600 rounded-full" />
              {/* زر الصفحة الرئيسية */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-gray-600 rounded-full" />
            </div>
            
            {/* الشاشة الداخلية */}
            <div className="absolute inset-1.5 bg-blue-50 rounded-xl overflow-hidden">
              {/* أيقونات الشاشة */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-blue-200 rounded-full" />
              <div className="absolute inset-x-3 top-6 space-y-1.5">
                <div className="h-1.5 bg-blue-200 rounded w-3/4" />
                <div className="h-1.5 bg-blue-200 rounded w-1/2" />
                <div className="h-1.5 bg-blue-200 rounded w-2/3" />
              </div>
              <div className="absolute bottom-3 inset-x-3">
                <div className="h-1.5 bg-blue-200 rounded w-full" />
              </div>
            </div>
          </motion.div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          يرجى تدوير الهاتف للوضع الأفقي
        </h2>
        
        <p className="text-gray-600 mb-6">
          هذه الواجهة مصممة للشاشات العريضة لعرض البيانات بشكل سليم
        </p>

        <button
          onClick={onTryAutoRotate}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-md"
        >
          محاولة التدوير التلقائي
        </button>

        <p className="text-xs text-gray-400 mt-4">
          إذا لم يعمل الزر، يرجى تدوير الهاتف يدوياً
        </p>
      </div>
    </div>
  );
}