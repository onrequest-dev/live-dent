// lib/dentalChartDB.ts
import Dexie, { Table } from 'dexie';
import { DentalChart } from '@/types';

export interface LocalDentalChart {
  // نستخدم id من الخادم بعد الرفع، أو id مؤقت قبل الرفع
  id: string;
  patientId: string;
  // نخزن كامل بيانات الرسمة
  chart: DentalChart;
  // حالة المزامنة
  synced: boolean;
}

class DentalChartDatabase extends Dexie {
  charts!: Table<LocalDentalChart, string>; // المفتاح الأساسي id

  constructor() {
    super('DentalChartDB');
    this.version(1).stores({
      charts: 'id, patientId, synced', // فهارس للبحث السريع
    });
  }
}

export const chartDB = new DentalChartDatabase();