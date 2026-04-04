import { Badge } from '@/layout/components/ui/Badge'
import type { ProfessionFulfillment } from '@/server/types/entities'
import { ProfessionFulfillmentRow } from './ProfessionFulfillmentRow'

interface FulfillmentSectionProps {
  title: string
  isFulfilled: boolean
  professions: ProfessionFulfillment[]
}

export function FulfillmentSection({
  title,
  isFulfilled,
  professions,
}: FulfillmentSectionProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface-sunken/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-heading text-sm font-semibold text-text-secondary">
          {title}
        </h4>
        <Badge variant={isFulfilled ? 'success' : 'error'}>
          {isFulfilled ? 'All Met' : 'Has Gaps'}
        </Badge>
      </div>
      <div className="flex flex-col gap-2.5">
        {professions.map((profession) => (
          <ProfessionFulfillmentRow
            key={profession.profession}
            fulfillment={profession}
          />
        ))}
      </div>
    </div>
  )
}
