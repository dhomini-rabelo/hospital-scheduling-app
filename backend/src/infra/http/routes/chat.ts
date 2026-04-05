import { createChatModel } from '@/infra/http/chat/model'
import { buildSystemPrompt } from '@/infra/http/chat/system-prompt'
import { allTools } from '@/infra/http/chat/tools'
import { convertToModelMessages, streamText } from 'ai'
import { Request, Response } from 'express'
import { z } from 'zod'

const chatSchema = z.object({
  messages: z.array(z.any()),
})

export async function chat(req: Request, res: Response) {
  const payload = chatSchema.parse(req.body)
  const modelMessages = await convertToModelMessages(payload.messages, {
    tools: allTools,
  })

  const result = streamText({
    model: createChatModel(),
    system: buildSystemPrompt(),
    messages: modelMessages,
    tools: allTools,
  })

  result.pipeUIMessageStreamToResponse(res)
}
