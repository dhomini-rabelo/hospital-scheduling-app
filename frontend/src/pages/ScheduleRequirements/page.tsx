import { ClipboardList } from 'lucide-react'

export function ScheduleRequirements() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
          <ClipboardList size={20} className="text-primary-600" />
        </div>
        <div>
          <h1 className="text-heading-2">Schedule Requirements</h1>
          <p className="text-sm text-text-tertiary">
            Configure staffing requirements
          </p>
        </div>
      </div>

      <div className="card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
          <ClipboardList size={28} className="text-primary-400" />
        </div>
        <p className="font-heading text-lg font-semibold text-text-secondary">
          Coming Soon
        </p>
        <p className="mt-1 max-w-sm text-sm text-text-tertiary">
          Staffing requirements configuration is under development. You'll be able to define shift requirements here.
        </p>
      </div>
    </div>
  )
}
