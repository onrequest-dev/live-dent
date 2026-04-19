

// ========== أنواع البيانات ==========
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    message?: string;
    slug?: string;
    user?: {
        id: string;
        clinicId: string;
        role: string;
        username: string;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    status: number;
}

// ========== دالة تسجيل الدخول ==========
export async function loginEmployee(
    credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> {
    try {
        const response = await fetch('/api/v1/clinic/employee/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // مهم لتخزين الـ JWT cookie
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'فشل في تسجيل الدخول',
                status: response.status,
            };
        }

        return {
            success: true,
            data: {
                message: data.message,
                slug: data.slug,
                user: data.user,
            },
            status: response.status,
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
            status: 500,
        };
    }
}
