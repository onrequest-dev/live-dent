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
  MessageCircle,
  ExternalLink,
  Layout,
  Database,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

// ============================================================
// نظام الألوان الموحد (مطابق لصفحة الهبوط)
// ============================================================
const COLORS = {
  primary: "#0043fa",
  primaryLight: "#0043fa15",
  primaryMedium: "#0043fa30",
  background: "#d2d9ff",
  surface: "#ffffff",
  text: "#0f172a",
  textSecondary: "#475569",
  border: "#e8ecf1",
  glassBg: "rgba(255, 255, 255, 0.75)",
  glassBorder: "rgba(255, 255, 255, 0.5)",
  danger: "#dc2626",
  success: "#16a34a",
  warning: "#f59e0b",
};

// ============================================================
// SVG الأسنان للخلفية
// ============================================================
const DentalSVG = ({
  className = "",
  direction = "right",
  size = "normal",
}: {
  className?: string;
  direction?: "left" | "right";
  size?: "small" | "normal" | "large";
}) => {
  const sizeClasses = {
    small: "w-48 h-48 md:w-64 md:h-64",
    normal: "w-64 h-64 md:w-80 md:h-80",
    large: "w-80 h-80 md:w-96 md:h-96",
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: direction === "right" ? 150 : -150,
        rotate: direction === "right" ? 20 : -20,
        scale: 0.5,
      }}
      animate={{
        opacity: 0.08,
        x: 0,
        rotate: 0,
        scale: 1,
      }}
      transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`absolute ${sizeClasses[size]} ${className} pointer-events-none select-none`}
    >
      <svg
        viewBox="0 0 6000 6000"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <g transform="scale(1, -1) translate(0, -6000)">
          <path
            d="M1336 4749 c-65 -16 -153 -69 -202 -121 -117 -125 -139 -302 -59 -464 41 -83 97 -139 184 -181 51 -25 66 -28 166 -28 98 0 116 3 167 27 195 91 284 317 207 524 -31 83 -140 192 -224 224 -67 25 -179 35 -239 19z M3775 4749 c-99 -13 -234 -51 -377 -105 -115 -45 -129 -48 -218 -48 -85 0 -113 5 -271 52 -256 75 -306 85 -454 85 -155 1 -262 -22 -389 -82 -95 -44 -206 -125 -206 -149 0 -10 5 -46 10 -82 26 -183 -61 -370 -216 -462 -48 -29 -53 -36 -59 -77 -10 -67 -7 -316 5 -412 31 -250 96 -472 199 -678 l51 -101 0 -177 c0 -261 31 -449 115 -700 168 -506 458 -759 653 -570 75 73 121 171 177 382 77 285 88 322 116 384 61 134 148 201 263 201 77 0 129 -24 183 -83 72 -78 101 -153 177 -452 60 -239 89 -309 163 -402 40 -50 122 -93 177 -93 127 0 277 149 398 393 103 209 171 441 213 735 17 114 17 114 86 220 314 482 453 1125 334 1538 -89 305 -302 527 -604 630 -166 56 -352 75 -526 53z"
            fill={COLORS.primary}
          />
          <path
            d="M4808 2297 c-59 -23 -124 -64 -153 -99 -108 -128 -107 -307 1 -427 65 -72 129 -103 224 -109 131 -7 242 54 305 169 24 45 30 69 33 142 4 82 3 91 -27 152 -35 70 -87 122 -159 157 -56 27 -171 34 -224 15z"
            fill={COLORS.primary}
          />
        </g>
      </svg>
    </motion.div>
  );
};

