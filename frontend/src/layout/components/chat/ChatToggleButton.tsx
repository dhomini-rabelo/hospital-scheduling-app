import { chatOpenAtom } from '@/layout/states/chat-atoms'
import { useAtom } from 'jotai'
import { MessageCircle, X } from 'lucide-react'

export function ChatToggleButton() {
  const [isOpen, setIsOpen] = useAtom(chatOpenAtom)

  function handleToggle() {
    setIsOpen((previous) => !previous)
  }

  return (
    <button
      onClick={handleToggle}
      className="fixed right-6 bottom-6 z-[var(--z-chat)] flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all duration-(--transition-base) hover:bg-primary-600 hover:shadow-xl active:scale-95"
    >
      {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
    </button>
  )
}
