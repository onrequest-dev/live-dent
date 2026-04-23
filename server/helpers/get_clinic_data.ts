import { supabase_server } from "../supabase-server";

export async function getClinicData(clinicId: string){
    const {data,error} = await supabase_server.from("Clinic").select("*").eq("id", clinicId).maybeSingle();
    if (error) {
        console.error('Error fetching clinic data:', error);
        return { success: false, error: "Failed to fetch patient data" };
    }
    delete data.createdAt; // إزالة createdAt من البيانات
    delete data.subscriptionStatus
    const {data:doctorProfile,error:doctorProfileError} = await supabase_server.from("DoctorProfile").select("*").eq("clinicId", clinicId).single();
    return { success: true, data: { ...data, doctorProfile: doctorProfileError ? null : doctorProfile } };
}