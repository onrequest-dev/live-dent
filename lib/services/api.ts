// lib/services/api.ts

import { Clinic, Patient, Session, PatientCase } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ============================================================
// دوال جلب بيانات العيادة
// ============================================================

export async function fetchClinic(clinicId: string): Promise<Clinic> {
  const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}`);
  if (!response.ok) throw new Error('Failed to fetch clinic');
  return response.json();
}

export async function updateClinicSettings(
  clinicId: string, 
  settings: Partial<Clinic['settings']>
): Promise<Clinic> {
  const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error('Failed to update clinic settings');
  return response.json();
}

// ============================================================
// دوال جلب بيانات المرضى
// ============================================================

export async function fetchPatients(
  clinicId: string,
  filters?: {
    search?: string;
    todayOnly?: boolean;
  }
): Promise<Patient[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.todayOnly) params.append('todayOnly', 'true');
  
  const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}/patients?${params}`);
  if (!response.ok) throw new Error('Failed to fetch patients');
  return response.json();
}

export async function fetchPatientDetails(
  clinicId: string,
  patientId: string
): Promise<{ patient: Patient; cases: PatientCase[]; sessions: Session[] }> {
  const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}/patients/${patientId}`);
  if (!response.ok) throw new Error('Failed to fetch patient details');
  return response.json();
}

export async function createPatient(
  clinicId: string,
  patientData: Omit<Patient, 'id' | 'clinicId' | 'createdAt'>
): Promise<Patient> {
  const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patientData),
  });
  if (!response.ok) throw new Error('Failed to create patient');
  return response.json();
}

// ============================================================
// دوال جلب الجلسات
// ============================================================

export async function fetchSessions(
  clinicId: string,
  filters?: {
    patientId?: string;
    date?: Date;
    status?: Session['status'];
  }
): Promise<Session[]> {
  const params = new URLSearchParams();
  if (filters?.patientId) params.append('patientId', filters.patientId);
  if (filters?.date) params.append('date', filters.date.toISOString());
  if (filters?.status) params.append('status', filters.status);
  
  const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}/sessions?${params}`);
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
}

export async function fetchTodaySessions(clinicId: string): Promise<Session[]> {
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}/sessions?date=${today}`);
  if (!response.ok) throw new Error('Failed to fetch today sessions');
  return response.json();
}

// ============================================================
// دوال جلب الحالات العلاجية
// ============================================================

export async function fetchPatientCases(
  clinicId: string,
  patientId: string
): Promise<PatientCase[]> {
  const response = await fetch(`${API_BASE_URL}/clinics/${clinicId}/patients/${patientId}/cases`);
  if (!response.ok) throw new Error('Failed to fetch patient cases');
  return response.json();
}