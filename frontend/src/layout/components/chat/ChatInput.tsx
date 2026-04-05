import { Send } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ChatInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 96) + 'px'
    }
  }, [input])

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (input.trim() && !isLoading) {
        onSubmit()
      }
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    onInputChange(event.target.value)
  }

  function handleSubmit() {
    if (input.trim() && !isLoading) {
      onSubmit()
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border px-4 py-3">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
        className="flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-primary-300 focus:ring-2 focus:ring-primary-100"
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:opacity-40 disabled:hover:bg-primary-500"
      >
        <Send size={16} />
      </button>
    </div>
  )
}
