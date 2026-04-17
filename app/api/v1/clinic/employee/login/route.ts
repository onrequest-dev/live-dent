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
        console.log(error)
        return new Response(JSON.stringify({ message: "Invalid username or password" }), { status: 401 });
    }
    const hashedPassword = data.hashed_password;
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if(!isPasswordValid) {
        console.log("Invalid password for user:", username);
        return new Response(JSON.stringify({ message: "Invalid username or password" }), { status: 401 });
    }
    const {data: clinicData, error: restuarantError} = await supabase_server
        .from("restaurants")
        .select("subscriptiontype, slug")
        .eq("id", data.clinicId)
        .single();
        console.log("Restaurant data:", clinicData, "Error:", restuarantError);
        const device_id = crypto.randomUUID();
    const jwt = createJwt({id: data.id, restaurantId: data.clinicId, role: data.role, subscriptionTier: clinicData?.subscriptiontype , device_id:device_id });
    const res =  NextResponse.json({ slug: clinicData?.slug }, { status: 200 });
    res.cookies.set("jwt", jwt || "", { path: "/", maxAge: 60 * 60 * 24 * 365 * 20, httpOnly: true });
    return res;
}