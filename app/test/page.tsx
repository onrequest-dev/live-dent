// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      {/* SVG سن بعيون حزينة مع 404 */}
      <div className="relative w-48 h-48 md:w-56 md:h-56 mb-8">
        <svg
          viewBox="0 0 6000 6000"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <g>
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

            {/* العيون بشكل هلال حزين - تم تعديل الدوران ليكون عمودي على الشاشة */}
            <g>
              {/* العين اليسرى - هلال حزين */}
              <path
                d="M2350 3820 Q2650 4000 2950 3820"
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="100"
                strokeLinecap="round"
                transform="rotate(200, 2650, 3820)"
              />

              {/* العين اليمنى - هلال حزين */}
              <path
                d="M3350 3820 Q3650 4000 3950 3820"
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="100"
                strokeLinecap="round"
                transform="rotate(160, 3650, 3820)"
              />
            </g>
            </g>
          </g>
        </svg>
      </div>
<h1 className="text-5xl md:text-9xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400"
    style={{ 
      WebkitTextStroke: '3px #3b82f6',
      textShadow: 'none'
    }}>
  404
</h1>
      <h2 className="text-2xl font-semibold text-blue-700 mb-3">
        الصفحة غير موجودة
      </h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها
      </p>

      {/* زر الرجوع للصفحة الرئيسية */}
      <a 
        href="/" 
        className="text-[#2558ff] px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-50 transition-all duration-300 inline-flex items-center gap-2"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        العودة للصفحة الرئيسية
      </a>
    </div>
  );
}