// components/LiveDentSubscriptionForm.tsx
'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { User, Building2, Phone, ArrowRight, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

// ============================================================
// دالة إرسال رسالة إلى تلغرام (تستخدم متغيرات بيئة Vercel)
// ============================================================

async function sendTelegramMessage(message: string): Promise<{ success: boolean; error?: string; messageId?: number }> {
  try {
    // استخدام متغيرات البيئة من Vercel أو المتغيرات المحلية
    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!token) {
      throw new Error('Telegram token is not configured');
    }

    if (!chatId) {
      throw new Error('Chat ID is not configured');
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.description || 'Failed to send message');
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// المكون الرئيسي
// ============================================================

interface LiveDentSubscriptionFormProps {
  primaryColor?: string;
  logo?: string;
}

function LiveDentSubscriptionForm({ 
  primaryColor = '#FFD700',
  logo
}: LiveDentSubscriptionFormProps) {
  const [doctorName, setDoctorName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'doctorName' | 'clinicName' | 'whatsapp' | null>(null);

  // تنظيف رقم الواتساب
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // التحقق من صحة المدخلات
      if (!doctorName.trim()) {
        throw new Error('يرجى إدخال اسم الطبيب');
      }
      if (!clinicName.trim()) {
        throw new Error('يرجى إدخال اسم العيادة');
      }
      if (!whatsapp.trim()) {
        throw new Error('يرجى إدخال رقم الواتساب');
      }

      const cleanPhone = cleanPhoneNumber(whatsapp);
      if (cleanPhone.length < 9) {
        throw new Error('رقم الواتساب غير صحيح');
      }
      // إنشاء رابط واتساب مباشر
const whatsappMessage = `أهلاً وسهلاً د. ${doctorName} 🌹\n\nلقد قمت بطلب حجز لنظام LiveDent 🦷\n\nسنقوم بإرسال بيانات التسجيل بأسرع وقت \n\n\n شكراً لثقتك بنا`;
const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;
      // رسالة تلغرام للإدارة
      const telegramMessage = `
🦷 <b>طلب اشتراك جديد - LiveDent</b>

━━━━━━━━━━━━━━━━━━━━━━

<b>👨‍⚕️ الطبيب:</b> د. ${doctorName}
<b>🏥 العيادة:</b> ${clinicName}
<b>📱 رقم الواتساب:</b> ${whatsapp}

📅 <b>تاريخ الطلب:</b> ${new Date().toLocaleString('ar-SA', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})}

<b>🔗 رابط التواصل المباشر:</b>
${whatsappLink}

━━━━━━━━━━━━━━━━━━━━━━

<i>تم الإرسال من صفحة طلب الاشتراك</i>
      `;

      // إرسال إلى تلغرام فقط
      const result = await sendTelegramMessage(telegramMessage);

      if (result.success) {
        setSuccess(true);
        // إعادة تعيين الحقول
        setDoctorName('');
        setClinicName('');
        setWhatsapp('');
      } else {
        throw new Error(result.error || 'فشل في إرسال الطلب');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 100,
        damping: 10
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0, rotateY: 10 },
    visible: {
      scale: 1,
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.6,
      },
    },
  };

  // تحويل لون primary إلى rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1628] relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-tl from-yellow-400 to-amber-600 rounded-full blur-3xl" />
      </div>

      {/* Gradient Corners */}
      <div 
        className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${hexToRgba(primaryColor, 0.15)} 0%, ${hexToRgba(primaryColor, 0.05)} 40%, transparent 70%)`
        }}
      />
      <div 
        className="absolute top-0 left-0 w-40 h-40 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.3)} 0%, transparent 100%)`,
          clipPath: 'polygon(0 0, 100% 0, 0 100%)'
        }}
      />
      
      <div 
        className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 100%, ${hexToRgba(primaryColor, 0.15)} 0%, ${hexToRgba(primaryColor, 0.05)} 40%, transparent 70%)`
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
        style={{
          background: `linear-gradient(315deg, ${hexToRgba(primaryColor, 0.3)} 0%, transparent 100%)`,
          clipPath: 'polygon(100% 100%, 0 100%, 100% 0)'
        }}
      />

      {/* Shimmer Effects */}
      <motion.div
        className="absolute top-0 left-0 w-0.5 h-32"
        style={{ backgroundImage: `linear-gradient(to bottom, ${primaryColor}, transparent)` }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 left-0 w-32 h-0.5"
        style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, transparent)` }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      
      <motion.div
        className="absolute bottom-0 right-0 w-0.5 h-32"
        style={{ backgroundImage: `linear-gradient(to top, ${primaryColor}, transparent)` }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-32 h-0.5"
        style={{ backgroundImage: `linear-gradient(to left, ${primaryColor}, transparent)` }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Logo/Header */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              className="inline-flex items-center justify-center mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-28 h-28">
                {logo ? (
                  <Image
                    src={logo}
                    alt="LiveDent"
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/30"
                  >
                    <span className="text-4xl font-bold text-white">LD</span>
                  </div>
                )}
              </div>
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 mb-3 tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              LiveDent
            </motion.h1>
            <motion.p
              className="text-lg font-medium text-yellow-400 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              نظام إدارة عيادات الأسنان
            </motion.p>
            <motion.p
              className="text-white/70 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              سجل الآن واحصل على نظام متكامل لإدارة عيادتك
            </motion.p>
          </motion.div>

          {/* Subscription Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#0F1F35] backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-500/20 p-6 sm:p-8"
          >
            {success ? (
              // Success Message
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30"
                >
                  <CheckCircle2 size={48} className="text-white" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">تم استلام طلبك بنجاح! </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    سنقوم بالتواصل معك قريباً عبر الواتساب
                    <br />
                    لتأكيد الحجز وإرسال بيانات التسجيل
                  </p>
                </div>
                <motion.button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 rounded-xl text-sm font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  تقديم طلب جديد
                </motion.button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Doctor Name Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-white text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-yellow-400" />
                    اسم الطبيب
                  </label>
                  <div
                    className={`relative transition-all duration-300 ${
                      focusedField === 'doctorName' ? 'transform scale-[1.02]' : ''
                    }`}
                  >
                    <User
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                        focusedField === 'doctorName' ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="أدخل اسم الطبيب"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      onFocus={() => setFocusedField('doctorName')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                      required
                      disabled={loading}
                      dir="rtl"
                    />
                  </div>
                </motion.div>

                {/* Clinic Name Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-white text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-yellow-400" />
                    اسم العيادة
                  </label>
                  <div
                    className={`relative transition-all duration-300 ${
                      focusedField === 'clinicName' ? 'transform scale-[1.02]' : ''
                    }`}
                  >
                    <Building2
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                        focusedField === 'clinicName' ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="أدخل اسم العيادة"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      onFocus={() => setFocusedField('clinicName')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                      required
                      disabled={loading}
                      dir="rtl"
                    />
                  </div>
                </motion.div>

                {/* WhatsApp Number Field */}
                <motion.div variants={itemVariants} className="space-y-2">
                  <label className="text-white text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-yellow-400" />
                    رقم الواتساب
                  </label>
                  <div
                    className={`relative transition-all duration-300 ${
                      focusedField === 'whatsapp' ? 'transform scale-[1.02]' : ''
                    }`}
                  >
                    <Phone
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                        focusedField === 'whatsapp' ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      onFocus={() => setFocusedField('whatsapp')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                      required
                      disabled={loading}
                      dir="ltr"
                    />
                  </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-3"
                  >
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] py-3 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Sparkles className="w-5 h-5" />
                          </motion.div>
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          تقديم طلب الاشتراك
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500"
                      initial={{ x: '100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </motion.div>
              </form>
            )}
          </motion.div>

          {/* Copyright */}
          <motion.p
            variants={itemVariants}
            className="text-center text-gray-500 text-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
            © 2026 LiveDent. جميع الحقوق محفوظة
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LiveDentSubscriptionPage({ 
  primaryColor = '#FFD700',
  logo
}: LiveDentSubscriptionFormProps) {
  return (
    <LiveDentSubscriptionForm 
      primaryColor={primaryColor}
      logo="/logo.png"
    />
  );
}