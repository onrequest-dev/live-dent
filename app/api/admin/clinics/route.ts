// app/api/admin/clinics/route.ts
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
    // ✅ جلب العيادات
    const { data: clinics, error } = await supabase_server
      .from("Clinic")
      .select(
        `
        id,
        name,
        logo,
        address,
        subscriptionStatus,
        currency,
        createdAt,
        "DoctorProfile" (
          fullName,
          specialization,
          contactEmail
        )
      `
      )
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("Fetch clinics error:", error);
      return NextResponse.json(
        { error: "Failed to fetch clinics" },
        { status: 500 }
      );
    }

    // ✅ جلب عدد المرضى لكل عيادة (بشكل منفصل)
    const clinicsWithCounts = await Promise.all(
      (clinics || []).map(async (clinic) => {
        const { count: patientsCount } = await supabase_server
          .from("Patient")
          .select("*", { count: "exact", head: true })
          .eq("clinicId", clinic.id);

        const { count: sessionsCount } = await supabase_server
          .from("Session")
          .select("*", { count: "exact", head: true })
          .eq("clinicId", clinic.id);

        return {
          ...clinic,
          patientsCount: patientsCount || 0,
          sessionsCount: sessionsCount || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: clinicsWithCounts,
    });
  } catch (error) {
    console.error("Clinics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}