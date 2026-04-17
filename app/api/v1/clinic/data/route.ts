import { decodeJWT } from "@/server/jwt";
import { supabase_server } from "@/server/supabase-server";
import { ClinicEmployeeJwt } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
    
    const clinicId = jwt_user.clinicId;
    
    // الحصول على query parameters للتحكم في البيانات المرجعة
    const searchParams = request.nextUrl.searchParams;
    const includePatients = searchParams.get('includePatients') !== 'false'; // default true
    const includeCases = searchParams.get('includeCases') !== 'false'; // default true
    const includeSessions = searchParams.get('includeSessions') !== 'false'; // default true
    
    const { data, error } = await supabase_server.rpc('get_clinic_full_data_filtered', {
        p_clinic_id: clinicId,
        p_include_patients: includePatients,
        p_include_cases: includeCases,
        p_include_sessions: includeSessions
    });
    
    if (error) {
        console.error('Error fetching clinic data:', error);
        return NextResponse.json({ error: "Failed to fetch clinic data" }, { status: 500 });
    }
    
    if (!data) {
        return NextResponse.json({ 
            patients: [],
            patientCases: [],
            sessions: []
        });
    }
    
    // البيانات ستكون في شكل JSON object يحتوي على الثلاث مصفوفات
    return NextResponse.json(data);
}