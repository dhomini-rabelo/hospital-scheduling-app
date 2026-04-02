import { env } from '../services/env'
import app from './app'

async function bootstrap() {
  await app.listen({
    port: env.API_PORT,
  })

  console.log(`Server is running on port ${env.API_PORT}`)
}

bootstrap()
