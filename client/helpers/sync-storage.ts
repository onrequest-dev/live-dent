// client/helpers/sync-storage.ts
"use client";

const SYNC_ENDPOINT = "/api/v1/clinic-sync";

// ✅ المفاتيح التي نزامنها
const SYNC_EXACT_KEYS = [
  "treatment_templates",
  "tooth_display_preference",
];
const SYNC_PREFIX_KEYS = [
  "tooth_template_assignments_",   // لكل مريض: tooth_template_assignments_<patientId>
];

export const isSyncableKey = (key: string): boolean => {
  if (SYNC_EXACT_KEYS.includes(key)) return true;
  return SYNC_PREFIX_KEYS.some((p) => key.startsWith(p));
};

// ============================================================
// سحب من السيرفر ودمج مع localStorage (بدون تكرار)
// ============================================================
export async function pullFromServer(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const res = await fetch(SYNC_ENDPOINT, { method: "GET", cache: "no-store" });
    if (!res.ok) {
      console.warn("[sync] pull failed:", res.status);
      return;
    }
    const json = await res.json();
    const serverData: Record<string, { value: string; updatedAt: string }> = json.data || {};

    for (const [key, { value: serverValue }] of Object.entries(serverData)) {
      if (!isSyncableKey(key)) continue;

      const localValue = localStorage.getItem(key);

      // إذا لم يوجد محلياً → أضف مباشرة
      if (localValue === null) {
        localStorage.setItem(key, serverValue);
        continue;
      }

      // إذا موجود محلياً → نحاول الدمج الذكي (للمصفوفات)
      if (localValue === serverValue) continue;

      const merged = tryMerge(key, localValue, serverValue);
      if (merged !== null && merged !== localValue) {
        localStorage.setItem(key, merged);
        // ارفع النسخة المدمجة للسيرفر
        await pushToServer(key, merged);
      }
    }

    // إشعار باقي المكونات
    window.dispatchEvent(new CustomEvent("toothAssignmentsChanged"));
    window.dispatchEvent(new CustomEvent("treatmentTemplatesChanged"));
    window.dispatchEvent(new CustomEvent("toothDisplayPreferenceChanged", {
      detail: localStorage.getItem("tooth_display_preference") || "number",
    }));
  } catch (e) {
    console.error("[sync] pull error:", e);
  }
}

// ============================================================
// دفع مفتاح واحد للسيرفر
// ============================================================
export async function pushToServer(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (!isSyncableKey(key)) return;

  try {
    await fetch(SYNC_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key_name: key, key_value: value }),
    });
  } catch (e) {
    console.error("[sync] push error:", e);
  }
}

// ============================================================
// Wrapper لـ localStorage.setItem (استخدمه بدلاً من setItem)
// ============================================================
export async function setItemAndSync(key: string, value: string): Promise<void> {
  localStorage.setItem(key, value);
  await pushToServer(key, value);
}

// ============================================================
// دمج ذكي بدون تكرار
// ============================================================
function tryMerge(key: string, localStr: string, serverStr: string): string | null {
  try {
    const localVal = JSON.parse(localStr);
    const serverVal = JSON.parse(serverStr);

    // للحالات التي القيمة فيها مصفوفة
    if (Array.isArray(localVal) && Array.isArray(serverVal)) {
      return JSON.stringify(mergeArraysByKey(key, localVal, serverVal));
    }

    // غير مصفوفة → نأخذ الأحدث حسب updatedAt إن وُجد، وإلا نأخذ السيرفر
    return serverStr;
  } catch {
    // ليست JSON (مثل "number" أو "name")
    return serverStr;
  }
}

// ============================================================
// دمج المصفوفات بدون تكرار (يحدد المفتاح حسب نوع البيانات)
// ============================================================
function mergeArraysByKey(key: string, localArr: any[], serverArr: any[]): any[] {
  const map = new Map<string, any>();

  const getId = (item: any): string => {
    if (item == null) return Math.random().toString();

    // للقوالب العلاجية: id
    if (key === "treatment_templates" && item.id) return `id:${item.id}`;

    // للتعيينات: مفتاح مركب toothNumber + templateId
    if (key.startsWith("tooth_template_assignments_")) {
      if (item.toothNumber !== undefined && item.templateId !== undefined) {
        return `assign:${item.toothNumber}:${item.templateId}`;
      }
    }

    if (item.id) return `id:${item.id}`;
    return JSON.stringify(item);
  };

  const getTime = (item: any): number => {
    if (item?.updatedAt) return new Date(item.updatedAt).getTime();
    if (item?.assignedAt) return new Date(item.assignedAt).getTime();
    return 0;
  };

  // ابدأ بالسيرفر ثم ادمج المحلي (بحيث الأحدث يفوز)
  for (const item of [...serverArr, ...localArr]) {
    const id = getId(item);
    const prev = map.get(id);
    if (!prev || getTime(item) > getTime(prev)) {
      map.set(id, item);
    }
  }

  return Array.from(map.values());
}