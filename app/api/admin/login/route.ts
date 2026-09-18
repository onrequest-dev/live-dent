// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { admin_key } = body;

    // ✅ التحقق من المفتاح
    if (!admin_key || admin_key !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: "مفتاح المدير غير صحيح" },
        { status: 401 }
      );
    }

    if (!process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        { error: "ADMIN_TOKEN غير معرّف في متغيرات البيئة" },
        { status: 500 }
      );
    }

    // ✅ إنشاء الاستجابة + الكوكي
    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
    });

    response.cookies.set({
      name: "admin_token",
      value: process.env.ADMIN_TOKEN,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}