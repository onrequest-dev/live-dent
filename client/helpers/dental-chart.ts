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
export async function fetchDentalChart(patientId: string): Promise<DentalChart | null> {
  try {
    // 1. البحث في قاعدة البيانات المحلية
    const localCharts = await chartDB.charts
      .where('patientId')
      .equals(patientId)
      .toArray();

    // إذا وجدنا سجلاً واحداً على الأقل نُرجع بياناته (قد يكون غير متزامن لكنّه أحدث ما لدينا)
    if (localCharts.length > 0) {
      // نُرجع أول نتيجة (في الحالة الطبيعية يجب ألا يكون هناك أكثر من رسمة لكل مريض)
      return localCharts[0].chart;
    }

    // 2. لم نجده محلياً → نجلبه من الخادم
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

    if (result.data) {
      // 3. نخزّن البيانات في IndexedDB مع وضعها كـ synced
      await chartDB.charts.put({
        id: result.data.id,
        patientId: result.data.patientId,
        chart: result.data,
        synced: true,
      });
    }

    return result.data; // قد يكون null إذا لم توجد رسمة
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("حدث خطأ غير متوقع أثناء جلب Dental Chart");
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
