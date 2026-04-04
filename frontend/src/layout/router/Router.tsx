import { BrowserRouter, Route, Routes } from 'react-router'
import { AppLayout } from '@/layout/components/layouts/AppLayout'
import { Schedule } from '@/pages/Schedule/page'
import { ScheduleRequirements } from '@/pages/ScheduleRequirements/page'
import { TeamMembers } from '@/pages/TeamMembers/page'
import { ROUTES } from './routes'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.schedule.layoutRoute} element={<Schedule />} />
          <Route
            path={ROUTES.scheduleRequirements.layoutRoute}
            element={<ScheduleRequirements />}
          />
          <Route
            path={ROUTES.teamMembers.layoutRoute}
            element={<TeamMembers />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