// ============================================================
// AnimatedSection - wrapper للأنيميشن
// ============================================================
const AnimatedSection = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================
// تحويل الاسم العربي إلى username
// ============================================================
function arabicToLatinUsername(arabicName: string): string {
  const map: Record<string, string> = {
    ا: "a",
    أ: "a",
    إ: "a",
    آ: "a",
    ٱ: "a",
    ب: "b",
    ت: "t",
    ث: "th",
    ج: "j",
    ح: "h",
    خ: "kh",
    د: "d",
    ذ: "dh",
    ر: "r",
    ز: "z",
    س: "s",
    ش: "sh",
    ص: "s",
    ض: "d",
    ط: "t",
    ظ: "z",
    ع: "a",
    غ: "gh",
    ف: "f",
    ق: "q",
    ك: "k",
    ل: "l",
    م: "m",
    ن: "n",
    ه: "h",
    و: "w",
    ي: "y",
    ى: "a",
    ة: "h",
    ء: "",
    ؤ: "w",
    ئ: "y",
  };

  const cleaned = arabicName.trim().replace(/\s+/g, " ");
  const latin = cleaned
    .split("")
    .map((ch) => map[ch] || (/[a-z0-9]/i.test(ch) ? ch.toLowerCase() : ""))
    .join("")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${latin || "user"}-${randomSuffix}`;
}

// ============================================================
// زر النسخ الآمن
// ============================================================
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-999999px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
          document.execCommand("copy");
        } catch {}
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, [text]);

  return (
    <div
      className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl transition-all duration-300 group"
      style={{
        backgroundColor: COLORS.glassBg,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${COLORS.primary}20`,
        boxShadow: "0 4px 16px rgba(0,67,250,0.04)",
      }}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {label === "username" ? (
          <UserCircle
            className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
            style={{ color: COLORS.primary }}
          />
        ) : (
          <Lock
            className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
            style={{ color: COLORS.primary }}
          />
        )}
        <span
          className="font-mono text-sm sm:text-base truncate select-all"
          style={{ color: COLORS.text, direction: "ltr" }}
        >
          {label === "password" ? "•".repeat(Math.min(text.length, 18)) : text}
        </span>
      </div>
      <motion.button
        onClick={handleCopy}
        className="p-2 sm:p-2.5 rounded-xl flex-shrink-0 touch-manipulation transition-all"
        style={{
          backgroundColor: copied
            ? `${COLORS.success}15`
            : `${COLORS.primary}10`,
          color: copied ? COLORS.success : COLORS.primary,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        aria-label={`نسخ ${label === "username" ? "اسم المستخدم" : "كلمة المرور"}`}
      >
        {copied ? (
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </motion.button>
    </div>
  );
}

// ============================================================
// مكون حقل الإدخال الموحد
// ============================================================
interface FieldProps {
  label: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  dir?: "rtl" | "ltr";
  inputMode?: "text" | "tel" | "numeric" | "email";
  autoComplete?: string;
  disabled?: boolean;
  hint?: string;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  trailing?: React.ReactNode;
  min?: string;
  max?: string;
}

function Field({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  dir = "rtl",
  inputMode,
  autoComplete,
  disabled,
  hint,
  focused,
  onFocus,
  onBlur,
  trailing,
  min,
  max,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-semibold flex items-center gap-2"
        style={{ color: COLORS.text }}
      >
        <Icon className="w-4 h-4" style={{ color: COLORS.primary }} />
        {label}
      </label>
      <div className="relative">
        <Icon
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-200"
          style={{ color: focused ? COLORS.primary : COLORS.textSecondary }}
        />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full px-4 py-3.5 pr-12 pl-12 rounded-2xl text-sm sm:text-base transition-all duration-200 outline-none"
          style={{
            backgroundColor: COLORS.surface,
            border: `1.5px solid ${focused ? COLORS.primary : COLORS.border}`,
            color: COLORS.text,
            boxShadow: focused
              ? `0 0 0 4px ${COLORS.primary}10`
              : "0 1px 2px rgba(0,0,0,0.02)",
          }}
          disabled={disabled}
          dir={dir}
          autoComplete={autoComplete}
          inputMode={inputMode}
          min={min}
          max={max}
        />
        {trailing && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        )}
      </div>
      {hint && (
        <p className="text-xs" style={{ color: COLORS.textSecondary }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ============================================================
// المكون الرئيسي
// ============================================================
interface LiveDentRegistrationFormProps {
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
  logo,
  invite_token,
}: LiveDentRegistrationFormProps) {
  const router = useRouter();
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
  const [successData, setSuccessData] = useState<{
    clinicId: string;
    clinicName: string;
    username: string;
    password: string;
  } | null>(null);
  const [credentialsSaved, setCredentialsSaved] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle");
  const [usernameManuallyEdited, setUsernameManuallyEdited] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const checkingUsernameRef = useRef<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // تنظيف
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // توليد username تلقائي عند تغيير اسم الطبيب
  useEffect(() => {
    if (!usernameManuallyEdited && formData.doctorName.trim().length >= 2) {
      const generated = arabicToLatinUsername(formData.doctorName);
      setFormData((prev) => ({ ...prev, username: generated }));
      // فحص التوفّر
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setUsernameStatus("checking");
      debounceRef.current = setTimeout(() => {
        checkUsernameAvailability(generated);
      }, 600);
    }
  }, [formData.doctorName, usernameManuallyEdited]);

  // معالجة الواتساب
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, "");
    if (value.startsWith("0")) value = "+963" + value.substring(1);
    if (value === "0") value = "+963";
    if (value.startsWith("+963+963")) value = value.replace("+963+963", "+963");
    value = value.replace(/[^\d+]/g, "");
    if (value.includes("+") && value.indexOf("+") !== 0) {
      value = value.replace(/\+/g, "");
      value = "+" + value;
    }
    updateField("phoneNumber", value);
  };

  const cleanPhoneNumber = (phone: string): string => {
    let c = phone.replace(/[^\d+]/g, "");
    if (c.startsWith("+") && !c.startsWith("+963")) {
      if (c.length > 1) return c;
    }
    if (c.startsWith("+963")) return c;
    if (c.startsWith("0")) return "+963" + c.substring(1);
    if (c.startsWith("963")) return "+" + c;
    if (c.length > 0 && !c.startsWith("+")) return "+963" + c;
    return c;
  };

  const isPhoneValid = (): boolean => {
    const clean = cleanPhoneNumber(formData.phoneNumber);
    return clean.length >= 9 && /^\+\d{9,}$/.test(clean);
  };

  const handleWhatsAppVerify = () => {
    const clean = cleanPhoneNumber(formData.phoneNumber);
    if (!isPhoneValid()) return;
    window.open(`https://wa.me/${clean.replace("+", "")}`, "_blank");
  };

  const checkUsernameAvailability = async (username: string) => {
    checkingUsernameRef.current = username;
    try {
      const res = await fetch("/api/v1/create-account/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name: username }),
      });
      if (!res.ok) throw new Error("Network");
      const data = await res.json();
      if (checkingUsernameRef.current !== username) return;
      setUsernameStatus(data.exists ? "taken" : "available");
    } catch {
      if (checkingUsernameRef.current === username) {
        setUsernameStatus("error");
      }
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsernameManuallyEdited(true);
    updateField("username", value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 4) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    debounceRef.current = setTimeout(() => {
      checkUsernameAvailability(value);
    }, 500);
  };

  // التحقق من الخطوات
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
        if (!isPhoneValid()) {
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
        const cy = new Date().getFullYear();
        if (isNaN(year) || year < 1950 || year > cy) {
          setError("سنة التخرج غير صحيحة");
          return false;
        }
        return true;
      case 3:
        if (!formData.username.trim() || formData.username.length < 4) {
          setError("اسم المستخدم يجب أن يكون 4 أحرف على الأقل");
          return false;
        }
        if (!formData.password.trim() || formData.password.length < 6) {
          setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
          return false;
        }
        if (usernameStatus === "checking") {
          setError("الرجاء الانتظار حتى يتم التحقق من اسم المستخدم");
          return false;
        }
        if (usernameStatus === "taken") {
          setError("اسم المستخدم مستخدم بالفعل");
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) setCurrentStep((p) => p + 1);
  };
  const handlePrevStep = () => {
    setCurrentStep((p) => p - 1);
    setError("");
  };

  // إرسال التسجيل
  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/create-account/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          doctorName: formData.doctorName,
          clinicName: formData.clinicName,
          clinicLocation: formData.clinicLocation,
          phoneNumber: cleanPhoneNumber(formData.phoneNumber),
          university: formData.university,
          graduationYear: formData.graduationYear,
          username: formData.username,
          password: formData.password,
          currency: formData.currency,
          invite_token,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "فشل إنشاء الحساب");

      // حفظ بيانات الحساب في localStorage للاستخدام في log-in
      try {
        // 1) بيانات الدخول المحفوظة (تُقرأ في log-in)
        localStorage.setItem(
          "livedent_saved_credentials",
          JSON.stringify({
            username: formData.username,

            clinicName: formData.clinicName,
            savedAt: new Date().toISOString(),
          }),
        );

        // 2) قائمة الحسابات (لتبديل الحسابات)
        const accountsRaw = localStorage.getItem("livedent_accounts") || "[]";
        const accounts = JSON.parse(accountsRaw);
        const filtered = accounts.filter(
          (a: any) => a.username !== formData.username,
        );
        filtered.push({
          id: data.slug,
          clinicId: data.slug,
          clinicName: formData.clinicName,
          username: formData.username,
          lastUsed: new Date().toISOString(),
        });
        localStorage.setItem("livedent_accounts", JSON.stringify(filtered));

        // 3) مفاتيح التوافق مع switch_accounts
        if (Array.isArray(data.clinics)) {
          localStorage.setItem("clinics", JSON.stringify(data.clinics));
        }
        if (Array.isArray(data.clinicIds)) {
          localStorage.setItem("clinicIds", JSON.stringify(data.clinicIds));
        }
        if (data.slug) {
          localStorage.setItem("currentClinicId", data.slug);
          const current = data.clinics?.find((c: any) => c.id === data.slug);
          if (current) {
            localStorage.setItem("currentClinicName", current.name);
            localStorage.setItem("currentClinicLogo", current.logo);
          }
        }
      } catch (e) {
        console.warn("localStorage failed:", e);
      }

      setSuccessData({
        clinicId: data.slug,
        clinicName: formData.clinicName,
        username: formData.username,
        password: formData.password,
      });
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      setLoading(false);
    }
  };

  // الذهاب للوحة التحكم
  const handleGoToDashboard = () => {
    if (!successData) return;
    const cleanPhone = cleanPhoneNumber(formData.phoneNumber);
    const message = `مرحباً د. ${formData.doctorName}

أهلاً وسهلاً بك في LiveDent.

يمكنك الآن تجربة النظام بكامل راحتك واستكشاف جميع ميزاته.

نحترم وقتك — لن نزعجك بالتواصل الآن.

سنتواصل معك خلال هذا الأسبوع.

إذا احتجت أي مساعدة أو كان لديك استفسار، خدمة العملاء في خدمتك على الرقم:
+963982719525

شكراً لك`;
    fetch("/api/v1/hello-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cleanPhone, message }),
    });

    //send messsage to whatsapp
    router.push(`/dashboard/${successData.clinicId}`);
    router.refresh();
  };

  const steps = [
    { number: 1, label: "المعلومات الأساسية", icon: User },
    { number: 2, label: "المؤهل العلمي", icon: GraduationCap },
    { number: 3, label: "إنشاء الحساب", icon: Shield },
  ];

  // Variants
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: { duration: 0.25 },
    },
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div
      ref={containerRef}
      dir="rtl"
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif",
      }}
    >
      {/* Dental SVG Backgrounds */}
      <DentalSVG
        direction="left"
        size="large"
        className="top-20 -right-24 md:-right-40"
      />
      <DentalSVG
        direction="right"
        size="small"
        className="bottom-20 -left-16 md:-left-32"
      />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-1 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <AnimatedSection className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
              duration: 0.7,
              type: "spring",
              stiffness: 150,
            }}
            className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6"
          >
            <div
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background: `radial-gradient(circle, ${COLORS.primary}, transparent)`,
                filter: "blur(20px)",
              }}
            />
            <Image
              src={logo || "/logo.png"}
              alt="LiveDent"
              fill
              className="object-contain relative z-10"
              priority
            />
          </motion.div>
        </AnimatedSection>

        {/* Steps Indicator */}
        {!success && (
          <AnimatedSection delay={0.5} className="mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isDone = currentStep > step.number;
                return (
                  <div
                    key={step.number}
                    className="flex items-center gap-2 sm:gap-4"
                  >
                    <motion.div
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl transition-all duration-300"
                      style={{
                        backgroundColor:
                          isActive || isDone
                            ? COLORS.primaryLight
                            : COLORS.glassBg,
                        border: `1.5px solid ${
                          isActive || isDone ? COLORS.primary : COLORS.border
                        }`,
                        backdropFilter: "blur(8px)",
                        boxShadow: isActive
                          ? `0 4px 16px ${COLORS.primary}15`
                          : "none",
                      }}
                      animate={isActive ? { scale: [1, 1.03, 1] } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          style={{ color: COLORS.primary }}
                        />
                      ) : (
                        <StepIcon
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          style={{
                            color:
                              isActive || isDone
                                ? COLORS.primary
                                : COLORS.textSecondary,
                          }}
                        />
                      )}
                      <span
                        className="text-xs sm:text-sm font-semibold hidden sm:inline"
                        style={{
                          color:
                            isActive || isDone
                              ? COLORS.primary
                              : COLORS.textSecondary,
                        }}
                      >
                        {step.label}
                      </span>
                    </motion.div>
                    {index < steps.length - 1 && (
                      <div
                        className="w-6 sm:w-12 h-0.5 rounded-full"
                        style={{
                          backgroundColor: isDone
                            ? COLORS.primary
                            : COLORS.border,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        )}

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {success && successData ? (
              // ============================================================
              // Success Modal (دائم)
              // ============================================================
              <motion.div
                key="success"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-3xl p-6 sm:p-8 lg:p-10"
                style={{
                  backgroundColor: COLORS.glassBg,
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: `1px solid ${COLORS.glassBorder}`,
                  boxShadow: "0 20px 60px -20px rgba(0,67,250,0.15)",
                }}
              >
                <div className="text-center space-y-6">
                  <div>
                    <h3
                      className="text-2xl sm:text-3xl font-bold mb-2"
                      style={{ color: COLORS.text }}
                    >
                      تم إنشاء حسابك بنجاح
                    </h3>
                    <p
                      className="text-sm sm:text-base"
                      style={{ color: COLORS.textSecondary }}
                    >
                      مرحباً بك في LiveDent — {successData.clinicName}
                    </p>
                  </div>

                  {/* Credentials Box */}
                  <div className="space-y-3 pt-2">
                    <div
                      className="flex items-center gap-2 p-3 rounded-2xl"
                      style={{
                        backgroundColor: `${COLORS.warning}10`,
                        border: `1px solid ${COLORS.warning}30`,
                      }}
                    >
                      <p
                        className="text-xs sm:text-sm font-medium"
                        style={{ color: COLORS.text }}
                      >
                        احفظ هذه البيانات في مكان آمن — ستحتاجها عندما تسجيل
                        الدخول
                      </p>
                    </div>

                    <CopyButton text={successData.username} label="username" />
                    <CopyButton text={successData.password} label="password" />
                  </div>

                  {/* Confirm Button */}
                 {/* Confirm Button with Fake Redirect Animation */}
<motion.button
  onClick={() => {
    if (!credentialsSaved || (typeof window !== "undefined" && (window as any).__redirecting)) return;
    if (typeof window !== "undefined") (window as any).__redirecting = true;
    // إعادة إطلاق الـ state الداخلي
    const btn = document.getElementById("confirm-redirect-btn");
    if (btn) btn.dispatchEvent(new CustomEvent("start-redirect"));
  }}
  id="confirm-redirect-btn"
  disabled={!credentialsSaved}
  whileHover={credentialsSaved ? { scale: 1.02, y: -2 } : {}}
  whileTap={credentialsSaved ? { scale: 0.98 } : {}}
  className="w-full py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden"
  style={{
    backgroundColor: credentialsSaved ? COLORS.primary : COLORS.border,
    color: credentialsSaved ? "#ffffff" : COLORS.textSecondary,
    cursor: credentialsSaved ? "pointer" : "not-allowed",
    boxShadow: credentialsSaved
      ? `0 8px 24px ${COLORS.primary}30`
      : "none",
  }}
>
  <ConfirmRedirectContent
    ready={credentialsSaved}
    onStart={handleGoToDashboard}
  />
</motion.button>

                  {/* Confirm Checkbox */}
                  <label
                    className="flex items-center justify-center gap-3 cursor-pointer select-none p-3 rounded-2xl transition-all"
                    style={{
                      backgroundColor: credentialsSaved
                        ? `${COLORS.success}10`
                        : "transparent",
                      border: `1.5px dashed ${
                        credentialsSaved ? COLORS.success : COLORS.border
                      }`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={credentialsSaved}
                      onChange={(e) => setCredentialsSaved(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                      onClick={() => {
                        if (!credentialsSaved) {
                          console.log("النقطة مفعلة");
                        }
                      }}
                      style={{
                        backgroundColor: credentialsSaved
                          ? COLORS.success
                          : "transparent",
                        border: `2px solid ${
                          credentialsSaved
                            ? COLORS.success
                            : COLORS.textSecondary
                        }`,
                      }}
                    >
                      {credentialsSaved && (
                        <CheckCircle2
                          className="w-4 h-4 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                    <span
                      className="text-sm sm:text-base font-semibold"
                      style={{
                        color: credentialsSaved ? COLORS.success : COLORS.text,
                      }}
                    >
                      نعم، قمت بحفظ بياناتي في مكان آمن ✓
                    </span>
                  </label>
                </div>
              </motion.div>
            ) : (
              // ============================================================
              // Form Card
              // ============================================================
              <motion.div
                key={`step-${currentStep}`}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-3xl p-5 sm:p-8 lg:p-10 relative overflow-hidden"
                style={{
                  // خلفية زجاجية شبه شفافة - بلور أساسي
                  backgroundColor: "rgba(255, 255, 255, 0.25)",

                  // تشويش قوي + إشباع لوني
                  backdropFilter: "blur(30px) saturate(180%)",
                  WebkitBackdropFilter: "blur(30px) saturate(180%)",

                  // إطار زجاجي ناعم
                  border: "1px solid rgba(255, 255, 255, 0.45)",

                  // ظل خارجي + توهج داخلي (زجاج حقيقي)
                  boxShadow: `
      0 20px 60px -20px rgba(0, 67, 250, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.15) inset,
      0 1px 0 rgba(255, 255, 255, 0.5) inset
    `,
                }}
              >
                {/* ========== Step 1 ========== */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-5"
                  >
                    <div className="text-center mb-4 sm:mb-6">
                      <h3
                        className="text-xl sm:text-2xl font-bold mb-1"
                        style={{ color: COLORS.text }}
                      >
                        المعلومات الأساسية
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.textSecondary }}
                      >
                        بيانات العيادة ورقم التواصل
                      </p>
                    </div>

                    <Field
                      label="اسم الطبيب"
                      icon={User}
                      value={formData.doctorName}
                      onChange={(v) => updateField("doctorName", v)}
                      placeholder="مثال: أحمد محمد علي"
                      autoComplete="name"
                      disabled={loading}
                      focused={focusedField === "doctorName"}
                      onFocus={() => setFocusedField("doctorName")}
                      onBlur={() => setFocusedField(null)}
                    />

                    <Field
                      label="اسم العيادة"
                      icon={Building2}
                      value={formData.clinicName}
                      onChange={(v) => updateField("clinicName", v)}
                      placeholder="مثال: مركز الابتسامة لطب الأسنان"
                      autoComplete="organization"
                      disabled={loading}
                      focused={focusedField === "clinicName"}
                      onFocus={() => setFocusedField("clinicName")}
                      onBlur={() => setFocusedField(null)}
                    />

                    <Field
                      label="موقع العيادة"
                      icon={MapPin}
                      value={formData.clinicLocation}
                      onChange={(v) => updateField("clinicLocation", v)}
                      placeholder="المحافظة، المدينة، الحي..."
                      autoComplete="street-address"
                      disabled={loading}
                      focused={focusedField === "clinicLocation"}
                      onFocus={() => setFocusedField("clinicLocation")}
                      onBlur={() => setFocusedField(null)}
                    />

                    {/* Phone with WhatsApp Verify */}
                    {/* Phone with WhatsApp Verify */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-semibold flex items-center gap-2"
                        style={{ color: COLORS.text }}
                      >
                        <Phone
                          className="w-4 h-4"
                          style={{ color: COLORS.primary }}
                        />
                        رقم الواتساب
                      </label>

                      <div className="relative">
                        <Phone
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-200 z-10"
                          style={{
                            color:
                              focusedField === "phoneNumber"
                                ? COLORS.primary
                                : COLORS.textSecondary,
                          }}
                        />

                        <input
                          type="tel"
                          placeholder="+963 9XX XXX XXX"
                          value={formData.phoneNumber}
                          onChange={handlePhoneChange}
                          onFocus={() => setFocusedField("phoneNumber")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3.5 pr-12 pl-28 rounded-2xl text-sm sm:text-base transition-all duration-200 outline-none font-mono"
                          style={{
                            backgroundColor: COLORS.surface,
                            border: `1.5px solid ${
                              focusedField === "phoneNumber"
                                ? COLORS.primary
                                : COLORS.border
                            }`,
                            color: COLORS.text,
                            boxShadow:
                              focusedField === "phoneNumber"
                                ? `0 0 0 4px ${COLORS.primary}10`
                                : "0 1px 2px rgba(0,0,0,0.02)",
                            direction: "ltr",
                          }}
                          disabled={loading}
                          dir="ltr"
                          autoComplete="tel"
                          inputMode="tel"
                        />

                        {/* زر التحقق - يظهر فقط عند اكتمال الرقم */}
                        {isPhoneValid() && (
                          <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleWhatsAppVerify}
                            type="button"
                            className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all z-20"
                            style={{
                              left: "8px",
                              top: "8px",
                              backgroundColor: "#25D366",
                              color: "#ffffff",
                              boxShadow: "0 2px 8px rgba(37, 211, 102, 0.35)",
                            }}
                            title="اضغط للتحقق من الرقم على الواتساب"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>تحقق</span>
                          </motion.button>
                        )}
                      </div>

                      <p
                        className="text-xs"
                        style={{ color: COLORS.textSecondary }}
                      >
                        {formData.phoneNumber.length === 0
                          ? "أدخل الرقم مع رمز الدولة (مثال: 963...) — سيصلك إشعار قبول عليه"
                          : isPhoneValid()
                            ? "✓ الرقم صحيح — اضغط 'تحقق' للتأكد عبر الواتساب"
                            : "الرقم غير مكتمل — تحقق من الطول ورمز الدولة"}
                      </p>
                    </div>

                    {/* Currency */}
                    <div className="space-y-2 pt-1">
                      <label
                        className="text-sm font-semibold flex items-center gap-2"
                        style={{ color: COLORS.text }}
                      >
                        <DollarSign
                          className="w-4 h-4"
                          style={{ color: COLORS.primary }}
                        />
                        العملة الأساسية للعيادة
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            val: "USD" as const,
                            icon: DollarSign,
                            label: "USD",
                            sub: "دولار أمريكي",
                          },
                          {
                            val: "SP" as const,
                            icon: CreditCard,
                            label: "SP",
                            sub: "ليرة سورية",
                          },
                        ].map((opt) => {
                          const OptIcon = opt.icon;
                          const active = formData.currency === opt.val;
                          return (
                            <motion.button
                              key={opt.val}
                              type="button"
                              onClick={() => updateField("currency", opt.val)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              disabled={loading}
                              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl font-semibold transition-all"
                              style={{
                                backgroundColor: active
                                  ? COLORS.primaryLight
                                  : COLORS.surface,
                                border: `2px solid ${
                                  active ? COLORS.primary : COLORS.border
                                }`,
                                color: active
                                  ? COLORS.primary
                                  : COLORS.textSecondary,
                                boxShadow: active
                                  ? `0 4px 12px ${COLORS.primary}15`
                                  : "none",
                              }}
                            >
                              <OptIcon className="w-4 h-4" />
                              <span className="text-sm">{opt.label}</span>
                              <span
                                className="text-xs opacity-70 hidden sm:inline"
                                style={{
                                  color: active
                                    ? COLORS.primary
                                    : COLORS.textSecondary,
                                }}
                              >
                                ({opt.sub})
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ========== Step 2 ========== */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-5"
                  >
                    <div className="text-center mb-4 sm:mb-6">
                      <h3
                        className="text-xl sm:text-2xl font-bold mb-1"
                        style={{ color: COLORS.text }}
                      >
                        المؤهل العلمي
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.textSecondary }}
                      >
                        ستظهر هذه المعلومات في صفحتك العامة
                      </p>
                    </div>

                    <Field
                      label="الجامعة"
                      icon={GraduationCap}
                      value={formData.university}
                      onChange={(v) => updateField("university", v)}
                      placeholder="مثال: جامعة دمشق"
                      disabled={loading}
                      focused={focusedField === "university"}
                      onFocus={() => setFocusedField("university")}
                      onBlur={() => setFocusedField(null)}
                    />

                    <Field
                      label="سنة التخرج"
                      icon={Calendar}
                      value={formData.graduationYear}
                      onChange={(v) => updateField("graduationYear", v)}
                      placeholder="مثال: 2018"
                      type="number"
                      dir="ltr"
                      inputMode="numeric"
                      min="1950"
                      max={new Date().getFullYear().toString()}
                      disabled={loading}
                      focused={focusedField === "graduationYear"}
                      onFocus={() => setFocusedField("graduationYear")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </motion.div>
                )}

                {/* ========== Step 3 ========== */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 sm:space-y-5"
                  >
                    <div className="text-center mb-4 sm:mb-6">
                      <h3
                        className="text-xl sm:text-2xl font-bold mb-1"
                        style={{ color: COLORS.text }}
                      >
                        إنشاء الحساب
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: COLORS.textSecondary }}
                      >
                        احفظ هذه البيانات — ستحتاجها لتسجيل الدخول
                      </p>
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-semibold flex items-center justify-between gap-2"
                        style={{ color: COLORS.text }}
                      >
                        <span className="flex items-center gap-2">
                          <UserCircle
                            className="w-4 h-4"
                            style={{ color: COLORS.primary }}
                          />
                          اسم المستخدم
                        </span>
                        {!usernameManuallyEdited &&
                          formData.doctorName.length >= 2 && (
                            <span
                              className="text-[10px] font-normal flex items-center gap-1 px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: COLORS.primaryLight,
                                color: COLORS.primary,
                              }}
                            >
                              <Sparkles className="w-3 h-3" />
                              تلقائي
                            </span>
                          )}
                      </label>
                      <div className="relative">
                        <UserCircle
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                          style={{
                            color:
                              focusedField === "username"
                                ? COLORS.primary
                                : COLORS.textSecondary,
                          }}
                        />
                        <input
                          type="text"
                          placeholder="username-xxxx"
                          value={formData.username}
                          onChange={handleUsernameChange}
                          onFocus={() => setFocusedField("username")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3.5 pr-12 pl-12 rounded-2xl text-sm sm:text-base transition-all duration-200 outline-none font-mono"
                          style={{
                            backgroundColor: COLORS.surface,
                            border: `1.5px solid ${
                              focusedField === "username"
                                ? COLORS.primary
                                : COLORS.border
                            }`,
                            color: COLORS.text,
                            boxShadow:
                              focusedField === "username"
                                ? `0 0 0 4px ${COLORS.primary}10`
                                : "0 1px 2px rgba(0,0,0,0.02)",
                          }}
                          disabled={loading}
                          dir="ltr"
                          autoComplete="username"
                        />
                        {usernameStatus !== "idle" && (
                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            {usernameStatus === "checking" ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-5 h-5 rounded-full"
                                style={{
                                  border: `2px solid ${COLORS.primary}30`,
                                  borderTopColor: COLORS.primary,
                                }}
                              />
                            ) : usernameStatus === "available" ? (
                              <CheckCircle2
                                className="w-5 h-5"
                                style={{ color: COLORS.success }}
                              />
                            ) : (
                              <AlertCircle
                                className="w-5 h-5"
                                style={{ color: COLORS.danger }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <p
                        className="text-xs"
                        style={{
                          color:
                            usernameStatus === "available"
                              ? COLORS.success
                              : usernameStatus === "taken"
                                ? COLORS.danger
                                : usernameStatus === "error"
                                  ? COLORS.warning
                                  : COLORS.textSecondary,
                        }}
                      >
                        {usernameStatus === "checking"
                          ? "جاري التحقق..."
                          : usernameStatus === "available"
                            ? "✓ اسم المستخدم متاح"
                            : usernameStatus === "taken"
                              ? "✗ اسم المستخدم مستخدم بالفعل"
                              : usernameStatus === "error"
                                ? "⚠️ تعذّر التحقق من التوفر"
                                : "أحرف إنجليزية صغيرة وأرقام وشرطات (—) فقط"}
                      </p>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-semibold flex items-center gap-2"
                        style={{ color: COLORS.text }}
                      >
                        <Lock
                          className="w-4 h-4"
                          style={{ color: COLORS.primary }}
                        />
                        كلمة المرور
                      </label>
                      <div className="relative">
                        <Lock
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                          style={{
                            color:
                              focusedField === "password"
                                ? COLORS.primary
                                : COLORS.textSecondary,
                          }}
                        />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) =>
                            updateField("password", e.target.value)
                          }
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3.5 pr-12 pl-12 rounded-2xl text-sm sm:text-base transition-all duration-200 outline-none font-mono"
                          style={{
                            backgroundColor: COLORS.surface,
                            border: `1.5px solid ${
                              focusedField === "password"
                                ? COLORS.primary
                                : COLORS.border
                            }`,
                            color: COLORS.text,
                            boxShadow:
                              focusedField === "password"
                                ? `0 0 0 4px ${COLORS.primary}10`
                                : "0 1px 2px rgba(0,0,0,0.02)",
                          }}
                          disabled={loading}
                          dir="ltr"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
                          style={{ color: COLORS.textSecondary }}
                          aria-label={showPassword ? "إخفاء" : "إظهار"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: COLORS.textSecondary }}
                      >
                        6 أحرف على الأقل — يُفضّل خلط أحرف وأرقام ورموز
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="mt-4"
                    >
                      <div
                        className="flex items-center gap-2 p-3 rounded-2xl"
                        style={{
                          backgroundColor: `${COLORS.danger}10`,
                          border: `1px solid ${COLORS.danger}30`,
                        }}
                      >
                        <AlertCircle
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: COLORS.danger }}
                        />
                        <p
                          className="text-sm font-medium"
                          style={{ color: COLORS.danger }}
                        >
                          {error}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center gap-3 mt-6 sm:mt-8">
                  {currentStep > 1 && (
                    <motion.button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-5 sm:px-6 py-3.5 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all"
                      style={{
                        backgroundColor: COLORS.surface,
                        border: `1.5px solid ${COLORS.border}`,
                        color: COLORS.text,
                      }}
                    >
                      <ArrowRight className="w-5 h-5" />
                      السابق
                    </motion.button>
                  )}

                  {currentStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={handleNextStep}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 py-3.5 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-all"
                      style={{
                        backgroundColor: COLORS.primary,
                        color: "#ffffff",
                        boxShadow: `0 8px 24px ${COLORS.primary}30`,
                      }}
                    >
                      التالي
                      <ArrowLeft className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!loading ? { scale: 0.97 } : {}}
                      className="flex-1 py-3.5 rounded-2xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: COLORS.primary,
                        color: "#ffffff",
                        boxShadow: `0 8px 24px ${COLORS.primary}30`,
                      }}
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
                          ></motion.div>
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
        </div>

        {/* Footer */}
        <AnimatedSection delay={0.6} className="mt-10 sm:mt-14 text-center">
          <p
            className="text-xs sm:text-sm flex items-center justify-center gap-2"
            style={{ color: COLORS.textSecondary }}
          >
            <Sparkles className="w-3 h-3" style={{ color: COLORS.primary }} />
            © 2026 LiveDent — جميع الحقوق محفوظة
            <Sparkles className="w-3 h-3" style={{ color: COLORS.primary }} />
          </p>
        </AnimatedSection>
      </div>
    </div>
  );
}

// ============================================================
// Wrapper + Default Export
// ============================================================
function LiveDentRegistrationFormWrapper() {
  const searchParams = useSearchParams();
  const invite_token = searchParams.get("invite_token") || undefined;
  return (
    <LiveDentRegistrationForm logo="/logo.png" invite_token={invite_token} />
  );
}

export default function LiveDentRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: COLORS.background }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full"
            style={{
              border: `4px solid ${COLORS.primary}30`,
              borderTopColor: COLORS.primary,
            }}
          />
        </div>
      }
    >
      <LiveDentRegistrationFormWrapper />
    </Suspense>
  );
}


