import type { UIMessage } from 'ai'
import { AlertTriangle, Bot, X } from 'lucide-react'
import { ChatInput } from './ChatInput'
import { ChatMessageList } from './ChatMessageList'

interface ChatPanelProps {
  messages: UIMessage[]
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  error: Error | undefined
  onClose: () => void
  onToolApprove: (approvalId: string) => void
  onToolReject: (approvalId: string, reason: string) => void
}

export function ChatPanel({
  messages,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  error,
  onClose,
  onToolApprove,
  onToolReject,
}: ChatPanelProps) {
  return (
    <div className="animate-[fade-in-up_0.2s_ease-out] fixed right-6 bottom-20 z-[var(--z-chat)] flex h-[600px] max-h-[80vh] w-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-100">
            <Bot size={14} className="text-primary-600" />
          </div>
          <span className="text-sm font-semibold text-text-primary">
            AI Assistant
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-neutral-100 hover:text-text-primary"
        >
          <X size={16} />
        </button>
      </div>

      <ChatMessageList
        messages={messages}
        onToolApprove={onToolApprove}
        onToolReject={onToolReject}
      />

      {error && (
        <div className="flex items-center gap-2 border-t border-error-200 bg-error-50 px-4 py-2">
          <AlertTriangle size={14} className="shrink-0 text-error-600" />
          <p className="text-xs text-error-700">
            Something went wrong. Please try again.
          </p>
        </div>
      )}

      <ChatInput
        input={input}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </div>
  )
}
