import { Badge } from '@/layout/components/ui/Badge'
import {
  PROFESSION_LABELS,
  type Profession,
  formatSpecialtyLabel,
  type Specialty,
} from '@/server/types/entities'

interface TeamMemberItem {
  name: string
  profession: string
  specialty: string
}

interface CreateTeamMemberCardProps {
  args: { items?: TeamMemberItem[] }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function CreateTeamMemberCard({ args }: CreateTeamMemberCardProps) {
  const items = args.items ?? []

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface-sunken/30 p-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            {getInitials(item.name)}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-text-primary">
              {item.name}
            </span>
            <div className="flex items-center gap-1.5">
              <Badge variant="primary">
                {PROFESSION_LABELS[item.profession as Profession] ??
                  item.profession}
              </Badge>
              <Badge variant="info">
                {formatSpecialtyLabel(item.specialty as Specialty)}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
