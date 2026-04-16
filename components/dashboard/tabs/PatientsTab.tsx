'use client';

import { Download } from 'lucide-react';

export function PatientsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">جدول المرضى</h1>
          <p className="text-gray-500 mt-1">شهر أبريل 2026</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
        <p className="text-gray-400">جدول المرضى الشهري قيد التطوير...</p>
      </div>
    </div>
  );
}