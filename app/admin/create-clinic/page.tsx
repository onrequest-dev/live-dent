// app/admin/create-clinic/page.tsx
"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Building2,
  User,
  Mail,
  Lock,
  Stethoscope,
  GraduationCap,
  Briefcase,
  Calendar,
  University,
  Phone,
  ArrowRight,
  Sparkles,
  Send,
  CheckCircle2,
  FileText,
  DollarSign,
  CreditCard,
} from "lucide-react";

interface CreateClinicForm {
  clinic: {
    name: string;
    address: string;
  };
  doctor: {
    fullName: string;
    specialization: string;
    about: string;
    education: string;
    experience: string;
    graduationYear: string;
    university: string;
    contactEmail: string;
  };
  credentials: {
    username: string;
    password: string;
  };
  settings: {
    currency: "USD" | "SP";
  };
}

export default function CreateClinicPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<CreateClinicForm>({
    clinic: {
      name: "",
      address: "",
    },
    doctor: {
      fullName: "",
      specialization: "",
      about: "",
      education: "",
      experience: "",
      graduationYear: "",
      university: "",
      contactEmail: "",
    },
    credentials: {
      username: "",
      password: "",
    },
    settings: {
      currency: "USD",
    },
  });

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const educationArray = formData.doctor.education
        .split("\n")
        .filter((item) => item.trim());
      const experienceArray = formData.doctor.experience
        .split("\n")
        .filter((item) => item.trim());

      const requestBody = {
        clinic_data: {
          name: formData.clinic.name,
          address: formData.clinic.address,
          subscriptionStatus: "trial",
          currency: formData.settings.currency,
          createdAt: new Date(),
          doctorProfile: {
            fullName: formData.doctor.fullName,
            specialization: formData.doctor.specialization,
            about: formData.doctor.about,
            education: educationArray,
            experience: experienceArray,
            graduationYear: formData.doctor.graduationYear,
            university: formData.doctor.university,
            contactEmail: formData.doctor.contactEmail,
          },
          settings: {
            defaultAppointmentDuration: 30,
            workingHours: [],
            primaryColor: "#4383a5",
            secondaryColor: "#6d6d6d",
          },
        },
        credentials: {
          username: formData.credentials.username,
          password: formData.credentials.password,
        },
      };

      const response = await fetch("/api/v1/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          clinic: { name: "", address: "" },
          doctor: {
            fullName: "",
            specialization: "",
            about: "",
            education: "",
            experience: "",
            graduationYear: "",
            university: "",
            contactEmail: "",
          },
          credentials: { username: "", password: "" },
          settings: { currency: "USD" },
        });
        setCurrentStep(1);
      } else {
        throw new Error("حدث خطأ أثناء إنشاء العيادة");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    section: keyof CreateClinicForm,
    field: string,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const nextStep = () => {
    if (currentStep === 1 && !formData.clinic.name) {
      setError("يرجى إدخال اسم العيادة");
      return;
    }
    if (currentStep === 2 && !formData.doctor.fullName) {
      setError("يرجى إدخال اسم الطبيب");
      return;
    }
    setError("");
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError("");
  };

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
        damping: 10,
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
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-tl from-teal-400 to-cyan-600 rounded-full blur-3xl" />
      </div>

      {/* Gradient Corners */}
      <div
        className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 0% 0%, ${hexToRgba("#14b8a6", 0.15)} 0%, ${hexToRgba("#14b8a6", 0.05)} 40%, transparent 70%)`,
        }}
      />
      <div
        className="absolute top-0 left-0 w-40 h-40 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${hexToRgba("#14b8a6", 0.3)} 0%, transparent 100%)`,
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      />

      <div
        className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 100%, ${hexToRgba("#14b8a6", 0.15)} 0%, ${hexToRgba("#14b8a6", 0.05)} 40%, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
        style={{
          background: `linear-gradient(315deg, ${hexToRgba("#14b8a6", 0.3)} 0%, transparent 100%)`,
          clipPath: "polygon(100% 100%, 0 100%, 100% 0)",
        }}
      />

      {/* Shimmer Effects */}
      <motion.div
        className="absolute top-0 left-0 w-0.5 h-32"
        style={{
          backgroundImage: `linear-gradient(to bottom, #14b8a6, transparent)`,
        }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-0 left-0 w-32 h-0.5"
        style={{
          backgroundImage: `linear-gradient(to right, #14b8a6, transparent)`,
        }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-0.5 h-32"
        style={{
          backgroundImage: `linear-gradient(to top, #14b8a6, transparent)`,
        }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-32 h-0.5"
        style={{
          backgroundImage: `linear-gradient(to left, #14b8a6, transparent)`,
        }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              className="inline-flex items-center justify-center mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30">
                <span className="text-4xl font-bold text-white">LD</span>
              </div>
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mb-3 tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              إنشاء عيادة جديدة
            </motion.h1>
            <motion.p
              className="text-white/70 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              أدخل بيانات العيادة والطبيب لإنشاء حساب جديد
            </motion.p>
          </motion.div>

          {/* Step Indicator */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-3"
          >
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentStep === step
                    ? "bg-teal-400 w-8"
                    : currentStep > step
                      ? "bg-teal-600"
                      : "bg-gray-600"
                }`}
              />
            ))}
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#0F1F35] backdrop-blur-xl rounded-2xl shadow-2xl border border-teal-500/20 p-6 sm:p-8"
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
                  <h3 className="text-2xl font-bold text-white">
                    تم إنشاء العيادة بنجاح! ✅
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    يمكن الآن للطبيب تسجيل الدخول باستخدام
                    <br />
                    اسم المستخدم وكلمة المرور
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setFormData({
                      clinic: { name: "", address: "" },
                      doctor: {
                        fullName: "",
                        specialization: "",
                        about: "",
                        education: "",
                        experience: "",
                        graduationYear: "",
                        university: "",
                        contactEmail: "",
                      },
                      credentials: { username: "", password: "" },
                      settings: { currency: "USD" },
                    });
                    setCurrentStep(1);
                  }}
                  className="px-6 py-2 rounded-xl text-sm font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  إنشاء عيادة جديدة
                </motion.button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Step 1: Clinic Info */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-400" />
                        اسم العيادة *
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "clinicName"
                            ? "transform scale-[1.02]"
                            : ""
                        }`}
                      >
                        <Building2
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                            focusedField === "clinicName"
                              ? "text-teal-400"
                              : "text-gray-400"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="أدخل اسم العيادة"
                          value={formData.clinic.name}
                          onChange={(e) =>
                            handleChange("clinic", "name", e.target.value)
                          }
                          onFocus={() => setFocusedField("clinicName")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                          required
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-teal-400" />
                        عنوان العيادة
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "clinicAddress"
                            ? "transform scale-[1.02]"
                            : ""
                        }`}
                      >
                        <Building2
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                            focusedField === "clinicAddress"
                              ? "text-teal-400"
                              : "text-gray-400"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="أدخل عنوان العيادة"
                          value={formData.clinic.address}
                          onChange={(e) =>
                            handleChange("clinic", "address", e.target.value)
                          }
                          onFocus={() => setFocusedField("clinicAddress")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    {/* Currency Selection - New Field in Step 1 */}
                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-teal-400" />
                        العملة الأساسية *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          type="button"
                          onClick={() =>
                            handleChange("settings", "currency", "USD")
                          }
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                            formData.settings.currency === "USD"
                              ? "border-teal-400 bg-teal-500/20 text-teal-400 shadow-lg shadow-teal-500/20"
                              : "border-gray-600 bg-[#1A2A44] text-gray-400 hover:border-teal-400/50"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <DollarSign className="w-5 h-5" />
                          <span className="font-medium">USD</span>
                          <span className="text-xs opacity-60">(دولار)</span>
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() =>
                            handleChange("settings", "currency", "SP")
                          }
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                            formData.settings.currency === "SP"
                              ? "border-teal-400 bg-teal-500/20 text-teal-400 shadow-lg shadow-teal-500/20"
                              : "border-gray-600 bg-[#1A2A44] text-gray-400 hover:border-teal-400/50"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CreditCard className="w-5 h-5" />
                          <span className="font-medium">SP</span>
                          <span className="text-xs opacity-60">(ل.س)</span>
                        </motion.button>
                      </div>
                      <p className="text-xs text-gray-500 mr-1">
                        سيتم استخدام هذه العملة لجميع المعاملات المالية في
                        العيادة
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Doctor Info */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                  >
                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-400" />
                        الاسم الكامل للطبيب *
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "doctorName"
                            ? "transform scale-[1.02]"
                            : ""
                        }`}
                      >
                        <User
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                            focusedField === "doctorName"
                              ? "text-teal-400"
                              : "text-gray-400"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="د. أحمد محمد علي"
                          value={formData.doctor.fullName}
                          onChange={(e) =>
                            handleChange("doctor", "fullName", e.target.value)
                          }
                          onFocus={() => setFocusedField("doctorName")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                          required
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-teal-400" />
                        التخصص *
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "specialization"
                            ? "transform scale-[1.02]"
                            : ""
                        }`}
                      >
                        <Stethoscope
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                            focusedField === "specialization"
                              ? "text-teal-400"
                              : "text-gray-400"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="دكتوراه في تركيبات وتجميل الأسنان"
                          value={formData.doctor.specialization}
                          onChange={(e) =>
                            handleChange(
                              "doctor",
                              "specialization",
                              e.target.value,
                            )
                          }
                          onFocus={() => setFocusedField("specialization")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                          required
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-400" />
                        نبذة عن الطبيب
                      </label>
                      <textarea
                        rows={3}
                        placeholder="أكتب نبذة تعريفية عن الطبيب..."
                        value={formData.doctor.about}
                        onChange={(e) =>
                          handleChange("doctor", "about", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-teal-400" />
                        المؤهلات العلمية (سطر لكل مؤهل)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="بكالوريوس طب الأسنان - جامعة القاهرة&#10;ماجستير علاج الجذور - جامعة عين شمس"
                        value={formData.doctor.education}
                        onChange={(e) =>
                          handleChange("doctor", "education", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-teal-400" />
                        الخبرات العملية (سطر لكل خبرة)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="10 سنوات في زراعة الأسنان&#10;مدير مركز الابتسامة الطبي منذ 2018"
                        value={formData.doctor.experience}
                        onChange={(e) =>
                          handleChange("doctor", "experience", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                        dir="rtl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-teal-400" />
                          سنة التخرج *
                        </label>
                        <input
                          type="number"
                          placeholder="2020"
                          value={formData.doctor.graduationYear}
                          onChange={(e) =>
                            handleChange(
                              "doctor",
                              "graduationYear",
                              e.target.value,
                            )
                          }
                          className="w-full px-4 py-3 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium flex items-center gap-2">
                          <University className="w-4 h-4 text-teal-400" />
                          الجامعة *
                        </label>
                        <input
                          type="text"
                          placeholder="جامعة القاهرة"
                          value={formData.doctor.university}
                          onChange={(e) =>
                            handleChange("doctor", "university", e.target.value)
                          }
                          className="w-full px-4 py-3 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                          required
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-teal-400" />
                        البريد الإلكتروني للتواصل
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "email"
                            ? "transform scale-[1.02]"
                            : ""
                        }`}
                      >
                        <Mail
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                            focusedField === "email"
                              ? "text-teal-400"
                              : "text-gray-400"
                          }`}
                        />
                        <input
                          type="email"
                          placeholder="doctor@example.com"
                          value={formData.doctor.contactEmail}
                          onChange={(e) =>
                            handleChange(
                              "doctor",
                              "contactEmail",
                              e.target.value,
                            )
                          }
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Credentials */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-400" />
                        اسم المستخدم *
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "username"
                            ? "transform scale-[1.02]"
                            : ""
                        }`}
                      >
                        <User
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                            focusedField === "username"
                              ? "text-teal-400"
                              : "text-gray-400"
                          }`}
                        />
                        <input
                          type="text"
                          placeholder="اسم المستخدم لتسجيل الدخول"
                          value={formData.credentials.username}
                          onChange={(e) =>
                            handleChange(
                              "credentials",
                              "username",
                              e.target.value,
                            )
                          }
                          onFocus={() => setFocusedField("username")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                          required
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-white text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4 text-teal-400" />
                        كلمة المرور *
                      </label>
                      <div
                        className={`relative transition-all duration-300 ${
                          focusedField === "password"
                            ? "transform scale-[1.02]"
                            : ""
                        }`}
                      >
                        <Lock
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${
                            focusedField === "password"
                              ? "text-teal-400"
                              : "text-gray-400"
                          }`}
                        />
                        <input
                          type="password"
                          placeholder="كلمة المرور"
                          value={formData.credentials.password}
                          onChange={(e) =>
                            handleChange(
                              "credentials",
                              "password",
                              e.target.value,
                            )
                          }
                          onFocus={() => setFocusedField("password")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3 pr-12 bg-[#1A2A44] border border-teal-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-200"
                          required
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Show selected currency in step 3 for confirmation */}
                    <div className="bg-[#1A2A44] rounded-xl p-4 border border-teal-500/10">
                      <p className="text-sm text-gray-400">
                        العملة المحددة للعيادة:
                      </p>
                      <p className="text-lg font-semibold text-teal-400 mt-1 flex items-center gap-2">
                        {formData.settings.currency === "USD" ? (
                          <>
                            <DollarSign className="w-5 h-5" />
                            USD - دولار أمريكي
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            SP - ليرة سورية
                          </>
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-3"
                  >
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <motion.button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-gray-700/50 text-white border border-gray-600 hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      السابق
                    </motion.button>
                  )}

                  {currentStep < 3 ? (
                    <motion.button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-teal-500 to-teal-400 text-[#0A1628] font-bold hover:shadow-lg transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      التالي
                      <ArrowRight className="inline-block mr-2 w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="flex-1 relative group overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-teal-400 text-[#0A1628] py-3 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            جاري الإنشاء...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            إنشاء العيادة
                          </>
                        )}
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-teal-400 to-teal-500"
                        initial={{ x: "100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  )}
                </div>
              </form>
            )}
          </motion.div>

          {/* Copyright */}
          <motion.p
            variants={itemVariants}
            className="text-center text-gray-500 text-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3 h-3 text-teal-400" />
            © 2026 LiveDent. جميع الحقوق محفوظة
            <Sparkles className="w-3 h-3 text-teal-400" />
          </motion.p>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a2a44;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #14b8a6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0d9488;
        }
      `}</style>
    </div>
  );
}
