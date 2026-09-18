// @/lib/api/templates.ts

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * جلب القوالب من الباك اند
 * السيرفر يعيد: { data: { id, owner_id, template: [...], created_at } | null }
 */
export async function fetchTemplates(): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch("/api/v1/clinic/templates", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "حدث خطأ أثناء جلب القوالب",
      };
    }

    // ✅ حقل القوالب اسمه template داخل الصف
    const templates = result.data?.template || [];

    return { success: true, data: templates };
  } catch (error) {
    console.error("Fetch templates error:", error);
    return { success: false, error: "فشل الاتصال بالخادم" };
  }
}

/**
 * حفظ القوالب (insert أو update)
 * السيرفر يتعامل مع INSERT و UPDATE
 */
export async function saveTemplates(
  templates: any[]
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch("/api/v1/clinic/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ template: templates }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "حدث خطأ أثناء حفظ القوالب",
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Save templates error:", error);
    return { success: false, error: "فشل الاتصال بالخادم" };
  }
}