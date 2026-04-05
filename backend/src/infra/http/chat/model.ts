import { env } from '@/infra/services/env'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

export function createChatModel() {
  const google = createGoogleGenerativeAI({
    apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
  })
  return google('gemini-2.5-flash')
}
