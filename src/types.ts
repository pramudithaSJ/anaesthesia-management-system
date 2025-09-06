/** ---- Roles / Enums ---- */
export type Role = 'ADMIN' | 'HOSPITAL_LEAD' | 'MEMBER'; // Phase 1 uses ADMIN only

export type Grade = 'MO' | 'REGISTRAR' | 'SENIOR_REGISTRAR' | 'CONSULTANT';

export type HospitalType =
  | 'BASE_HOSPITAL'
  | 'BOARD_MANAGED_HOSPITAL'
  | 'DISTRICT_GENERAL_HOSPITAL'
  | 'DIVISIONAL_HOSPITAL'
  | 'GENERAL_HOSPITAL'
  | 'MEDICAL_CLINIC'
  | 'MOH_OFFICE'
  | 'NATIONAL_HOSPITAL'
  | 'REGIONAL_HEALTH_SERVICES_OFFICE'
  | 'OTHER_HEALTH_INSTITUTION'
  | 'OTHER_HOSPITAL'
  | 'PRIMARY_MEDICAL_CARE_UNIT'
  | 'PROVINCIAL_GENERAL_HOSPITAL'
  | 'SPECIALIZED_HOSPITAL'
  | 'TEACHING_HOSPITAL';

/** ---- Users (admin-only in Phase 1) ---- */
export interface User {
  uid: string;                 // Firebase Auth UID
  email: string;
  displayName?: string;
  role: Role;                  // 'ADMIN' in Phase 1
  hospitalId?: string;         // for 'HOSPITAL_LEAD' in Phase 2
  isActive: boolean;
  createdAt: string;           // ISO string
  updatedAt: string;           // ISO string
}

/** ---- Hospitals ---- */
export interface Hospital {
  id: string;
  name: string;
  province: string;
  district: string;
  type: HospitalType;
  location?: { lat: number; lng: number }; // optional if not geocoded yet
  allocation: number;           // Gov allocated positions
  notes?: string;
  createdAt: string;            // ISO string
  updatedAt: string;            // ISO string
}

/** ---- People (Anaesthesiologists) ---- */
export interface TrainingRecord {
  title: string;
  provider?: string;
  completedOn: string;          // ISO date
  expiresOn?: string;           // ISO date
  credentialUrl?: string;
}

export interface TimelineEntry {
  from: string;                 // ISO date
  to?: string;                  // ISO date
  hospitalId: string;
  grade: Grade;
  note?: string;
}

export type Gender = 'MALE' | 'FEMALE';

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  slmcNumber: string;
  nationalId?: string;          // National ID number
  phone?: string;               // Primary phone number
  phone2?: string;              // Secondary phone number
  personalEmail?: string;       // Personal email
  pgimEmail?: string;           // PGIM email
  address?: string;             // Full address
  gender?: Gender;              // Gender selection
  currentHospitalId?: string;
  currentGrade: Grade;
  anaesthesiaTrainingDone?: boolean; // Training completion status
  timeline: TimelineEntry[];    // career + transfers
  trainings?: TrainingRecord[];
  documents?: { name: string; storagePath: string; uploadedAt: string }[];
  createdAt: string;            // ISO string
  updatedAt: string;            // ISO string
}