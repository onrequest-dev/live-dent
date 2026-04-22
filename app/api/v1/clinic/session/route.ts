import { decodeJWT } from "@/server/jwt";
import { sanitizeInput } from "@/server/sanitize";
import { supabase_server } from "@/server/supabase-server";
import { ClinicEmployeeJwt,  Session } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }
    
    const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
    if (!jwt_user || typeof jwt_user === "string" ) {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    
    if (jwt_user.role !== 'admin' && jwt_user.role !== 'manager') {
        return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }
    const sessionData: Omit<Session, 'id' | 'clinicId' | 'createdAt'> = sanitizeInput(await (request.json()));
    const clinicId = jwt_user.clinicId;
    const { data, error } = await supabase_server.from("Session").insert({ ...sessionData, clinicId }).select("*").single();
    if (error || !data) {
        console.error("Error adding session:", error);
        return NextResponse.json({ error: "Failed to add session" }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
} 



export async function PUT(
  request: NextRequest,
) {
  const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  // التحقق من JWT
  const jwt = request.cookies.get("jwt")?.value;
  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
  }
  
  const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
  if (!jwt_user || typeof jwt_user === "string") {
    return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
  }
  
  // التحقق من الصلاحيات (admin أو manager فقط)
  if (jwt_user.role !== 'admin' && jwt_user.role !== 'manager') {
    return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
  }
  
  const clinicId = jwt_user.clinicId;
  
  try {
    const sessionData: Partial<Omit<Session, 'id' | 'clinicId' | 'createdAt'>> = sanitizeInput(await request.json());
    
    // ✅ التحقق من أن الجلسة موجودة وتابعة لنفس العيادة قبل التحديث
    const { data: existingSession, error: checkError } = await supabase_server
      .from("Session")
      .select("id, clinicId")
      .eq("id", sessionId)
      .eq("clinicId", clinicId) // ✅ التأكد من أن clinicId تطابق
      .single();
    
    if (checkError || !existingSession) {
      console.error("Session not found or access denied:", checkError);
      return NextResponse.json({ 
        error: "Session not found or you don't have permission to modify it" 
      }, { status: 404 });
    }
    
    // ✅ إضافة وقت التحديث
    const dataToUpdate = {
      ...sessionData,
      updatedAt: new Date().toISOString(),
    };
    
    // ✅ تحديث الجلسة مع شرط clinicId
    const { data, error } = await supabase_server
      .from("Session")
      .update(dataToUpdate)
      .eq("id", sessionId)
      .eq("clinicId", clinicId) // ✅ حصر التحديث على جلسات هذه العيادة فقط
      .select("*")
      .single();
    
    if (error) {
      console.error("Error updating session:", error);
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: "Session not found after update" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data,
      message: "Session updated successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Unexpected error updating session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ============================================================
// حذف جلسة
// ============================================================
export async function DELETE(
  request: NextRequest,
) {
  const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
  }

  const jwt = request.cookies.get("jwt")?.value;
  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
  }
  
  const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
  if (!jwt_user || typeof jwt_user === "string") {
    return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
  }
  
  if (jwt_user.role !== 'admin' && jwt_user.role !== 'manager') {
    return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
  }
  
  const clinicId = jwt_user.clinicId;
  
  try {
    // ✅ التحقق من وجود الجلسة وأنها تابعة للعيادة
    const { data: existingSession, error: checkError } = await supabase_server
      .from("Session")
      .select("id, clinicId")
      .eq("id", sessionId)
      .eq("clinicId", clinicId)
      .single();
    
    if (checkError || !existingSession) {
      console.error("Session not found or access denied:", checkError);
      return NextResponse.json({ 
        error: "Session not found or you don't have permission to delete it" 
      }, { status: 404 });
    }
    
    // ✅ حذف الجلسة مع شرط clinicId
    const { error } = await supabase_server
      .from("Session")
      .delete()
      .eq("id", sessionId)
      .eq("clinicId", clinicId); // ✅ حصر الحذف على جلسات هذه العيادة فقط
    
    if (error) {
      console.error("Error deleting session:", error);
      return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Session deleted successfully" 
    }, { status: 200 });
    
  } catch (error) {
    console.error("Unexpected error deleting session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
