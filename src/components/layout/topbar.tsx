'use client'

import { useState } from 'react'
import Link from 'next/link'
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

const QUICK_NOTIFS = [
  { title: 'Mission acceptée',  message: 'Mohamed Keita arrive dans ~8 min', time: 'À l\'instant', unread: true  },
  { title: 'Évaluation reçue', message: 'Vous avez reçu une note de 5 étoiles',   time: 'Il y a 2h',  unread: true  },
  { title: 'Paiement validé',  message: '175 000 GNF reçus',                       time: 'Hier',       unread: false },
]

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user } = useAuthStore()
  const [showNotifs, setShowNotifs]   = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const unreadCount = QUICK_NOTIFS.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-30 h-16 lg:h-20 glass border-b border-border/50 flex items-center px-4 lg:px-8 gap-4">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden h-10 w-10 inline-flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {title && (
        <h1 className="hidden sm:block text-lg lg:text-xl font-semibold truncate">{title}</h1>
      )}

      {/* Right group */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">

        {/* Search bar — desktop */}
        <div className="hidden md:flex items-center gap-2 h-10 px-3 rounded-xl bg-muted border border-border text-sm text-muted-foreground w-64 focus-within:ring-2 focus-within:ring-ring transition-shadow">
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
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false) }}
            className="relative h-10 w-10 inline-flex items-center justify-center rounded-xl border border-border bg-card hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-card" />
            )}
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card shadow-soft-lg overflow-hidden z-50 animate-slide-down">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold text-white bg-accent-600 px-2 py-0.5 rounded-full">
                      {unreadCount} nouvelles
                    </span>
                  )}
                </div>
                <div className="divide-y divide-border max-h-96 overflow-y-auto">
                  {QUICK_NOTIFS.map((n, i) => (
                    <div key={i} className={cn('p-4 hover:bg-muted transition-colors cursor-pointer', n.unread && 'bg-accent-50/40 dark:bg-accent-900/10')}>
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
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="flex items-center justify-center w-full p-3 text-sm font-medium text-brand-700 dark:text-brand-300 hover:bg-muted transition-colors border-t border-border"
                >
                  Voir toutes les notifications
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false) }}
            className="flex items-center gap-2 h-10 pl-1 pr-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
          >
            <Avatar fallback={getInitials(user?.name)} size="sm" />
            <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px]">
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-border bg-card shadow-soft-lg overflow-hidden z-50 animate-slide-down">
                {/* User info header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Avatar fallback={getInitials(user?.name)} size="md" />
                  <div className="min-w-0">
                    <div className="font-semibold truncate text-sm">{user?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/profile"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    Mon profil
                  </Link>
                  <Link
                    href="/parametres"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    Paramètres
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
                  >
                    Notifications
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
