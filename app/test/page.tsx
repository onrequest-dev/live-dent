// components/ToothChart/PatientToothView.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { fetchDentalChart } from "@/client/helpers/dental-chart";
import { ToothChartSkeleton } from "../../components/ToothChart/ToothChartSkeleton";

// ============================================================
// أنواع البيانات (مبسطة للعرض فقط)
// ============================================================

type ProcedureType =
  | "sound"
  | "decayed"
  | "filled"
  | "crown"
  | "root-canal"
  | "implant"
  | "missing"
  | "custom";

interface ToothData {
  id: number;
  procedure: ProcedureType;
  customProcedure?: string;
  color: string;
  treatments: string[];
  notes: string;
}

interface PatientToothViewProps {
  patientId?: string;
  patientName?: string;
  initialTeethData?: ToothData[];
  className?: string;
  primaryColor?: string;
}

// ============================================================
// الثوابت
// ============================================================

const PROCEDURE_COLORS: Record<ProcedureType, string> = {
  sound: "#FFFFFF",
  decayed: "#bcef44",
  filled: "#3B82F6",
  crown: "#F59E0B",
  "root-canal": "#8B4513",
  implant: "#10B981",
  missing: "#9CA3AF",
  custom: "#DC2626",
};

const PROCEDURE_LABELS: Record<ProcedureType, string> = {
  sound: "سليم",
  decayed: "متسوس",
  filled: "محشو",
  crown: "تاج",
  "root-canal": "معالجة لبية",
  implant: "زرعة",
  missing: "مفقود",
  custom: "مخصص",
};

// ============================================================
// البيانات الافتراضية
// ============================================================

const DEFAULT_TEETH_DATA: ToothData[] = Array.from({ length: 32 }, (_, i) => ({
  id: i + 1,
  procedure: "sound" as ProcedureType,
  color: "#FFFFFF",
  treatments: ["", "", "", "", "", "", "", "", "", ""],
  notes: "",
}));

// ============================================================
// دوال مساعدة
// ============================================================

function normalizeChartTeeth(
  teeth: {
    toothNumber: number;
    procedure: string;
    customProcedure?: string;
    color: string;
    treatments?: string[];
    notes?: string;
  }[],
): ToothData[] {
  const defaultTeeth = [...DEFAULT_TEETH_DATA];

  return defaultTeeth.map((tooth) => {
    const entry = teeth.find((item) => item.toothNumber === tooth.id);
    if (!entry) return tooth;

    const procedure = (
      PROCEDURE_COLORS[entry.procedure as ProcedureType] !== undefined
        ? entry.procedure
        : "custom"
    ) as ProcedureType;

    const treatments = entry.treatments
      ? [...entry.treatments, ...Array(10 - entry.treatments.length).fill("")].slice(0, 10)
      : ["", "", "", "", "", "", "", "", "", ""];

    return {
      id: entry.toothNumber,
      procedure,
      customProcedure: entry.customProcedure,
      color: entry.color,
      treatments,
      notes: entry.notes || "",
    };
  });
}

// ============================================================
// SVG الأسنان (نسخة للعرض فقط بدون أحداث تفاعلية)
// ============================================================

