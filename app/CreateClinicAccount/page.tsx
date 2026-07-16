// components/LiveDentRegistrationForm.tsx
"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  User,
  Building2,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Send,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  UserCircle,
  Lock,
  AlertCircle,
  Shield,
  Smartphone,
  ChevronDown,
  DollarSign,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

// ============================================================
// دالة إرسال رسالة إلى تلغرام
// ============================================================

async function sendTelegramMessage(
  message: string,
  invite_token?: string,
): Promise<{ success: boolean; error?: string; messageId?: number }> {
  try {
    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    const abd_chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID_ABD;

    if (!token) {
      throw new Error("حدث خطأ ما");
    }

    if (!chatId) {
      throw new Error("Chat ID is not configured");
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.description || "Failed to send message");
    }

    if (invite_token === "abd2343livedent") {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: abd_chatId,
            text: message,
            parse_mode: "HTML",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.description || "Failed to send message");
      }
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================
// مكون النسخ الآمن (يعمل على الهواتف)
// ============================================================

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  const handleCopy = useCallback(async () => {
    try {
      // محاولة استخدام Clipboard API أولاً
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // طريقة احتياطية للهواتف القديمة
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        textArea.style.fontSize = "16px"; // منع التكبير في iOS
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback copy failed:", err);
        }

        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Copy failed:", err);
      // فشل النسخ - نعرض النص للمستخدم
      setShowFullText(true);
      setTimeout(() => setShowFullText(false), 5000);
    }
  }, [text]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between bg-[#0F1F35] rounded-lg p-2.5 sm:p-3 border border-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300 group">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {label === "username" ? (
            <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
          ) : (
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
          )}
          <span
            ref={textRef}
            className="text-white text-xs sm:text-sm font-mono truncate select-all"
          >
            {label === "password" && !showFullText
              ? "•".repeat(Math.min(text.length, 20))
              : text}
          </span>
        </div>
        <motion.button
          onClick={handleCopy}
          className="p-2 sm:p-2.5 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 active:bg-yellow-500/30 transition-all duration-200 flex-shrink-0 touch-manipulation"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`نسخ ${label === "username" ? "اسم المستخدم" : "كلمة المرور"}`}
        >
          {copied ? (
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </motion.button>
      </div>
      {copied && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-400 text-xs text-center"
        >
          ✓ تم النسخ بنجاح
        </motion.p>
      )}
      {showFullText && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-yellow-400 text-xs text-center break-all"
        >
          النص: {text}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================
// المكون الرئيسي
// ============================================================

interface LiveDentRegistrationFormProps {
  primaryColor?: string;
  logo?: string;
  invite_token?: string;
}

interface FormData {
  doctorName: string;
  clinicName: string;
  clinicLocation: string;
  phoneNumber: string;
  university: string;
  graduationYear: string;
  username: string;
  password: string;
  currency: "USD" | "SP";
}

function LiveDentRegistrationForm({
  primaryColor = "#FFD700",
  logo,
  invite_token,
}: LiveDentRegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    doctorName: "",
    clinicName: "",
    clinicLocation: "",
    phoneNumber: "",
    university: "",
    graduationYear: "",
    username: "",
    password: "",
    currency: "USD",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // حالة التحقق من اسم المستخدم
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const checkingUsernameRef = useRef<string>("");

  // التحقق من نوع الجهاز
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // تنظيف المؤقت عند مغادرة المكون
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // تمرير تلقائي إلى الأعلى عند تغيير الخطوة (للهواتف)
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isMobile && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [currentStep, isMobile]);

  // تنظيف رقم الواتساب
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\s/g, "");

    if (value.startsWith("0")) {
      value = "+963" + value.substring(1);
    }

    if (value === "0") {
      value = "+963";
    }

    if (value.startsWith("+963+963")) {
      value = value.replace("+963+963", "+963");
    }

    value = value.replace(/[^\d+]/g, "");

    if (value.includes("+") && value.indexOf("+") !== 0) {
      value = value.replace(/\+/g, "");
      value = "+" + value;
    }

    updateField("phoneNumber", value);
  };

  // دالة التحقق من توفر اسم المستخدم
  const checkUsernameAvailability = async (username: string) => {
    checkingUsernameRef.current = username;

    try {
      const res = await fetch("/api/v1/create-account/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: username }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();

      // تجاهل النتيجة إذا تغير الاسم أثناء الطلب
      if (checkingUsernameRef.current !== username) return;

      setUsernameStatus(data.exists ? "taken" : "available");
    } catch {
      if (checkingUsernameRef.current === username) {
        setUsernameStatus("error");
      }
    }
  };

  // تنظيف اسم المستخدم مع التحقق المؤجل
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.toLowerCase().replace(/[^a-z-]/g, "");
    updateField("username", value);

    // إلغاء أي مؤقت سابق
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // إذا كان الطول أقل من 4، إخفاء المؤشر
    if (value.length < 4) {
      setUsernameStatus("idle");
      return;
    }

    // إظهار حالة "جاري التحقق" فوراً
    setUsernameStatus("checking");

    // انتظر 500 مللي ثانية قبل الاستدعاء الفعلي
    debounceRef.current = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
  };

  const cleanPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[^\d+]/g, "");

    if (cleaned.startsWith("+") && !cleaned.startsWith("+963")) {
      if (cleaned.length > 1) {
        return cleaned;
      }
    }

    if (cleaned.startsWith("+963")) {
      return cleaned;
    }

    if (cleaned.startsWith("0")) {
      return "+963" + cleaned.substring(1);
    }

    if (cleaned.startsWith("963")) {
      return "+" + cleaned;
    }

    if (cleaned.length > 0 && !cleaned.startsWith("+")) {
      return "+963" + cleaned;
    }

    return cleaned;
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    setError("");

    switch (step) {
      case 1:
        if (!formData.doctorName.trim()) {
          setError("يرجى إدخال اسم الطبيب");
          return false;
        }
        if (!formData.clinicName.trim()) {
          setError("يرجى إدخال اسم العيادة");
          return false;
        }
        if (!formData.clinicLocation.trim()) {
          setError("يرجى إدخال موقع العيادة");
          return false;
        }
        if (!formData.phoneNumber.trim()) {
          setError("يرجى إدخال رقم الواتساب");
          return false;
        }
        const cleanPhone = cleanPhoneNumber(formData.phoneNumber);
        if (cleanPhone.length < 9) {
          setError("رقم الواتساب غير صحيح");
          return false;
        }
        return true;
      case 2:
        if (!formData.university.trim()) {
          setError("يرجى إدخال اسم الجامعة");
          return false;
        }
        if (!formData.graduationYear.trim()) {
          setError("يرجى إدخال سنة التخرج");
          return false;
        }
        const year = parseInt(formData.graduationYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1950 || year > currentYear) {
          setError("سنة التخرج غير صحيحة");
          return false;
        }
        return true;
      case 3:
        if (!formData.username.trim()) {
          setError("يرجى إدخال اسم المستخدم");
          return false;
        }
        if (formData.username.length < 4) {
          setError("اسم المستخدم يجب أن يكون 4 أحرف على الأقل");
          return false;
        }
        if (!formData.password.trim()) {
          setError("يرجى إدخال كلمة المرور");
          return false;
        }
        if (formData.password.length < 6) {
          setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
          return false;
        }
        // التحقق من حالة اسم المستخدم
        if (usernameStatus === "checking") {
          setError("الرجاء الانتظار حتى يتم التحقق من اسم المستخدم");
          return false;
        }
        if (usernameStatus === "taken") {
          setError("اسم المستخدم مستخدم بالفعل، يرجى اختيار اسم آخر");
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError("");

    try {
      const cleanPhone = cleanPhoneNumber(formData.phoneNumber);

      // إنشاء رابط واتساب مباشر
      const currencyLabel =
        formData.currency === "USD" ? "دولار أمريكي" : "ل.س";
      const currencySymbol = formData.currency === "USD" ? "$" : "ل.س";

      const whatsappMessage = `السلام عليكم \nكيف الحال د.${formData.doctorName}\nنود اعلامك بأنه قد تم انشاء حسابك على LiveDent بنجاح\n\nيمكنك الآن الدخول ل:\nhttps://live-dent.vercel.app/log-in\n\nووضع اسم المستخدم و كلمة المرور التي قمت بإنشائها سلفاً`;
      const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`;

      // رسالة تلغرام للإدارة
      const telegramMessage = `
🦷 <b>طلب تسجيل جديد - LiveDent</b>

━━━━━━━━━━━━━━━━━━━━━━

📋 <b>معلومات الطبيب:</b>
<b>👨‍⚕️ اسم الطبيب:</b> د. ${formData.doctorName}
<b>🏥 اسم العيادة:</b> ${formData.clinicName}
<b>📍 موقع العيادة:</b> ${formData.clinicLocation}
<b>📱 رقم الواتساب:</b> ${formData.phoneNumber}

━━━━━━━━━━━━━━━━━━━━━━

💰 <b>العملة الأساسية للعيادة:</b>
<b>💱 العملة:</b> ${formData.currency} (${currencyLabel}) ${currencySymbol}

━━━━━━━━━━━━━━━━━━━━━━

🎓 <b>المؤهل العلمي:</b>
<b>🏛️ الجامعة:</b> ${formData.university}
<b>📅 سنة التخرج:</b> ${formData.graduationYear}

━━━━━━━━━━━━━━━━━━━━━━

🔐 <b>معلومات الحساب:</b>
<b>👤 اسم المستخدم:</b> <code>${formData.username}</code>
<b>🔑 كلمة المرور:</b> <code>${formData.password}</code>

━━━━━━━━━━━━━━━━━━━━━━

📅 <b>تاريخ الطلب:</b> ${new Date().toLocaleString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}

<b>🔗 رابط التواصل المباشر:</b>
${whatsappLink}

━━━━━━━━━━━━━━━━━━━━━━

<i>تم الإرسال من صفحة التسجيل الجديد</i>
      `;

      const result = await sendTelegramMessage(telegramMessage, invite_token);

      if (result.success) {
        setSuccess(true);
      } else {
        throw new Error(result.error || "فشل في إرسال الطلب");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
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
        delayChildren: 0.2,
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
        damping: 10,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.5,
      },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const steps = [
    { number: 1, label: "المعلومات الأساسية", icon: User },
    { number: 2, label: "المؤهل العلمي", icon: GraduationCap },
    { number: 3, label: "إنشاء الحساب", icon: Shield },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0A1628] relative overflow-hidden"
      ref={containerRef}
    >
      {/* Background Patterns - مخففة للهواتف */}
      <div className="absolute inset-0 opacity-[0.07] sm:opacity-10">
        <div className="absolute top-10 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-tl from-yellow-400 to-amber-600 rounded-full blur-3xl" />
      </div>

      {/* Shimmer Effects - مخفية على الهواتف الصغيرة */}
      {!isMobile && (
        <>
          <motion.div
            className="absolute top-0 left-0 w-0.5 h-32"
            style={{
              backgroundImage: `linear-gradient(to bottom, ${primaryColor}, transparent)`,
            }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-0.5 h-32"
            style={{
              backgroundImage: `linear-gradient(to top, ${primaryColor}, transparent)`,
            }}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md px-3 sm:px-6 py-4 sm:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 sm:space-y-6"
        >
          {/* Logo/Header */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              className="inline-flex items-center justify-center mb-2 sm:mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-16 h-16 sm:w-24 sm:h-24">
                {logo ? (
                  <Image
                    src={logo}
                    alt="LiveDent"
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 shadow-lg shadow-yellow-500/30">
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      LD
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
            <motion.h1
              className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400 mb-1 sm:mb-2 tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              LiveDent
            </motion.h1>
            <motion.p
              className="text-sm sm:text-base font-medium text-yellow-400 mb-1 sm:mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              نظام إدارة عيادات الأسنان
            </motion.p>
            <motion.p
              className="text-white/70 text-xs sm:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              سجل الآن واحصل على حسابك الخاص
            </motion.p>
          </motion.div>

          {/* Step Indicators - محسن للهواتف */}
          {!success && (
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center gap-1 sm:gap-2"
            >
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.number} className="flex items-center">
                    <motion.div
                      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-300 ${
                        currentStep >= step.number
                          ? "bg-yellow-400/20 border border-yellow-400/50"
                          : "bg-[#1A2A44] border border-gray-600"
                      }`}
                      animate={
                        currentStep === step.number
                          ? { scale: [1, 1.05, 1] }
                          : {}
                      }
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <StepIcon
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          currentStep >= step.number
                            ? "text-yellow-400"
                            : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                          currentStep >= step.number
                            ? "text-yellow-400"
                            : "text-gray-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                    {index < steps.length - 1 && (
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mx-0.5 sm:mx-1 rotate-[270deg]" />
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Registration Card */}
          <AnimatePresence mode="wait">
            {success ? (
              // Success Message
              <motion.div
                key="success"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-[#0F1F35] backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-500/20 p-4 sm:p-8"
              >
                <div className="text-center space-y-4 sm:space-y-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      delay: 0.2,
                    }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-green-500/30"
                  >
                    <CheckCircle2
                      size={isMobile ? 32 : 40}
                      className="text-white"
                    />
                  </motion.div>

                  <div className="space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      تم إنشاء الحساب بنجاح!
                    </h3>

                    {/* معلومات الحساب مع نسخ آمن */}
                    <div className="bg-[#1A2A44] rounded-xl p-3 sm:p-4 space-y-3 border border-yellow-500/20">
                      <p className="text-yellow-400 text-xs sm:text-sm font-medium flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                        احفظ معلومات الحساب في مكان آمن
                      </p>

                      <CopyButton text={formData.username} label="username" />
                      <CopyButton text={formData.password} label="password" />
                    </div>

                    <div className="text-white/80 text-xs sm:text-sm space-y-2 leading-relaxed">
                      <p className="font-medium text-red-400/90">
                        ⚠️ رجاء قم بنسخ اسم المستخدم وكلمة المرور واحتفظ بهم في
                        مكان آمن على جهازك
                      </p>
                      <div className="bg-yellow-500/10 rounded-lg p-2.5 sm:p-3 border border-yellow-500/20 space-y-1.5">
                        <p className="text-yellow-400/90 text-xs sm:text-sm flex items-center gap-2">
                          <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          ستتلقى إشعاراً تلقائياً على رقم الواتساب فور اكتمال
                          إنشاء الحساب
                        </p>
                        <p className="text-yellow-400/70 text-xs flex items-center gap-2">
                          <span className="text-lg">⏱️</span>
                          سيتم إنشاء الحساب خلال 24 ساعة
                        </p>
                        <p className="text-yellow-400/70 text-xs flex items-center gap-2">
                          <span className="text-lg">📞</span>
                          إن لم تصلك الرسالة يرجى مراجعة خدمة العملاء
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${currentStep}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-[#0F1F35] backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-500/20 p-4 sm:p-8"
              >
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3 sm:space-y-5"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-white text-center mb-2 sm:mb-4">
                      المعلومات الأساسية
                    </h3>

                    {/* Doctor Name */}
                    <motion.div
                      variants={itemVariants}
                      className="space-y-1.5 sm:space-y-2"
                    >
                      <label className="text-white text-xs sm:text-sm font-medium flex items-center gap-2">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                        اسم الطبيب
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "doctorName"
                            ? "transform scale-[1.01]"
                            : ""
                        }`}
                      >
                        <User
                          className={`absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 pointer-events-none ${
                            focusedField === "doctorName"
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="أدخل اسم الطبيب"
                          value={formData.doctorName}
                          onChange={(e) =>
                            updateField("doctorName", e.target.value)
                          }
                          onFocus={() => setFocusedField("doctorName")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                          required
                          disabled={loading}
                          dir="rtl"
                          autoComplete="name"
                        />
                      </div>
                    </motion.div>

                    {/* Clinic Name */}
                    <motion.div
                      variants={itemVariants}
                      className="space-y-1.5 sm:space-y-2"
                    >
                      <label className="text-white text-xs sm:text-sm font-medium flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                        اسم العيادة
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "clinicName"
                            ? "transform scale-[1.01]"
                            : ""
                        }`}
                      >
                        <Building2
                          className={`absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 pointer-events-none ${
                            focusedField === "clinicName"
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="أدخل اسم العيادة"
                          value={formData.clinicName}
                          onChange={(e) =>
                            updateField("clinicName", e.target.value)
                          }
                          onFocus={() => setFocusedField("clinicName")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                          required
                          disabled={loading}
                          dir="rtl"
                          autoComplete="organization"
                        />
                      </div>
                    </motion.div>

                    {/* Clinic Location */}
                    <motion.div
                      variants={itemVariants}
                      className="space-y-1.5 sm:space-y-2"
                    >
                      <label className="text-white text-xs sm:text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                        موقع العيادة
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "clinicLocation"
                            ? "transform scale-[1.01]"
                            : ""
                        }`}
                      >
                        <MapPin
                          className={`absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 pointer-events-none ${
                            focusedField === "clinicLocation"
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="المحافظة ثم المدينة او الريف ... "
                          value={formData.clinicLocation}
                          onChange={(e) =>
                            updateField("clinicLocation", e.target.value)
                          }
                          onFocus={() => setFocusedField("clinicLocation")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                          required
                          disabled={loading}
                          dir="rtl"
                          autoComplete="street-address"
                        />
                      </div>
                    </motion.div>

                    {/* Phone Number */}
                    <motion.div
                      variants={itemVariants}
                      className="space-y-1.5 sm:space-y-2"
                    >
                      <label className="text-white text-xs sm:text-sm font-medium flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                        رقم الواتساب
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "phoneNumber"
                            ? "transform scale-[1.01]"
                            : ""
                        }`}
                      >
                        <Phone
                          className={`absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 pointer-events-none ${
                            focusedField === "phoneNumber"
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                        />
                        <input
                          type="tel"
                          placeholder="+963........."
                          value={formData.phoneNumber}
                          onChange={handlePhoneChange}
                          onFocus={() => setFocusedField("phoneNumber")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 font-mono"
                          required
                          disabled={loading}
                          dir="ltr"
                          autoComplete="tel"
                          inputMode="tel"
                        />
                      </div>
                      <p className="text-gray-500 text-[10px] sm:text-xs">
                        رمز الدولة و الرقم (مهم لأنك ستتلقى رسالة القبول عليه من
                        الضروري ان يكون صحيحا)
                      </p>
                    </motion.div>

                    {/* Currency Selection - NEW */}
                    <motion.div
                      variants={itemVariants}
                      className="space-y-1.5 sm:space-y-2 pt-1"
                    >
                      <label className="text-white text-xs sm:text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                        العملة الأساسية للعيادة
                      </label>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <motion.button
                          type="button"
                          onClick={() => updateField("currency", "USD")}
                          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-200 ${
                            formData.currency === "USD"
                              ? "border-yellow-400 bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/20"
                              : "border-gray-600 bg-[#1A2A44] text-gray-400 hover:border-yellow-400/50"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={loading}
                        >
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="font-medium text-sm sm:text-base">
                            USD
                          </span>
                          <span className="text-[10px] sm:text-xs opacity-60">
                            (دولار)
                          </span>
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => updateField("currency", "SP")}
                          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all duration-200 ${
                            formData.currency === "SP"
                              ? "border-yellow-400 bg-yellow-500/20 text-yellow-400 shadow-lg shadow-yellow-500/20"
                              : "border-gray-600 bg-[#1A2A44] text-gray-400 hover:border-yellow-400/50"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={loading}
                        >
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="font-medium text-sm sm:text-base">
                            SP
                          </span>
                          <span className="text-[10px] sm:text-xs opacity-60">
                            (ل.س)
                          </span>
                        </motion.button>
                      </div>
                      <p className="text-gray-500 text-[10px] sm:text-xs">
                        سيتم استخدام هذه العملة لجميع المعاملات المالية في
                        العيادة
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2: Education */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3 sm:space-y-5"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-white text-center mb-2 sm:mb-4">
                      المؤهل العلمي
                    </h3>

                    {/* University */}
                    <motion.div
                      variants={itemVariants}
                      className="space-y-1.5 sm:space-y-2"
                    >
                      <label className="text-white text-xs sm:text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                        الجامعة
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "university"
                            ? "transform scale-[1.01]"
                            : ""
                        }`}
                      >
                        <GraduationCap
                          className={`absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 pointer-events-none ${
                            focusedField === "university"
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="أدخل اسم الجامعة"
                          value={formData.university}
                          onChange={(e) =>
                            updateField("university", e.target.value)
                          }
                          onFocus={() => setFocusedField("university")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                          required
                          disabled={loading}
                          dir="rtl"
                        />
                      </div>
                    </motion.div>

                    {/* Graduation Year */}
                    <motion.div
                      variants={itemVariants}
                      className="space-y-1.5 sm:space-y-2"
                    >
                      <label className="text-white text-xs sm:text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                        سنة التخرج
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "graduationYear"
                            ? "transform scale-[1.01]"
                            : ""
                        }`}
                      >
                        <Calendar
                          className={`absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 pointer-events-none ${
                            focusedField === "graduationYear"
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                        />
                        <input
                          type="number"
                          placeholder="مثال: 2015"
                          value={formData.graduationYear}
                          onChange={(e) =>
                            updateField("graduationYear", e.target.value)
                          }
                          onFocus={() => setFocusedField("graduationYear")}
                          onBlur={() => setFocusedField(null)}
                          min="1950"
                          max={new Date().getFullYear()}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                          required
                          disabled={loading}
                          dir="ltr"
                          inputMode="numeric"
                        />
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 3: Account Creation */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3 sm:space-y-5"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-white text-center mb-2 sm:mb-4">
                      إنشاء الحساب
                    </h3>

                    <div className="bg-amber-500/10 border border-yellow-500/30 rounded-xl p-2.5 sm:p-3 mb-2">
                      <p className="text-yellow-400 text-[10px] sm:text-xs flex items-center gap-1.5">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        هذه المعلومات مهمة جداً ويجب عليك الحفاظ عليها في مكان
                        آمن
                      </p>
                    </div>

                    {/* Username */}
                    <motion.div
                      variants={itemVariants}
                      className="space-y-1.5 sm:space-y-2"
                    >
                      <label className="text-white text-xs sm:text-sm font-medium flex items-center gap-2">
                        <UserCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                        اسم المستخدم
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "username"
                            ? "transform scale-[1.01]"
                            : ""
                        }`}
                      >
                        <UserCircle
                          className={`absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 pointer-events-none ${
                            focusedField === "username"
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="أحرف صغيرة وشرطات - فقط"
                          value={formData.username}
                          onChange={handleUsernameChange}
                          onFocus={() => setFocusedField("username")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 font-mono"
                          required
                          disabled={loading}
                          dir="ltr"
                          autoComplete="username"
                          inputMode="text"
                        />
                        {/* مؤشر حالة اسم المستخدم */}
                        {usernameStatus !== "idle" && (
                          <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2">
                            {usernameStatus === "checking" ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full"
                              />
                            ) : usernameStatus === "available" ? (
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                            ) : usernameStatus === "taken" ? (
                              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                            )}
                          </div>
                        )}
                      </div>
                      <p
                        className={`text-[10px] sm:text-xs ${
                          usernameStatus === "available"
                            ? "text-green-400"
                            : usernameStatus === "taken"
                              ? "text-red-400"
                              : usernameStatus === "error"
                                ? "text-yellow-400"
                                : "text-gray-500"
                        }`}
                      >
                        {usernameStatus === "checking"
                          ? "جاري التحقق..."
                          : usernameStatus === "available"
                            ? "✓ اسم المستخدم متاح"
                            : usernameStatus === "taken"
                              ? "✗ اسم المستخدم مستخدم بالفعل"
                              : usernameStatus === "error"
                                ? "⚠️ خطأ في التحقق"
                                : "مسموح: احرف انجليزية صغيرة و شرطات - فقط اربع حروف على الأقل"}
                      </p>
                    </motion.div>

                    {/* Password */}
                    <motion.div
                      variants={itemVariants}
                      className="space-y-1.5 sm:space-y-2"
                    >
                      <label className="text-white text-xs sm:text-sm font-medium flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
                        كلمة المرور
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "password"
                            ? "transform scale-[1.01]"
                            : ""
                        }`}
                      >
                        <Lock
                          className={`absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 pointer-events-none ${
                            focusedField === "password"
                              ? "text-yellow-400"
                              : "text-gray-500"
                          }`}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="أدخل كلمة المرور"
                          value={formData.password}
                          onChange={(e) =>
                            updateField("password", e.target.value)
                          }
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 pl-10 sm:pl-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 font-mono"
                          required
                          disabled={loading}
                          dir="ltr"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400 active:text-yellow-500 transition-colors p-1 touch-manipulation"
                          aria-label={
                            showPassword
                              ? "إخفاء كلمة المرور"
                              : "إظهار كلمة المرور"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-gray-500 text-[10px] sm:text-xs">
                        مسموح: أحرف، أرقام، ورموز ست أحرف على الأقل
                      </p>
                    </motion.div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 sm:p-3 mt-3 sm:mt-4"
                  >
                    <p className="text-red-400 text-xs sm:text-sm text-center flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      {error}
                    </p>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                  {currentStep > 1 && (
                    <motion.button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={loading}
                      className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium bg-[#1A2A44] text-white border border-gray-600 hover:border-yellow-500/50 active:bg-[#243652] transition-all duration-300 flex items-center gap-1.5 sm:gap-2 touch-manipulation"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      السابق
                    </motion.button>
                  )}

                  {currentStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] shadow-lg hover:shadow-xl active:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      التالي
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 text-[#0A1628] shadow-lg hover:shadow-xl active:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                    >
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
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </motion.div>
                          جاري الإنشاء...
                        </>
                      ) : (
                        <>إنشاء الحساب</>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Copyright */}
          <motion.p
            variants={itemVariants}
            className="text-center text-gray-500 text-[10px] sm:text-xs flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />
            © 2026 LiveDent. جميع الحقوق محفوظة
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

function LiveDentRegistrationFormWrapper() {
  const searchParams = useSearchParams();
  const invite_token = searchParams.get("invite_token") || undefined;

  return (
    <LiveDentRegistrationForm
      primaryColor="#FFD700"
      logo="/logo.png"
      invite_token={invite_token}
    />
  );
}

export default function LiveDentRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-yellow-500/30 border-t-yellow-400 rounded-full"
          />
        </div>
      }
    >
      <LiveDentRegistrationFormWrapper />
    </Suspense>
  );
}
