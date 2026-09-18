// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase_server } from "@/server/supabase-server";

export async function GET(request: NextRequest) {
  // ✅ التحقق من كوكي المدير
  const adminToken = request.cookies.get("admin_token")?.value;
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid admin token" },
      { status: 401 }
    );
  }

  try {
    // ✅ جلب جميع العيادات
    const { data: clinics, error: clinicsError } = await supabase_server
      .from("Clinic")
      .select("id, name, subscriptionStatus, createdAt");

    if (clinicsError) {
      console.error("Fetch clinics error:", clinicsError);
      return NextResponse.json(
        { error: "Failed to fetch clinics" },
        { status: 500 }
      );
    }

    const allClinics = clinics || [];

    // ✅ حساب الإحصائيات
    const totalClinics = allClinics.length;
    const activeClinics = allClinics.filter(
      (c) => c.subscriptionStatus === "active"
    ).length;
    const trialClinics = allClinics.filter(
      (c) => c.subscriptionStatus === "trial"
    ).length;
    const expiredClinics = allClinics.filter(
      (c) => c.subscriptionStatus === "expired"
    ).length;

    // ✅ إحصائيات آخر 30 يوم
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last30DaysClinics = allClinics.filter(
      (c) => new Date(c.createdAt) >= thirtyDaysAgo
    ).length;

    // ✅ إحصائيات هذا الشهر
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthClinics = allClinics.filter(
      (c) => new Date(c.createdAt) >= startOfMonth
    ).length;

    // ✅ إجمالي المرضى
    const { count: totalPatients } = await supabase_server
      .from("Patient")
      .select("*", { count: "exact", head: true });

    // ✅ إجمالي الجلسات
    const { count: totalSessions } = await supabase_server
      .from("Session")
      .select("*", { count: "exact", head: true });

    // ✅ نمو العيادات آخر 30 يوم (يوم بيوم)
    const growthChart: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const count = allClinics.filter((c) => {
        const clinicDate = new Date(c.createdAt).toISOString().split("T")[0];
        return clinicDate === dateStr;
      }).length;
      growthChart.push({ date: dateStr, count });
    }

    return NextResponse.json({
      success: true,
      data: {
        clinics: {
          total: totalClinics,
          active: activeClinics,
          trial: trialClinics,
          expired: expiredClinics,
        },
        totals: {
          patients: totalPatients || 0,
          sessions: totalSessions || 0,
        },
        recent: {
          last30Days: last30DaysClinics,
          thisMonth: thisMonthClinics,
        },
        growthChart,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}