import {
  ScheduleEntry,
  StructureData,
  StructureDataJsonField,
} from '@/domain/entities/schedule-entry/schedule-entry'
import { ScheduleEntryScheduleRequirementMap } from '@/domain/entities/schedule-entry/schedule-entry-schedule-requirement-map'
import { ScheduleEntryScheduleRequirementMapWatchedList } from '@/domain/entities/schedule-entry/watched-lists/schedule-entry-schedule-requirement-map'
import { ScheduleEntryTeamMemberMapWatchedList } from '@/domain/entities/schedule-entry/watched-lists/schedule-entry-team-member-map'
import {
  RequirementsData,
  RequirementsDataJsonField,
  ScheduleRequirement,
} from '@/domain/entities/schedule-requirement'
import {
  DoctorSpecialty,
  NurseSpecialty,
  Profession,
  SupportStaffSpecialty,
  TeamMember,
  TechnicianSpecialty,
} from '@/domain/entities/team-member'
import { formatDateToISO, getMondayOfWeek } from '@/domain/utils/schedule'
import { PrismaScheduleEntryRepository } from '@/infra/adapters/repository/prisma-schedule-entry-repository'
import { PrismaScheduleRequirementRepository } from '@/infra/adapters/repository/prisma-schedule-requirement-repository'
import { PrismaTeamMemberRepository } from '@/infra/adapters/repository/prisma-team-member-repository'
import { prisma } from '@/infra/services/prisma'

type SeedRepositories = {
  teamMemberRepository: PrismaTeamMemberRepository
  scheduleRequirementRepository: PrismaScheduleRequirementRepository
  scheduleEntryRepository: PrismaScheduleEntryRepository
}

function buildWeekDates(weeksCount: number): string[] {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const firstMonday = getMondayOfWeek(today)
  const dates: string[] = []

  for (let index = 0; index < weeksCount * 7; index++) {
    const date = new Date(firstMonday)
    date.setUTCDate(firstMonday.getUTCDate() + index)
    dates.push(formatDateToISO(date))
  }

  return dates
}

function buildWeekdayRequirements(): RequirementsData {
  return [
    {
      profession: Profession.DOCTOR,
      requiredCount: 2,
      specialtyRequirements: [
        { specialty: DoctorSpecialty.EMERGENCY, requiredCount: 1 },
      ],
    },
    {
      profession: Profession.NURSE,
      requiredCount: 3,
      specialtyRequirements: [
        { specialty: NurseSpecialty.ICU, requiredCount: 1 },
      ],
    },
    {
      profession: Profession.TECHNICIAN,
      requiredCount: 1,
      specialtyRequirements: [
        { specialty: TechnicianSpecialty.LAB, requiredCount: 1 },
      ],
    },
    {
      profession: Profession.SUPPORT_STAFF,
      requiredCount: 2,
      specialtyRequirements: [
        { specialty: SupportStaffSpecialty.RECEPTIONIST, requiredCount: 1 },
      ],
    },
  ]
}

function buildWeekendRequirements(): RequirementsData {
  return [
    {
      profession: Profession.DOCTOR,
      requiredCount: 1,
      specialtyRequirements: [
        { specialty: DoctorSpecialty.EMERGENCY, requiredCount: 1 },
      ],
    },
    {
      profession: Profession.NURSE,
      requiredCount: 2,
      specialtyRequirements: [
        { specialty: NurseSpecialty.EMERGENCY, requiredCount: 1 },
      ],
    },
    {
      profession: Profession.TECHNICIAN,
      requiredCount: 1,
      specialtyRequirements: [
        { specialty: TechnicianSpecialty.RADIOLOGY, requiredCount: 1 },
      ],
    },
    {
      profession: Profession.SUPPORT_STAFF,
      requiredCount: 1,
      specialtyRequirements: [
        { specialty: SupportStaffSpecialty.SECURITY, requiredCount: 1 },
      ],
    },
  ]
}

function buildScheduleStructure(isWeekend: boolean): StructureData {
  if (isWeekend) {
    return buildWeekendRequirements()
  }

  return buildWeekdayRequirements()
}

async function resetDatabase(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.scheduleEntryTeamMemberMap.deleteMany()
    await tx.scheduleEntryScheduleRequirementMap.deleteMany()
    await tx.scheduleEntry.deleteMany()
    await tx.scheduleRequirement.deleteMany()
    await tx.teamMember.deleteMany()
  })
}

