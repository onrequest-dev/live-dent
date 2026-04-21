// components/ui/EmptyState.tsx
// يعرض في حال عدم وجود بيانات
'use client';

import { motion } from 'framer-motion';

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[400px] p-6"
    >
      {/* رسم توضيحي - مجلد فارغ */}
      <div className="relative mb-6">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-300"
        >
          {/* ظل */}
          <ellipse cx="60" cy="95" rx="35" ry="6" fill="currentColor" opacity="0.15" />
          
          {/* الملف الخلفي */}
          <path
            d="M30 35C30 31.6863 32.6863 29 36 29H52L60 38H90C93.3137 38 96 40.6863 96 44V80C96 83.3137 93.3137 86 90 86H36C32.6863 86 30 83.3137 30 80V35Z"
            fill="white"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* الملف الأمامي */}
          <path
            d="M24 40C24 36.6863 26.6863 34 30 34H56L64 43H84C87.3137 43 90 45.6863 90 49V85C90 88.3137 87.3137 91 84 91H30C26.6863 91 24 88.3137 24 85V40Z"
            fill="white"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* خطوط داخل الملف */}
          <path
            d="M38 58H82"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M38 68H72"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
          <path
            d="M38 78H62"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* النص */}
      <h3 className="text-xl font-medium text-gray-700 mb-1">
        لا توجد بيانات
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        لم يتم العثور على أي بيانات للعرض حالياً
      </p>
    </motion.div>
  );
}