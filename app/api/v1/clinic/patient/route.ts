import { decodeJWT } from "@/server/jwt";
import { sanitizeInput } from "@/server/sanitize";
import { supabase_server } from "@/server/supabase-server";
import { ClinicEmployeeJwt, Patient } from "@/types";
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
    const patientData: Omit<Patient, 'id' | 'clinicId' | 'createdAt'> = sanitizeInput(await (request.json()));
    const clinicId = jwt_user.clinicId;
    const { data, error } = await supabase_server.from("Patient").insert({ ...patientData, clinicId }).select("*").single();
    if (error || !data) {
        console.error("Error adding patient:", error);
        return NextResponse.json({ error: "Failed to add patient" }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
} 