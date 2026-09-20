// components/LoginForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Shield,
  X,
  Info,
} from "lucide-react";
import Image from "next/image";
import { loginEmployee } from "@/client/helpers/auth";

// ============================================================
// نظام الألوان الموحد
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
// SVG الأسنان
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
      animate={{ opacity: 0.08, x: 0, rotate: 0, scale: 1 }}
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
// AnimatedSection
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
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ============================================================
// المكون الرئيسي
// ============================================================
function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "username" | "password" | null
  >(null);
  const [showPassword, setShowPassword] = useState(false);
  const [savedBannerVisible, setSavedBannerVisible] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  const [savedClinicName, setSavedClinicName] = useState<string>("");
  const firstInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // قراءة البيانات المحفوظة من localStorage
  // ============================================================
  useEffect(() => {
    try {
      const raw = localStorage.getItem("livedent_saved_credentials");
      if (!raw) return;

      const parsed = JSON.parse(raw);

      // تحقق بسيط من البنية
      if (parsed && typeof parsed.username === "string") {
        setUsername(parsed.username);
        if (typeof parsed.password === "string") {
          setPassword(parsed.password);
        }
        if (parsed.clinicName) {
          setSavedClinicName(parsed.clinicName);
        }
        setHasSavedCredentials(true);
        setSavedBannerVisible(true);
      }
    } catch (e) {
      console.warn("Failed to read saved credentials:", e);
    }
  }, []);

  // ============================================================
  // دخول
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    const result = await loginEmployee({ username, password });

    if (result.success) {
      // اختياري: امسح البيانات المحفوظة بعد نجاح الدخول
      try {
        localStorage.removeItem("livedent_saved_credentials");
      } catch {}

      router.push(`/dashboard/${result.data?.slug}`);
      router.refresh();
    } else {
      setError(result.error || "خطأ في اسم المستخدم أو كلمة المرور");
      setLoading(false);
    }
  };

  // ============================================================
  // مسح البيانات المحفوظة
  // ============================================================
  const handleClearSaved = () => {
    try {
      localStorage.removeItem("livedent_saved_credentials");
    } catch {}
    setUsername("");
    setPassword("");
    setHasSavedCredentials(false);
    setSavedBannerVisible(false);
    setSavedClinicName("");
    firstInputRef.current?.focus();
  };

  // ============================================================
  // Variants
  // ============================================================
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8 sm:py-12"
      style={{
        backgroundColor: COLORS.background,
        fontFamily: "'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif",
      }}
    >
      {/* Dental SVG Backgrounds */}
      <DentalSVG
        direction="left"
        size="large"
        className="top-10 -right-24 md:-right-40"
      />
      <DentalSVG
        direction="right"
        size="small"
        className="bottom-10 -left-16 md:-left-32"
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ============================================================
              Header (Logo + Title)
          ============================================================ */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 150 }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-5"
            >
              <div
                className="absolute inset-0 rounded-full opacity-20"
                style={{
                  background: `radial-gradient(circle, ${COLORS.primary}, transparent)`,
                  filter: "blur(20px)",
                }}
              />
              <Image
                src="/logo.png"
                alt="LiveDent"
                fill
                className="object-contain relative z-10"
                priority
              />
            </motion.div>
          </motion.div>

          {/* ============================================================
              Saved Credentials Banner
          ============================================================ */}
          <AnimatePresence>
            {savedBannerVisible && hasSavedCredentials && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div
                  className="flex items-start gap-3 p-3.5 rounded-2xl"
                  style={{
                    backgroundColor: `${COLORS.success}10`,
                    border: `1.5px solid ${COLORS.success}30`,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold mb-0.5"
                      style={{ color: COLORS.text }}
                    >
                      تم تعبئة بياناتك المحفوظة
                      {savedClinicName && (
                        <span
                          className="font-normal"
                          style={{ color: COLORS.textSecondary }}
                        >
                          {" — "}
                          {savedClinicName}
                        </span>
                      )}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: COLORS.textSecondary }}
                    >
                      يمكنك الدخول مباشرة أو مسح البيانات لتسجيل حساب آخر
                    </p>
                  </div>

                  <button
                    onClick={handleClearSaved}
                    className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                    style={{ color: COLORS.textSecondary }}
                    aria-label="مسح البيانات المحفوظة"
                    title="مسح البيانات المحفوظة"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============================================================
              Login Card
          ============================================================ */}
