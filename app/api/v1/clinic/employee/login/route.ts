import { supabase_server } from "@/server/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createJwt, decodeJWT } from "@/server/jwt";
import { sanitizeInput } from "@/server/sanitize";

export interface EmployeeLoginRequestBody {
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
    const requestbody : EmployeeLoginRequestBody = await request.json();
    let { username, password } = sanitizeInput(requestbody);
    
    if(!username || !password) {
        return new Response(JSON.stringify({ message: "Username and password are required" }), { status: 400 });
    }
    
    username = username.toLocaleLowerCase();
    
    const {data,error} = await supabase_server
        .from("employees")
        .select("hashed_password,id,clinicId,role")
        .eq("user_name", username)
        .single();
    
    if(error || !data) {
        console.log(error);
        return new Response(JSON.stringify({ message: "Invalid username or password" }), { status: 401 });
    }
    
    const hashedPassword = data.hashed_password;
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    
    if(!isPasswordValid) {
        return new Response(JSON.stringify({ message: "Invalid username or password" }), { status: 401 });
    }

    // استخراج clinicIds من JWT القديم إن وجد
    let existingClinicIds: string[] = [];
    const oldJwt = request.cookies.get("jwt")?.value;
    
    if (oldJwt) {
        try {
            const decodedOldJwt = decodeJWT(oldJwt);
            if (decodedOldJwt && typeof decodedOldJwt !== 'string') {
                if (decodedOldJwt.clinicIds && Array.isArray(decodedOldJwt.clinicIds)) {
                    existingClinicIds = decodedOldJwt.clinicIds;
                } else if (decodedOldJwt.clinicId) {
                    existingClinicIds = [decodedOldJwt.clinicId];
                }
            }
        } catch (e) {
            console.log("Failed to decode old JWT, creating new one");
        }
    }

    // بناء clinicIds المحدثة
    const currentClinicId = data.clinicId;
    
    if (!existingClinicIds.includes(currentClinicId)) {
        existingClinicIds.push(currentClinicId);
    }

    // ============================================================
    // 🆕 جلب بيانات العيادات (الاسم والـ Logo)
    // ============================================================
    let clinicsData: { id: string; name: string; logo: string }[] = [];

    if (existingClinicIds.length > 0) {
        const { data: clinics, error: clinicsError } = await supabase_server
            .from("Clinic")
            .select("id, name, logo")
            .in("id", existingClinicIds);
        
        if (!clinicsError && clinics) {
            clinicsData = clinics;
        } else {
            console.log("Error fetching clinics data:", clinicsError);
        }
    }

    // إنشاء JWT جديد
    const device_id = crypto.randomUUID();
    const jwt = createJwt({
        id: data.id,
        clinicId: data.clinicId,
        clinicIds: existingClinicIds,
        role: data.role,
        subscriptionStatus: "active",
        device_id: device_id
    });

    const res = NextResponse.json({ 
        slug: data.clinicId,
        clinicIds: existingClinicIds,
        clinics: clinicsData // ✅ اسم و logo كل عيادة
    }, { status: 200 });
    
    res.cookies.set("jwt", jwt || "", { 
        path: "/", 
        maxAge: 60 * 60 * 24 * 365 * 20, 
        httpOnly: true 
    });
    
    res.cookies.set("clinic_id", data.clinicId || "", { 
        path: "/", 
        maxAge: 60 * 60 * 24 * 365 * 20, 
        httpOnly: true 
    });
    
    return res;
}