// ============================================================
// محتوى زر التحويل — بأنيميشن وهمي عند النقر
// ============================================================
function ConfirmRedirectContent({
  ready,
  onStart,
}: {
  ready: boolean;
  onStart: () => void;
}) {
  const [redirecting, setRedirecting] = useState(false);

  // استقبال حدث البدء من الزر الأب
  useEffect(() => {
    const btn = document.getElementById("confirm-redirect-btn");
    if (!btn) return;

    const handler = () => {
      if (redirecting) return;
      setRedirecting(true);
      // ✅ استدعاء التحويل الفعلي بعد بدء الأنيميشن
      setTimeout(() => {
        onStart();
      }, 900);
    };

    btn.addEventListener("start-redirect", handler);
    return () => btn.removeEventListener("start-redirect", handler);
  }, [redirecting, onStart]);

  return (
    <>
      {/* ✨ لمعة متحركة */}
      {redirecting && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
          }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        {redirecting ? (
          <motion.div
            key="redirecting"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2 relative z-10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-5 h-5 rounded-full"
              style={{
                border: `2.5px solid rgba(255,255,255,0.3)`,
                borderTopColor: "#ffffff",
              }}
            />
            <span>جاري التحويل للوحة التحكم...</span>
          </motion.div>
        ) : ready ? (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2 relative z-10"
          >
            <ArrowRight className="w-5 h-5" />
            <span>الدخول للوحة التحكم</span>
          </motion.div>
        ) : (
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2 relative z-10"
          >
            <Lock className="w-5 h-5" />
            <span>يرجى تأكيد حفظ البيانات أولاً</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}