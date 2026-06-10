import React, { useState, useEffect } from "react";

const STORAGE_KEY = "live_dent_update_v2_shown";

const UpdateModal = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem(STORAGE_KEY);
    if (!alreadyShown) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch (e) {}
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.3s_ease]">
      {/* تعريف الحركات داخل نفس المكون (يمكن نقلها لملف CSS عام) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div
        dir="rtl"
        className="relative w-[90%] max-w-[380px] bg-white rounded-2xl p-5 pt-6 shadow-2xl animate-[slideUp_0.35s_ease-out]"
      >
        {/* زر الإغلاق */}
        <button
          onClick={handleDismiss}
          aria-label="إغلاق"
          className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full text-[#8e8e93] hover:bg-gray-100 transition-colors text-xl leading-none"
        >
          ✕
        </button>

        {/* العنوان والترحيب */}
        <h2 className="text-center text-lg font-bold leading-snug text-[#1c1c1e]">
          مرحباً مستخدمي{" "}
          <span className="text-blue-500 font-extrabold">Live-Dent</span> 🎉
        </h2>
        <p className="text-center text-sm text-gray-500 mt-1 mb-4">
          أهلاً بكم في النسخة الجديدة
        </p>

        {/* حاوية التحديثات */}
        <div className="bg-gray-100 rounded-xl p-3.5 mb-4">
          <h3 className="text-sm font-semibold text-[#1c1c1e] mb-2">
            التحديثات الحاصلة:
          </h3>
          <ul className="list-none p-0 m-0 space-y-1.5">
            <li className="flex items-start text-sm text-[#2c2c2e]">
              <span className="text-blue-500 font-bold ml-2">•</span>
              تعديل وتحسين شكل الواجهة في الهاتف وسطح المكتب
            </li>
            <li className="flex items-start text-sm text-[#2c2c2e]">
              <span className="text-blue-500 font-bold ml-2">•</span>
              إضافة صور أشعة للمريض
            </li>
            <li className="flex items-start text-sm text-[#2c2c2e]">
              <span className="text-blue-500 font-bold ml-2">•</span>
              إضافة شارت مخصص لكل مريض
            </li>
            <li className="flex items-start text-sm text-[#2c2c2e]">
              <span className="text-blue-500 font-bold ml-2">•</span>
              إضافة تقويم وأجندة
            </li>
          </ul>
        </div>

        {/* زر التأكيد */}
        <button
          onClick={handleDismiss}
          className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl text-base hover:bg-blue-600 transition-colors focus:outline-none"
        >
          حسناً، فهمت
        </button>
      </div>
    </div>
  );
};

export default UpdateModal;
