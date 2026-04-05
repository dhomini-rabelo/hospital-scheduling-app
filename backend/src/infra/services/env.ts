import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else if (process.env.NODE_ENV === 'development') {
  config({ path: '.env.development' })
} else {
  config()
}

const envSchema = z.object({
  API_PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
})

const schema = envSchema.safeParse({
  ...process.env,
})

if (!schema.success) {
  console.error('Errors: ', JSON.stringify(schema.error.format(), null, 2))
  throw new Error('Invalid environment variables!')
}

export const env = schema.data

export type Env = z.infer<typeof envSchema>
