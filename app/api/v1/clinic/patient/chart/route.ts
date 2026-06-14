import { decodeJWT } from "@/server/jwt";
import { sanitizeInput } from "@/server/sanitize";
import { supabase_server } from "@/server/supabase-server";
import { ClinicEmployeeJwt, DentalChart } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }
    
    const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
    if (!jwt_user || typeof jwt_user === "string") {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    const clinicId = jwt_user.clinicId;
    
    if (jwt_user.role !== 'admin' && jwt_user.role !== 'manager') {
        return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }
    
    const requestBody = await request.json().catch(() => null);
    if (!requestBody) {
        return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    
    const chartData: Omit<DentalChart, 'id' | 'created_at' | 'lastUpdated'> = sanitizeInput(requestBody);
    chartData.teeth = ensureTeethArray(chartData.teeth);
    // console.log("Received chart data:", chartData);
    
    if (!chartData.patientId) {
        return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }
    
    if (!chartData.teeth || chartData.teeth.length === 0) {
        return NextResponse.json({ error: "Teeth data is required and must be a non-empty array" }, { status: 400 });
    }
    // console.log(chartData.teeth)
    
    // Verify the patient exists and belongs to this clinic
    const { data: patientData, error: patientError } = await supabase_server
        .from("Patient")
        .select("id, clinicId")
        .eq("id", chartData.patientId)
        .single();
    
    if (patientError || !patientData) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    
    if (patientData.clinicId !== clinicId) {
        return NextResponse.json({ error: "Patient does not belong to this clinic" }, { status: 403 });
    }
    
    // Check if a dental chart already exists for this patient in the clinic
    const { data: existingChart, error: existingError } = await supabase_server
        .from("DentalChart")
        .select("id")
        .eq("patientId", chartData.patientId)
        .eq("clinicId", clinicId)
        .maybeSingle();  // Returns null if not found
    
    if (existingError) {
        // console.error("Error checking existing chart:", existingError);
        return NextResponse.json({ error: "Database error while checking existing chart" }, { status: 500 });
    }
    
    const now = new Date().toISOString();
    let result;
    
    if (existingChart) {
        // Update existing dental chart
        const { data, error } = await supabase_server
            .from("DentalChart")
            .update({
                teeth: chartData.teeth,
                lastUpdated: now
            })
            .eq("id", existingChart.id)
            .select()
            .single();
        
        if (error) {
            // console.error("Update error:", error);
            return NextResponse.json({ 
                error: "Failed to update dental chart",
                details: error.message 
            }, { status: 500 });
        }
        
        if (!data) {
            return NextResponse.json({ error: "Failed to update dental chart - no data returned" }, { status: 500 });
        }
        
        result = { action: "updated", data };
    } else {
        // Insert new dental chart
        const { data, error } = await supabase_server
            .from("DentalChart")
            .insert({
                patientId: chartData.patientId,
                teeth: chartData.teeth,
                clinicId: clinicId,
                lastUpdated: now
            })
            .select()
            .single();
        
        if (error) {
            // console.error("Insert error:", error);
            return NextResponse.json({ 
                error: "Failed to create dental chart",
                details: error.message 
            }, { status: 500 });
        }
        
        if (!data) {
            return NextResponse.json({ error: "Failed to create dental chart - no data returned" }, { status: 500 });
        }
        
        result = { action: "created", data };
    }
    
    return NextResponse.json({ 
        message: `Dental chart ${result.action} successfully`,
        data: result.data 
    }, { status: result.action === "created" ? 201 : 200 });
}



export async function GET(request: NextRequest) {
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }
    
    const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
    if (!jwt_user || typeof jwt_user === "string") {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    const clinicId = jwt_user.clinicId;
    
    // الحصول على patientId من query parameter
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    
    if (!patientId) {
        return NextResponse.json({ error: "Patient ID is required as query parameter" }, { status: 400 });
    }
    
    // التحقق من وجود المريض وانتمائه لنفس العيادة
    // const { data: patientData, error: patientError } = await supabase_server
    //     .from("Patient")
    //     .select("id, clinicId")
    //     .eq("id", patientId)
    //     .single();
    
    // if (patientError || !patientData) {
    //     return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    // }
    
    // if (patientData.clinicId !== clinicId) {
    //     return NextResponse.json({ error: "Patient does not belong to this clinic" }, { status: 403 });
    // }
    
    // جلب Dental Chart للمريض
    const { data: chartData, error: chartError } = await supabase_server
        .from("DentalChart")
        .select("*")
        .eq("patientId", patientId)
        .eq("clinicId", clinicId)
        .maybeSingle();
    
    if (chartError) {
        // console.error("Database error:", chartError);
        return NextResponse.json({ 
            error: "Failed to fetch dental chart",
            details: chartError.message 
        }, { status: 500 });
    }
    
    if (!chartData) {
        return NextResponse.json({ 
            message: "No dental chart found for this patient",
            data: null 
        }, { status: 200 });
    }
    
    return NextResponse.json({ 
        message: "Dental chart retrieved successfully",
        data: chartData 
    }, { status: 200 });
}


function ensureTeethArray(teeth: any): any[] {
  if (Array.isArray(teeth)) return teeth;
  if (teeth && typeof teeth === 'object') {
    return Object.values(teeth).map((tooth: any) => ({
      ...tooth,
      treatments: Array.isArray(tooth.treatments)
        ? tooth.treatments
        : Object.values(tooth.treatments || {}),
    }));
  }
  return [];
}