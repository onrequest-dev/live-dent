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
    const {data,error} = await supabase_server.from("Clinic").select("*").eq("id", clinicId).single();
    if(error){
        console.error("Supabase error:", error);
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
    if (!jwt_user || typeof jwt_user === "string") {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    // إنشاء عيادة جديدة - فقط للمشرفين العامين (يمكن تعديل الصلاحية حسب منطق تطبيقك)
    // هنا نفترض أن إنشاء عيادة جديد يتطلب صلاحية خاصة أو يتم أثناء التسجيل
    if (jwt_user.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden - Only admins can create clinics" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, logo, address, settings } = body;

        // تحقق بسيط من البيانات المطلوبة
        if (!name) {
            return NextResponse.json({ error: "Clinic name is required" }, { status: 400 });
        }

        const { data, error } = await supabase_server
            .from("Clinic")
            .insert({
                name,
                logo: logo || '/logos/placeholder.svg',
                address,
                settings: settings || {},
                subscriptionStatus: 'trial' // افتراضي للعيادات الجديدة
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: "Failed to create clinic" }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
        console.error("Request parsing error:", error);
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}

export async function PUT(request: NextRequest) {
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }
    
    const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
    if (!jwt_user || typeof jwt_user === "string") {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    // فقط الأدمن والمدير يمكنهم تعديل بيانات العيادة
    if (jwt_user.role !== 'admin' && jwt_user.role !== 'manager') {
        return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const clinicId = jwt_user.clinicId;

    try {
        const body = await request.json();
        const { name, logo, address, settings } = body;

        // منع تعديل الحقول الحساسة
        const allowedUpdates: Record<string, any> = {};
        if (name !== undefined) allowedUpdates.name = name;
        if (logo !== undefined) allowedUpdates.logo = logo;
        if (address !== undefined) allowedUpdates.address = address;
        if (settings !== undefined) allowedUpdates.settings = settings;

        if (Object.keys(allowedUpdates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const { data, error } = await supabase_server
            .from("Clinic")
            .update(allowedUpdates)
            .eq("id", clinicId)
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: "Failed to update clinic" }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Request parsing error:", error);
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}

