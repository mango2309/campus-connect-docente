import { Outlet } from 'react-router-dom'
import { TopBar } from '@/shared/layout/TopBar'
import { NavTabs } from '@/shared/layout/NavTabs'

export function AppShell() {
  return (
    <div className="ac-portal ac-page-bg">
      <TopBar />
      <NavTabs />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
