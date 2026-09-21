// client/helpers/date-helpers.ts

/**
 * ============================================================
 * دوال التعامل مع التواريخ بالتوقيت المحلي
 * ============================================================
 * ⚠️ القاعدة الذهبية:
 * - استخدم getFullYear/getMonth/getDate للعرض والتحويل
 * - تجنّب toISOString() و getUTC* إلا عند التعامل مع API يريد UTC
 */

// ============================================================
// 1) تحويل Date → "YYYY-MM-DD" (محلي)
// ============================================================
export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ============================================================
// 2) تحويل Date → "YYYY-MM-DDTHH:MM" (محلي) - للـ datetime-local
// ============================================================
export function toLocalDateTimeString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ============================================================
// 3) تحويل Date → "HH:MM" (محلي)
// ============================================================
export function toLocalTimeString(date: Date = new Date()): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// ============================================================
// 4) تحويل "YYYY-MM-DD" → Date (محلي، ليس UTC)
// ============================================================
export function fromLocalDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

// ============================================================
// 5) تحويل "YYYY-MM-DDTHH:MM" → Date (محلي)
// ============================================================
export function fromLocalDateTimeString(dateTimeStr: string): Date {
  // استخراج التاريخ والوقت يدوياً لتجنب تفسير UTC
  const [datePart, timePart] = dateTimeStr.split("T");
  if (!datePart) return new Date();
  
  const [y, m, d] = datePart.split("-").map(Number);
  
  if (timePart) {
    const [hh, mm] = timePart.split(":").map(Number);
    return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
  }
  
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

// ============================================================
// 6) مقارنة يومين (نفس اليوم محلياً؟)
// ============================================================
export function isSameLocalDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// ============================================================
// 7) اليوم (محلي) بصيغة "YYYY-MM-DD"
// ============================================================
export function todayLocalString(): string {
  return toLocalDateString(new Date());
}

// ============================================================
// 8) إضافة أيام ليوم (محلياً، مع تصفير الساعات)
// ============================================================
export function addLocalDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
}

// ============================================================
// 9) دمج تاريخ ووقت محلياً
// ============================================================
export function mergeLocalDateAndTime(
  dateStr: string,
  timeStr: string
): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
}