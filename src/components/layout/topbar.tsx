'use client'

import { useState } from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Avatar } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
import { getInitials } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface TopbarProps {
  onMenuClick: () => void
  title?: string
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user } = useAuthStore()
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <header className="sticky top-0 z-30 h-16 lg:h-20 glass border-b border-border/50 flex items-center px-4 lg:px-8 gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-muted"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {title && (
        <h1 className="hidden sm:block text-lg lg:text-xl font-semibold truncate">{title}</h1>
      )}

      {/* Search bar */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-2 h-10 px-3 rounded-lg bg-muted border border-border text-sm text-muted-foreground w-64">
          <Search className="h-4 w-4 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher…"
            className="flex-1 bg-transparent outline-none placeholder-muted-foreground"
          />
          <kbd className="hidden lg:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border">⌘K</kbd>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-card" />
          </button>
          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-soft-lg overflow-hidden z-50 animate-slide-down">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="divide-y divide-border max-h-96 overflow-y-auto">
                  {[
                    { title: 'Mission acceptée', message: 'Mohamed Keita arrive dans ~8 min', time: 'À l\'instant', unread: true },
                    { title: 'Évaluation reçue', message: 'Vous avez reçu une note de 5 étoiles', time: 'Il y a 2h', unread: true },
                    { title: 'Paiement validé', message: '175 000 GNF reçus', time: 'Hier' },
                  ].map((n, i) => (
                    <div key={i} className={cn('p-4 hover:bg-muted transition-colors cursor-pointer', n.unread && 'bg-accent-50/30 dark:bg-accent-900/10')}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{n.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{n.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
                        </div>
                        {n.unread && <div className="h-2 w-2 rounded-full bg-accent-500 mt-1.5 flex-shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full p-3 text-sm text-center text-brand-700 dark:text-brand-300 hover:bg-muted transition-colors border-t border-border">
                  Voir tout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Theme */}
        <ThemeToggle />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 h-10 pl-1 pr-3 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <Avatar fallback={getInitials(user?.name)} size="sm" />
            <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
              {user?.name?.split(' ')[0]}
            </span>
          </button>
          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-soft-lg overflow-hidden z-50 animate-slide-down">
                <div className="p-4 border-b border-border">
                  <div className="font-semibold truncate">{user?.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                </div>
                <div className="p-1">
                  <a href="/profile" className="block px-3 py-2 text-sm hover:bg-muted rounded-md">Profil</a>
                  <a href="/profile" className="block px-3 py-2 text-sm hover:bg-muted rounded-md">Paramètres</a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
