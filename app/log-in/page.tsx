// components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
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
            router.push(`/dashboard/${result.data?.slug}`);
            router.refresh();
        } else {
            setError(result.error || 'خطأ في اسم المستخدم أو كلمة المرور');
            setLoading(false)
        }

        // setLoading(false);
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
        <div className="min-h-screen flex items-center justify-center bg-[#0A1628] relative overflow-hidden">
            {/* Golden Gradient Corners */}
            {/* Top Left Corner */}
            <div 
                className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 0% 0%, rgba(255, 215, 0, 0.15) 0%, rgba(255, 200, 0, 0.05) 40%, transparent 70%)'
                }}
            />
            <div 
                className="absolute top-0 left-0 w-40 h-40 pointer-events-none"
                style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, transparent 100%)',
                    clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                }}
            />
            
            {/* Bottom Right Corner */}
            <div 
                className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 100% 100%, rgba(255, 215, 0, 0.15) 0%, rgba(255, 200, 0, 0.05) 40%, transparent 70%)'
                }}
            />
            <div 
                className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
                style={{
                    background: 'linear-gradient(315deg, rgba(255, 215, 0, 0.3) 0%, transparent 100%)',
                    clipPath: 'polygon(100% 100%, 0 100%, 100% 0)'
                }}
            />

            {/* Subtle Shimmer Effect on Golden Edges */}
            <motion.div
                className="absolute top-0 left-0 w-0.5 h-32 bg-gradient-to-b from-yellow-400 to-transparent"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-0 left-0 w-32 h-0.5 bg-gradient-to-r from-yellow-400 to-transparent"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            
            <motion.div
                className="absolute bottom-0 right-0 w-0.5 h-32 bg-gradient-to-t from-yellow-400 to-transparent"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-0 right-0 w-32 h-0.5 bg-gradient-to-l from-yellow-400 to-transparent"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Logo */}
                    <motion.div variants={itemVariants} className="text-center">
                        <motion.div
                            className="inline-flex items-center justify-center mb-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="relative w-28 h-28">
                                <Image
                                    src="/logo.png"
                                    alt="Live Dent Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </motion.div>
                        <motion.h1
                            className="text-4xl font-bold text-white mb-2 tracking-tight"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                            LiveDent
                        </motion.h1>
                        <motion.p
                            className="text-yellow-400 text-sm font-medium"
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
                        className="bg-[#0F1F35] backdrop-blur-xl rounded-2xl shadow-2xl border border-yellow-500/20 p-6 sm:p-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Field */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="text-white text-sm font-medium block flex items-center gap-2">
                                    <User className="w-4 h-4 text-yellow-400" />
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
                                                ? 'text-yellow-400'
                                                : 'text-gray-400'
                                        }`}
                                    />
                                    <input
                                        type="text"
                                        placeholder="أدخل اسم المستخدم"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => setFocusedField('username')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                                        required
                                        disabled={loading}
                                        dir="rtl"
                                    />
                                </div>
                            </motion.div>

                            {/* Password Field */}
                            <motion.div variants={itemVariants} className="space-y-2">
                                <label className="text-white text-sm font-medium block flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-yellow-400" />
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
                                                ? 'text-yellow-400'
                                                : 'text-gray-400'
                                        }`}
                                    />
                                    <input
                                        type="password"
                                        placeholder="أدخل كلمة المرور"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-yellow-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
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
                                        className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500"
                                        initial={{ x: '100%' }}
                                        whileHover={{ x: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.button>
                            </motion.div>

                            {/* Footer */}
                            <div className="text-center pt-4 border-t border-yellow-500/20">
                                <p className="text-gray-400 text-xs flex items-center justify-center gap-1">
                                    <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                                    نظام آمن لإدارة عيادات الأسنان
                                    <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                                </p>
                            </div>
                        </form>
                    </motion.div>

                    {/* Copyright */}
                    <motion.p
                        variants={itemVariants}
                        className="text-center text-gray-500 text-xs flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        © 2026 live-dent. جميع الحقوق محفوظة
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return <LoginForm />;
}