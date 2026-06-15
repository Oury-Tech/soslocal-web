'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Wrench, MessageCircle, RefreshCw, CreditCard,
  Info, CheckCheck, X, CheckCircle2, Star, AlertTriangle, Gift, Loader2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { formatRelative } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import {
  useNotifications, useMarkRead, useMarkAllRead, useDeleteNotification,
  type AppNotification,
} from '@/hooks/useNotifications'
import { resolveNotifHref } from '@/lib/notifications/href'

// Config visuelle par type backend (info|success|warning|error|request|payment|review|chat|system|promotion)
const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  request:   { icon: Wrench,        color: 'text-brand-600',        bg: 'bg-brand-100 dark:bg-brand-900/40'   },
  chat:      { icon: MessageCircle, color: 'text-purple-600',       bg: 'bg-purple-100 dark:bg-purple-900/40' },
  message:   { icon: MessageCircle, color: 'text-purple-600',       bg: 'bg-purple-100 dark:bg-purple-900/40' },
  payment:   { icon: CreditCard,    color: 'text-green-600',        bg: 'bg-green-100 dark:bg-green-900/40'   },
  review:    { icon: Star,          color: 'text-amber-600',        bg: 'bg-amber-100 dark:bg-amber-900/40'   },
  success:   { icon: CheckCircle2,  color: 'text-green-600',        bg: 'bg-green-100 dark:bg-green-900/40'   },
  warning:   { icon: AlertTriangle, color: 'text-amber-600',        bg: 'bg-amber-100 dark:bg-amber-900/40'   },
  error:     { icon: AlertTriangle, color: 'text-red-600',          bg: 'bg-red-100 dark:bg-red-900/40'       },
  promotion: { icon: Gift,          color: 'text-pink-600',         bg: 'bg-pink-100 dark:bg-pink-900/40'     },
  system:    { icon: Info,          color: 'text-muted-foreground', bg: 'bg-muted'                            },
  info:      { icon: Info,          color: 'text-muted-foreground', bg: 'bg-muted'                            },
}

function cfgFor(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.info
}

export default function NotificationsPage() {
  const { data: notifs = [], isLoading } = useNotifications()
  const markReadM = useMarkRead()
  const markAllM = useMarkAllRead()
  const deleteM = useDeleteNotification()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifs.filter((n) => !n.read).length
  const displayed = filter === 'unread' ? notifs.filter((n) => !n.read) : notifs

  const markRead = (n: AppNotification) => { if (!n.read) markReadM.mutate(n.id) }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllM.mutate()} disabled={markAllM.isPending}>
            {markAllM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            Tout marquer lu
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2">
        {([
          { key: 'all',    label: 'Toutes' },
          { key: 'unread', label: unreadCount > 0 ? `Non lues (${unreadCount})` : 'Non lues' },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              filter === f.key ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayed.map((notif) => {
              const cfg = cfgFor(notif.type)
              const Icon = cfg.icon
              const href = resolveNotifHref(notif)

              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    'flex gap-4 p-4 border-b border-border last:border-0 transition-colors',
                    !notif.read && 'bg-brand-50/50 dark:bg-brand-900/10'
                  )}
                >
                  {/* Icône */}
                  <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
                    <Icon className={cn('h-5 w-5', cfg.color)} />
                  </div>

                  {/* Contenu */}
                  {href ? (
                    <Link
                      href={href}
                      className="flex-1 min-w-0"
                      onClick={() => markRead(notif)}
                    >
                      <NotifContent notif={notif} />
                    </Link>
                  ) : (
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => markRead(notif)}
                    >
                      <NotifContent notif={notif} />
                    </div>
                  )}

                  {/* Supprimer */}
                  <button
                    onClick={() => deleteM.mutate(notif.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 p-1"
                    aria-label="Supprimer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </Card>

      {!isLoading && notifs.length > 0 && unreadCount === 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
          <CheckCircle2 className="h-4 w-4 text-brand-500" />
          Toutes les notifications ont été lues.
        </div>
      )}
    </div>
  )
}

function NotifContent({ notif }: { notif: AppNotification }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-sm', !notif.read && 'font-semibold')}>{notif.title}</p>
        {!notif.read && (
          <span className="h-2 w-2 rounded-full bg-accent-500 flex-shrink-0 mt-1.5" />
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.short_message || notif.message}</p>
      <p className="text-xs text-muted-foreground mt-1">{formatRelative(notif.created_at)}</p>
    </>
  )
}
