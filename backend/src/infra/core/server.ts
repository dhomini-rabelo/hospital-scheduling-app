import app from '@/infra/core/app'
import { env } from '@/infra/services/env'

async function bootstrap() {
  await app.listen({
    port: env.API_PORT,
  })

  console.log(`Server is running on port ${env.API_PORT}`)
}

bootstrap()
