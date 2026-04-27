// components/dashboard/RotateDevicePrompt.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface RotateDevicePromptProps {
  onTryAutoRotate: () => void;
}

export function RotateDevicePrompt({ onTryAutoRotate }: RotateDevicePromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRotate = async () => {
    setIsLoading(true);
    await onTryAutoRotate();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4 text-center">
      {/* المحتوى كما هو */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-sm w-full"
      >
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

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          يرجى تدوير الجهاز للوضع الافقي
        </h2>
        
        <p className="text-gray-600 text-sm mb-5">
          هذه الواجهة مصممة لتعمل مع الشاشات العريضة
        </p>
        <p className="text-gray-600 text-sm mb-5">
          وذلك لضمان عرض البيانات بأوضح شكل ممكن
        </p>

        {/* <button
          onClick={handleRotate}
          disabled={isLoading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          {isLoading ? "جاري المحاولة..." : "🔄 محاولة التدوير التلقائي"}
        </button> */}

        <p className="text-xs text-gray-400 mt-4">
          قم بتفعل تدوير الشاشة واقلب الهاتف للوضع الافقي
        </p>
      </motion.div>
    </div>
  );
}