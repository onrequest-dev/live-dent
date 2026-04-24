import { Clinic, DoctorProfile, Patient, PatientCase, Session } from "@/types";
import { ApiResponse } from "./fetch_with_retry";

export async function getClinic(): Promise<ApiResponse<Clinic>> {
  try {
    const response = await fetch("/api/v1/clinic");
    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || "فشل جلب بيانات العيادة" };
    }
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "حدث خطأ في الاتصال",
    };
  }
}

export async function updateClinic(clinicData: Partial<Clinic>): Promise<ApiResponse<Clinic>> {
  try {
    const response = await fetch("/api/v1/clinic", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clinicData),
    });
    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || "فشل تحديث بيانات العيادة" };
    }
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "حدث خطأ في الاتصال",
    };
  }
}

export async function updateProfile(clinicData: Partial<DoctorProfile>): Promise<ApiResponse<DoctorProfile>> {
  try {
    const response = await fetch("/api/v1/clinic/doctor-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clinicData),
    });
    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || "فشل تحديث بيانات الملف الشخصي للطبيب" };
    }
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "حدث خطأ في الاتصال",
    };
  }
}

export type ClinicData = {
    patients:Patient[],
    patientCases:PatientCase[],
    sessions:Session[]
}
export async function getClinicData(): Promise<ApiResponse<ClinicData>>{
    try {
    const response = await fetch("/api/v1/clinic/data");
    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || "فشل جلب بيانات العيادة" };
    }
    // console.log("clinic data fetched: ", result);
    return { success: true, data: {patientCases: result.patientCases, patients: result.patients, sessions: result.sessions} };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "حدث خطأ في الاتصال",
    };
  }
}

