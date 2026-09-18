// app/api/v1/clinic/templates/route.ts

import { decodeJWT } from "@/server/jwt";
import { sanitizeInput } from "@/server/sanitize";
import { supabase_server } from "@/server/supabase-server";
import { ClinicEmployeeJwt } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// ============================================================
// GET - جلب القوالب
// ============================================================
export async function GET(request: NextRequest) {
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }

    const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
    if (!jwt_user || typeof jwt_user === "string") {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    if (jwt_user.role !== "admin" && jwt_user.role !== "manager") {
        return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const clinicId = jwt_user.clinicId;

    const { data, error } = await supabase_server
        .from("templates")
        .select("*")
        .eq("owner_id", clinicId)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("Supabase GET error:", error);
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }

    return NextResponse.json({ data });
}

// ============================================================
// POST - حفظ القوالب (INSERT أو UPDATE)
// ============================================================
export async function POST(request: NextRequest) {
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }

    const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
    if (!jwt_user || typeof jwt_user === "string") {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    if (jwt_user.role !== "admin" && jwt_user.role !== "manager") {
        return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const clinicId = jwt_user.clinicId;
    const rawBody = await request.json();

    // ✅ شخّص أولاً قبل أي شيء
    console.log("📥 POST raw body:", {
        type: typeof rawBody,
        isArray: Array.isArray(rawBody),
        keys: rawBody && typeof rawBody === "object" ? Object.keys(rawBody) : null,
        templateType: typeof rawBody?.template,
        templateIsArray: Array.isArray(rawBody?.template),
        templateValue: rawBody?.template,
        bodyPreview: JSON.stringify(rawBody).substring(0, 500),
    });

    const body = sanitizeInput(rawBody);

    console.log("📥 POST after sanitize:", {
        type: typeof body,
        isArray: Array.isArray(body),
        keys: body && typeof body === "object" ? Object.keys(body) : null,
        templateType: typeof body?.template,
        templateIsArray: Array.isArray(body?.template),
        templateValue: body?.template,
    });

    // ✅ مرنة: اقبل 4 صيغ
    let templatesArray: any[] | null = null;

    // الصيغة 1: مصفوفة مباشرة
    if (Array.isArray(rawBody)) {
        templatesArray = rawBody;
    }
    // الصيغة 2: { template: [...] }
    else if (rawBody && Array.isArray(rawBody.template)) {
        templatesArray = rawBody.template;
    }
    // الصيغة 3: { data: [...] }
    else if (rawBody && Array.isArray(rawBody.data)) {
        templatesArray = rawBody.data;
    }
    // الصيغة 4: template كنص JSON
    else if (rawBody?.template && typeof rawBody.template === "string") {
        try {
            const parsed = JSON.parse(rawBody.template);
            if (Array.isArray(parsed)) templatesArray = parsed;
        } catch (e) {
            console.error("❌ Failed to parse template string:", e);
        }
    }
    // الصيغة 5: template ككائن بمفاتيح رقمية
    else if (
        rawBody?.template &&
        typeof rawBody.template === "object" &&
        !Array.isArray(rawBody.template)
    ) {
        const values = Object.values(rawBody.template);
        if (values.length > 0) {
            templatesArray = values;
        }
    }

    if (!templatesArray || !Array.isArray(templatesArray)) {
        console.error("❌ Invalid format:", {
            rawBodyType: typeof rawBody,
            templateType: typeof rawBody?.template,
            templatePreview: JSON.stringify(rawBody?.template).substring(0, 200),
        });
        return NextResponse.json(
            {
                error: "template must be an array",
                templateType: typeof rawBody?.template,
                templateIsArray: Array.isArray(rawBody?.template),
                templatePreview: JSON.stringify(rawBody?.template).substring(0, 200),
            },
            { status: 400 }
        );
    }

    // ✅ تحقق من وجود صف مسبقاً
    const { data: existing } = await supabase_server
        .from("templates")
        .select("id")
        .eq("owner_id", clinicId)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

    let result;

    if (existing) {
        // ✅ تحديث
        result = await supabase_server
            .from("templates")
            .update({ template: templatesArray })
            .eq("owner_id", clinicId)
            .select("*")
            .single();
    } else {
        // ✅ إنشاء
        result = await supabase_server
            .from("templates")
            .insert([{ owner_id: clinicId, template: templatesArray }])
            .select("*")
            .single();
    }

    if (result.error) {
        console.error("Supabase POST error:", result.error);
        return NextResponse.json({ error: "Failed to save templates" }, { status: 500 });
    }

    console.log("✅ Templates saved successfully:", {
        isUpdate: !!existing,
        count: templatesArray.length,
    });

    return NextResponse.json({ data: result.data });
}