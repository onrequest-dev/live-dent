import { Clinic, Patient, PatientCase, Session } from "@/types";
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