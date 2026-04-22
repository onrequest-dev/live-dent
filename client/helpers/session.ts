// client/helpers/sessions.ts

import { Session } from "@/types";
import { ApiResponse } from "./fetch_with_retry";

// ============================================================
// إنشاء جلسة جديدة
// ============================================================
export async function createSession(
    credentials: Omit<Session, 'id' | 'clinicId' | 'createdAt'>
): Promise<ApiResponse<Session>> {
    try {
        const response = await fetch('/api/v1/clinic/session', {
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
                error: data.message || data.error || 'فشل في إنشاء الجلسة',
            };
        }

        return {
            success: true,
            data: data.data || data,
        };
    } catch (error) {
        console.error('Create session error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}

// ============================================================
// تحديث جلسة موجودة
// ============================================================
export async function updateSession(
    sessionId: string,
    updateData: Partial<Omit<Session, 'id' | 'clinicId' | 'createdAt'>>
): Promise<ApiResponse<Session>> {
    try {
        const response = await fetch(`/api/v1/clinic/session/?sessionId=${sessionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(updateData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'فشل في تحديث الجلسة',
            };
        }

        return {
            success: true,
            data: data.data || data,
        };
    } catch (error) {
        console.error('Update session error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}

// ============================================================
// حذف جلسة
// ============================================================
export async function deleteSession(
    sessionId: string
): Promise<ApiResponse<null>> {
    try {
        const response = await fetch(`/api/v1/clinic/session/?sessionId=${sessionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'فشل في حذف الجلسة',
            };
        }

        return {
            success: true,
            data: null,
        };
    } catch (error) {
        console.error('Delete session error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}

// ============================================================
// جلب جلسة واحدة
// ============================================================
export async function getSession(
    sessionId: string
): Promise<ApiResponse<Session>> {
    try {
        const response = await fetch(`/api/v1/clinic/session/${sessionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'فشل في جلب الجلسة',
            };
        }

        return {
            success: true,
            data: data.data || data,
        };
    } catch (error) {
        console.error('Get session error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}

// ============================================================
// جلب جميع الجلسات
// ============================================================
export async function getAllSessions(): Promise<ApiResponse<Session[]>> {
    try {
        const response = await fetch('/api/v1/clinic/sessions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'فشل في جلب الجلسات',
            };
        }

        return {
            success: true,
            data: data.data || data,
        };
    } catch (error) {
        console.error('Get all sessions error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}

// ============================================================
// جلب جلسات مريض محدد
// ============================================================
export async function getPatientSessions(
    patientId: string
): Promise<ApiResponse<Session[]>> {
    try {
        const response = await fetch(`/api/v1/clinic/sessions?patientId=${patientId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'فشل في جلب جلسات المريض',
            };
        }

        return {
            success: true,
            data: data.data || data,
        };
    } catch (error) {
        console.error('Get patient sessions error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}

// ============================================================
// جلب جلسات اليوم
// ============================================================
export async function getTodaySessions(): Promise<ApiResponse<Session[]>> {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/v1/clinic/sessions?date=${today}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'فشل في جلب جلسات اليوم',
            };
        }

        return {
            success: true,
            data: data.data || data,
        };
    } catch (error) {
        console.error('Get today sessions error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}

// ============================================================
// جلب الجلسات حسب التاريخ
// ============================================================
export async function getSessionsByDate(
    date: Date | string
): Promise<ApiResponse<Session[]>> {
    try {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const response = await fetch(`/api/v1/clinic/sessions?date=${dateStr}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'فشل في جلب الجلسات',
            };
        }

        return {
            success: true,
            data: data.data || data,
        };
    } catch (error) {
        console.error('Get sessions by date error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}

// ============================================================
// جلب الجلسات حسب الحالة
// ============================================================
export async function getSessionsByStatus(
    status: Session['status']
): Promise<ApiResponse<Session[]>> {
    try {
        const response = await fetch(`/api/v1/clinic/sessions?status=${status}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'فشل في جلب الجلسات',
            };
        }

        return {
            success: true,
            data: data.data || data,
        };
    } catch (error) {
        console.error('Get sessions by status error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}

// ============================================================
// تحديث حالة الجلسة فقط
// ============================================================
export async function updateSessionStatus(
    sessionId: string,
    status: Session['status']
): Promise<ApiResponse<Session>> {
    return updateSession(sessionId, { status });
}

// ============================================================
// تحديث حالة الدفع للجلسة
// ============================================================
export async function updateSessionPayment(
    sessionId: string,
    isPaid: boolean,
    paymentMethod?: 'cash' | 'transfer'
): Promise<ApiResponse<Session>> {
    const updateData: Partial<Session> = {
        isPaid,
        paidAt: isPaid ? new Date() : undefined,
        paymentMethod: isPaid ? paymentMethod : undefined,
    };
    
    return updateSession(sessionId, updateData);
}

// ============================================================
// جلب الجلسات في نطاق زمني
// ============================================================
export async function getSessionsInRange(
    startDate: Date | string,
    endDate: Date | string
): Promise<ApiResponse<Session[]>> {
    try {
        const start = typeof startDate === 'string' ? startDate : startDate.toISOString();
        const end = typeof endDate === 'string' ? endDate : endDate.toISOString();
        
        const response = await fetch(
            `/api/v1/clinic/sessions?startDate=${start}&endDate=${end}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || data.error || 'فشل في جلب الجلسات',
            };
        }

        return {
            success: true,
            data: data.data || data,
        };
    } catch (error) {
        console.error('Get sessions in range error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}