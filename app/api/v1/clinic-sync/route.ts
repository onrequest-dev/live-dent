import { decodeJWT } from "@/server/jwt";
import { supabase_server } from "@/server/supabase-server";
import { ClinicEmployeeJwt } from "@/types";
import { NextRequest, NextResponse } from "next/server";

// ============================================================
// دالة مساعدة للتحقق من الـ JWT
// ============================================================
function authenticate(request: NextRequest): 
  | { ok: true; clinicId: string } 
  | { ok: false; response: NextResponse } {
  
  const jwt = request.cookies.get("jwt")?.value;
  if (!jwt) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 }),
    };
  }

  const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
  if (!jwt_user || typeof jwt_user === "string") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 }),
    };
  }

  if (jwt_user.role !== "admin" && jwt_user.role !== "manager") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 }),
    };
  }

  return { ok: true, clinicId: jwt_user.clinicId };
}

// ============================================================
// GET: جلب كل المفاتيح الخاصة بالعيادة
// ============================================================
export async function GET(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.ok) return auth.response;
  const { clinicId } = auth;

  const { data, error } = await supabase_server
    .from("clinic_local_storage")
    .select("key_name, key_value, updated_at")
    .eq("clinic_id", clinicId);   // ✅ فلترة صارمة بالعيادة

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // نرجع كائن { key: value } لتسهيل الدمج في العميل
  const result: Record<string, { value: string; updatedAt: string }> = {};
  for (const row of data || []) {
    result[row.key_name] = {
      value: row.key_value,
      updatedAt: row.updated_at,
    };
  }

  return NextResponse.json({ data: result });
}

// ============================================================
// POST: رفع/تحديث مفتاح واحد (Upsert)
// ============================================================
export async function POST(request: NextRequest) {
  const auth = authenticate(request);
  if (!auth.ok) return auth.response;
  const { clinicId } = auth;

  let body: { key_name?: string; key_value?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { key_name, key_value } = body;

  if (!key_name || typeof key_name !== "string") {
    return NextResponse.json({ error: "key_name is required" }, { status: 400 });
  }
  if (typeof key_value !== "string") {
    return NextResponse.json({ error: "key_value must be a string" }, { status: 400 });
  }

  // ✅ منع كتابة أي مفتاح لا يخص العيادة - نضمن أن clinicId من الـ JWT
  const { data, error } = await supabase_server
    .from("clinic_local_storage")
    .upsert(
      {
        clinic_id: clinicId,
        key_name,
        key_value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clinic_id,key_name" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}