import { ChatWidget } from '@/layout/components/chat/ChatWidget'
import { Sidebar } from '@/layout/components/Sidebar'
import { Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-10 py-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
      <ChatWidget />
    </div>
  )
}
