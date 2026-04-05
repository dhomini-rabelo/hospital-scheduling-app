import {
  chatOpenAtom,
  chatPendingPromptAtom,
} from '@/layout/states/chat-atoms'
import { useChat } from '@ai-sdk/react'
import { useQueryClient } from '@tanstack/react-query'
import { DefaultChatTransport, getToolName, isToolUIPart } from 'ai'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { ChatPanel } from './ChatPanel'
import { ChatToggleButton } from './ChatToggleButton'
import { invalidateToolQueries } from './utils/invalidate-tool-queries'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useAtom(chatOpenAtom)
  const [pendingPrompt, setPendingPrompt] = useAtom(chatPendingPromptAtom)
  const [chatInput, setChatInput] = useState('')
  const queryClient = useQueryClient()

  const { messages, sendMessage, addToolApprovalResponse, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: 'http://localhost:5000/chat',
    }),
    sendAutomaticallyWhen: ({ messages: msgs }) => {
      const lastAssistant = msgs.findLast((m) => m.role === 'assistant')
      if (!lastAssistant) return false
      return lastAssistant.parts.some(
        (part) => 'state' in part && part.state === 'approval-responded',
      )
    },
    onFinish: ({ message }) => {
      for (const part of message.parts) {
        if (isToolUIPart(part) && part.state === 'output-available') {
          invalidateToolQueries(queryClient, getToolName(part))
        }
      }
    },
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  function handleInputChange(value: string) {
    setChatInput(value)
  }

  function handleSubmit() {
    if (!chatInput.trim() || isLoading) return
    const messageText = chatInput
    setChatInput('')
    sendMessage({ text: messageText })
  }

  function handleClose() {
    setIsOpen(false)
  }

  function handleToolApprove(approvalId: string) {
    addToolApprovalResponse({ id: approvalId, approved: true })
  }

  function handleToolReject(approvalId: string, reason: string) {
    addToolApprovalResponse({ id: approvalId, approved: false, reason })
  }

  function getInputValue(): string {
    if (pendingPrompt !== null) {
      const prompt = pendingPrompt
      setPendingPrompt(null)
      setChatInput(prompt)
      return prompt
    }
    return chatInput
  }

  const displayInput = getInputValue()

  return (
    <>
      <ChatToggleButton />
      {isOpen && (
        <ChatPanel
          messages={messages}
          input={displayInput}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          onClose={handleClose}
          onToolApprove={handleToolApprove}
          onToolReject={handleToolReject}
        />
      )}
    </>
  )
}
