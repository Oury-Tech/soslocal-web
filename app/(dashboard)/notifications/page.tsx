'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Wrench, MessageCircle, RefreshCw, CreditCard,
  Info, CheckCheck, X, CheckCircle2,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { formatRelative } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

type NotifType = 'mission' | 'message' | 'statut' | 'paiement' | 'systeme'

interface Notif {
  id: string
  type: NotifType
  title: string
  body: string
  read: boolean
  time: string
  href?: string
}

const TYPE_CONFIG: Record<NotifType, { icon: typeof Bell; color: string; bg: string }> = {
  mission:  { icon: Wrench,         color: 'text-brand-600',   bg: 'bg-brand-100 dark:bg-brand-900/40'   },
  message:  { icon: MessageCircle,  color: 'text-purple-600',  bg: 'bg-purple-100 dark:bg-purple-900/40' },
  statut:   { icon: RefreshCw,      color: 'text-amber-600',   bg: 'bg-amber-100 dark:bg-amber-900/40'   },
  paiement: { icon: CreditCard,     color: 'text-green-600',   bg: 'bg-green-100 dark:bg-green-900/40'   },
  systeme:  { icon: Info,           color: 'text-muted-foreground', bg: 'bg-muted'                       },
}

const INITIAL_NOTIFS: Notif[] = [
  { id: '1', type: 'mission',  title: 'Nouvelle mission disponible',  body: 'Panne électrique · Kaloum · 1.2 km',          read: false, time: new Date(Date.now() - 2 * 60_000).toISOString(),      href: '/artisan/missions' },
  { id: '2', type: 'message',  title: 'Message de Mariama Diallo',    body: 'Bonjour, êtes-vous disponible cet après-midi ?', read: false, time: new Date(Date.now() - 15 * 60_000).toISOString(),    href: '/chat/room-1001' },
  { id: '3', type: 'statut',   title: 'Demande confirmée',            body: 'Votre artisan Ibrahima Sow est en route',       read: false, time: new Date(Date.now() - 45 * 60_000).toISOString(),    href: '/beneficiaire/demandes/1001' },
  { id: '4', type: 'paiement', title: 'Paiement reçu',                body: '200 000 GNF crédités via Orange Money',         read: true,  time: new Date(Date.now() - 2 * 3_600_000).toISOString(), href: '/artisan/revenus' },
  { id: '5', type: 'statut',   title: 'Intervention terminée',        body: 'Plomberie · Ratoma — Pensez à laisser un avis',  read: true,  time: new Date(Date.now() - 5 * 3_600_000).toISOString(), href: '/beneficiaire/demandes/1002' },
  { id: '6', type: 'mission',  title: 'Mission acceptée',             body: 'Ibrahima Sow a accepté votre demande',          read: true,  time: new Date(Date.now() - 86_400_000).toISOString(),     href: '/beneficiaire/demandes/1001' },
  { id: '7', type: 'systeme',  title: 'Bienvenue sur SOSLocal !',     body: 'Votre compte a été créé avec succès.',           read: true,  time: new Date(Date.now() - 3 * 86_400_000).toISOString() },
]

export default function NotificationsPage() {
  const [notifs, setNotifs]   = useState<Notif[]>(INITIAL_NOTIFS)
  const [filter, setFilter]   = useState<'all' | 'unread'>('all')

  const unreadCount = notifs.filter((n) => !n.read).length
  const displayed   = filter === 'unread' ? notifs.filter((n) => !n.read) : notifs

  const markRead    = (id: string) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })))
  const remove      = (id: string) => setNotifs((p) => p.filter((n) => n.id !== id))

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
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" />
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
              filter === f.key ? 'bg-brand-700 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <Card className="overflow-hidden">
        {displayed.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayed.map((notif) => {
              const cfg = TYPE_CONFIG[notif.type]
              const Icon = cfg.icon

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
                  {notif.href ? (
                    <Link
                      href={notif.href}
                      className="flex-1 min-w-0"
                      onClick={() => markRead(notif.id)}
                    >
                      <NotifContent notif={notif} />
                    </Link>
                  ) : (
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => markRead(notif.id)}
                    >
                      <NotifContent notif={notif} />
                    </div>
                  )}

                  {/* Supprimer */}
                  <button
                    onClick={() => remove(notif.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </Card>

      {notifs.length > 0 && unreadCount === 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
          <CheckCircle2 className="h-4 w-4 text-accent-600" />
          Toutes les notifications ont été lues.
        </div>
      )}
    </div>
  )
}

function NotifContent({ notif }: { notif: Notif }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-sm', !notif.read && 'font-semibold')}>{notif.title}</p>
        {!notif.read && (
          <span className="h-2 w-2 rounded-full bg-accent-500 flex-shrink-0 mt-1.5" />
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
      <p className="text-xs text-muted-foreground mt-1">{formatRelative(notif.time)}</p>
    </>
  )
}
