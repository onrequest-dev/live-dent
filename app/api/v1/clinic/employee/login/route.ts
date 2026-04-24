import { supabase_server } from "@/server/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createJwt } from "@/server/jwt";
import { sanitizeInput } from "@/server/sanitize";


export interface EmployeeLoginRequestBody {
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
    const requestbody : EmployeeLoginRequestBody = await request.json();
    const { username, password } = sanitizeInput(requestbody);
    if(!username || !password) {
        return new Response(JSON.stringify({ message: "Username and password are required" }), { status: 400 });
    }
    const {data,error} = await supabase_server.from("employees").select("hashed_password,id,clinicId,role").eq("user_name", username).single()
    if(error || !data) {
        return new Response(JSON.stringify({ message: "Invalid username or password" }), { status: 401 });
    }
    const hashedPassword = data.hashed_password;
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if(!isPasswordValid) {
        return new Response(JSON.stringify({ message: "Invalid username or password" }), { status: 401 });
    }
    // const {data: clinicData, error: ClinicError} = await supabase_server
    //     .from("Clinic")
    //     .select("id, slug")
    //     .eq("id", data.clinicId)
    //     .single();
    //     console.log("clinic data:", clinicData, "Error:", ClinicError);
        const device_id = crypto.randomUUID();
    const jwt = createJwt({id: data.id, clinicId: data.clinicId, role: data.role,subscriptionStatus:"active" , device_id:device_id });
    const res =  NextResponse.json({ slug: data.clinicId }, { status: 200 });
    res.cookies.set("jwt", jwt || "", { path: "/", maxAge: 60 * 60 * 24 * 365 * 20, httpOnly: true });
    res.cookies.set("clinic_id", data.clinicId || "", { path: "/", maxAge: 60 * 60 * 24 * 365 * 20, httpOnly: true });
    return res;
}