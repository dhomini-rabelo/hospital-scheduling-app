import type { UIMessage } from 'ai'
import { useEffect, useRef } from 'react'
import { ChatMessage } from './ChatMessage'
import { ToolApprovalMessage } from './ToolApprovalMessage'

interface ChatMessageListProps {
  messages: UIMessage[]
  onToolApprove: (approvalId: string) => void
  onToolReject: (approvalId: string, reason: string) => void
}

function isToolPart(
  part: UIMessage['parts'][number],
): part is UIMessage['parts'][number] & {
  toolCallId: string
  toolName: string
  state: string
  input: Record<string, unknown>
  output?: unknown
  errorText?: string
  approval?: { id: string; approved?: boolean; reason?: string }
} {
  return part.type.startsWith('tool-') || part.type === 'dynamic-tool'
}

function getToolName(part: UIMessage['parts'][number]): string {
  if (part.type === 'dynamic-tool') {
    return (part as unknown as { toolName: string }).toolName
  }
  return part.type.replace('tool-', '')
}

export function ChatMessageList({
  messages,
  onToolApprove,
  onToolReject,
}: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-tertiary">
            Ask me anything about scheduling...
          </p>
        </div>
      )}
      {messages.map((message) => (
        <div key={message.id} className="flex flex-col gap-2">
          {message.parts.map((part, partIndex) => {
            if (part.type === 'text' && part.text.trim()) {
              return (
                <ChatMessage
                  key={`${message.id}-text-${partIndex}`}
                  role={message.role as 'user' | 'assistant'}
                  content={part.text}
                />
              )
            }

            if (isToolPart(part)) {
              const toolPart = part as unknown as {
                toolCallId: string
                state: string
                input: Record<string, unknown>
                output?: unknown
                errorText?: string
                approval?: {
                  id: string
                  approved?: boolean
                  reason?: string
                }
              }
              return (
                <ToolApprovalMessage
                  key={`${message.id}-tool-${partIndex}`}
                  toolName={getToolName(part)}
                  state={toolPart.state}
                  input={toolPart.input ?? {}}
                  errorText={toolPart.errorText}
                  approval={toolPart.approval}
                  onApprove={onToolApprove}
                  onReject={onToolReject}
                />
              )
            }

            return null
          })}
        </div>
      ))}
    </div>
  )
}
