// lib/toothNames.ts

export interface ToothNameInfo {
  number: number; // الرقم بالنظام العالمي (1-32)
  nameAr: string; // الاسم الكامل بالعربية
  quadrant: "upper-right" | "upper-left" | "lower-left" | "lower-right";
  type: "molar" | "premolar" | "canine" | "incisor";
}

export const TOOTH_NAMES_AR: ToothNameInfo[] = [
  // ============================================================
  // الفك العلوي الأيمن (1-8)
  // ============================================================
  { number: 1, nameAr: "الضرس الثالث العلوي الأيمن (ضرس العقل)", quadrant: "upper-right", type: "molar" },
  { number: 2, nameAr: "الضرس الثاني العلوي الأيمن", quadrant: "upper-right", type: "molar" },
  { number: 3, nameAr: "الضرس الأول العلوي الأيمن", quadrant: "upper-right", type: "molar" },
  { number: 4, nameAr: "الضاحك الثاني العلوي الأيمن", quadrant: "upper-right", type: "premolar" },
  { number: 5, nameAr: "الضاحك الأول العلوي الأيمن", quadrant: "upper-right", type: "premolar" },
  { number: 6, nameAr: "الناب العلوي الأيمن", quadrant: "upper-right", type: "canine" },
  { number: 7, nameAr: "القاطع الجانبي العلوي الأيمن", quadrant: "upper-right", type: "incisor" },
  { number: 8, nameAr: "القاطع المركزي العلوي الأيمن", quadrant: "upper-right", type: "incisor" },

  // ============================================================
  // الفك العلوي الأيسر (9-16)
  // ============================================================
  { number: 9, nameAr: "القاطع المركزي العلوي الأيسر", quadrant: "upper-left", type: "incisor" },
  { number: 10, nameAr: "القاطع الجانبي العلوي الأيسر", quadrant: "upper-left", type: "incisor" },
  { number: 11, nameAr: "الناب العلوي الأيسر", quadrant: "upper-left", type: "canine" },
  { number: 12, nameAr: "الضاحك الأول العلوي الأيسر", quadrant: "upper-left", type: "premolar" },
  { number: 13, nameAr: "الضاحك الثاني العلوي الأيسر", quadrant: "upper-left", type: "premolar" },
  { number: 14, nameAr: "الضرس الأول العلوي الأيسر", quadrant: "upper-left", type: "molar" },
  { number: 15, nameAr: "الضرس الثاني العلوي الأيسر", quadrant: "upper-left", type: "molar" },
  { number: 16, nameAr: "الضرس الثالث العلوي الأيسر (ضرس العقل)", quadrant: "upper-left", type: "molar" },

  // ============================================================
  // الفك السفلي الأيسر (17-24)
  // ============================================================
  { number: 17, nameAr: "الضرس الثالث السفلي الأيسر (ضرس العقل)", quadrant: "lower-left", type: "molar" },
  { number: 18, nameAr: "الضرس الثاني السفلي الأيسر", quadrant: "lower-left", type: "molar" },
  { number: 19, nameAr: "الضرس الأول السفلي الأيسر", quadrant: "lower-left", type: "molar" },
  { number: 20, nameAr: "الضاحك الثاني السفلي الأيسر", quadrant: "lower-left", type: "premolar" },
  { number: 21, nameAr: "الضاحك الأول السفلي الأيسر", quadrant: "lower-left", type: "premolar" },
  { number: 22, nameAr: "الناب السفلي الأيسر", quadrant: "lower-left", type: "canine" },
  { number: 23, nameAr: "القاطع الجانبي السفلي الأيسر", quadrant: "lower-left", type: "incisor" },
  { number: 24, nameAr: "القاطع المركزي السفلي الأيسر", quadrant: "lower-left", type: "incisor" },

  // ============================================================
  // الفك السفلي الأيمن (25-32)
  // ============================================================
  { number: 25, nameAr: "القاطع المركزي السفلي الأيمن", quadrant: "lower-right", type: "incisor" },
  { number: 26, nameAr: "القاطع الجانبي السفلي الأيمن", quadrant: "lower-right", type: "incisor" },
  { number: 27, nameAr: "الناب السفلي الأيمن", quadrant: "lower-right", type: "canine" },
  { number: 28, nameAr: "الضاحك الأول السفلي الأيمن", quadrant: "lower-right", type: "premolar" },
  { number: 29, nameAr: "الضاحك الثاني السفلي الأيمن", quadrant: "lower-right", type: "premolar" },
  { number: 30, nameAr: "الضرس الأول السفلي الأيمن", quadrant: "lower-right", type: "molar" },
  { number: 31, nameAr: "الضرس الثاني السفلي الأيمن", quadrant: "lower-right", type: "molar" },
  { number: 32, nameAr: "الضرس الثالث السفلي الأيمن (ضرس العقل)", quadrant: "lower-right", type: "molar" },
];

// ✅ دالة للحصول على اسم السن
export function getToothName(number: number): string {
  const tooth = TOOTH_NAMES_AR.find((t) => t.number === number);
  return tooth?.nameAr || `السن رقم ${number}`;
}

// ✅ دالة للحصول على عرض السن حسب الإعدادات
export function getToothDisplay(
  number: number,
  preference: "number" | "name" | "both" = "number"
): string {
  const tooth = TOOTH_NAMES_AR.find((t) => t.number === number);
  
  if (!tooth) return `السن ${number}`;
  
  switch (preference) {
    case "number":
      return `السن ${number}`;
    case "name":
      return tooth.nameAr;
    case "both":
      return `السن ${number} - ${tooth.nameAr}`;
    default:
      return `السن ${number}`;
  }
}