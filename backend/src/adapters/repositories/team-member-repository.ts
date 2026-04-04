import {
  Profession,
  TeamMember,
  TeamMemberProps,
} from '@/domain/entities/team-member'

export abstract class TeamMemberRepository {
  abstract create(
    props: Omit<TeamMemberProps, 'createdAt' | 'updatedAt'>,
  ): Promise<TeamMember>

  abstract createMany(
    items: Omit<TeamMemberProps, 'createdAt' | 'updatedAt'>[],
  ): Promise<TeamMember[]>

  abstract findById(id: string): Promise<TeamMember | null>

  abstract findAll(profession?: Profession): Promise<TeamMember[]>

  abstract update(
    id: string,
    props: Partial<Omit<TeamMemberProps, 'createdAt' | 'updatedAt'>>,
  ): Promise<TeamMember>

  abstract delete(id: string): Promise<void>
}
