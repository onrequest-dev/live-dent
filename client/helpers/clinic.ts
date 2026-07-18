// import { Clinic, DoctorProfile, Patient, PatientCase, Session } from "@/types";
// import { ApiResponse } from "./fetch_with_retry";
// import { clinicLocalDB } from '@/lib/clinicDB';

// export type ClinicData = {
//     patients: Patient[],
//     patientCases: PatientCase[],
//     sessions: Session[]
// }

// export async function getClinic(): Promise<ApiResponse<Clinic>> {
//   try {
//     const localRecord = await clinicLocalDB.clinic.get('clinic');
    
//     if (localRecord) {
//       return { success: true, data: localRecord.data };
//     }

//     const response = await fetch("/api/v1/clinic");
//     const result = await response.json();

//     if (!response.ok) {
//       return { success: false, error: result.error || "فشل جلب بيانات العيادة" };
//     }

//     await clinicLocalDB.clinic.put({
//       key: 'clinic',
//       data: result.data,
//       synced: true,
//     });

//     return { success: true, data: result.data };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "حدث خطأ في الاتصال",
//     };
//   }
// }

// export async function updateClinic(clinicData: Partial<Clinic>): Promise<ApiResponse<Clinic>> {
//   try {
//     const existingRecord = await clinicLocalDB.clinic.get('clinic');
//     const mergedData = { ...(existingRecord?.data ?? {}), ...clinicData } as Clinic;

//     await clinicLocalDB.clinic.put({
//       key: 'clinic',
//       data: mergedData,
//       synced: false,
//     });

//     const response = await fetch("/api/v1/clinic", {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(clinicData),
//     });
//     const result = await response.json();

//     if (!response.ok) {
//       return { success: false, error: result.error || "فشل تحديث بيانات العيادة" };
//     }

//     await clinicLocalDB.clinic.put({
//       key: 'clinic',
//       data: result.data,
//       synced: true,
//     });

//     return { success: true, data: result.data };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "حدث خطأ في الاتصال",
//     };
//   }
// }

// export async function updateProfile(profileData: Partial<DoctorProfile>): Promise<ApiResponse<DoctorProfile>> {
//   try {
//     const existingRecord = await clinicLocalDB.doctorProfile.get('profile');
//     const mergedData = { ...(existingRecord?.data ?? {}), ...profileData } as DoctorProfile;

//     await clinicLocalDB.doctorProfile.put({
//       key: 'profile',
//       data: mergedData,
//       synced: false,
//     });

//     const response = await fetch("/api/v1/clinic/doctor-profile", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(profileData),
//     });
//     const result = await response.json();

//     if (!response.ok) {
//       return { success: false, error: result.error || "فشل تحديث بيانات الملف الشخصي للطبيب" };
//     }

//     await clinicLocalDB.doctorProfile.put({
//       key: 'profile',
//       data: result.data,
//       synced: true,
//     });

//     return { success: true, data: result.data };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "حدث خطأ في الاتصال",
//     };
//   }
// }


// export async function getClinicData(): Promise<ApiResponse<ClinicData>>{
//     try {
//     const response = await fetch("/api/v1/clinic/data");
//     const result = await response.json();

//     if (!response.ok) {
//       return { success: false, error: result.error || "فشل جلب بيانات العيادة" };
//     }
//     // console.log("clinic data fetched: ", result);
//     return { success: true, data: {patientCases: result.patientCases, patients: result.patients, sessions: result.sessions} };
//   } catch (error) {
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "حدث خطأ في الاتصال",
//     };
//   }
// }


import { Clinic, DoctorProfile, Patient, PatientCase, Session } from "@/types";
import { ApiResponse } from "./fetch_with_retry";

export async function getClinic(): Promise<ApiResponse<Clinic>> {
  try {
    const response = await fetch("/api/v1/clinic");
    const result = await response.json();
    
    localStorage.setItem('currency', result.data?.currency || 'USD'); 

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
