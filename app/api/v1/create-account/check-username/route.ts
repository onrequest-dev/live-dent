import { supabase_server } from "@/server/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // استخراج اسم المستخدم من body الطلب
    const body = await request.json();
    const { user_name } = body;

    // التحقق من وجود user_name في الطلب
    if (!user_name) {
      return NextResponse.json(
        { error: "اسم المستخدم مطلوب" },
        { status: 400 }
      );
    }

    // البحث عن المستخدم في قاعدة البيانات
    const { data, error } = await supabase_server
      .from("employees")
      .select("id, user_name")
      .eq("user_name", user_name)
      .single();

    // في حالة وجود خطأ غير "لم يتم العثور على نتائج"
    if (error && error.code !== "PGRST116") {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "حدث خطأ في قاعدة البيانات" },
        { status: 500 }
      );
    }

    // إرجاع النتيجة
    return NextResponse.json({
      exists: !!data, // true إذا كان المستخدم موجوداً
      user_name: user_name,
      message: data ? "اسم المستخدم موجود" : "اسم المستخدم غير موجود"
    });

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}