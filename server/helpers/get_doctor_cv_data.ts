import { supabase_server } from "../supabase-server";

export async function getDoctorCv(clinicId: string){
    const {data,error} = await supabase_server.from("DoctorProfile").select("*").eq("clinicId", clinicId).maybeSingle();
    if (error) {
        console.error('Error fetching doctor CV data:', error);
        return { success: false, error: "Failed to fetch doctor CV data" };
    }
    return { success: true, data };
}