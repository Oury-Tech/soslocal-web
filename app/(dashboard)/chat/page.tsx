'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Search, Plus, X, ArrowRight, Wrench, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, Spinner } from '@/components/ui/badge'
import { useChatRooms } from '@/hooks/queries/useChat'
import { useRequests } from '@/hooks/queries/useRequests'
import { useAllTechnicians } from '@/hooks/queries/useTechnicians'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils/cn'
import { formatRelative, getInitials } from '@/lib/utils/format'
import { SERVICES } from '@/lib/mock-data'

// ─── Modal nouvelle conversation ──────────────────────────────────────────────

function NewChatModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<'requests' | 'technicians'>('requests')
  const { data: requests = [], isLoading: reqLoading } = useRequests()
  const { data: technicians = [], isLoading: techLoading } = useAllTechnicians()

  const contactableRequests = requests.filter(
    (r) => ['accepted', 'in_progress'].includes(r.status) && (r.technician_id || r.technician),
  )

  const availableTechs = technicians.filter((t) => t.is_online || (t as any).is_available)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] flex flex-col rounded-t-3xl bg-card border-t border-border shadow-2xl sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[440px] sm:rounded-2xl sm:border"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
              <h3 className="font-bold text-base">Nouvelle conversation</h3>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Onglets */}
            <div className="flex gap-1 px-4 pt-3 pb-2 flex-shrink-0">
              {([
                { key: 'requests', label: 'Mes demandes', icon: Wrench },
                { key: 'technicians', label: 'Artisans disponibles', icon: Users },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-colors',
                    tab === t.key
                      ? 'bg-brand-500 text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Contenu */}
            <div className="flex-1 overflow-y-auto p-4">
              {tab === 'requests' && (
                reqLoading ? (
                  <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
                ) : contactableRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">💬</div>
                    <p className="font-semibold text-sm mb-1">Aucune demande active</p>
                    <p className="text-xs text-muted-foreground mb-5">
                      Le chat s'ouvre automatiquement une fois qu'un artisan a accepté votre demande.
                    </p>
                    <Link href="/beneficiaire/nouvelle" onClick={onClose}>
                      <Button variant="accent" size="sm">
                        <Plus className="h-4 w-4" />
                        Créer une demande
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-3">
                      Sélectionnez une demande pour discuter avec l'artisan assigné :
                    </p>
                    {contactableRequests.map((req) => {
                      const techName = req.technician?.name ?? req.technician_name ?? 'Artisan'
                      const techProf = req.technician?.profession
                      const icon = req.service?.icon ?? SERVICES.find((s) => s.id === req.service_id)?.icon ?? '🔧'
                      return (
                        <Link
                          key={req.id}
                          href={`/chat/${req.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/70 transition-colors border border-border"
                        >
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-xl flex-shrink-0">
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{req.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {techName}{techProf ? ` · ${techProf}` : ''}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </Link>
                      )
                    })}
                  </div>
                )
              )}

              {tab === 'technicians' && (
                techLoading ? (
                  <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
                ) : availableTechs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🔧</div>
                    <p className="font-semibold text-sm mb-1">Aucun artisan disponible</p>
                    <p className="text-xs text-muted-foreground">
                      Tous les artisans sont hors ligne pour le moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-3">
                      {availableTechs.length} artisan{availableTechs.length > 1 ? 's' : ''} en ligne — cliquez pour démarrer une conversation :
                    </p>
                    {availableTechs.map((tech) => {
                      const serviceIcons = (tech as any).services
                        ?.slice(0, 2)
                        .map((s: any) => s.icon)
                        .join(' ') ?? '🔧'
                      return (
                        <Link
                          key={tech.id}
                          href={`/chat/tech-${tech.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/70 transition-colors border border-border"
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar fallback={getInitials(tech.name)} size="md" />
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm truncate">{tech.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {(tech as any).profession ?? 'Artisan'} · {serviceIcons}
                            </div>
                            {(tech as any).rating && (
                              <div className="text-xs text-amber-500 font-medium">
                                ★ {(tech as any).rating} · {(tech as any).total_reviews ?? 0} avis
                              </div>
                            )}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </Link>
                      )
                    })}
                  </div>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ChatListPage() {
  const { user } = useAuthStore()
  const { data: rooms = [], isLoading } = useChatRooms()
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)

  const filtered = rooms.filter(
    (r) =>
      r.other_participant.name.toLowerCase().includes(search.toLowerCase()) ||
      r.request_title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-background">

        {/* Header */}
        <div className="flex-shrink-0 px-4 pt-5 pb-3 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-display text-2xl font-extrabold">Messages</h1>
            <button
              onClick={() => setShowNew(true)}
              className="h-9 w-9 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors shadow-sm"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="w-full h-10 pl-9 pr-4 rounded-full bg-muted/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">
                {search ? 'Aucun résultat' : 'Aucune conversation'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                {search
                  ? 'Essayez un autre nom ou une autre mission.'
                  : 'Démarrez une conversation avec un artisan disponible.'}
              </p>
              {!search && (
                <Button variant="accent" onClick={() => setShowNew(true)}>
                  <Plus className="h-4 w-4" />
                  Nouvelle conversation
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((room, i) => {
                const other = room.other_participant
                const lastMsg = room.last_message
                const isMe = lastMsg?.sender_id === user?.id
                const hasUnread = room.unread_count > 0

                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={`/chat/${room.request_id}`}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors',
                        hasUnread && 'bg-brand-50/40 dark:bg-brand-950/30',
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar fallback={getInitials(other.name)} size="lg" />
                        {other.is_online && (
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-0.5">
                          <span className={cn('font-semibold truncate text-sm', hasUnread && 'text-foreground')}>
                            {other.name}
                          </span>
                          <span className={cn(
                            'text-[11px] flex-shrink-0',
                            hasUnread ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-muted-foreground',
                          )}>
                            {lastMsg ? formatRelative(lastMsg.created_at) : ''}
                          </span>
                        </div>
                        {other.profession && (
                          <p className="text-xs text-muted-foreground truncate mb-0.5">{other.profession}</p>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn(
                            'text-sm truncate',
                            hasUnread ? 'text-foreground font-medium' : 'text-muted-foreground',
                          )}>
                            {lastMsg
                              ? `${isMe ? 'Vous : ' : ''}${lastMsg.content}`
                              : room.request_title}
                          </p>
                          {hasUnread && (
                            <span className="flex-shrink-0 h-5 min-w-5 px-1.5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {room.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <NewChatModal open={showNew} onClose={() => setShowNew(false)} />
    </>
  )
}
