// app/api/v1/clinic/session/bulk/route.ts

import { generateWhatsAppMessage } from "@/lib/services/communication";
import { sendMessage } from "@/server/helpers/send_whatssap_message";
import { decodeJWT } from "@/server/jwt";
import { sanitizeInput } from "@/server/sanitize";
import { supabase_server } from "@/server/supabase-server";
import { ClinicEmployeeJwt, Session } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from '@vercel/functions';

export async function POST(request: NextRequest) {
    const jwt = request.cookies.get("jwt")?.value;
    if (!jwt) {
        return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
    }
    
    const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
    if (!jwt_user || typeof jwt_user === "string") {
        return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }
    
    if (jwt_user.role !== 'admin' && jwt_user.role !== 'manager') {
        return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    console.log('📥 استقبال body:', body);
    
    // ✅ استخراج المصفوفة من body.sessions أو body مباشرة
    const sessionsData = Array.isArray(body) ? body : body.sessions;
    
    console.log('📋 sessionsData:', sessionsData);

    if (!Array.isArray(sessionsData) || sessionsData.length === 0) {
        console.error('❌ ليست مصفوفة أو فارغة:', sessionsData);
        return NextResponse.json({ error: "يجب إرسال مصفوفة جلسات" }, { status: 400 });
    }

    const clinicId = jwt_user.clinicId;

    // ✅ تجهيز البيانات للإدراج
    const sessionsToInsert = sessionsData.map((sessionData: any) => {
        const { info, ...sessionWithoutInfo } = sessionData;
        return { ...sessionWithoutInfo, clinicId };
    });

    console.log('📝 جلسات للإدراج:', sessionsToInsert);

    // ✅ إدراج جميع الجلسات
    const { data: createdSessions, error } = await supabase_server
        .from("Session")
        .insert(sessionsToInsert)
        .select("*");

    if (error || !createdSessions || createdSessions.length === 0) {
        console.error("❌ خطأ في الإدراج:", error);
        return NextResponse.json({ error: "Failed to add sessions" }, { status: 500 });
    }

    console.log('✅ تم إنشاء:', createdSessions.length, 'جلسات');

    // ✅ إرسال رسائل واتساب لكل جلسة (بدون انتظار)
    for (let i = 0; i < sessionsData.length; i++) {
        const info = sessionsData[i].info;
        const data = createdSessions[i];

        if (info && !info.prevent_auto_messages && data) {
            const start = new Date(data.startTime);

            if (!isNaN(start.getTime())) {
                // توقيت سوريا UTC+3
                const localStart = new Date(start.getTime() + 3 * 60 * 60 * 1000);

                let hours = localStart.getUTCHours();
                const minutes = localStart.getUTCMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'مساءً' : 'صباحاً';
                hours = hours % 12 || 12;
                const time = `${hours}:${minutes} ${ampm}`;

                const year = localStart.getUTCFullYear();
                const month = (localStart.getUTCMonth() + 1).toString().padStart(2, '0');
                const day = localStart.getUTCDate().toString().padStart(2, '0');
                const date = `${year}-${month}-${day}`;

                waitUntil(
                    sendMessage(info.phoneNumber, generateWhatsAppMessage({
                        patient: { fullName: info.patientName, gender: info.gender, id: data.patientId },
                        clinicId: clinicId,
                        clinicName: info.clinicName,
                        messageType: "reminder",
                        time,
                        date,
                    }))
                );
            }
        }
    }

    // ✅ إرجاع كل الجلسات المنشأة
    return NextResponse.json({ sessions: createdSessions, data: createdSessions }, { status: 201 });
}