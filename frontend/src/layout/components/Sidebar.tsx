import { ROUTES } from '@/layout/router/routes'
import { Calendar, ClipboardList, Users } from 'lucide-react'
import { NavLink } from 'react-router'

const NAV_ITEMS = [
  { label: 'Schedule', route: ROUTES.schedule.route, icon: Calendar },
  {
    label: 'Schedule Requirements',
    route: ROUTES.scheduleRequirements.route,
    icon: ClipboardList,
  },
  { label: 'Team Members', route: ROUTES.teamMembers.route, icon: Users },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-neutral-900">
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
          <Calendar size={18} className="text-white" />
        </div>
        <span className="font-heading text-[1.0625rem] font-bold tracking-tight text-text-inverse">
          Hospital Scheduler
        </span>
      </div>

      <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.route}
            to={item.route}
            end={item.route === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-(--transition-base) ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'text-neutral-400 hover:bg-neutral-800/80 hover:text-neutral-200'
              }`
            }
          >
            <item.icon
              size={18}
              strokeWidth={2}
              className="shrink-0 transition-transform duration-(--transition-base) group-hover:scale-105"
            />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-800/50 px-4 py-3">
          <p className="text-xs font-medium text-neutral-500">Version</p>
          <p className="text-xs text-neutral-400">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
