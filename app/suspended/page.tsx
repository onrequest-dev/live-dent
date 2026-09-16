// app/suspended/page.tsx
import Link from 'next/link';

export default function SuspendedAccount() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      {/* SVG سن مع علامة استفهام */}
      <div className="mb-8">
        <svg
          viewBox="0 0 6000 6000"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full max-w-md"
        >
          <g transform="scale(1, -1) translate(0, -6000)">
            {/* السن الرئيسية */}
            <path
              d="M1336 4749 c-65 -16 -153 -69 -202 -121 -117 -125 -139 -302 -59 -464 41 -83 97 -139 184 -181 51 -25 66 -28 166 -28 98 0 116 3 167 27 195 91 284 317 207 524 -31 83 -140 192 -224 224 -67 25 -179 35 -239 19z M3775 4749 c-99 -13 -234 -51 -377 -105 -115 -45 -129 -48 -218 -48 -85 0 -113 5 -271 52 -256 75 -306 85 -454 85 -155 1 -262 -22 -389 -82 -95 -44 -206 -125 -206 -149 0 -10 5 -46 10 -82 26 -183 -61 -370 -216 -462 -48 -29 -53 -36 -59 -77 -10 -67 -7 -316 5 -412 31 -250 96 -472 199 -678 l51 -101 0 -177 c0 -261 31 -449 115 -700 168 -506 458 -759 653 -570 75 73 121 171 177 382 77 285 88 322 116 384 61 134 148 201 263 201 77 0 129 -24 183 -83 72 -78 101 -153 177 -452 60 -239 89 -309 163 -402 40 -50 122 -93 177 -93 127 0 277 149 398 393 103 209 171 441 213 735 17 114 17 114 86 220 314 482 453 1125 334 1538 -89 305 -302 527 -604 630 -166 56 -352 75 -526 53z"
              fill="#0043fa6e"
            />

            {/* الدائرة الصغيرة */}
            <path
              d="M4808 2297 c-59 -23 -124 -64 -153 -99 -108 -128 -107 -307 1 -427 65 -72 129 -103 224 -109 131 -7 242 54 305 169 24 45 30 69 33 142 4 82 3 91 -27 152 -35 70 -87 122 -159 157 -56 27 -171 34 -224 15z"
              fill="#f59e0b"
            />

            {/* العيون بشكل هلال حزين */}
            <g>
              {/* العين اليسرى */}
              <path
                d="M2350 3820 Q2650 4000 2950 3820"
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="100"
                strokeLinecap="round"
                transform="rotate(200, 2650, 3820)"
              />

              {/* العين اليمنى */}
              <path
                d="M3350 3820 Q3650 4000 3950 3820"
                fill="none"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="100"
                strokeLinecap="round"
                transform="rotate(160, 3650, 3820)"
              />
            </g>

            {/* ✅ علامة استفهام بدل X */}
{/* ✅ علامة استفهام - مدورة 180 درجة (مقلوبة) */}
<g transform="translate(1420, 4350) rotate(180)">
  {/* خلفية دائرية برتقالية */}
  <circle cx="0" cy="0" r="400" fill="#f59e0b" />

  {/* علامة الاستفهام */}
  <g fill="none" stroke="white" strokeWidth="90" strokeLinecap="round" strokeLinejoin="round">
    <path d="M -130 -180 Q -130 -320, 0 -320 Q 130 -320, 130 -180 Q 130 -60, 0 30" />
    <circle cx="0" cy="180" r="45" fill="white" stroke="none" />
  </g>
</g>
          </g>
        </svg>
      </div>

      {/* العنوان الرئيسي */}
      <h1 className="text-3xl font-bold text-blue-900 mb-3 text-center">
        حسابك موقوف مؤقتاً
      </h1>

      {/* السبب */}
      <h2 className="text-lg font-semibold text-amber-700 mb-5 text-center">
        نأسف لإبلاغك بأن حسابك متوقف عن العمل
      </h2>

      {/* التفاصيل */}
      <div className="max-w-md w-full bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm" dir='rtl'>
        <p className="text-sm text-gray-700 leading-relaxed text-center" dir='rtl'>
          قد يكون السبب:
        </p>
        <ul className="text-sm text-gray-600 leading-relaxed mt-2 space-y-1.5 text-right">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>عدم استخدام الحساب لفترة طويلة</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            <span>انتهاء صلاحية الاشتراك</span>
          </li>
        </ul>
      </div>

      {/* رسالة الإعتذار */}
      <p className="text-sm text-gray-600 mb-8 text-center max-w-md leading-relaxed">
        نعتذر عن أي إزعاج، يرجى التواصل مع خدمة العملاء لإعادة تفعيل حسابك
      </p>

      {/* ============ الأزرار ============ */}
<div className="flex flex-col sm:flex-row items-center gap-3">
  {/* زر خدمة العملاء */}
  <a
    href="https://wa.me/963982719525"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-500 text-emerald-700 hover:bg-emerald-50 transition-all duration-300 font-medium text-sm"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.498 2 2.017 6.477 2.012 11.984c-.001 1.76.46 3.478 1.335 4.992L2 21.991l5.172-1.356c1.46.796 3.104 1.215 4.828 1.216h.004c5.508 0 9.99-4.478 9.995-9.984.002-2.667-1.035-5.175-2.922-7.064zm-7.071 15.355h-.003c-1.507 0-2.985-.405-4.273-1.169l-.306-.181-3.069.805.819-2.991-.202-.32a8.268 8.268 0 0 1-1.267-4.439c.003-4.572 3.724-8.29 8.301-8.29 2.216.001 4.299.865 5.866 2.432a8.238 8.238 0 0 1 2.428 5.873c-.003 4.572-3.724 8.29-8.297 8.29zm4.551-6.208c-.25-.125-1.476-.728-1.705-.812-.229-.083-.396-.124-.562.125-.167.25-.647.812-.793.978-.146.167-.292.187-.542.062-.25-.124-1.054-.389-2.008-1.24-.742-.662-1.243-1.48-1.389-1.729-.146-.25-.015-.385.11-.509.112-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.021-.438-.062-.125-.562-1.355-.771-1.855-.203-.486-.409-.42-.562-.427-.144-.007-.308-.009-.473-.009-.166 0-.437.063-.666.313-.229.25-.874.854-.874 2.083s.895 2.416 1.02 2.583c.125.166 1.761 2.688 4.267 3.77.596.257 1.062.411 1.425.526.599.19 1.144.163 1.575.099.48-.072 1.476-.604 1.684-1.187.208-.583.208-1.083.146-1.187-.062-.104-.229-.167-.479-.292z" />
    </svg>
    <span>تواصل مع خدمة العملاء</span>
  </a>

  {/* ✅ زر إنشاء حساب جديد */}
  <Link
    href="/log-in"
    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-teal-500 text-teal-700 hover:bg-teal-50 transition-all duration-300 font-medium text-sm"
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
    <span>سجل الدخول من حساب آخر</span>
  </Link>
</div>
    </div>
  );
}