<motion.div
  variants={cardVariants}
  className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
  style={{
    // خلفية زجاجية شبه شفافة - أقوى بلور
    backgroundColor: "rgba(255, 255, 255, 0.25)",

    // تشويش قوي على كل ما خلف البطاقة
    backdropFilter: "blur(30px) saturate(180%)",
    WebkitBackdropFilter: "blur(30px) saturate(180%)",

    // إطار زجاجي متدرج
    border: "1px solid rgba(255, 255, 255, 0.45)",

    // ظل ناعم + توهج داخلي
    boxShadow: `
      0 20px 60px -20px rgba(0, 67, 250, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.15) inset,
      0 1px 0 rgba(255, 255, 255, 0.5) inset
    `,
  }}
>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ============================================================
                  Username Field
              ============================================================ */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label
                  className="text-sm font-semibold flex items-center gap-2"
                  style={{ color: COLORS.text }}
                >
                  <User
                    className="w-4 h-4"
                    style={{ color: COLORS.primary }}
                  />
                  اسم المستخدم
                </label>
                <div className="relative">
                  <User
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-200"
                    style={{
                      color:
                        focusedField === "username"
                          ? COLORS.primary
                          : COLORS.textSecondary,
                    }}
                  />
                  <input
                    ref={firstInputRef}
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField("username")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-4 py-3.5 pr-12 rounded-2xl text-sm sm:text-base transition-all duration-200 outline-none font-mono"
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
                    required
                    disabled={loading}
                    dir="ltr"
                    autoComplete="username"
                    inputMode="text"
                  />
                </div>
              </motion.div>

              {/* ============================================================
                  Password Field
              ============================================================ */}
              <motion.div variants={itemVariants} className="space-y-2">
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors duration-200"
                    style={{
                      color:
                        focusedField === "password"
                          ? COLORS.primary
                          : COLORS.textSecondary,
                    }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    required
                    disabled={loading}
                    dir="ltr"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
                    style={{ color: COLORS.textSecondary }}
                    aria-label={
                      showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* ============================================================
                  Error Message
              ============================================================ */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
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

              {/* ============================================================
                  Submit Button
              ============================================================ */}
              <motion.div variants={itemVariants} className="pt-1">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="w-full py-3.5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: COLORS.primary,
                    color: "#ffffff",
                    boxShadow: `0 8px 24px ${COLORS.primary}30`,
                  }}
                >
                  {loading ? (
                    <>
                      جاري الدخول...
                    </>
                  ) : (
                    <>
                      دخول
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* ============================================================
                  Create Account Link
              ============================================================ */}
              <div
                className="text-center pt-4"
                style={{ borderTop: `1px solid ${COLORS.border}` }}
              >
                <p
                  className="text-sm mb-2"
                  style={{ color: COLORS.textSecondary }}
                >
                  لا تملك حساباً بعد؟
                </p>
                <a
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  style={{ color: COLORS.primary }}
                >
                  إنشاء حساب جديد
                </a>
              </div>
            </form>
          </motion.div>

          {/* ============================================================
              Footer
          ============================================================ */}
          <AnimatedSection delay={0.5} className="text-center">
            <p
              className="text-xs flex items-center justify-center gap-2"
              style={{ color: COLORS.textSecondary }}
            >
              © 2026 LiveDent — جميع الحقوق محفوظة
            </p>
          </AnimatedSection>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}