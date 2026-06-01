import { decodeJWT } from "@/server/jwt";
import { supabase_server } from "@/server/supabase-server";
import { ClinicEmployeeJwt } from "@/types";
import { NextRequest, NextResponse } from "next/server";

// مهم جدا للانتباه 
// اي شخص معاه ال id الخاصة بالمريض بيحسن يضيف ويعدل صور 
// اصلح هذه المشكلة لاحقا 




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
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");
    if(!patientId || typeof patientId !== "string") {
        return NextResponse.json({ error: "Bad Request - Invalid patientId" }, { status: 400 });
    }
    
    // Get all images for the patient
    const { data: images, error } = await supabase_server
        .from("xray_img")
        .select("id, title, img_tele_id, created_at")
        .eq("patientId", patientId)
        .order("created_at", { ascending: false });
    
    if (error) {
        console.error("Error fetching patient images:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    
    // Return array of image IDs with their details
    return NextResponse.json({ 
        images: images.map(img => ({
            id: img.id,
            title: img.title,
            img_tele_id: img.img_tele_id,
            created_at: img.created_at
        }))
    }, { status: 200 });
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
    
    try {
        const body = await request.json();
        const { patientId, images } = body;
        
        // Validate patientId
        if (!patientId || typeof patientId !== "string") {
            return NextResponse.json({ error: "Bad Request - Invalid patientId" }, { status: 400 });
        }
        
        // Validate images array
        if (!images || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: "Bad Request - Images array is required" }, { status: 400 });
        }
        
        // Prepare images data for insertion
        // Support both single image object and array of images
        const imagesToInsert = images.map(img => {
            // Handle different input formats
            if (typeof img === "string") {
                // If just a string (img_tele_id), create with empty title
                return {
                    img_tele_id: img,
                    title: "",
                    patientId: patientId
                };
            } else if (typeof img === "object") {
                // If object with img_tele_id and optional title
                return {
                    img_tele_id: img.img_tele_id,
                    title: img.title || "",
                    patientId: patientId
                };
            } else {
                throw new Error("Invalid image format");
            }
        });
        
        // Insert images into database
        const { data: insertedImages, error } = await supabase_server
            .from("xray_img")
            .insert(imagesToInsert)
            .select("id, title, img_tele_id, created_at");
        
        if (error) {
            console.error("Error inserting images:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
        
        // Return the inserted images with their generated IDs
        return NextResponse.json({ 
            message: `Successfully added ${insertedImages.length} image(s)`,
            images: insertedImages 
        }, { status: 201 });
        
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Bad Request - Invalid request body" }, { status: 400 });
    }
}




export async function DELETE(request: NextRequest) {
  const jwt = request.cookies.get("jwt")?.value;
  if (!jwt) {
    return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 });
  }
  const jwt_user = decodeJWT(jwt) as ClinicEmployeeJwt | null;
  if (!jwt_user || typeof jwt_user === "string" || (jwt_user.role !== 'admin' && jwt_user.role !== 'manager')) {
    return NextResponse.json({ error: "Forbidden - Insufficient permissions" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const imageId = searchParams.get("imageId");
  if (!imageId || typeof imageId !== "string") {
    return NextResponse.json({ error: "Bad Request - Invalid imageId" }, { status: 400 });
  }

  // تأكد من أن الصورة تتبع لنفس العيادة (اختياري لكن آمن)
  // يمكنك إضافة شرط للتحقق من patientId المرتبط بالعيادة
  
  const { error } = await supabase_server
    .from("xray_img")
    .delete()
    .eq("id", imageId);
  
  if (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  return NextResponse.json({ message: "Image deleted successfully" }, { status: 200 });
}
