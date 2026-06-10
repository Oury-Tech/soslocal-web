'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Bell, Search } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Avatar } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
import { getInitials, formatRelative } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { useNotifications, useMarkRead, useUnreadCount } from '@/hooks/useNotifications'

interface TopbarProps {
  onMenuClick: () => void
  title?: string
}

export function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user } = useAuthStore()
  const [showNotifs, setShowNotifs]   = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const { data: notifs = [] } = useNotifications()
  const markReadM = useMarkRead()
  const quickNotifs = notifs.slice(0, 6)
  // Compteur basé sur les stats backend, avec repli sur la liste locale.
  const statsUnread = useUnreadCount()
  const unreadCount = statsUnread || notifs.filter((n) => !n.read).length

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
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-[10px] font-bold leading-none ring-2 ring-card">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
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
                  {quickNotifs.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[rgb(var(--muted-fg))]">
                      Aucune notification
                    </div>
                  ) : quickNotifs.map((n) => {
                    const inner = (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[rgb(var(--fg))]">{n.title}</div>
                          <div className="text-sm text-[rgb(var(--muted-fg))] truncate">{n.short_message || n.message}</div>
                          <div className="text-xs text-[rgb(var(--muted-fg))] mt-1">{formatRelative(n.created_at)}</div>
                        </div>
                        {!n.read && <div className="h-2 w-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />}
                      </div>
                    )
                    const cls = cn('block p-4 hover:bg-muted transition-colors cursor-pointer', !n.read && 'bg-brand-50/50 dark:bg-brand-900/10')
                    const onClick = () => { if (!n.read) markReadM.mutate(n.id); setShowNotifs(false) }
                    return n.action_url ? (
                      <Link key={n.id} href={n.action_url} onClick={onClick} className={cls}>{inner}</Link>
                    ) : (
                      <div key={n.id} onClick={onClick} className={cls}>{inner}</div>
                    )
                  })}
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
