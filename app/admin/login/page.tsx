// app/admin/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_key: adminKey }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 800);
      } else {
        setError(data.error || "فشل تسجيل الدخول");
        setIsLoading(false);
      }
    } catch {
      setError("تعذر الاتصال بالخادم");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] relative overflow-hidden flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="bg-[#0F1F35] backdrop-blur-xl rounded-3xl shadow-2xl border border-teal-500/20 p-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30 mb-6"
          >
            <span className="text-2xl font-bold text-white">LD</span>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-white mb-1.5">
              تسجيل دخول المسؤول
            </h1>
            <p className="text-sm text-white/50">
              أدخل مفتاح المسؤول للمتابعة
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                />
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="أدخل مفتاح المسؤول"
                  required
                  autoComplete="off"
                  autoFocus
                  dir="ltr"
                  className="w-full px-4 py-3.5 pr-12 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all"
                />
              </div>
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Success */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm"
              >
                <Sparkles size={16} className="flex-shrink-0" />
                <span>تم تسجيل الدخول — جاري التوجيه...</span>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !adminKey || success}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-[#0A1628] font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-[#0A1628]/30 border-t-[#0A1628] rounded-full"
                  />
                  جاري التحقق...
                </>
              ) : (
                <>
                  دخول
                  <ArrowRight size={16} className="rotate-180" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-[10px] text-white/30"
          >
            © 2026 LiveDent. جميع الحقوق محفوظة
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}