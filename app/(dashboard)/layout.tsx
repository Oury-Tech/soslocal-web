'use client'

import { useState } from 'react'
import { Sidebar, BottomNav } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { AuthGuard } from '@/components/layout/auth-guard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar onMenuClick={() => setMobileOpen(true)} />
          {/* pb-20 on mobile to clear the fixed bottom nav */}
          <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{children}</main>
        </div>
        <BottomNav />
      </div>
    </AuthGuard>
  )
}
