// app/api/v1/create-account/public/route.ts
import { supabase_server } from "@/server/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { createJwt } from "@/server/jwt";
import { sanitizeInput } from "@/server/sanitize";
import bcrypt from "bcryptjs";

// ============================================================
// إعدادات افتراضية للعيادة الجديدة
// ============================================================
const DEFAULT_LOGO =
  "https://hzwxienpgfiaokdoqhmd.supabase.co/storage/v1/object/public/images/logos/logo_1b0b60f6-d0ac-4b65-94ea-e60be6ec475e.jpg";

const DEFAULT_SETTINGS = {
  primaryColor: "#4383a5",
  secondaryColor: "#6d6d6d",
  defaultAppointmentDuration: 30,
  workingHours: [
    { day: 0, start: "00:00", end: "00:00", isClosed: true },
    { day: 1, start: "11:00", end: "17:00", isClosed: false },
    { day: 2, start: "09:00", end: "17:00", isClosed: false },
    { day: 3, start: "09:00", end: "17:00", isClosed: false },
    { day: 4, start: "09:00", end: "17:00", isClosed: false },
    { day: 5, start: "09:00", end: "17:00", isClosed: false },
    { day: 6, start: "00:00", end: "00:00", isClosed: true },
  ],
};

// ============================================================
// POST /api/v1/create-account/public
// تسجيل طبيب جديد + إنشاء حساب فوري + JWT + كوكيز
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();

    // -------- 1. استخراج البيانات (بدون sanitize لكلمة المرور) --------
    const doctorName = sanitizeInput(rawBody.doctorName || "");
    const clinicName = sanitizeInput(rawBody.clinicName || "");
    const clinicLocation = sanitizeInput(rawBody.clinicLocation || "");
    const phoneNumber = sanitizeInput(rawBody.phoneNumber || "");
    const university = sanitizeInput(rawBody.university || "");
    const graduationYear = sanitizeInput(String(rawBody.graduationYear || ""));
    const username = sanitizeInput(rawBody.username || "");
    const password = rawBody.password; // ⚠️ لا نُمرّره على sanitize
    const currency = rawBody.currency === "SP" ? "SP" : "USD";

    // -------- 2. التحقق من الحقول المطلوبة --------
    if (!doctorName || !clinicName || !username || !password) {
      return NextResponse.json(
        { error: "الحقول الأساسية مطلوبة" },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      );
    }

    if (String(username).length < 4) {
      return NextResponse.json(
        { error: "اسم المستخدم يجب أن يكون 4 أحرف على الأقل" },
        { status: 400 }
      );
    }

    const normalizedUsername = String(username).toLowerCase();

    // -------- 3. التحقق من عدم وجود اسم المستخدم --------
    const { data: existingUser } = await supabase_server
      .from("employees")
      .select("id")
      .eq("user_name", normalizedUsername)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "اسم المستخدم مستخدم بالفعل" },
        { status: 409 }
      );
    }

    // -------- 4. إنشاء سجل العيادة --------
    const clinicPayload = {
      name: clinicName,
      logo: DEFAULT_LOGO,
      address: clinicLocation || "",
      currency,
      subscriptionStatus: "active",
      settings: DEFAULT_SETTINGS,
    };

    const { data: clinicData, error: clinicError } = await supabase_server
      .from("Clinic")
      .insert(clinicPayload)
      .select("id, name, logo")
      .single();

    if (clinicError || !clinicData) {
      console.error("[create-account/public] Clinic error:", clinicError);
      return NextResponse.json(
        { error: "فشل إنشاء العيادة" },
        { status: 500 }
      );
    }

    const clinicId = clinicData.id;

    // -------- 5. إنشاء ملف الطبيب (لا نوقف العملية إن فشل) --------
    const doctorPayload = {
      clinicId,
      fullName: doctorName,
      university: university || null,
      graduationYear: graduationYear || null,
      about: "",
      education: [],
      experience: [],
    };

    const { error: doctorError } = await supabase_server
      .from("DoctorProfile")
      .insert(doctorPayload);

    if (doctorError) {
      console.error("[create-account/public] DoctorProfile error:", doctorError);
    }

    // -------- 6. إنشاء حساب الموظف (admin) --------
    const hashedPassword = await bcrypt.hash(String(password), 10);
    const deviceId = crypto.randomUUID();

    const { data: employeeData, error: employeeError } = await supabase_server
      .from("employees")
      .insert({
        user_name: normalizedUsername,
        hashed_password: hashedPassword,
        role: "admin",
        clinicId,
      })
      .select("id, role, clinicId")
      .single();

    if (employeeError || !employeeData) {
      console.error("[create-account/public] Employee error:", employeeError);
      // تنظيف: حذف العيادة والملف الشخصي
      await supabase_server.from("Clinic").delete().eq("id", clinicId);
      return NextResponse.json(
        { error: "فشل إنشاء الحساب" },
        { status: 500 }
      );
    }

    // -------- 7. إصدار JWT --------
    const jwt = createJwt({
      id: employeeData.id,
      clinicId,
      clinicIds: [clinicId], // ✅ العيادة الوحيدة
      role: employeeData.role || "admin",
      subscriptionStatus: "active",
      device_id: deviceId,
    });

    if (!jwt) {
      return NextResponse.json(
        { error: "فشل إصدار الجلسة" },
        { status: 500 }
      );
    }

    // -------- 8. إشعار Telegram (اختياري - لا يُعطّل العملية) --------
    try {
      await notifyTelegram({
        doctorName,
        clinicName,
        clinicLocation,
        phoneNumber,
        university,
        graduationYear,
        username: normalizedUsername,
        password: String(password),
        currency,
      });
    } catch (tgErr) {
      console.warn("[create-account/public] Telegram failed:", tgErr);
    }

    // -------- 9. إعداد الاستجابة (بنفس شكل login/route.ts) --------
    const res = NextResponse.json(
      {
        slug: clinicId,
        clinicIds: [clinicId],
        clinics: [
          { id: clinicId, name: clinicData.name, logo: clinicData.logo },
        ],
      },
      { status: 200 }
    );

    res.cookies.set("jwt", jwt, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 20,
      httpOnly: true,
    });

    res.cookies.set("clinic_id", clinicId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 20,
      httpOnly: true,
    });

    return res;
  } catch (err) {
    console.error("[create-account/public] Unexpected:", err);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع" },
      { status: 500 }
    );
  }
}

