import { chartDB } from "@/lib/entalChartDB";
import { DentalChart } from "@/types";
import { v4 as uuidv4 } from 'uuid';

interface DentalChartResponse {
  message: string;
  data: DentalChart | null;
}

interface DentalChartCreateUpdateResponse {
  message: string;
  data: DentalChart & { action: "created" | "updated" };
}

interface ApiErrorResponse {
  error: string;
  details?: string;
}



/**
 * جلب بيانات الشارت السني من السيرفر مباشرة (يتجاوز التخزين المحلي)
 * مناسبة لعرض بيانات المريض في الصفحة العامة حيث نريد دائماً أحدث البيانات
 */
export async function fetchDentalChartFromServer(patientId: string): Promise<DentalChart | null> {
  try {
    const response = await fetch(`/api/v1/clinic/patient/chart?patientId=${patientId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      if (response.status === 404) throw new Error("المريض غير موجود");
      if (response.status === 403) throw new Error("المريض لا ينتمي لهذه العيادة");
      if (response.status === 401) throw new Error("غير مصرح - يرجى تسجيل الدخول");
      throw new Error(errorData.error || "فشل في جلب بيانات Dental Chart");
    }

    const result: DentalChartResponse = await response.json();

    return result.data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("حدث خطأ غير متوقع أثناء جلب Dental Chart");
  }
}
/**
 * جلب Dental Chart لمريض معين
 * - يبحث أولاً في IndexedDB
 * - إن لم يجده يجلبه من الخادم ويخزنه محلياً
 */
// Simple in‑memory cache with 30‑second TTL
const networkCache = new Map<
  string,
  { data: DentalChart | null; timestamp: number }
>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export async function fetchDentalChart(
  patientId: string
): Promise<DentalChart | null> {
  try {
    // 1. Check in‑memory cache first (network priority)
    const cached = networkCache.get(patientId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data; // may be null if no chart exists
    }

    // 2. Fetch from network
    const response = await fetch(
      `/api/v1/clinic/patient/chart?patientId=${patientId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      if (response.status === 404) throw new Error("المريض غير موجود");
      if (response.status === 403)
        throw new Error("المريض لا ينتمي لهذه العيادة");
      if (response.status === 401)
        throw new Error("غير مصرح - يرجى تسجيل الدخول");
      throw new Error(errorData.error || "فشل في جلب بيانات Dental Chart");
    }

    const result: DentalChartResponse = await response.json();
    console.log(result.data)
    const chartData = result.data ?? null; // ensure null if no data

    // 3. Store in memory cache (including null responses)
    networkCache.set(patientId, { data: chartData, timestamp: Date.now() });

    // 4. Update IndexedDB for offline persistence (optional)
    if (chartData) {
      await chartDB.charts.put({
        id: chartData.id,
        patientId: chartData.patientId,
        chart: chartData,
        synced: true,
      });
    }

    return chartData;
  } catch (error) {
    // Network error or other failure → fallback to local IndexedDB
    console.warn(
      `Network fetch failed for patient ${patientId}, falling back to local DB:`,
      error
    );
    try {
      const localCharts = await chartDB.charts
        .where("patientId")
        .equals(patientId)
        .toArray();

      if (localCharts.length > 0) {
        // Also refresh the memory cache with the local data (optional)
        const localData = localCharts[0].chart;
        networkCache.set(patientId, { data: localData, timestamp: Date.now() });
        return localData;
      }
      return null;
    } catch (localError) {
      // If even local DB fails, rethrow the original network error
      if (error instanceof Error) throw error;
      throw new Error("حدث خطأ غير متوقع أثناء جلب Dental Chart");
    }
  }
}
/**
 * إنشاء أو تحديث Dental Chart لمريض
 * - يخزن أولاً في IndexedDB بمعرف مؤقت وحالة غير متزامنة
 * - يحاول الرفع للخادم، وعند النجاح يُحدّث السجل المحلي بالمعرّف الحقيقي والحالة synced
 */
export async function saveDentalChart(
  chartData: Omit<DentalChart, 'id' | 'created_at' | 'lastUpdated'>
): Promise<{ data: DentalChart; action: "created" | "updated" }> {
  // 1. إنشاء id مؤقت وسجل محلي غير متزامن
  const localId = uuidv4();
  const localChart: DentalChart = {
    ...chartData,
    id: localId,
    lastUpdated: new Date(),
  };

  // نخزن محلياً فوراً
  await chartDB.charts.put({
    id: localId,
    patientId: chartData.patientId, // تأكد من وجود patientId في chartData
    chart: localChart,
    synced: false,
  });

  // 2. محاولة الرفع للخادم
  try {
    const response = await fetch("/api/v1/clinic/patient/chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(chartData), // نرسل بدون id/timestamps كما كان
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();
      // في حال الفشل نُبقي السجل المحلي غير متزامن ونُعيد throw
      throw new Error( "فشل في حفظ Dental Chart");
    }

    const result: DentalChartCreateUpdateResponse = await response.json();

    // 3. رفع ناجح: نستبدل السجل المؤقت بالسجل الحقيقي من الخادم
    await chartDB.charts.delete(localId); // نحذف السجل المؤقت
    await chartDB.charts.put({
      id: result.data.id,               // id الحقيقي من الخادم
      patientId: result.data.patientId,
      chart: result.data,
      synced: true,
    });

    return {
      data: result.data,
      action: result.data.action,
    };
  } catch (error) {
    // في حال الفشل (مثلاً انقطاع الشبكة) نُبقي السجل المحلي غير متزامن
    // ونُرجعه كـ "تفاؤل" مع وضع action مؤقت
    // يمكنك إعادة throw أو إرجاع بيانات محلية حسب الحاجة
    if (error instanceof Error) throw error;
    throw new Error("حدث خطأ غير متوقع أثناء حفظ Dental Chart");
  }
}
