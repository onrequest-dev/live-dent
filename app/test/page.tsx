// components/DentalSVGLoader.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface DentalSVGLoaderProps {
  size?: number;
  primaryColor?: string;
  backgroundColor?: string;
  text?: string;
}

export default function DentalSVGLoader({
  size = 100,
  primaryColor = '#FFD700',
  backgroundColor = '#1A2A44',
  text = 'جاري التحميل...'
}: DentalSVGLoaderProps) {
  const [pathLength, setPathLength] = useState(0);

useEffect(() => {
  const path = document.getElementById('toothPath') as unknown as SVGPathElement;
  if (path) {
    setPathLength(path.getTotalLength?.() || 500);
  }
}, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 mt-80">
      <div className="relative" style={{ width: size, height: size * 1.2 }}>
        <svg
          viewBox="0 0 32 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* طبقة الخلفية */}
          <defs>
            {/* تدرج للمسار الذهبي */}
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#130842" />
              <stop offset="50%" stopColor="#130842" />
              <stop offset="100%" stopColor="#130842" />
            </linearGradient>
          </defs>

          {/* المسار الأساسي (الخافت) */}
          <path
            id="toothPath"
            d="M16 7.5c-1.432 -.781 -3.444 -2 -5.333 -2c-2.8 0 -5.334 1.663 -5.334 6.667c0 6.532 1.408 11.213 3.561 14.05c.764 1.008 2.627 .694 3.423 -.315c.53 -.673 1.092 -1.918 1.683 -3.735c.389 -.77 1.189 -1.505 2 -1.5c.803 0 1.613 .737 2 1.5c.591 1.817 1.152 3.062 1.683 3.735c.796 1.012 2.66 1.324 3.423 .316c2.153 -2.836 3.561 -7.517 3.561 -14.05c0 -4.987 -2.544 -6.667 -5.334 -6.667c-1.896 0 -3.896 1.216 -5.333 2z"
            stroke={backgroundColor}
            strokeWidth="1.5"
            fill="none"
            opacity="0.3"
          />

          {/* المسار الذهبي المتحرك */}
          <motion.path
            d="M16 7.5c-1.432 -.781 -3.444 -2 -5.333 -2c-2.8 0 -5.334 1.663 -5.334 6.667c0 6.532 1.408 11.213 3.561 14.05c.764 1.008 2.627 .694 3.423 -.315c.53 -.673 1.092 -1.918 1.683 -3.735c.389 -.77 1.189 -1.505 2 -1.5c.803 0 1.613 .737 2 1.5c.591 1.817 1.152 3.062 1.683 3.735c.796 1.012 2.66 1.324 3.423 .316c2.153 -2.836 3.561 -7.517 3.561 -14.05c0 -4.987 -2.544 -6.667 -5.334 -6.667c-1.896 0 -3.896 1.216 -5.333 2z"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0, pathOffset: 0 }}
            animate={{ 
              pathLength: [0, 0.3, 0.3, 0],
              pathOffset: [0, 0, 0.7, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.3, 0.7, 1],
            }}
            style={{
              strokeDasharray: pathLength,
              strokeDashoffset: 0,
            }}
          />

          {/* نقطة في مقدمة الشريط المتحرك */}
          <motion.circle
            r="1.5"
            fill={primaryColor}
            filter="url(#glow)"
            animate={{
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.3, 0.7, 1],
            }}
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href="#toothPath" />
            </animateMotion>
          </motion.circle>
        </svg>
      </div>
    </div>
  );
}