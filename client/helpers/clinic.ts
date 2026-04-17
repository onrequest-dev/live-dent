import { Clinic } from "@/types";
import { ApiResponse } from "./fetch_with_retry";

export async function getRestaurant(): Promise<ApiResponse<Clinic>> {
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