import { Badge } from '@/layout/components/ui/Badge'
import {
  PROFESSION_LABELS,
  type ProfessionFulfillment,
  formatSpecialtyLabel,
} from '@/server/types/entities'

interface ProfessionFulfillmentRowProps {
  fulfillment: ProfessionFulfillment
}

export function ProfessionFulfillmentRow({
  fulfillment,
}: ProfessionFulfillmentRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {PROFESSION_LABELS[fulfillment.profession]}
          </span>
          <span className="text-xs text-text-tertiary">
            {fulfillment.assignedCount} / {fulfillment.requiredCount}
          </span>
        </div>
        <Badge variant={fulfillment.isFulfilled ? 'success' : 'error'}>
          {fulfillment.isFulfilled ? 'Fulfilled' : 'Gap'}
        </Badge>
      </div>

      {fulfillment.specialties.length > 0 && (
        <div className="ml-4 flex flex-col gap-1 border-l-2 border-border/40 pl-3">
          {fulfillment.specialties.map((specialty) => (
            <div
              key={specialty.specialty}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">
                  {formatSpecialtyLabel(specialty.specialty)}
                </span>
                <span className="text-xs text-text-tertiary">
                  {specialty.assignedCount} / {specialty.requiredCount}
                </span>
              </div>
              <Badge
                variant={specialty.isFulfilled ? 'success' : 'error'}
              >
                {specialty.isFulfilled ? 'Met' : 'Short'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
