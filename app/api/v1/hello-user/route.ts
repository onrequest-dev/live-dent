import { generateWhatsAppMessage } from "@/lib/services/communication";
import { sendMessage } from "@/server/helpers/send_whatssap_message";
import { decodeJWT } from "@/server/jwt";
import { ClinicEmployeeJwt } from "@/types";
import { waitUntil } from "@vercel/functions";
import { info, time } from "console";
import { NextRequest, NextResponse } from "next/server";

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
    waitUntil(
                sendMessage(body.cleanPhone, body.message)
            );
    return NextResponse.json({ message: "Message sent successfully" }, { status: 200 });
}