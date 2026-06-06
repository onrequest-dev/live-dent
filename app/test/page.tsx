'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const ToothLoader = () => {
  const [isWaving, setIsWaving] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsWaving((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen w-full bg-white">
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        <svg
          viewBox="0 0 6000 6000"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* تعكس الرسمة رأساً على عقب لتصحيح الاتجاه */}
          <g transform="scale(1, -1) translate(0, -6000)">
            
            {/* السن الرئيسية */}
<path
  d="M1336 4749 c-65 -16 -153 -69 -202 -121 -117 -125 -139 -302 -59 -464 41 -83 97 -139 184 -181 51 -25 66 -28 166 -28 98 0 116 3 167 27 195 91 284 317 207 524 -31 83 -140 192 -224 224 -67 25 -179 35 -239 19z M3775 4749 c-99 -13 -234 -51 -377 -105 -115 -45 -129 -48 -218 -48 -85 0 -113 5 -271 52 -256 75 -306 85 -454 85 -155 1 -262 -22 -389 -82 -95 -44 -206 -125 -206 -149 0 -10 5 -46 10 -82 26 -183 -61 -370 -216 -462 -48 -29 -53 -36 -59 -77 -10 -67 -7 -316 5 -412 31 -250 96 -472 199 -678 l51 -101 0 -177 c0 -261 31 -449 115 -700 168 -506 458 -759 653 -570 75 73 121 171 177 382 77 285 88 322 116 384 61 134 148 201 263 201 77 0 129 -24 183 -83 72 -78 101 -153 177 -452 60 -239 89 -309 163 -402 40 -50 122 -93 177 -93 127 0 277 149 398 393 103 209 171 441 213 735 17 114 17 114 86 220 314 482 453 1125 334 1538 -89 305 -302 527 -604 630 -166 56 -352 75 -526 53z"
  fill="#0043fa6e"
/>

            {/* الدائرة الصغيرة */}
            <path
              d="M4808 2297 c-59 -23 -124 -64 -153 -99 -108 -128 -107 -307 1 -427 65 -72 129 -103 224 -109 131 -7 242 54 305 169 24 45 30 69 33 142 4 82 3 91 -27 152 -35 70 -87 122 -159 157 -56 27 -171 34 -224 15z"
              fill="#0043fa6e"
            />

{/* العيون المتحركة - داخل المجموعة المقلوبة */}
<g>
  {/* العين اليسرى */}
  <motion.circle
    cx="2650"
    cy="3820"
    r="350"
    fill="white"
    animate={{
      scaleY: [1, 1, 1, 0.05, 1, 1, 1, 1, 1, 1, 1, 1],
      x: [0, 5, -4, 0, 0, 5, -4, 0, 5, -4, 0, 0],
    }}
    transition={{
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
      times: [0, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    }}
  />
  
  {/* العين اليمنى */}
  <motion.circle
    cx="3650"
    cy="3820"
    r="350"
    fill="white"
    animate={{
      scaleY: [1, 1, 1, 0.05, 1, 1, 1, 1, 1, 1, 1, 1],
      x: [0, 5, -4, 0, 0, 5, -4, 0, 5, -4, 0, 0],
    }}
    transition={{
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
      times: [0, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    }}
  />
</g>

{/* عجلة تحميل محسنة */}
<motion.circle
  cx="1400"
  cy="4408"
  r="410"
  fill="none"
  stroke="#2558ff"
  strokeWidth="120"
  strokeDasharray="200 1200"  // زيادة طول الخط للوضوح
  strokeLinecap="round"
  animate={{
    rotate: 360,
  }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear',
  }}
  style={{
    transformOrigin: '1400px 4415px',  // تعديل نقطة الدوران لتطابق المركز
  }}
/>
            
          </g>
        </svg>

        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-gray-600 font-medium tracking-widest text-sm">
          جاري التحميل...
        </div>
      </div>
    </div>
  );
};

export default ToothLoader;