import { atom } from 'jotai'

export const chatOpenAtom = atom<boolean>(false)
export const chatPendingPromptAtom = atom<string | null>(null)
