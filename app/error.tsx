// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      {/* SVG سن مكسور بعيون حزينة */}
      <div className="mb-8 text-gray-500">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="140" 
          height="140" 
          viewBox="0 0 32 32" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* السن الأساسي */}
          <path d="M16 7.5c-1.432 -.781 -3.444 -2 -5.333 -2c-2.8 0 -5.334 1.663 -5.334 6.667c0 6.532 1.408 11.213 3.561 14.05c.764 1.008 2.627 .694 3.423 -.315c.53 -.673 1.092 -1.918 1.683 -3.735c.389 -.77 1.189 -1.505 2 -1.5c.803 0 1.613 .737 2 1.5c.591 1.817 1.152 3.062 1.683 3.735c.796 1.012 2.66 1.324 3.423 .316c2.153 -2.836 3.561 -7.517 3.561 -14.05c0 -4.987 -2.544 -6.667 -5.334 -6.667c-1.896 0 -3.896 1.216 -5.333 2z" />
          
          {/* خط الكسر */}
          <path d="M16 7.5l1.333 3.333l-2.666 2.667l2.666 2.666" />
          
          {/* العين اليسرى - حزينة */}
          <circle cx="11" cy="15" r="1.5" fill="currentColor" stroke="none" />
          
          {/* حاجب العين اليسرى - مائل للحزن */}
          <path d="M9 13.5 L12.5 13" stroke="currentColor" strokeWidth="1.2" fill="none" />
          
          {/* العين اليمنى - حزينة */}
          <circle cx="19" cy="15" r="1.5" fill="currentColor" stroke="none" />
          
          {/* حاجب العين اليمنى - مائل للحزن */}
          <path d="M18 13 L21.5 13.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
          
          {/* فم حزين */}
          <path d="M13 20 Q15 18.5 17 20" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-semibold text-red-600 mb-3">
        عذراً، حدث خطأ ما
      </h1>
      
      <p className="text-gray-600 mb-8 text-center">
        يرجى المحاولة مرة أخرى لاحقاً
      </p>
      
      <button
        onClick={reset}
        className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium shadow-sm"
      >
        حاول مرة أخرى
      </button>
    </div>
  );
}