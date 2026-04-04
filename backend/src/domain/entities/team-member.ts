import { Entity } from '@/modules/domain/entity'

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

export const PROFESSION_SPECIALTIES: Record<Profession, readonly Specialty[]> =
  {
    [Profession.DOCTOR]: Object.values(DoctorSpecialty),
    [Profession.NURSE]: Object.values(NurseSpecialty),
    [Profession.TECHNICIAN]: Object.values(TechnicianSpecialty),
    [Profession.SUPPORT_STAFF]: Object.values(SupportStaffSpecialty),
  }

export type TeamMemberProps = {
  name: string
  profession: Profession
  specialty: Specialty
  createdAt: Date
  updatedAt: Date
}

export class TeamMember extends Entity<TeamMemberProps> {
  static create(props: Omit<TeamMemberProps, 'createdAt' | 'updatedAt'>) {
    const now = new Date()
    return new TeamMember({
      ...props,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reference(id: string, props: TeamMemberProps) {
    return new TeamMember(props, id)
  }
}
