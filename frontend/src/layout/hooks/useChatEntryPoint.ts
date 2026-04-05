import {
  chatOpenAtom,
  chatPendingPromptAtom,
} from '@/layout/states/chat-atoms'
import { useSetAtom } from 'jotai'

export function useChatEntryPoint() {
  const setIsOpen = useSetAtom(chatOpenAtom)
  const setPendingPrompt = useSetAtom(chatPendingPromptAtom)

  function openChatWithPrompt(prompt: string) {
    setIsOpen(true)
    setPendingPrompt(prompt)
  }

  return { openChatWithPrompt }
}
