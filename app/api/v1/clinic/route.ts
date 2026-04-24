import { decodeJWT } from "@/server/jwt";
import { sanitizeInput } from "@/server/sanitize";
import { supabase_server } from "@/server/supabase-server";
import { Clinic, ClinicEmployeeJwt } from "@/types";
import { revalidatePath } from "next/cache";
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
    const {data,error} = await supabase_server.from("Clinic").select("*").eq("id", clinicId).maybeSingle();
    if(error){
        console.error("Supabase error:", error);
        return NextResponse.json({ error: "Failed to fetch clinic data" }, { status: 500 });
    }
    const {data:doctorProfile,error:doctorProfileError} = await supabase_server.from("DoctorProfile").select("*").eq("clinicId", clinicId).single();
    if(doctorProfileError){
        console.error("Supabase error fetching doctor profile:", doctorProfileError);
    }
        return NextResponse.json({data:{ ...data, doctorProfile }});
}


export async function PUT(request: NextRequest){
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
    const clinicData: Partial<Omit<Clinic, 'id' | 'createdAt'>> = sanitizeInput(await request.json());
    const { data, error } = await supabase_server.from("Clinic").update(clinicData).eq("id", clinicId).select("*").single();
    if (error || !data) {
        console.error("Error updating clinic data:", error);
        return NextResponse.json({ error: "Failed to update clinic data" }, { status: 500 });
    }
    revalidatePath(`/public-clinic/${clinicId}`);
    revalidatePath(`/public-clinic/${clinicId}/doctor-cv`);
    const res = NextResponse.json(data, { status: 200 });
    const primary_color = clinicData.settings?.primaryColor || "#0284c7";
    const secondary_color = clinicData.settings?.secondaryColor || "#0ea5e9";
    res.cookies.set("primary_color",primary_color , { path: "/", maxAge: 60 * 60 * 24 * 365 * 20, httpOnly: true });
    res.cookies.set("secondary_color",secondary_color , { path: "/", maxAge: 60 * 60 * 24 * 365 * 20, httpOnly: true });
    return res ;
}