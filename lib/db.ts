// lib/db.ts
import Dexie, { Table } from 'dexie';

export interface XrayImageMetadata {
  id: string;          // نفس الـ id من supabase
  patientId: string;
  title: string;
  img_tele_id: string; // file_id من تلجرام
  created_at: string;
  localFileKey?: string; 
   mimeType?: string;// مفتاح الملف في تخزين الملفات (اختياري)
}

// تخزين الملفات الثنائية (Blob)
export interface StoredFile {
  key: string;         // مثلاً img_tele_id أو id
  blob: Blob;
  mimeType: string;
  fileName: string;
}

class XRayDatabase extends Dexie {
  images!: Table<XrayImageMetadata, string>;
  files!: Table<StoredFile, string>;

  constructor() {
    super('XRayDB');
    this.version(1).stores({
      images: 'id, patientId, created_at, img_tele_id',
      files: 'key'
    });
  }
}

export const db = new XRayDatabase();