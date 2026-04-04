import { Calendar, ClipboardList, Users } from 'lucide-react'
import { NavLink } from 'react-router'
import { ROUTES } from '@/layout/router/routes'

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
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col bg-neutral-900">
      <div className="flex items-center gap-2 px-5 py-6">
        <Calendar size={24} className="text-primary-400" />
        <span className="text-lg font-semibold text-text-inverse">
          Hospital Scheduler
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.route}
            to={item.route}
            end={item.route === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-[background-color,color] duration-[var(--transition-fast)] ${
                isActive
                  ? 'bg-primary-600 text-text-inverse'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-text-inverse'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
