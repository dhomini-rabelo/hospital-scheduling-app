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

export interface SpecialtyRequirement {
  specialty: Specialty
  requiredCount: number
}

export interface ProfessionRequirement {
  profession: Profession
  requiredCount: number
  specialtyRequirements: SpecialtyRequirement[]
}

export interface ScheduleRequirement {
  id: string
  dateReference: string
  requirements: ProfessionRequirement[]
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ScheduleEntry {
  id: string
  date: string
  structure: ProfessionRequirement[]
  createdAt: string
  updatedAt: string
}

export interface ScheduleEntryWithAggregateData extends ScheduleEntry {
  teamMembers: TeamMember[]
  scheduleRequirements: ScheduleRequirement[]
}

export interface SpecialtyFulfillment {
  specialty: string
  requiredCount: number
  assignedCount: number
  isFulfilled: boolean
}

export interface ProfessionFulfillment {
  profession: Profession
  requiredCount: number
  assignedCount: number
  isFulfilled: boolean
  specialties: SpecialtyFulfillment[]
}

export interface StructureFulfillment {
  professions: ProfessionFulfillment[]
}

export interface RequirementFulfillment {
  requirementId: string
  dateReference: string
  isFulfilled: boolean
  professions: ProfessionFulfillment[]
}

export interface ScheduleOverviewEntry {
  id: string
  teamMember: TeamMember
}

export interface ScheduleOverview {
  date: string
  totalAssigned: number
  entries: ScheduleOverviewEntry[]
  scheduleRequirements: ScheduleRequirement[]
  structureFulfillment: StructureFulfillment | null
  requirementsFulfillment: RequirementFulfillment[]
}

export interface SpecialtyGap {
  specialty: Specialty
  requiredCount: number
  assignedCount: number
  deficit: number
}

export interface ProfessionGap {
  profession: Profession
  requiredCount: number
  assignedCount: number
  deficit: number
  specialtyGaps: SpecialtyGap[]
}

export interface DayGap {
  date: string
  professionGaps: ProfessionGap[]
}

export interface AutoFillGapReport {
  hasGaps: boolean
  days: DayGap[]
}

export interface AutoFillResponse {
  entries: ScheduleEntry[]
  gapReport: AutoFillGapReport
}
