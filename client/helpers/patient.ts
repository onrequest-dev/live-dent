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

            return {
                success: true,
                data: data,
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'حدث خطأ في الاتصال بالخادم',
            };
        }
    }