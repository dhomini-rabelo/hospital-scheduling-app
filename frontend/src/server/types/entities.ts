export enum Profession {
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  TECHNICIAN = 'TECHNICIAN',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
}

export enum DoctorSpecialty {
  NEUROLOGY = 'NEUROLOGY',
  CARDIOLOGY = 'CARDIOLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  PEDIATRICS = 'PEDIATRICS',
  EMERGENCY = 'EMERGENCY',
  GENERAL = 'GENERAL',
}

export enum NurseSpecialty {
  ICU = 'ICU',
  EMERGENCY = 'EMERGENCY',
  GENERAL_WARD = 'GENERAL_WARD',
  PEDIATRIC = 'PEDIATRIC',
}

export enum TechnicianSpecialty {
  RADIOLOGY = 'RADIOLOGY',
  LAB = 'LAB',
  PHARMACY = 'PHARMACY',
}

export enum SupportStaffSpecialty {
  RECEPTIONIST = 'RECEPTIONIST',
  CLEANING = 'CLEANING',
  SECURITY = 'SECURITY',
}

export type Specialty =
  | DoctorSpecialty
  | NurseSpecialty
  | TechnicianSpecialty
  | SupportStaffSpecialty

export const PROFESSION_SPECIALTIES: Record<Profession, readonly Specialty[]> = {
  [Profession.DOCTOR]: Object.values(DoctorSpecialty),
  [Profession.NURSE]: Object.values(NurseSpecialty),
  [Profession.TECHNICIAN]: Object.values(TechnicianSpecialty),
  [Profession.SUPPORT_STAFF]: Object.values(SupportStaffSpecialty),
}

export const PROFESSION_LABELS: Record<Profession, string> = {
  [Profession.DOCTOR]: 'Doctor',
  [Profession.NURSE]: 'Nurse',
  [Profession.TECHNICIAN]: 'Technician',
  [Profession.SUPPORT_STAFF]: 'Support Staff',
}

export function formatSpecialtyLabel(specialty: Specialty): string {
  return specialty
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export interface TeamMember {
  id: string
  name: string
  profession: Profession
  specialty: Specialty
  createdAt: string
  updatedAt: string
}
