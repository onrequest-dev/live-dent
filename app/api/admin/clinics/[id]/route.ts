// app/api/admin/clinics/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase_server } from "@/server/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ✅ التحقق من كوكي المدير
  const adminToken = request.cookies.get("admin_token")?.value;
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid admin token" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { subscriptionStatus } = body;

    // ✅ التحقق من القيمة
    const validStatuses = ["active", "expired", "trial"];
    if (!subscriptionStatus || !validStatuses.includes(subscriptionStatus)) {
      return NextResponse.json(
        { error: "قيمة حالة الاشتراك غير صحيحة" },
        { status: 400 }
      );
    }

    // ✅ تحديث العيادة
    const { data, error } = await supabase_server
      .from("Clinic")
      .update({ subscriptionStatus })
      .eq("id", params.id)
      .select("id, name, subscriptionStatus")
      .single();

    if (error) {
      console.error("Update clinic error:", error);
      return NextResponse.json(
        { error: "فشل تحديث العيادة" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}