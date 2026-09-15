// @/lib/api/templates.ts

// نوع البيانات التي ستعيده الدوال المساعدة
export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

/**
 * دالة مساعدة لجلب القوالب (GET)
 * @param clinicId - معرف العيادة (يُرسل كـ Query Parameter)
 */
export async function fetchTemplates(clinicId?: string): Promise<ApiResponse> {
    try {
        // بناء الرابط، وإضافة clinicId إذا تم تمريره (حسب الحاجة)
        const url = new URL("/api/v1/clinic/templates", window.location.origin);
        if (clinicId) {
            url.searchParams.append("clinicId", clinicId);
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            // مهم جداً: إرسال الـ Cookies مع الطلب ليتمكن الراوت من قراءة الـ JWT
            credentials: "include", 
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || "حدث خطأ أثناء جلب القوالب",
            };
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        console.error("Fetch templates error:", error);
        return {
            success: false,
            error: "فشل الاتصال بالخادم",
        };
    }
}

/**
 * دالة مساعدة لإنشاء قالب جديد (POST)
 * @param templateData - كائن القالب (لا يهم محتواه كما طلبت)
 */
export async function createTemplate(templateData: Record<string, any>): Promise<ApiResponse> {
    try {
        const response = await fetch("/api/v1/clinic/templates", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // مهم جداً: إرسال الـ Cookies مع الطلب
            credentials: "include",
            // إرسال كائن القالب في جسم الطلب
            body: JSON.stringify(templateData),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || "حدث خطأ أثناء إنشاء القالب",
            };
        }

        return {
            success: true,
            data: result.data,
        };
    } catch (error) {
        console.error("Create template error:", error);
        return {
            success: false,
            error: "فشل الاتصال بالخادم",
        };
    }
}