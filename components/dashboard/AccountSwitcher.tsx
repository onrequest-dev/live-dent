// components/dashboard/AccountSwitcher.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  UserCircle,
  PlusCircle,
  Trash2,
  Check,
  ChevronDown,
  Building2,
  MoreVertical,
  Users,
  Search,
  LogOut,
  Loader2,
} from "lucide-react";
import { switchClinic } from "@/client/helpers/switch_accounts";

interface ClinicAccount {
  id: string;
  name: string;
  logo?: string;
  lastActive?: string;
  type?: "clinic" | "hospital" | "center";
}

export function AccountSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState<ClinicAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingAccountId, setSwitchingAccountId] = useState<string | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // تحميل الحسابات من localStorage
  useEffect(() => {
    const storedAccounts = localStorage.getItem("clinics");
    if (storedAccounts) {
      try {
        const parsed = JSON.parse(storedAccounts);
        setAccounts(parsed);
        const activeId = localStorage.getItem("currentClinicId");
        setActiveAccountId(activeId || parsed[0]?.id || null);
      } catch (error) {
        console.error("خطأ في قراءة الحسابات:", error);
      }
    }
  }, []);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        if (!isSwitching) {
          setIsOpen(false);
          setSearchTerm("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSwitching]);

  // تركيز على حقل البحث عند فتح القائمة
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const activeAccount = accounts.find((acc) => acc.id === activeAccountId);

  // تصفية الحسابات حسب البحث
  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSwitchAccount = async (accountId: string) => {
    if (accountId === activeAccountId || isSwitching) return;

    // تفعيل حالة التحميل
    setIsSwitching(true);
    setSwitchingAccountId(accountId);

    try {
      const result = await switchClinic(accountId);

      if (result.success) {
        // تحديث الحالة المحلية
        setActiveAccountId(accountId);
        localStorage.setItem("currentClinicId", accountId);

        // تحديث آخر استخدام للحساب
        const updatedAccounts = accounts.map((acc) =>
          acc.id === accountId
            ? { ...acc, lastActive: new Date().toISOString() }
            : acc,
        );
        setAccounts(updatedAccounts);
        localStorage.setItem("clinics", JSON.stringify(updatedAccounts));
        // إظهار نجاح التبديل لمدة قصيرة ثم تحديث الصفحة
        sessionStorage.setItem("refresh_from_switch_account","true")
        window.location.href = `/dashboard/${accountId}?time=${Date.now()}`; // إعادة تحميل الصفحة لتحديث البيانات
      } else {
        console.error("فشل تبديل الحساب:", result.error);
        // إعادة تعيين حالة التحميل في حالة الفشل
        setIsSwitching(false);
        setSwitchingAccountId(null);
      }
    } catch (error) {
      console.error("خطأ في تبديل الحساب:", error);
      setIsSwitching(false);
      setSwitchingAccountId(null);
    }
  };

  const handleDeleteAccount = (accountId: string) => {
    if (deleteConfirm === accountId) {
      // تنفيذ الحذف
      const updatedAccounts = accounts.filter((acc) => acc.id !== accountId);
      setAccounts(updatedAccounts);
      localStorage.setItem("clinics", JSON.stringify(updatedAccounts));

      // إذا تم حذف الحساب النشط، التبديل للحساب التالي
      if (activeAccountId === accountId && updatedAccounts.length > 0) {
        handleSwitchAccount(updatedAccounts[0].id);
      }
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(accountId);
      // إلغاء تأكيد الحذف بعد 3 ثواني
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleRegisterNewAccount = () => {
    window.location.href = "/log-in";
  };

  const getAccountIcon = (type?: string) => {
    switch (type) {
      case "hospital":
        return <Building2 size={16} className="text-purple-500" />;
      case "center":
        return <Users size={16} className="text-green-500" />;
      default:
        return <Building2 size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* أوفرلي التحميل عند تبديل الحسابات */}
      <AnimatePresence>
        {isSwitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
            >
              {/* أيقونة متحركة */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
              >
                <Loader2 size={36} className="text-blue-600" />
              </motion.div>

              {/* النص */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-gray-900 mb-2"
              >
                جاري تبديل الحساب
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-500 mb-6"
              >
                {accounts.find((a) => a.id === switchingAccountId)?.name ||
                  "الحساب الجديد"}
              </motion.p>

              {/* شريط تقدم متحرك */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </motion.div>

              {/* نقاط تحميل متحركة */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-2 mt-4"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [-4, 4, -4],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-2 h-2 rounded-full bg-blue-400"
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* زر عرض البروفايل الحالي - محسن */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => !isSwitching && setIsOpen(!isOpen)}
        className={`flex items-center gap-3 p-2 pr-3 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 group ${
          isSwitching ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        disabled={isSwitching}
      >
        {/* صورة أو أيقونة الحساب النشط */}
        <div className="relative">
          {activeAccount?.logo ? (
            <Image
              src={activeAccount.logo}
              alt={`شعار ${activeAccount.name}`}
              width={40}
              height={40}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ring-2 ring-white shadow-sm">
              <Building2 size={20} className="text-blue-600" />
            </div>
          )}

          {/* مؤشر الحسابات المتعددة - محسن */}
          {accounts.length > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm"
            >
              <span className="text-[10px] font-bold text-white">
                {accounts.length}
              </span>
            </motion.div>
          )}
        </div>

        {/* معلومات الحساب */}
        <div className="hidden sm:block text-right flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate max-w-[140px]">
            {activeAccount?.name || "اختر حساب"}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-[140px]">
            {isSwitching
              ? "جاري التبديل..."
              : activeAccount?.type || "نشط الآن"}
          </p>
        </div>

        {/* سهم القائمة */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="hidden sm:block"
        >
          <ChevronDown
            size={18}
            className="text-gray-400 group-hover:text-gray-600 transition-colors"
          />
        </motion.div>
      </motion.button>

      {/* القائمة المنسدلة المحسنة */}
      <AnimatePresence>
        {isOpen && !isSwitching && (
          <>
            {/* خلفية شفافة للإغلاق */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
              dir="rtl"
            >
              {/* رأس القائمة مع البحث */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-900">
                    الحسابات
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {accounts.length} حسابات
                  </span>
                </div>

                {/* حقل البحث */}
                {accounts.length > 3 && (
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="ابحث عن حساب..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* قائمة الحسابات */}
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {filteredAccounts.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {filteredAccounts.map((account, index) => (
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                          account.id === activeAccountId
                            ? "bg-blue-50/80 border-2 border-blue-200"
                            : "hover:bg-gray-50 border-2 border-transparent"
                        } ${isSwitching ? "opacity-50 pointer-events-none" : ""}`}
                        onClick={() => handleSwitchAccount(account.id)}
                      >
                        {/* شعار الحساب */}
                        <div className="relative flex-shrink-0">
                          {account.logo ? (
                            <Image
                              src={account.logo}
                              alt={account.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                                account.id === activeAccountId
                                  ? "from-blue-100 to-blue-200"
                                  : "from-gray-100 to-gray-200"
                              } flex items-center justify-center`}
                            >
                              {getAccountIcon(account.type)}
                            </div>
                          )}

                          {/* شارة الحساب النشط */}
                          {account.id === activeAccountId && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white"
                            >
                              <Check size={10} className="text-white" />
                            </motion.div>
                          )}
                        </div>

                        {/* معلومات الحساب */}
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {account.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {account.type === "clinic" && "عيادة"}
                            {account.type === "hospital" && "مستشفى"}
                            {account.type === "center" && "مركز طبي"}
                            {!account.type && "حساب"}
                            {" • "}
                            {account.id.substring(0, 6)}...
                          </p>
                        </div>

                        {/* إجراءات الحساب */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {deleteConfirm === account.id ? (
                            <motion.button
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAccount(account.id);
                              }}
                              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                              title="تأكيد الحذف"
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAccount(account.id);
                              }}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                              title="حذف الحساب"
                            >
                              <MoreVertical size={14} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <UserCircle
                      size={48}
                      className="mx-auto text-gray-300 mb-3"
                    />
                    <p className="text-sm font-medium text-gray-600">
                      لا توجد نتائج
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchTerm
                        ? "جرب مصطلح بحث آخر"
                        : "لا توجد حسابات مسجلة"}
                    </p>
                  </div>
                )}
              </div>

              {/* تذييل القائمة */}
              <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: "#fff" }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleRegisterNewAccount}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                    <PlusCircle size={20} className="text-blue-600" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      إضافة حساب
                    </p>
                    <p className="text-xs text-gray-500">
                      تسجيل عيادة أو حساب جديد
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className="mr-auto rotate-180 text-blue-400"
                  />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