function TeethSVGViewOnly({
  teethData,
  selectedToothId,
}: {
  teethData: ToothData[];
  selectedToothId: number | null;
}) {
  const svgRef = useRef<HTMLDivElement>(null);

  // تحديث مظهر الأسنان
  useEffect(() => {
    const timer = setTimeout(() => {
      teethData.forEach((tooth) => {
        const toothElement = document.getElementById(`Tooth${tooth.id}`);
        const txtElement = document.getElementById(`txtTooth${tooth.id}`);

        if (toothElement) {
          toothElement.setAttribute("fill", tooth.color);
          
          const isSelected = selectedToothId === tooth.id;
          const baseOpacity = selectedToothId === null ? "0.8" : "0.35";
          
          if (isSelected) {
            toothElement.setAttribute("opacity", "1");
            toothElement.setAttribute("fill-opacity", "1");
            toothElement.setAttribute("stroke-opacity", "1");
            toothElement.setAttribute("stroke", "#4B5563");
            toothElement.setAttribute("stroke-width", "2.5");
            toothElement.setAttribute("filter", "url(#highlight)");
          } else {
            toothElement.setAttribute("opacity", baseOpacity);
            toothElement.setAttribute("fill-opacity", baseOpacity);
            toothElement.setAttribute("stroke-opacity", baseOpacity);
            toothElement.setAttribute("stroke", "#C0C0C0");
            toothElement.setAttribute("stroke-width", "1.5");
            toothElement.setAttribute("filter", "none");
          }
        }

        if (txtElement) {
          const procedureText =
            tooth.customProcedure ||
            (tooth.procedure !== "sound" ? getProcedureLabel(tooth.procedure) : "");
          txtElement.textContent = procedureText;

          if (selectedToothId === tooth.id) {
            txtElement.setAttribute("fill", "#1F2937");
            txtElement.setAttribute("font-size", "13px");
            txtElement.setAttribute("font-weight", "bold");
            txtElement.setAttribute("opacity", "1");
          } else {
            txtElement.setAttribute(
              "fill",
              tooth.procedure === "sound" ? "#9CA3AF" : "#374151",
            );
            txtElement.setAttribute("font-size", "10px");
            txtElement.setAttribute("font-weight", "normal");
            txtElement.setAttribute("opacity", selectedToothId === null ? "0.7" : "0.5");
          }
        }
      });

      // تحديث الأرقام
      for (let i = 1; i <= 32; i++) {
        const label = document.getElementById(`lbl${i}`);
        if (label) {
          label.setAttribute("opacity", i === selectedToothId ? "1" : "0.5");
        }
      }

      // تحديث الحدود الخارجية
      const outlinesGroup = document.getElementById("adult-outlines");
      if (outlinesGroup) {
        outlinesGroup.setAttribute("opacity", selectedToothId === null ? "1" : "0.2");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [teethData, selectedToothId]);

  function getProcedureLabel(procedure: string): string {
    const labels: Record<string, string> = {
      decayed: "تسوس",
      filled: "حشوة",
      crown: "تاج",
      "root-canal": "معالجة",
      implant: "زرعة",
      missing: "مفقود",
    };
    return labels[procedure] || "";
  }

  return (
    <div ref={svgRef} className="tooth-chart-svg-container">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 450 700"
        enableBackground="new 0 0 450 700"
        preserveAspectRatio="xMidYMid meet"
        className="tooth-chart-svg"
        style={{
          width: "100%",
          maxWidth: "400px",
          height: "auto",
          display: "block",
          margin: "0 auto",
          backgroundColor: "#f8fafc",
        }}
      >
        <defs>
          <filter id="highlight" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
            <feFlood floodColor="#000000" floodOpacity="0.5" result="glowColor" />
            <feComposite in="glowColor" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* أرقام الأسنان */}
        <g id="toothLabels" transform="translate(40, -5)" opacity="1">
          {/* الفك العلوي - الجهة اليمنى (1-8) */}
          <text id="lbl1" transform="matrix(1 0 0 1 75 324)" fontFamily="'Avenir-Heavy'" fontSize="18px">1</text>
          <text id="lbl2" transform="matrix(1 0 0 1 68 276)" fontFamily="'Avenir-Heavy'" fontSize="18px">2</text>
          <text id="lbl3" transform="matrix(1 0 0 1 75 234)" fontFamily="'Avenir-Heavy'" fontSize="18px">3</text>
          <text id="lbl4" transform="matrix(1 0 0 1 90 195)" fontFamily="'Avenir-Heavy'" fontSize="18px">4</text>
          <text id="lbl5" transform="matrix(1 0 0 1 103 164)" fontFamily="'Avenir-Heavy'" fontSize="18px">5</text>
          <text id="lbl6" transform="matrix(1 0 0 1 120 134)" fontFamily="'Avenir-Heavy'" fontSize="18px">6</text>
          <text id="lbl7" transform="matrix(1 0 0 1 145 117)" fontFamily="'Avenir-Heavy'" fontSize="18px">7</text>
          <text id="lbl8" transform="matrix(1 0 0 1 175 112)" fontFamily="'Avenir-Heavy'" fontSize="18px">8</text>

          {/* الفك العلوي - الأمامية (9-10) */}
          <text id="lbl9" transform="matrix(1 0 0 1 208 112)" fontFamily="'Avenir-Heavy'" fontSize="18px">9</text>
          <text id="lbl10" transform="matrix(1 0 0 1 235 118)" fontFamily="'Avenir-Heavy'" fontSize="18px">10</text>

          {/* الفك العلوي - الأمامية (11-12) */}
          <text id="lbl11" transform="matrix(1 0 0 1 258 142)" fontFamily="'Avenir-Heavy'" fontSize="18px">11</text>
          <text id="lbl12" transform="matrix(1 0 0 1 275 172)" fontFamily="'Avenir-Heavy'" fontSize="18px">12</text>

          {/* الفك العلوي - الجهة اليسرى (13-16) */}
          <text id="lbl13" transform="matrix(1 0 0 1 288 200)" fontFamily="'Avenir-Heavy'" fontSize="18px">13</text>
          <text id="lbl14" transform="matrix(1 0 0 1 298 236)" fontFamily="'Avenir-Heavy'" fontSize="18px">14</text>
          <text id="lbl15" transform="matrix(1 0 0 1 300 275)" fontFamily="'Avenir-Heavy'" fontSize="18px">15</text>
          <text id="lbl16" transform="matrix(1 0 0 1 296 324)" fontFamily="'Avenir-Heavy'" fontSize="18px">16</text>

          {/* الفك السفلي - الجهة اليسرى (17-20) */}
          <text id="lbl17" transform="matrix(1 0 0 1 308 402)" fontFamily="'Avenir-Heavy'" fontSize="18px">17</text>
          <text id="lbl18" transform="matrix(1 0 0 1 310 449)" fontFamily="'Avenir-Heavy'" fontSize="18px">18</text>
          <text id="lbl19" transform="matrix(1 0 0 1 306 495)" fontFamily="'Avenir-Heavy'" fontSize="18px">19</text>
          <text id="lbl20" transform="matrix(1 0 0 1 288 538)" fontFamily="'Avenir-Heavy'" fontSize="18px">20</text>

          {/* الفك السفلي - الأمامية (21-22) */}
          <text id="lbl21" transform="matrix(1 0 0 1 268 573)" fontFamily="'Avenir-Heavy'" fontSize="18px">21</text>
          <text id="lbl22" transform="matrix(1 0 0 1 258 602)" fontFamily="'Avenir-Heavy'" fontSize="18px">22</text>

          {/* الفك السفلي - الأمامية (23-24) */}
          <text id="lbl23" transform="matrix(1 0 0 1 238 619)" fontFamily="'Avenir-Heavy'" fontSize="18px">23</text>
          <text id="lbl24" transform="matrix(1 0 0 1 215 628)" fontFamily="'Avenir-Heavy'" fontSize="18px">24</text>

          {/* الفك السفلي - الأمامية (25-26) */}
          <text id="lbl25" transform="matrix(1 0 0 1 188 628)" fontFamily="'Avenir-Heavy'" fontSize="18px">25</text>
          <text id="lbl26" transform="matrix(1 0 0 1 163 623)" fontFamily="'Avenir-Heavy'" fontSize="18px">26</text>

          {/* الفك السفلي - الجهة اليمنى (27-32) */}
          <text id="lbl27" transform="matrix(1 0 0 1 142 603)" fontFamily="'Avenir-Heavy'" fontSize="18px">27</text>
          <text id="lbl28" transform="matrix(1 0 0 1 120 573)" fontFamily="'Avenir-Heavy'" fontSize="18px">28</text>
          <text id="lbl29" transform="matrix(1 0 0 1 100 538)" fontFamily="'Avenir-Heavy'" fontSize="18px">29</text>
          <text id="lbl30" transform="matrix(1 0 0 1 90 495)" fontFamily="'Avenir-Heavy'" fontSize="18px">30</text>
          <text id="lbl31" transform="matrix(1 0 0 1 80 449)" fontFamily="'Avenir-Heavy'" fontSize="18px">31</text>
          <text id="lbl32" transform="matrix(1 0 0 1 82 402)" fontFamily="'Avenir-Heavy'" fontSize="18px">32</text>
        </g>

        {/* نصوص الإجراءات */}
        <g id="dmftLabels" transform="translate(30, -5)" opacity="0.5">
          <text id="txtTooth32" transform="matrix(1 0 0 1 5.0001 386.3778)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth31" transform="matrix(1 0 0 1 0.9998 449.7374)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth30" transform="matrix(1 0 0 1 9.6668 513.5912)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth29" transform="matrix(1 0 0 1 36.3335 578.2579)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth28" transform="matrix(1 0 0 1 74.3335 626.9246)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth27" transform="matrix(1 0 0 1 109.0001 660.9246)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth26" transform="matrix(1 0 0 1 145.6668 678.2579)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth25" transform="matrix(1 0 0 1 191.6668 687.5912)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth24" transform="matrix(1 0 0 1 233.0001 687.5915)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth23" transform="matrix(1 0 0 1 283.0001 673.5915)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth22" transform="matrix(1 0 0 1 329.6668 644.9248)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth21" transform="matrix(1 0 0 1 359.6668 604.9248)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth20" transform="matrix(1 0 0 1 390.3334 558.2581)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth19" transform="matrix(1 0 0 1 412.6435 494.2493)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth18" transform="matrix(1 0 0 1 416.1565 449.7382)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth17" transform="matrix(1 0 0 1 409.9765 386.378)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth16" transform="matrix(1 0 0 1 410.5356 325.845)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth15" transform="matrix(1 0 0 1 414.0005 251.8453)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth14" transform="matrix(1 0 0 1 408.7707 211.7113)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth13" transform="matrix(1 0 0 1 386.7073 165.7383)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth12" transform="matrix(1 0 0 1 360.5876 123.5825)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth11" transform="matrix(1 0 0 1 344.0069 89.5916)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth10" transform="matrix(1 0 0 1 301.0546 54.1648)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth9" transform="matrix(1 0 0 1 229.2251 29.2916)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth8" transform="matrix(1 0 0 1 172.7413 30.3285)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth7" transform="matrix(1 0 0 1 114.3296 51.5455)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth6" transform="matrix(1 0 0 1 72.0002 91.2056)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth5" transform="matrix(1 0 0 1 48.5357 127.8719)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth4" transform="matrix(1 0 0 1 13 183)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth3" transform="matrix(1 0 0 1 10 212.3336)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth2" transform="matrix(1 0 0 1 3.25 260.1059)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
          <text id="txtTooth1" transform="matrix(1 0 0 1 5.0001 338.4393)" fontFamily="'MyriadPro-Regular'" fontSize="16px"></text>
        </g>

        {/* أشكال الأسنان */}
        <g id="Spots">
          <polygon id="Tooth32" fill="#FFFFFF" data-key="32" points="66.7,369.7 59,370.3 51,373.7 43.7,384.3 42.3,392 38.7,406 41,415.3 44.3,420.3 47.3,424 51.7,424.3 57.7,424 62.3,422.7 66.7,422.7 71,424.3 76.3,422.7 80.7,419.3 84.7,412.3 85.3,405 87.3,391.7 85,380 80.7,375 73.7,371.3" />
          <polygon id="Tooth31" fill="#FFFFFF" data-key="31" points="76,425.7 80.3,427.7 83.3,433 85.3,447.7 84.3,458.7 79.7,472.3 73,475 50.3,479.7 46.7,476.7 37.7,446.3 39.7,438.3 43.3,432 49,426.7 56,424.7 65,424.7" />
          <polygon id="Tooth30" fill="#FFFFFF" data-key="30" points="78.7,476 85,481 90.3,488.3 96.3,499.3 97.7,511.3 93,522 86,526.3 67,533 60.3,529.7 56.3,523.7 51.7,511 47.7,494.7 47.7,488.3 50.3,483.3 55,479.7 67,476.7" />
          <polygon id="Tooth29" fill="#FFFFFF" data-key="29" points="93.3,525 99.3,527.3 108.3,536 114,546.7 115.7,559.3 114.3,567.3 106.3,573 98.3,578.3 88,579 82,575 75,565 69.3,552.3 67.3,542 69.7,536 74.3,531.7 84.3,528.3" />
          <path id="Tooth28" fill="#FFFFFF" data-key="28" d="M117.3,569.7l7.7,1.3l6.3,3.7l6.3,7.7l4,8.3L144,602l-1.3,6.7l-6.7,6.7l-7.7,3.3l-7.3-1l-7-3l-7.3-7l-5-9l-2-10c0,0-0.7-7,0.3-7.3c1-0.3,5.3-6.7,5.3-6.7l9-5H117.3z" />
          <polygon id="Tooth27" fill="#FFFFFF" data-key="27" points="155.7,611 160.3,615.3 165,624.7 161.7,634.3 156,641.3 149,644 140.7,644.3 133.3,641.3 128.7,634.7 128.7,629 132.7,621.3 137.7,615 143.7,611 149.7,610" />
          <polygon id="Tooth26" fill="#FFFFFF" data-key="26" points="178.3,627 186,629 187.7,633.7 188.7,644 189,657 189.3,662.7 186.3,663.7 176.7,663 168,656.3 159.3,649.7 156.7,644 162,639.3" />
          <polygon id="Tooth25" fill="#FFFFFF" data-key="25" points="214,637 218,642.7 223,654.3 225.7,664 225.3,666.3 219,668.3 206.7,668 196,665.7 190.3,662.7 193,657.3 199.7,647.3 207,638 210.7,635.5" />
          <path id="Tooth24" fill="#FFFFFF" data-key="24" d="M235.3,637c0,0,3-2,4-2.3c1-0.3,4.3,0,4.3,0l5,4.3l5.3,7.3l3.3,6.7l2,7.3l-2,3l-7.7,2.7l-10,0.3h-10l-2-6.7l2.7-7.3L235.3,637z" />
          <polygon id="Tooth23" fill="#FFFFFF" data-key="23" points="269.3,624 273.3,624.7 275.3,627.3 279,628.7 281.7,631.3 285.3,634.7 289.3,638.3 292,643.3 291.3,650 287,655 280.7,658.7 272,660 265,660.7 261.3,657.3 261.7,650 263.7,637 264.3,627" />
          <polygon id="Tooth22" fill="#FFFFFF" data-key="22" points="286,629.3 286.7,633.3 291.3,638.7 295.3,642.3 302,644 311.7,643.3 318.3,637.7 321,630 321.3,620.3 317,614.3 308,608 298.3,607 291,609.3 287,612.3 286.7,617.7 287.3,624.7" />
          <polygon id="Tooth21" fill="#FFFFFF" data-key="21" points="331,565.7 335,565.7 341.3,568 349.3,574.3 352.3,578.3 352.7,583.7 350.7,593.7 342.7,604 337.7,609 328,612.7 320,613.3 315,611 308.3,604.7 306.7,598 307.3,591.3 309,584.7 312.7,578.3 318.3,571.7" />
          <polygon id="Tooth20" fill="#FFFFFF" data-key="20" points="334,561 338.7,566 346,570 354.7,573 360.7,571.7 368,568.3 383,545 385.3,532.7 381.3,524.3 374,520.7 363.7,516.3 356.3,515.3 351.3,518.3 346.3,524 340.3,534.3 336,546.7" />
          <path id="Tooth19" fill="#FFFFFF" data-key="19" d="M398,470l4.7,5.7l3,7.7l-0.3,11.7l-6,13.3l-6.3,10.3l-8.3,4.3l-7.3-1l-16.3-7c0,0-2.7-6-3-7.3c-0.3-1.3-0.3-11-0.3-11l3.7-14.3l3.7-7l5.3-6.7l8-2l9.7-0.7L398,470z" />
          <polygon id="Tooth18" fill="#FFFFFF" data-key="18" points="410,435 408.7,447.3 404.3,459 399.3,467.7 393.7,468 388,466 376.3,466.3 369.7,466.3 365.7,460 364.7,444.7 366.3,434.3 369,424 378.3,417.3 386.7,415.7 391.7,415.3 396,418 399.7,418 404,421.7 407.7,427.3" />
          <polygon id="Tooth17" fill="#FFFFFF" data-key="17" points="371.7,417 378.3,417.3 386.7,415.7 391.7,415.3 397.3,417.7 402.7,416.3 407.7,409.7 406.7,395 401,377.7 397.3,373 390.7,367.3 380,365 373,366.7 367.3,369 364,374.3 360,389 363.3,401.3 367.7,412.3" />
          <polygon id="Tooth16" fill="#FFFFFF" data-key="16" points="404.3,293.7 408.7,299.3 408.7,308 405.3,318.7 401,329.7 392.3,339.7 382.7,341 369,339.7 359,335 354.7,327.7 354.3,316 358.3,304 363.7,294 368.7,294.7 378.7,296 389,296" />
          <polygon id="Tooth15" fill="#FFFFFF" data-key="15" points="362.3,247.3 357.3,251 357,259.3 358.7,268 359.7,279.7 361.3,286.7 365,291.7 371,294.3 392,295 404.3,293.7 410,280.7 412,263.3 407.3,246.7 401,240.3 396,239.7 389.3,243" />
          <polygon id="Tooth14" fill="#FFFFFF" data-key="14" points="359.7,243.7 350.7,224 345.7,211.7 348.7,205 358.3,202.7 375.7,197 388.7,193 393,196 399.3,207 401.3,222.7 400,234.3 394.7,240.7 381.7,244.7 371,246" />
          <polygon id="Tooth13" fill="#FFFFFF" data-key="13" points="386,188.7 383.3,192.7 377.7,196 356.3,203.3 345.7,202.3 341.7,199.7 338.7,196.3 335,188.7 332,177 333.7,169.7 338,164.7 346.3,161 353.7,156.7 360.3,150.3 364,151 370.7,156.3 376.3,164.3 380,170.3 383.3,178.3" />
          <polygon id="Tooth12" fill="#FFFFFF" data-key="12" points="358.7,134.3 360.3,145.7 357.3,152.7 352,157.3 346.3,161 336,164 329.7,163.3 321.7,157.7 314.3,149 310.7,139.3 310,133.7 312.3,127 318.3,125.7 326,122 332.7,116 334.7,114.3 337.7,117.3 343.3,119.7 348.7,122.7 354.3,127.7" />
          <polygon id="Tooth11" fill="#FFFFFF" data-key="11" points="336,93.3 337.7,100 336,104.7 332.7,113.7 324.3,121.3 315.3,125.7 306.3,126 297.3,120.3 294,112 295.7,102.7 299,95 303.3,90 309.3,88 316.3,87.3 322.7,87.3 328,88.3" />
          <polygon id="Tooth10" fill="#FFFFFF" data-key="10" points="310.3,83.3 298,90.7 286,95 276.3,98.3 270.3,93.3 269,82.7 269,69.3 270,58.7 274.7,54.7 282,53 287.7,54.7 297.3,60.3 304,64.3 308.7,68.7 312.3,74 313,81" />
          <polygon id="Tooth9" fill="#FFFFFF" data-key="9" points="273.3,52 266.7,61.7 258.3,72.3 253.3,79.7 247.3,85 239,87.7 232.3,82 224.7,67 222,58.3 219,50 220,44.3 224.3,40.3 230,38.7 237.3,38.7 253,39.3 258.7,41.3 264.3,43.7 268.3,45.7" />
          <polygon id="Tooth8" fill="#FFFFFF" data-key="8" points="176.7,46.3 195,41 203.3,39.7 209.3,40.7 215.3,42.7 217,47 217.7,54.3 215,64.7 212.3,75.7 208,83 201.7,85.7 195.7,86.7 189.7,83.3 183.7,74.7 175,62 171.7,54 172.7,49.7" />
          <path id="Tooth7" fill="#FFFFFF" data-key="7" d="M167,55l6.7,6.3L174,68l0.3,8l1,10l-2,8.3l-4.7,4.3l-6.7,1.7l-8-4.3l-7.3-4.7l-9.3-4.7l-6.3-5.3l-1-4.3l1.3-5c0,0,3.3-6,4.3-6s5.3-6,6.3-6s10.3-4.7,10.3-4.7L167,55z" />
          <polygon id="Tooth6" fill="#FFFFFF" data-key="6" points="126.3,82 134.3,86.3 139.7,92.3 144.7,104.7 145.7,115.3 143.7,120.7 138,124.3 131.3,125 121,125 114.7,119.3 110.3,112.3 108.3,104.7 108.7,94.7 110.7,88.7 116,84" />
          <polygon id="Tooth5" fill="#FFFFFF" data-key="5" points="109,116.7 116,122.3 122.7,125.3 127.7,131.3 128.3,141 122.7,153.7 114,161.7 105.7,162.3 96.7,161 85.7,156 82,150 81,139.3 86.3,128 93,121.3 100.7,117.3" />
          <polygon id="Tooth4" fill="#FFFFFF" data-key="4" points="82,155.3 102.3,163.3 108.7,172 109.3,182 104.7,192 100,199 94,203.7 85.3,201.7 73.7,201 64.3,196.7 60.3,190.7 59,183.3 61.7,175.3 66.3,167.7 71.3,161.3" />
          <path id="Tooth3" fill="#FFFFFF" data-key="3" d="M92.7,207.3l2,5.3l-1.7,8l-1.7,9l-4,8l-5,7.7l-11,4.7l-13.7,0.7l-10-7l-1.7-5L45,220l3-10.7l5-7.3l4-3.3l4.7-2.7l5.3,3.7l6.7,1.3c0,0,7.3,1.3,9.3,1.3s6.3,0.7,6.3,0.7L92.7,207.3z" />
          <polygon id="Tooth2" fill="#FFFFFF" data-key="2" points="79.7,288.3 71.7,291 55,293 40.3,291.3 36,287 33,273.7 36.3,260 42,248.7 44.7,244.7 50.3,246.7 56,249 65.3,250.7 74,249.7 80.3,249.7 82.3,254 85.3,259.3 87,267.7 87.7,274.7 85.3,282.7" />
          <polygon id="Tooth1" fill="#FFFFFF" data-key="1" points="33,314.3 38,325.7 45.7,335.7 55.7,341.7 64.7,343 73.3,340 77.7,335.7 81.3,326.3 82,314.3 81.3,302 80.7,292.7 73.7,292 51.3,293.7 38.7,293.7 34,298 31.7,302.3 32,311" />
        </g>

        {/* الحدود الخارجية */}
        <g id="adult-outlines" opacity="1">
          <path fill="#010101" d="M372.6,180.5c0.2,1.4-2,2.3-2.9,1.2c-0.7-1.1,1.5-1.8,2.4-0.9L372.6,180.5z" />
          <path fill="#010101" d="M71.4,392.6c-0.5,1.1-2,1.5-2.9,0.9c-0.3-1.6,2.6-2.4,3.2-0.9L71.4,392.6z" />
          <path fill="#010101" d="M407.7,456.5c5.4-9,6.6-22,0.9-30c-0.6-1.7-1.7-3.4-2.9-4.4c-0.9-0.7-1.8-1.4-2.6-2.1c-0.4-0.4-0.8-0.7-1.2-1c2.4-1.1,4.5-3.1,5.6-5.4c2.5-5.1,1.8-11,0.8-16.6c-1.6-8.7-4.1-17.6-9.8-24.5c-5.6-6.9-15-11.3-23.5-8.9c-9.2,2.6-14.9,12.4-15.5,21.9c-0.6,9.5,3,18.8,7.2,27.4c1,2.1,2.1,4.3,2.2,6.7c0,2.1-0.8,4.2-1.5,6.2c-3.5,9.5-4.8,19.7-4.1,29.8c0.4,4.9,2.8,10.8,6.5,13.2c-0.6,0.6-1.2,1.5-1.8,2.1c-1.2,1.2-2.5,2.3-3.6,3.6c-5,4.6-6.7,12.7-7.1,19.9c-0.5,8.9-0.8,18.9-7.3,24.9c-9.4,8.5-15.3,20.7-16.3,33.3c-0.4,4.8-0.9,10.9-5.5,12.3c-16.4,5.2-26.6,24.8-21.3,41.2c-8.6-1-20.5,0.4-21.6,9c-0.4,3.3,1.1,6.5,0.9,9.8c-0.1,2.3-1.9,4.8-4,5.4c-1.4-1.1-2.7-2.2-4.5-2.8c-1.3-0.4-1.7-0.9-2.4-1.7c0.1,0,0.2,0,0.3,0.1c-1.4-4.1-8-3.8-10.7-0.3c-2.7,3.4-2.7,8.2-2.9,12.5c-0.2,4.4-1,9.2-4.5,11.8c-2.2-4.9-4.5-10-8.7-13.3S238,632,234,635.6c-5.2,4.7-2.9,13.6-6.3,19.8c-4.4-1.8-5.7-7.3-7-11.9c-1.3-4.6-4.6-9.9-9.4-9.1c-2.6,0.4-4.4,2.6-6.1,4.6c-4.8,5.8-9.5,11.6-14.3,17.4c-4.6-9,3.5-22.7-4.5-29c-6.7-5.2-15.8,1.6-21.4,7.9c1-5.8,2.1-11.8,0.3-17.4c-1.8-5.6-7.4-10.4-13.1-9.2c-5.6,1.2-8.2-6.7-8.1-12.4c0.1-4.8-0.7-11.1-4.4-13.2c-1.3-1.9-2.7-3.8-4-5.7c-1.7-2.5-3.2-4.2-6-5.6c0,0-0.1,0-0.1,0c-3.4-2.8-7.7-4.4-12-4.4c3.2-16.9-5.5-35.3-20.6-43.5c4.2-10.4,2.9-22.8-3-32.3c-3.1-5.8-7.1-11.1-12.4-14.8c3.8-12.1,5.3-24.8,4.6-37.5c-0.2-2.9-0.8-6.2-2.4-8.6c-0.4-1.2-1-2.3-1.9-3.1c-1.1-0.9-2.6-1.6-4.1-2.1c1.1-0.7,2.1-1.6,2.9-2.6c3-3.6,4.3-8.2,5.4-12.7c2.4-9.5,4.5-19.9,0.6-28.9c-3.2-7.3-10.3-12.7-18.2-13.8s-16.2,2.2-21.3,8.3c-4.6,5.6-6.4,13.1-7.9,20.2c-2.1,9.3-3.3,20.9,4.5,26.4c2,1.4,1.7,4.7,0.3,6.7s-3.6,3.5-5.1,5.5c-2.6,3.6-2.5,8.5-2,13c1.5,12.7,5.6,25.1,11.8,36.3c-0.4,0.7-0.9,1.3-1.2,2c-0.8,1.5-1,3.2-1.1,4.8c-0.8,3.2-0.2,6.9,0.5,10.2c3,14.2,8.1,30.9,21.9,35.3c-5,5.4-2.4,14,0.5,20.8c2.7,6.4,5.5,12.9,10.3,18c4.8,5,12.1,8.3,18.7,6.4c-4,19.4,13.3,40,33,40.1c-1.1,2.1-2.1,4.2-3.1,6.4c-0.2,0.4-0.1,0.8,0.1,1.1c-2.2,6.2,0.8,14.6,7.4,16.3c7.7,2,18.2-2.8,22.3,3.9c5.4,9,15.4,15,25.9,15.7c-0.2-0.2-0.5-0.3-0.7-0.5c1,0.1,2,0.2,3,0.2c1.5,0.1,2.8,0.2,4.1-0.6c6.6,5.3,15.8,7.3,24,5.3c2.2,0,4.3,0.2,6.5-0.2c2.3-0.4,4.4-1,6.3-2.3c8.3,3.6,18.2,3.2,26.2-1c0.3-0.1,0.5-0.1,0.8-0.2c1.3-0.3,2.5-0.6,3.5-1.5c0.2-0.2,0.3-0.5,0.3-0.7c1.2-0.9,2.3-1.8,3.5-2.7c13.1,6.3,31.1-2.4,34.2-16.7c7.4,3.6,17.1,1.8,22.7-4.2c5.6-6,6.8-15.8,2.7-22.9c19.4-1.8,35.2-21.6,32.6-40.9c21.2-5.9,36-29.1,32.3-50.8c9.8-4.6,14.6-15.7,18.6-25.8c3.1-7.9,5.7-17.9-0.4-23.8C399.1,470.9,404,462.6,407.7,456.5z M40.6,410c-1-1.9-0.5-4.3,0-6.4c1.1-4.4,2.2-8.8,3.3-13.2c1.5-5.8,3.3-12.1,8.1-15.6c1.4-1,2.9-1.7,4.5-2.2c7.1-2.5,15.4-1.7,21.5,2.7c6.1,4.4,9.5,12.5,7.6,19.7c-1.5,6-0.9,12.3-2.8,18.2c-1.9,5.8-7.9,11.3-13.7,9.2c-7.2-2.5-16.2,4.1-22.4-0.4C43.1,419.3,42.8,414,40.6,410z M408.9,285.8c7.9-15.8,6-38.2-9.1-47.3c7.5-16.1,2.5-37.1-11.5-48.1c-2.6-15.9-11.2-30.8-23.7-41.1c-3.5-2.9-3.3-8.2-3.9-12.7c-0.3-2.2-1.3-4.7-2.7-6.4c0,0,0-0.1-0.1-0.1c-0.7-1.1-1.7-2-2.6-2.8c-1.4-2-3.1-4-5-5.3c-0.4-0.3-0.8-0.5-1.3-0.8c0.1,0,0.3,0,0.4,0c-0.4-0.2-0.8-0.3-1.2-0.5c-0.8-0.4-1.7-0.8-2.4-1.4c-1.1-0.7-1.9-1.1-2.9-1.1c-1.4-0.8-2.7-1.8-3.8-3c-2.7-3-3.9-7.8-1.4-11c4-5.3,0.2-13.6-5.8-16.5s-13.1-2.1-19.7-1.2c3.3-3.9,3.4-9.8,1.4-14.5c-2.1-4.7-6-8.3-10.2-11.2c-8.1-5.6-17.6-9.1-27.4-10c-2.4-1.7-4.3-3.7-6.5-5.4c-2.5-1.9-5.6-3-8.4-4.3c-0.1,0-0.1,0-0.2,0c-12.1-6.2-27.1-6.6-39.4-0.7c-4.2,2-9-0.1-13.5-1.3c-14.4-4-31,2.2-39.3,14.6c-15.1-3.5-32.1,5.4-37.9,19.8c-1.4,3.4-3.4,7.8-7,7.1c-6.8-1.2-13.3,4.4-15.5,11c-2.2,6.6-1,13.7,0.4,20.5c0.6,2.8-3.4,4-6.2,4.4c-13.6,2-24.2,16.2-22.3,29.8c0.4,2.5,0.9,5.6-1,7.2c-8,6.9-16.4,14.4-19.6,24.5c-1.8,5.7-1.1,12.4,1.7,17.5c0,0-0.1,0-0.1,0.1c-1,0.7-2.1,1.4-3.1,2c-0.4,0.2-0.7,0.5-1.1,0.7c-6.1,0.9-10.5,7.4-11.6,13.7c-1.2,6.9,0.3,14.1-0.4,21.1c-1,10.4-6.6,19.8-9.9,29.7c-3.3,9.9-3.8,22.3,3.8,29.5c-3.6,2.2-6.3,5.9-7.2,10c-0.2,0.2-0.2,0.4-0.3,0.6c-0.2,0.2-0.3,0.4-0.3,0.7c0,2.3,0,4.6,0.8,6.8c0.3,6.8,3.2,13.5,7.8,18.5c0.2,0.5,0.4,0.9,0.7,1.3c0,0,0,0,0,0c1.5,2.6,3.5,4.6,6.1,6.4c2,1.4,4,3.3,6.1,4.7c4.3,4.6,12.1,5.7,18,3c7-3.2,11.5-10.5,13.2-18.1s1-15.4,0.3-23.1c-0.4-4.3-0.7-8.5-1.1-12.8c1.8-2.6,3.1-5.5,4-8.5c0.3-0.7,0.6-1.3,0.8-2c0.4-1.5,0.6-3.2,1-4.7c0.2-0.7,0.3-1.3,0.3-2c3.4-9.7-9.3-22.2-2.6-30.3c8.7-10.4,12.1-25,9-38.2l2-1.8c0.9-0.3,1.7-0.8,2.4-1.6c1-1.2,2.3-2,3.3-3.3c0.6-0.8,1.1-1.6,1.5-2.4c0.5-0.5,1-1,1.5-1.6c0-0.1,0.1-0.1,0.1-0.2c3.6-3.1,4.9-9.4,4.8-14.6c-0.2-7-0.1-15.7,6.2-18.7c11.4-5.6,16.9-21,11.4-32.5c6.1-0.7,12.5-2.7,16.2-7.6c6.6-8.8,1.2-21.2-4.3-30.7c9.3,2.2,16.2,12.8,25.7,11.6c6.5-0.8,11.1-7.3,11.9-13.7s-1.1-13-3.1-19.2c8.3,4.9,11.6,17,21,19.4c6.8,1.8,13.9-2.8,17.4-8.9c3.5-6.1,4.2-13.3,4.9-20.3c5.4,3.6,7,10.6,9,16.7c2,6.1,6,12.9,12.4,13.3c4.8,0.4,9-3,12.5-6.3c5.5-5.4,10.6-11.3,14.9-17.7c3,5.6,1.5,12.3,1,18.6c-0.4,6.3,1.2,13.9,7.2,16.1c7.7,2.7,14.8-6,23-6.9c-3,7.9-7.4,16.3-4.6,24.2c2.5,7.1,10.3,11.1,17.8,11.1c-0.7,0.9-1.3,1.9-1.5,3c-0.4,1.8-0.1,3.8-0.1,5.6c0,0.1,0,0.3,0.1,0.4c-1,9.7,7,19.7,16,25c3.6,2.1,8,5.4,6.6,9.2c-2.5,6.8-1,14.8,3.5,20.4c0.3,2.7,2.6,5.2,4.3,7.2c1.5,1.8,3.2,3.4,5.2,4.5c0.5,1,1,2.1,1.5,3.1c-1.2,1.6-1.1,4.2-0.9,6c0.1,1.3,0.3,2.7,0.7,3.9c0.4,1.1,1.1,2,1.5,3.2c1.5,6.7,4,13.2,7.3,19.1c1.3,2.3,2.8,4.8,2.3,7.5c-2.5,14-1.1,28.8,4.1,42c1.6,4.1-0.5,8.6-2.4,12.6c-2.8,5.6-5.4,11.5-6.1,17.7c-0.7,6.2,0.7,13,5.2,17.4c5.3,5.3,13.3,6.2,20.7,6.7c3.7,0.2,7.4,0.4,10.9-0.7c8-2.5,12.5-10.9,16.1-18.5c4.2-8.8,8.1-20,1.9-27.5C405.4,293.1,407.3,289,408.9,285.8z" />
        </g>
      </svg>
    </div>
  );
}

// ============================================================
// لوحة معلومات السن (نسخة للعرض فقط)
// ============================================================

function ToothInfoPanelViewOnly({
  tooth,
  primaryColor,
  isMobile,
}: {
  tooth: ToothData;
  primaryColor: string;
  isMobile: boolean;
}) {
  const hasProcedure =
    tooth.procedure !== "sound" || tooth.customProcedure;
  const hasTreatments = tooth.treatments.some((t) => t.trim());
  const hasNotes = tooth.notes.trim() !== "";
  const hasAnyInfo = hasProcedure || hasTreatments || hasNotes;

  const getProcedureDisplayName = () => {
    if (tooth.customProcedure) return tooth.customProcedure;
    if (tooth.procedure !== "sound") return PROCEDURE_LABELS[tooth.procedure];
    return "";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-900">
            السن {tooth.id}
          </span>
          {hasProcedure && (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: tooth.color || "#FFFFFF" }}
              />
              <span className="text-xs text-gray-600">
                {getProcedureDisplayName()}
              </span>
            </div>
          )}
        </div>
        {!hasAnyInfo && (
          <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
            سليم
          </span>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* قسم الإجراء */}
        {hasProcedure && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              الإجراء
            </p>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span
                className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                style={{ backgroundColor: tooth.color || "#FFFFFF", border: tooth.color === "#FFFFFF" ? "2px solid #E5E7EB" : "none" }}
              />
              <span className="text-sm text-gray-800 font-medium">
                {getProcedureDisplayName()}
              </span>
            </div>
          </div>
        )}

        {/* قسم الأعمال المنفذة */}
        {hasTreatments && (
          <>
            <div className="h-px bg-gray-100" />
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                الأعمال المنفذة
              </p>
              <div className="space-y-2">
                {tooth.treatments
                  .filter((t) => t.trim())
                  .map((treatment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-[10px] text-gray-300 w-5 text-center flex-shrink-0 font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{treatment}</span>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* قسم الملاحظات */}
        {hasNotes && (
          <>
            <div className="h-px bg-gray-100" />
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                ملاحظات
              </p>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {tooth.notes}
                </p>
              </div>
            </div>
          </>
        )}

        {/* رسالة إذا كان السن سليماً */}
        {!hasAnyInfo && (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500">هذا السن سليم ولا يحتاج أي إجراء</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// المكون الرئيسي PatientToothView
// ============================================================

export function PatientToothView({
  patientId,
  patientName,
  initialTeethData,
  className = "",
  primaryColor = "#007bff",
}: PatientToothViewProps) {
  const [teethData, setTeethData] = useState<ToothData[]>(
    initialTeethData || DEFAULT_TEETH_DATA,
  );
  const [selectedToothId, setSelectedToothId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const infoPanelRef = useRef<HTMLDivElement>(null);

  // كشف حجم الشاشة
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1200);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // جلب البيانات
  useEffect(() => {
    if (!initialTeethData && patientId) {
      const loadDentalChart = async () => {
        setIsLoading(true);
        setFetchError(null);

        try {
          const chartData = await fetchDentalChart(patientId);

          if (chartData && chartData.teeth) {
            const normalized = normalizeChartTeeth(chartData.teeth);
            setTeethData(normalized);
          } else {
            setTeethData(DEFAULT_TEETH_DATA);
          }
        } catch (error: any) {
          setFetchError(error.message || "فشل تحميل بيانات الأسنان");
          setTeethData(DEFAULT_TEETH_DATA);
        } finally {
          setIsLoading(false);
        }
      };

      loadDentalChart();
    }
  }, [patientId, initialTeethData]);

  // تحديث عند تغير initialTeethData
  useEffect(() => {
    if (initialTeethData) {
      setTeethData(initialTeethData);
    }
  }, [initialTeethData]);

  // تمرير تلقائي في وضع الهاتف
  useEffect(() => {
    if (isMobile && selectedToothId && infoPanelRef.current) {
      const timer = setTimeout(() => {
        infoPanelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [selectedToothId, isMobile]);

  const selectedTooth = selectedToothId
    ? teethData.find((t) => t.id === selectedToothId) || null
    : null;

  // إحصاءات سريعة
  const totalTeeth = teethData.length;
  const soundTeeth = teethData.filter((t) => t.procedure === "sound" && !t.customProcedure).length;
  const treatedTeeth = totalTeeth - soundTeeth;

  // عرض السكيليتون
  if (isLoading && !initialTeethData) {
    return (
      <div ref={containerRef} className={`tooth-chart-wrapper ${className}`}>
        <ToothChartSkeleton isMobile={isMobile} />
      </div>
    );
  }

  // عرض الخطأ
  if (fetchError && !isLoading) {
    return (
      <div ref={containerRef} className={`tooth-chart-wrapper ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-700 font-medium mb-2">خطأ في تحميل البيانات</p>
          <p className="text-red-600 text-sm">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`tooth-chart-wrapper ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Stethoscope
              size={18}
              className="sm:w-5 sm:h-5"
              style={{ color: primaryColor }}
            />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              الشارت السني
            </h3>
            {patientName && (
              <p className="text-xs text-gray-500">{patientName}</p>
            )}
          </div>
        </div>

        {/* إحصاءات سريعة */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-400">الأسنان المعالجة</p>
            <p className="text-sm font-semibold text-gray-700">
              {treatedTeeth} / {totalTeeth}
            </p>
          </div>
          {treatedTeeth > 0 && (
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-600">
                {treatedTeeth}
              </span>
            </div>
          )}
          {treatedTeeth === 0 && (
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      {isMobile ? (
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-2">
            <TeethSVGViewOnly
              teethData={teethData}
              selectedToothId={selectedToothId}
            />
          </div>

          {/* أزرار اختيار السن في وضع الهاتف */}
          <div className="flex flex-wrap gap-2 justify-center">
            {teethData.map((tooth) => (
              <button
                key={tooth.id}
                onClick={() =>
                  setSelectedToothId((prev) =>
                    prev === tooth.id ? null : tooth.id,
                  )
                }
                className={`
                  w-9 h-9 rounded-lg text-xs font-medium transition-all flex items-center justify-center
                  ${
                    selectedToothId === tooth.id
                      ? "bg-gray-900 text-white shadow-md"
                      : tooth.procedure !== "sound"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-gray-50 text-gray-500 border border-gray-200"
                  }
                `}
              >
                {tooth.id}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selectedTooth && (
              <motion.div
                key={selectedToothId}
                ref={infoPanelRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <ToothInfoPanelViewOnly
                  tooth={selectedTooth}
                  primaryColor={primaryColor}
                  isMobile={true}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!selectedTooth && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <ChevronRight size={20} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-500">
                اضغط على سن من الأزرار أعلاه لعرض معلوماته
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-3 items-start">
          <div
            className="bg-white rounded-2xl border border-gray-100 p-2"
            style={{
              width: isTablet ? "320px" : "380px",
              flexShrink: 0,
            }}
          >
            <TeethSVGViewOnly
              teethData={teethData}
              selectedToothId={selectedToothId}
            />

            {/* شبكة أرقام الأسنان لسطح المكتب */}
            <div className="flex flex-wrap gap-1.5 justify-center mt-3 px-2">
              {teethData.map((tooth) => (
                <button
                  key={tooth.id}
                  onClick={() =>
                    setSelectedToothId((prev) =>
                      prev === tooth.id ? null : tooth.id,
                    )
                  }
                  className={`
                    w-7 h-7 rounded-md text-[10px] font-medium transition-all flex items-center justify-center
                    ${
                      selectedToothId === tooth.id
                        ? "bg-gray-900 text-white shadow-md"
                        : tooth.procedure !== "sound"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100"
                    }
                  `}
                >
                  {tooth.id}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {selectedTooth ? (
                <motion.div
                  key={selectedToothId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ToothInfoPanelViewOnly
                    tooth={selectedTooth}
                    primaryColor={primaryColor}
                    isMobile={false}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-gray-100 p-8 text-center flex flex-col items-center justify-center min-h-[400px]"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <Stethoscope size={28} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium mb-1">
                    لوحة معلومات السن
                  </p>
                  <p className="text-sm text-gray-400">
                    اضغط على سن من الرسم أو الأزرار لعرض معلوماته
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientToothView;