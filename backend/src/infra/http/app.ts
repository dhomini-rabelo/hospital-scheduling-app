import { errorHandler } from '@/infra/http/error-handler'
import { autoFillDayGaps } from '@/infra/http/routes/auto-fill-day-gaps'
import { autoFillSchedule } from '@/infra/http/routes/auto-fill-schedule'
import { chat } from '@/infra/http/routes/chat'
import { createScheduleRequirement } from '@/infra/http/routes/create-schedule-requirement'
import { createTeamMembers } from '@/infra/http/routes/create-team-members'
import { deleteScheduleEntry } from '@/infra/http/routes/delete-schedule-entry'
import { deleteScheduleRequirement } from '@/infra/http/routes/delete-schedule-requirement'
import { deleteTeamMember } from '@/infra/http/routes/delete-team-member'
import { disableScheduleRequirement } from '@/infra/http/routes/disable-schedule-requirement'
import { enableScheduleRequirement } from '@/infra/http/routes/enable-schedule-requirement'
import { getScheduleOverview } from '@/infra/http/routes/get-schedule-overview'
import { listScheduleEntries } from '@/infra/http/routes/list-schedule-entries'
import { listScheduleRequirements } from '@/infra/http/routes/list-schedule-requirements'
import { listSwapCandidates } from '@/infra/http/routes/list-swap-candidates'
import { listTeamMembers } from '@/infra/http/routes/list-team-members'
import { setScheduleEntries } from '@/infra/http/routes/set-schedule-entries'
import { swapTeamMember } from '@/infra/http/routes/swap-team-member'
import { updateScheduleRequirement } from '@/infra/http/routes/update-schedule-requirement'
import { updateTeamMember } from '@/infra/http/routes/update-team-member'
import cors from 'cors'
import Express, { json, urlencoded } from 'express'

const app = Express()

app.use(cors(), urlencoded({ extended: true, limit: '100mb' }))

app.use(json({ limit: '100mb' }))

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok' })
})

// Chat route
app.post('/chat', chat)

// Team Member routes
app.post('/team-members', createTeamMembers)
app.get('/team-members', listTeamMembers)
app.put('/team-members/:id', updateTeamMember)
app.delete('/team-members/:id', deleteTeamMember)

// Schedule Requirement routes
app.post('/schedule-requirements', createScheduleRequirement)
app.get('/schedule-requirements', listScheduleRequirements)
app.put('/schedule-requirements/:id', updateScheduleRequirement)
app.patch('/schedule-requirements/:id/enable', enableScheduleRequirement)
app.patch('/schedule-requirements/:id/disable', disableScheduleRequirement)
app.delete('/schedule-requirements/:id', deleteScheduleRequirement)

// Schedule Entry routes
app.post('/schedule-entries/auto-fill', autoFillSchedule)
app.get(
  '/schedule-entries/:entryId/swap-candidates/:teamMemberId',
  listSwapCandidates,
)
app.post('/schedule-entries/:entryId/swap', swapTeamMember)
app.post('/schedule-entries/:entryId/auto-fill-gaps', autoFillDayGaps)
app.put('/schedule-entries', setScheduleEntries)
app.get('/schedule-entries', listScheduleEntries)
app.delete('/schedule-entries/:id', deleteScheduleEntry)
app.get('/schedule-overview', getScheduleOverview)

// Error handling (must be after all routes)
app.use(errorHandler)

export default app
