    import { Patient } from "@/types";
    import { ApiResponse } from "./fetch_with_retry";

export async function createPatient(
  credentials: Omit<Patient, 'id' | 'clinicId' | 'createdAt'>
): Promise<ApiResponse<Patient>> {
  try {
    const response = await fetch('/api/v1/clinic/patient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'فشل في تسجيل المريض',
      };
    }

    // ✅ عند نجاح الإنشاء، أضف المريض إلى sessionStorage
    const stored = sessionStorage.getItem('newpatients');
    const newPatients: Patient[] = stored ? JSON.parse(stored) : [];
    newPatients.push(data); // data هو كائن المريض الكامل القادم من الخادم
    sessionStorage.setItem('newpatients', JSON.stringify(newPatients));

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Create patient error:', error);
    return {
      success: false,
      error: 'حدث خطأ في الاتصال بالخادم',
    };
  }
}

export async function updatePatient(
id: string, credentials: Partial<Omit<Patient, 'id' | 'clinicId' | 'createdAt'>> & { id: string; }): Promise<ApiResponse<Patient>> {
    try {
        const { id: _, ...payload } = credentials;
        const response = await fetch('/api/v1/clinic/patient', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ id, ...payload }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'فشل في تعديل المريض',
            };
        }

        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Update patient error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}