async function persistTeamMembers(
  teamMemberRepository: SeedRepositories['teamMemberRepository'],
): Promise<TeamMember[]> {
  return teamMemberRepository.createMany([
    {
      name: 'Dr. Sofia Ramos',
      profession: Profession.DOCTOR,
      specialty: DoctorSpecialty.EMERGENCY,
    },
    {
      name: 'Dr. Lucas Vieira',
      profession: Profession.DOCTOR,
      specialty: DoctorSpecialty.CARDIOLOGY,
    },
    {
      name: 'Dr. Helena Costa',
      profession: Profession.DOCTOR,
      specialty: DoctorSpecialty.PEDIATRICS,
    },
    {
      name: 'Ana Martins',
      profession: Profession.NURSE,
      specialty: NurseSpecialty.ICU,
    },
    {
      name: 'Mariana Alves',
      profession: Profession.NURSE,
      specialty: NurseSpecialty.EMERGENCY,
    },
    {
      name: 'Paulo Mendes',
      profession: Profession.NURSE,
      specialty: NurseSpecialty.GENERAL_WARD,
    },
    {
      name: 'Carla Pires',
      profession: Profession.NURSE,
      specialty: NurseSpecialty.PEDIATRIC,
    },
    {
      name: 'Rafael Nunes',
      profession: Profession.TECHNICIAN,
      specialty: TechnicianSpecialty.LAB,
    },
    {
      name: 'Bruna Rocha',
      profession: Profession.TECHNICIAN,
      specialty: TechnicianSpecialty.RADIOLOGY,
    },
    {
      name: 'Joao Teixeira',
      profession: Profession.SUPPORT_STAFF,
      specialty: SupportStaffSpecialty.RECEPTIONIST,
    },
    {
      name: 'Laura Batista',
      profession: Profession.SUPPORT_STAFF,
      specialty: SupportStaffSpecialty.SECURITY,
    },
    {
      name: 'Renata Lima',
      profession: Profession.SUPPORT_STAFF,
      specialty: SupportStaffSpecialty.CLEANING,
    },
  ])
}

async function persistScheduleRequirements(
  scheduleRequirementRepository: SeedRepositories['scheduleRequirementRepository'],
): Promise<{ weekday: ScheduleRequirement; weekend: ScheduleRequirement }> {
  const weekday = await scheduleRequirementRepository.create({
    dateReference: 'weekday',
    requirements: RequirementsDataJsonField.create(buildWeekdayRequirements()),
  })

  const weekend = await scheduleRequirementRepository.create({
    dateReference: 'weekend',
    requirements: RequirementsDataJsonField.create(buildWeekendRequirements()),
  })

  return { weekday, weekend }
}

function createRequirementMaps(
  scheduleRequirementIds: string[],
): ScheduleEntryScheduleRequirementMapWatchedList {
  const mapItems = scheduleRequirementIds.map((scheduleRequirementId) =>
    ScheduleEntryScheduleRequirementMap.create({
      scheduleEntryId: '',
      scheduleRequirementId,
    }),
  )

  return new ScheduleEntryScheduleRequirementMapWatchedList(mapItems)
}

async function persistScheduleEntries(
  scheduleEntryRepository: SeedRepositories['scheduleEntryRepository'],
  requirementsByType: {
    weekday: ScheduleRequirement
    weekend: ScheduleRequirement
  },
  dates: string[],
): Promise<ScheduleEntry[]> {
  const createdEntries: ScheduleEntry[] = []

  for (const date of dates) {
    const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const scheduleRequirementId = isWeekend
      ? requirementsByType.weekend.id
      : requirementsByType.weekday.id

    const createdEntry = await scheduleEntryRepository.create({
      date,
      structure: StructureDataJsonField.create(
        buildScheduleStructure(isWeekend),
      ),
      teamMembers: new ScheduleEntryTeamMemberMapWatchedList([]),
      scheduleRequirements: createRequirementMaps([scheduleRequirementId]),
    })

    createdEntries.push(createdEntry)
  }

  return createdEntries
}

async function run(): Promise<void> {
  const repositories: SeedRepositories = {
    teamMemberRepository: new PrismaTeamMemberRepository(),
    scheduleRequirementRepository: new PrismaScheduleRequirementRepository(),
    scheduleEntryRepository: new PrismaScheduleEntryRepository(),
  }

  await resetDatabase()

  const teamMembers = await persistTeamMembers(
    repositories.teamMemberRepository,
  )
  const requirements = await persistScheduleRequirements(
    repositories.scheduleRequirementRepository,
  )
  const entries = await persistScheduleEntries(
    repositories.scheduleEntryRepository,
    requirements,
    buildWeekDates(2),
  )

  console.log('Fake data created successfully')
  console.log(`Team members: ${teamMembers.length}`)
  console.log('Schedule requirements: 2')
  console.log(`Schedule entries: ${entries.length}`)
}

run()
  .catch((error) => {
    console.error('Error while creating fake data', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
