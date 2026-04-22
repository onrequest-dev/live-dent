import { supabase_server } from "../supabase-server";

export async function getPatientData(clinicId: string, patientId: string) {
    const { data, error } = await supabase_server.rpc('get_patient_full_data', {
        p_clinic_id: clinicId,
        p_patient_id: patientId
    });

    if (error) {
        console.error("RPC error:", error);
        return { success: false, error: "Failed to fetch patient data" };
    }
    return { 
        success: true, 
        data: {
            clinic: {
                ...data.clinic,
                doctorProfile: data.doctorProfile
            },
            patient: data.patient,
            sessions: data.sessions
        }
    };
}