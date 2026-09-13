// components/dashboard/AccountSwitcher.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Building2,
  Check,
  PlusCircle,
  LogOut,
  Loader2,
  ChevronDown,
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
  const [accounts, setAccounts] = useState<ClinicAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingAccountId, setSwitchingAccountId] = useState<string | null>(null);
  const [showAllAccounts, setShowAllAccounts] = useState(false);

  // تحميل الحسابات
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

  const activeAccount = accounts.find((acc) => acc.id === activeAccountId);
  const otherAccounts = accounts.filter((acc) => acc.id !== activeAccountId);

  const handleSwitchAccount = async (accountId: string) => {
    if (accountId === activeAccountId || isSwitching) return;

    setIsSwitching(true);
    setSwitchingAccountId(accountId);

    try {
      const result = await switchClinic(accountId);

      if (result.success) {
        setActiveAccountId(accountId);
        localStorage.setItem("currentClinicId", accountId);

        const updatedAccounts = accounts.map((acc) =>
          acc.id === accountId
            ? { ...acc, lastActive: new Date().toISOString() }
            : acc,
        );
        setAccounts(updatedAccounts);
        localStorage.setItem("clinics", JSON.stringify(updatedAccounts));
        
        sessionStorage.setItem("refresh_from_switch_account", "true");
        window.location.href = `/dashboard/${accountId}?time=${Date.now()}`;
      } else {
        console.error("فشل تبديل الحساب:", result.error);
        setIsSwitching(false);
        setSwitchingAccountId(null);
      }
    } catch (error) {
      console.error("خطأ في تبديل الحساب:", error);
      setIsSwitching(false);
      setSwitchingAccountId(null);
    }
  };

  const handleRegisterNewAccount = () => {
    window.location.href = "/log-in";
  };

  // ✅ إذا لا توجد حسابات
  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <p className="text-center text-gray-500 text-sm">لا توجد حسابات مسجلة</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ✅ أوفرلي التحميل */}
      <AnimatePresence>
        {isSwitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center"
              >
                <Loader2 size={28} className="text-blue-600" />
              </motion.div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">جاري تبديل الحساب</h3>
              <p className="text-sm text-gray-500">
                {accounts.find((a) => a.id === switchingAccountId)?.name || ""}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ رأس القسم */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">الحسابات</h3>
          <span className="text-xs text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
            {accounts.length} حسابات
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* ✅ الحساب النشط - متميز */}
        {activeAccount && (
          <div
            className="p-4 rounded-xl border-2 flex items-center gap-4"
            style={{
              borderColor: "#10B981",
              backgroundColor: "#10B98108",
            }}
          >
            {/* الشعار */}
            <div className="relative flex-shrink-0">
              {activeAccount.logo ? (
                <Image
                  src={activeAccount.logo}
                  alt={activeAccount.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-green-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center ring-2 ring-green-200">
                  <Building2 size={22} className="text-green-600" />
                </div>
              )}
              
              {/* شارة نشط */}
              <span className="absolute -top-1.5 -left-1.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                نشط
              </span>
            </div>

            {/* المعلومات */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 truncate">{activeAccount.name}</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">
                الحساب الحالي
              </p>
            </div>

            {/* علامة صح */}
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check size={16} className="text-white" strokeWidth={3} />
            </div>
          </div>
        )}

        {/* ✅ الحسابات الأخرى */}
        {otherAccounts.length > 0 && (
          <AnimatePresence>
            {(showAllAccounts || otherAccounts.length <= 2) &&
              otherAccounts.map((account, index) => (
                <motion.button
                  key={account.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSwitchAccount(account.id)}
                  disabled={isSwitching}
                  className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  {/* الشعار */}
                  <div className="flex-shrink-0">
                    {account.logo ? (
                      <Image
                        src={account.logo}
                        alt={account.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Building2 size={18} className="text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* المعلومات */}
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {account.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {account.type === "clinic" && "عيادة"}
                      {account.type === "hospital" && "مستشفى"}
                      {account.type === "center" && "مركز طبي"}
                      {!account.type && "حساب"}
                    </p>
                  </div>

                  {/* مؤشر التبديل */}
                  {isSwitching && switchingAccountId === account.id ? (
                    <Loader2 size={18} className="animate-spin text-blue-500 flex-shrink-0" />
                  ) : (
                    <span className="text-xs text-blue-600 font-medium flex-shrink-0">
                      تبديل
                    </span>
                  )}
                </motion.button>
              ))}
          </AnimatePresence>
        )}

        {/* ✅ زر عرض المزيد */}
        {otherAccounts.length > 2 && !showAllAccounts && (
          <button
            onClick={() => setShowAllAccounts(true)}
            className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
          >
            <ChevronDown size={16} />
            عرض {otherAccounts.length - 2} حسابات أخرى
          </button>
        )}

        {showAllAccounts && otherAccounts.length > 2 && (
          <button
            onClick={() => setShowAllAccounts(false)}
            className="w-full py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
          >
            <ChevronDown size={16} className="rotate-180" />
            إخفاء الحسابات
          </button>
        )}

        {/* ✅ زر إضافة حساب */}
        <button
          onClick={handleRegisterNewAccount}
          className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <PlusCircle size={20} className="text-blue-600" />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">إضافة حساب جديد</p>
            <p className="text-xs text-gray-500">تسجيل عيادة أو حساب آخر</p>
          </div>
        </button>
      </div>
    </div>
  );
}