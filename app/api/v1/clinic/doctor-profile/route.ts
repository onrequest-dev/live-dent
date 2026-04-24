import { decodeJWT } from "@/server/jwt";
// import { sanitizeInput } from "@/server/sanitize";
import { supabase_server } from "@/server/supabase-server";
import { ClinicEmployeeJwt,  DoctorProfile } from "@/types";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest){
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
    const profileData: Partial<Omit<DoctorProfile, 'id' | 'createdAt'>> = await request.json();
    const { data, error } = await supabase_server.from("DoctorProfile").update(profileData).eq("clinicId", clinicId).select("*").single();
    if (error || !data) {
        console.error("Error updating doctor profile data:", error);
        return NextResponse.json({ error: "Failed to update doctor profile data" }, { status: 500 });
    }
    revalidatePath(`/public-clinic/${clinicId}`);
    revalidatePath(`/public-clinic/${clinicId}/doctor-cv`);
    return NextResponse.json(data, { status: 200 });
}