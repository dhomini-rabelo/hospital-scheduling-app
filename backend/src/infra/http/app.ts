import { errorHandler } from '@/infra/http/error-handler'
import { createScheduleRequirement } from '@/infra/http/routes/create-schedule-requirement'
import { createTeamMembers } from '@/infra/http/routes/create-team-members'
import { deleteScheduleRequirement } from '@/infra/http/routes/delete-schedule-requirement'
import { deleteTeamMember } from '@/infra/http/routes/delete-team-member'
import { disableScheduleRequirement } from '@/infra/http/routes/disable-schedule-requirement'
import { enableScheduleRequirement } from '@/infra/http/routes/enable-schedule-requirement'
import { listScheduleRequirements } from '@/infra/http/routes/list-schedule-requirements'
import { listTeamMembers } from '@/infra/http/routes/list-team-members'
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

// Error handling (must be after all routes)
app.use(errorHandler)

export default app
