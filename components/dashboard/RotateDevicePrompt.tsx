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
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: [0, 90] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 0.8,
              ease: "easeInOut"
            }}
          >
            <svg className="w-28 h-28 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M12 3v18M3 12h18M9 3v2m6-2v2M9 19v2m6-2v2M5 7h14M5 11h14M5 15h14" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M15 9l-3-3-3 3m3-3v6" />
            </svg>
          </motion.div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          يرجى تدوير الجهاز
        </h2>
        
        <p className="text-gray-600 text-sm mb-5">
          قم بتدوير هاتفك إلى الوضع الأفقي للحصول على أفضل تجربة
        </p>

        <button
          onClick={handleRotate}
          disabled={isLoading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          {isLoading ? "جاري المحاولة..." : "🔄 محاولة التدوير التلقائي"}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          يمكنك أيضاً تدوير الهاتف يدوياً
        </p>
      </motion.div>
    </div>
  );
}