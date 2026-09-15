import { decodeJWT } from "@/server/jwt";
import { sanitizeInput } from "@/server/sanitize";
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
    // if(cond) return NextResponse.redirect(new URL("/log-in", request.url));

    const clinicId = jwt_user.clinicId;
    const {data,error} = await supabase_server.from("templates").select("*").eq("clinicId", clinicId).maybeSingle();
    if (error) {
        // console.error("Supabase error:", error);
        return NextResponse.json({ error: "Failed to fetch clinic data" }, { status: 500 });
    }
    return NextResponse.json({ data });

}

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
    const clinicId = jwt_user.clinicId;
    const templateData = sanitizeInput(await request.json());
    const { data, error } = await supabase_server.from("templates").insert([{ ...templateData, clinicId }]).select("*").single();
    if (error) {
        // console.error("Supabase error:", error);
        return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
    }
    return NextResponse.json({ data });
}