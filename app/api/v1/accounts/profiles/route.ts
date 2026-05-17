// app/api/v1/auth/switch-clinic/route.ts
import { decodeJWT, createJwt } from "@/server/jwt";
import { NextRequest, NextResponse } from "next/server";
import { ClinicEmployeeJwt } from "@/types";

export async function POST(request: NextRequest) {
    try {
        // 1. استخراج JWT الحالي
        const currentJwt = request.cookies.get("jwt")?.value;
        
        if (!currentJwt) {
            return NextResponse.json(
                { error: "غير مصرح - لا يوجد JWT" },
                { status: 401 }
            );
        }

        // 2. فك تشفير JWT الحالي
        const decodedJwt = decodeJWT(currentJwt) as ClinicEmployeeJwt | null;
        
        if (!decodedJwt || typeof decodedJwt === "string") {
            return NextResponse.json(
                { error: "غير مصرح - JWT غير صالح" },
                { status: 401 }
            );
        }

        // 3. استخراج clinicId المطلوب من body
        const { clinicId: targetClinicId } = await request.json();
        
        if (!targetClinicId) {
            return NextResponse.json(
                { error: "معرف العيادة مطلوب" },
                { status: 400 }
            );
        }

        // 4. التحقق من أن العيادة موجودة في clinicIds
        if (!decodedJwt.clinicIds || !Array.isArray(decodedJwt.clinicIds)) {
            return NextResponse.json(
                { error: "ليس لديك عيادات مسجلة" },
                { status: 403 }
            );
        }

        if (!decodedJwt.clinicIds.includes(targetClinicId)) {
            return NextResponse.json(
                { error: "غير مصرح - هذه العيادة غير متاحة لحسابك" },
                { status: 403 }
            );
        }

        // 5. إنشاء JWT جديد مع clinicId المطلوب كافتراضي
        const newJwt = createJwt({
            id: decodedJwt.id,
            clinicId: targetClinicId, // العيادة الجديدة كافتراضية
            clinicIds: decodedJwt.clinicIds, // الحفاظ على نفس المصفوفة
            role: decodedJwt.role,
            subscriptionStatus: decodedJwt.subscriptionStatus || "active",
            device_id: decodedJwt.device_id || crypto.randomUUID(),
        });

        // 6. إنشاء الاستجابة مع الكوكيز الجديدة
        const response = NextResponse.json(
            {
                success: true,
                clinicId: targetClinicId,
                message: "تم تبديل العيادة بنجاح",
            },
            { status: 200 }
        );

        // 7. تعيين الكوكيز
        response.cookies.set("jwt", newJwt || "", {
            path: "/",
            maxAge: 60 * 60 * 24 * 365 * 20, // 20 سنة
            httpOnly: true,
        });


        response.cookies.set("clinic_id", targetClinicId, {
            path: "/",
            maxAge: 60 * 60 * 24 * 365 * 20,
            httpOnly: true,
        });

        return response;

    } catch (error) {
        console.error("خطأ في تبديل العيادة:", error);
        return NextResponse.json(
            { error: "حدث خطأ داخلي في الخادم" },
            { status: 500 }
        );
    }
}