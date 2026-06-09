// lib/clinicDB.ts
import Dexie, { Table } from 'dexie';
import { Clinic, DoctorProfile } from '@/types';
import { ClinicData } from '@/client/helpers/clinic';


interface LocalRecord<T> {
  key: string;       // 'clinic', 'profile', 'clinicData'
  data: T;
  synced: boolean;
}

class ClinicDB extends Dexie {
  clinic!: Table<LocalRecord<Clinic>, string>;
  doctorProfile!: Table<LocalRecord<DoctorProfile>, string>;
  clinicData!: Table<LocalRecord<ClinicData>, string>;

  constructor() {
    super('ClinicDB');
    this.version(1).stores({
      clinic: 'key',             // المفتاح 'clinic'
      doctorProfile: 'key',      // المفتاح 'profile'
      clinicData: 'key',         // المفتاح 'clinicData'
    });
  }
}

export const clinicLocalDB = new ClinicDB();