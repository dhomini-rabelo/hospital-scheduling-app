import cors from 'cors'
import Express, { json, urlencoded } from 'express'

const app = Express()

app.use(cors(), urlencoded({ extended: true, limit: '100mb' }))

app.use(json({ limit: '100mb' }))

app.get('/health', (req, res) => {
  return res.status(200).json({ status: 'ok' })
})

export default app
