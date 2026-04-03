import cors from 'cors'
import Express, { json, urlencoded } from 'express'

import { errorHandler } from '@/infra/http/error-handler'
import { createTeamMember } from '@/infra/http/routes/create-team-member'
import { deleteTeamMember } from '@/infra/http/routes/delete-team-member'
import { listTeamMembers } from '@/infra/http/routes/list-team-members'
import { updateTeamMember } from '@/infra/http/routes/update-team-member'

const app = Express()

app.use(cors(), urlencoded({ extended: true, limit: '100mb' }))

app.use(json({ limit: '100mb' }))

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok' })
})

// Team Member routes
app.post('/team-members', createTeamMember)
app.get('/team-members', listTeamMembers)
app.put('/team-members/:id', updateTeamMember)
app.delete('/team-members/:id', deleteTeamMember)

// Error handling (must be after all routes)
app.use(errorHandler)

export default app
