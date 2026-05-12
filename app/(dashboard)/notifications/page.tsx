'use client'

import { useState } from 'react'
import { formatRelative } from '@/lib/utils/format'

type NotifType =
  | 'mission'
  | 'message'
  | 'statut'
  | 'paiement'
  | 'systeme'

interface Notif {
  id: string
  type: NotifType
  title: string
  body: string
  read: boolean
  time: string
  href?: string
}

const MOCK_NOTIFS: Notif[] = [
  {
    id: '1',
    type: 'mission',
    title: 'Nouvelle mission disponible',
    body: 'Panne électrique · Kaloum · 1.2 km de vous',
    read: false,
    time: new Date(Date.now() - 2 * 60000).toISOString(),
    href: '/artisan/missions',
  },
  {
    id: '2',
    type: 'message',
    title: 'Message de Mariama Diallo',
    body: 'Bonjour, êtes-vous disponible cet après-midi ?',
    read: false,
    time: new Date(Date.now() - 15 * 60000).toISOString(),
    href: '/chat/req-123',
  },
  {
    id: '3',
    type: 'statut',
    title: 'Demande confirmée',
    body: 'Votre artisan Ibrahima Sow est en route',
    read: false,
    time: new Date(Date.now() - 45 * 60000).toISOString(),
    href: '/beneficiaire/demandes/req-1',
  },
  {
    id: '4',
    type: 'paiement',
    title: 'Paiement reçu',
    body: '200 000 GNF crédités via Orange Money',
    read: true,
    time: new Date(Date.now() - 2 * 3600000).toISOString(),
    href: '/artisan/revenus',
  },
  {
    id: '5',
    type: 'statut',
    title: 'Intervention terminée',
    body: 'Plomberie · Ratoma — Pensez à laisser un avis',
    read: true,
    time: new Date(Date.now() - 5 * 3600000).toISOString(),
    href: '/beneficiaire/demandes/req-2',
  },
  {
    id: '6',
    type: 'mission',
    title: 'Mission acceptée',
    body: "Ibrahima Sow a accepté votre demande d'intervention",
    read: true,
    time: new Date(Date.now() - 86400000).toISOString(),
    href: '/beneficiaire/demandes/req-1',
  },
  {
    id: '7',
    type: 'systeme',
    title: 'Bienvenue sur SOSLocal !',
    body: 'Votre compte a été créé avec succès. Explorez la plateforme.',
    read: true,
    time: new Date(Date.now() - 3 * 86400000).toISOString(),
    href: '/',
  },
]

const TYPE_STYLE: Record<
  NotifType,
  { icon: string; bg: string; text: string }
> = {
  mission: { icon: 'tool', bg: 'bg-brand-50', text: 'text-brand-600' },
  message: { icon: 'message-2', bg: 'bg-purple-50', text: 'text-purple-600' },
  statut: { icon: 'refresh', bg: 'bg-amber-50', text: 'text-amber-600' },
  paiement: { icon: 'coin', bg: 'bg-green-50', text: 'text-green-600' },
  systeme: { icon: 'info-circle', bg: 'bg-gray-100', text: 'text-gray-500' },
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const unreadCount = notifs.filter((n) => !n.read).length

  const displayed =
    filter === 'unread'
      ? notifs.filter((n) => !n.read)
      : notifs

  const markAllRead = () =>
    setNotifs((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    )

  const markRead = (id: string) =>
    setNotifs((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    )

  const deleteNotif = (id: string) =>
    setNotifs((prev) =>
      prev.filter((n) => n.id !== id)
    )

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="text-sm text-gray-400 mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} non lue${
                  unreadCount > 1 ? 's' : ''
                }`
              : 'Tout est lu'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      {/* FILTER */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 w-fit">
        {[
          { key: 'all', label: 'Toutes' },
          {
            key: 'unread',
            label: `Non lues${
              unreadCount > 0 ? ` (${unreadCount})` : ''
            }`,
          },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f.key
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Aucune notification
          </div>
        ) : (
          displayed.map((notif, idx) => {
            const s = TYPE_STYLE[notif.type]

            return (
              <div
                key={notif.id}
                className={`flex gap-4 p-4 hover:bg-gray-50 cursor-pointer ${
                  !notif.read ? 'bg-brand-50/40' : ''
                }`}
                onClick={() => markRead(notif.id)}
              >

                {/* ICON */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}
                >
                  <i
                    className={`ti ti-${s.icon} ${s.text}`}
                  />
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {notif.title}
                  </p>

                  <p className="text-xs text-gray-400">
                    {notif.body}
                  </p>

                  <p className="text-xs text-gray-300 mt-1">
                    {formatRelative(notif.time)}
                  </p>
                </div>

                {/* DELETE */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotif(notif.id)
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}