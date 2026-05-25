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
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {title && (
        <h1 className="hidden sm:block text-lg font-semibold truncate text-[rgb(var(--fg))]">{title}</h1>
      )}

      {/* Right group */}
      <div className="ml-auto flex items-center gap-2">

        {/* Search bar — desktop */}
        <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-xl bg-muted border border-border text-sm text-[rgb(var(--muted-fg))] w-56 focus-within:ring-2 focus-within:ring-ring transition-shadow">
          <Search className="h-4 w-4 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher…"
            className="flex-1 bg-transparent outline-none placeholder:text-[rgb(var(--muted-fg))] text-[rgb(var(--fg))]"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false) }}
            className="relative h-9 w-9 inline-flex items-center justify-center rounded-xl border border-border bg-card hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-card" />
            )}
          </button>

          {showNotifs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-card shadow-soft-lg overflow-hidden z-50 animate-slide-down">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-[rgb(var(--fg))]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold text-white bg-brand-500 px-2 py-0.5 rounded-full">
                      {unreadCount} nouvelles
                    </span>
                  )}
                </div>
                <div className="divide-y divide-border max-h-96 overflow-y-auto">
                  {QUICK_NOTIFS.map((n, i) => (
                    <div key={i} className={cn('p-4 hover:bg-muted transition-colors cursor-pointer', n.unread && 'bg-brand-50/50 dark:bg-brand-900/10')}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[rgb(var(--fg))]">{n.title}</div>
                          <div className="text-sm text-[rgb(var(--muted-fg))] truncate">{n.message}</div>
                          <div className="text-xs text-[rgb(var(--muted-fg))] mt-1">{n.time}</div>
                        </div>
                        {n.unread && <div className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="flex items-center justify-center w-full p-3 text-sm font-medium text-brand-600 dark:text-brand-300 hover:bg-muted transition-colors border-t border-border"
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
            className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
          >
            <Avatar fallback={getInitials(user?.name)} size="sm" />
            <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px] text-[rgb(var(--fg))]">
              {user?.name?.split(' ')[0]}
            </span>
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card shadow-soft-lg overflow-hidden z-50 animate-slide-down">
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Avatar fallback={getInitials(user?.name)} size="md" />
                  <div className="min-w-0">
                    <div className="font-semibold truncate text-sm text-[rgb(var(--fg))]">{user?.name}</div>
                    <div className="text-xs text-[rgb(var(--muted-fg))] truncate">{user?.email}</div>
                  </div>
                </div>
                <div className="p-1.5">
                  {[
                    { href: '/profile', label: 'Mon profil' },
                    { href: '/parametres', label: 'Paramètres' },
                    { href: '/notifications', label: 'Notifications' },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setShowProfile(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-[rgb(var(--fg))]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
