// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { Smile, User, Lock, ArrowRight, Sparkles, Stethoscope, Shield } from 'lucide-react';
import { loginEmployee } from '@/client/helpers/auth';

function LoginForm() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await loginEmployee({ username, password });

        if (result.success) {
            console.log(result.data || 'Login successful');
            console.log('Clinic slug:', result.data?.slug);
            router.push(`/dashboard/${result.data?.slug}`);
            router.refresh();
        } else {
            setError(result.error || 'خطأ في اسم المستخدم أو كلمة المرور');
        }

        setLoading(false);
    };

    // Animation variants with proper types
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B4F6C] via-[#1A6B8A] to-[#083C52] relative overflow-hidden">
            {/* Animated Background Elements - Medical/Clinical Theme */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-[#40C9FF] rounded-full opacity-10 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00D2FF] rounded-full opacity-5 blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#40C9FF] rounded-full opacity-5 blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.05, 0.08, 0.05],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                />
                
                {/* Tooth Pattern Background */}
                <div className="absolute inset-0 opacity-5">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                rotate: [0, 360],
                            }}
                            transition={{
                                duration: 50 + Math.random() * 30,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        >
                            <Smile className="w-8 h-8 text-white" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Logo and Brand */}
                    <motion.div variants={itemVariants} className="text-center">
                        <motion.div
                            className="inline-flex items-center justify-center mb-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#40C9FF] rounded-full blur-xl opacity-50 animate-pulse" />
                                <div className="relative bg-gradient-to-br from-[#40C9FF] to-[#00D2FF] p-4 rounded-full shadow-lg">
                                    <Smile className="w-10 h-10 text-white" />
                                </div>
                            </div>
                        </motion.div>
                        <motion.h1
                            className="text-5xl font-bold text-white mb-2 tracking-tight"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            live dent
                        </motion.h1>
                        <motion.p
                            className="text-[#40C9FF] text-sm font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            نظام إدارة عيادات الأسنان الذكي
                        </motion.p>
                    </motion.div>

                    {/* Login Card */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Field */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="text-white text-sm font-medium block flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    اسم المستخدم
                                </label>
                                <div
                                    className={`relative transition-all duration-300 ${
                                        focusedField === 'username'
                                            ? 'transform scale-[1.02]'
                                            : ''
                                    }`}
                                >
                                    <User
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                            focusedField === 'username'
                                                ? 'text-[#40C9FF]'
                                                : 'text-white/40'
                                        }`}
                                    />
                                    <input
                                        type="text"
                                        placeholder="أدخل اسم المستخدم"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#40C9FF] focus:ring-2 focus:ring-[#40C9FF]/20 transition-all duration-200"
                                        required
                                        disabled={loading}
                                        dir="rtl"
                                    />
                                </div>
                            </motion.div>

                            {/* Password Field */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="text-white text-sm font-medium block flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    كلمة المرور
                                </label>
                                <div
                                    className={`relative transition-all duration-300 ${
                                        focusedField === 'password'
                                            ? 'transform scale-[1.02]'
                                            : ''
                                    }`}
                                >
                                    <Lock
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                                            focusedField === 'password'
                                                ? 'text-[#40C9FF]'
                                                : 'text-white/40'
                                        }`}
                                    />
                                    <input
                                        type="password"
                                        placeholder="أدخل كلمة المرور"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#40C9FF] focus:ring-2 focus:ring-[#40C9FF]/20 transition-all duration-200"
                                        required
                                        disabled={loading}
                                        dir="rtl"
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
                                    <p className="text-red-400 text-sm text-center">
                                        {error}
                                    </p>
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <motion.div variants={itemVariants}>
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    className="relative w-full group overflow-hidden rounded-xl bg-gradient-to-r from-[#40C9FF] to-[#00D2FF] text-white py-3 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                    <Stethoscope className="w-5 h-5" />
                                                </motion.div>
                                                جاري الدخول...
                                            </>
                                        ) : (
                                            <>
                                                دخول
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-[#00D2FF] to-[#40C9FF]"
                                        initial={{ x: '100%' }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.button>
                            </motion.div>

                            {/* Security Note */}
                            <motion.div
                                variants={itemVariants}
                                className="text-center pt-4 border-t border-white/10"
                            >
                                <p className="text-white/40 text-xs flex items-center justify-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    نظام آمن لإدارة عيادات الأسنان
                                    <Shield className="w-3 h-3" />
                                </p>
                            </motion.div>
                        </form>
                    </motion.div>

                    {/* Footer */}
                    <motion.p
                        variants={itemVariants}
                        className="text-center text-white/30 text-xs flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-3 h-3" />
                        © 2026 live-dent. جميع الحقوق محفوظة
                        <Sparkles className="w-3 h-3" />
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return <LoginForm />;
}