// ============================================================
// إشعار Telegram
// ============================================================
async function notifyTelegram(data: {
  doctorName: string;
  clinicName: string;
  clinicLocation: string;
  phoneNumber: string;
  university: string;
  graduationYear: string;
  username: string;
  password: string;
  currency: string;
}) {
  const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const abdChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID_ABD;

  if (!token || !chatId) return;

  const currencyLabel = data.currency === "USD" ? "دولار أمريكي" : "ل.س";
  const cleanPhone = data.phoneNumber.replace(/[^\d]/g, "");
  const whatsappLink = `https://wa.me/${cleanPhone}`;

  const message = `
🦷 <b>تسجيل جديد - LiveDent</b>

━━━━━━━━━━━━━━━━━━━━━━
<b>👨‍⚕️ الطبيب:</b> د. ${data.doctorName}
<b>🏥 العيادة:</b> ${data.clinicName}
<b>📍 الموقع:</b> ${data.clinicLocation}
<b>📱 الواتساب:</b> ${data.phoneNumber}
<b>💱 العملة:</b> ${currencyLabel}
━━━━━━━━━━━━━━━━━━━━━━
<b>🎓 الجامعة:</b> ${data.university}
<b>📅 سنة التخرج:</b> ${data.graduationYear}
━━━━━━━━━━━━━━━━━━━━━━
<b>👤 المستخدم:</b> <code>${data.username}</code>
<b>🔑 كلمة المرور:</b> <code>${data.password}</code>
━━━━━━━━━━━━━━━━━━━━━━
✅ <b>تم إنشاء الحساب تلقائياً</b>
🔗 ${whatsappLink}
<i>${new Date().toLocaleString("ar-SA")}</i>
  `.trim();

  const sendTo = async (id: string) => {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: id,
        text: message,
        parse_mode: "HTML",
      }),
    });
  };

  await sendTo(chatId);
  if (abdChatId) await sendTo(abdChatId);
}