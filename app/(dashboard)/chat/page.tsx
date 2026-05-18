'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Search, Plus, X, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useChatRooms } from '@/hooks/queries/useChat'
import { useRequests } from '@/hooks/queries/useRequests'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils/cn'
import { formatRelative, getInitials } from '@/lib/utils/format'
import { SERVICES } from '@/lib/mock-data'

// ─── Nouvelle conversation modal ──────────────────────────────────────────────

function NewChatModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { data: requests = [], isLoading } = useRequests()

  const contactable = requests.filter(
    (r) =>
      ['accepted', 'in_progress'].includes(r.status) &&
      (r.technician_id || r.technician),
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] flex flex-col rounded-t-3xl bg-card border-t border-border shadow-2xl sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[420px] sm:rounded-2xl sm:border"
          >
            {/* Handle */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border flex-shrink-0">
              <h3 className="font-bold text-base">Nouvelle conversation</h3>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : contactable.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="font-semibold text-sm mb-1">Aucune demande active</p>
                  <p className="text-xs text-muted-foreground mb-5">
                    Le chat s'ouvre automatiquement une fois qu'un artisan
                    a accepté votre demande.
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
                    Sélectionnez une demande pour démarrer la conversation :
                  </p>
                  {contactable.map((req) => {
                    const techName = req.technician?.name ?? req.technician_name ?? 'Artisan'
                    const techProf = req.technician?.profession
                    const icon =
                      req.service?.icon ??
                      SERVICES.find((s) => s.id === req.service_id)?.icon ??
                      '🔧'

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
  const { user }                    = useAuthStore()
  const { data: rooms = [], isLoading } = useChatRooms()
  const [search, setSearch]         = useState('')
  const [showNew, setShowNew]       = useState(false)

  const filtered = rooms.filter((r) =>
    r.other_participant.name.toLowerCase().includes(search.toLowerCase()) ||
    r.request_title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold">Messages</h1>
            <p className="text-muted-foreground mt-1">Vos conversations en cours.</p>
          </div>
          <Button variant="accent" size="sm" onClick={() => setShowNew(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Rechercher une conversation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Card>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-1">Aucune conversation</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Les conversations s'ouvrent automatiquement lorsqu'un artisan
              accepte votre demande.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button variant="accent" onClick={() => setShowNew(true)}>
                <MessageCircle className="h-4 w-4" />
                Démarrer une conversation
              </Button>
              <Link href="/beneficiaire/nouvelle">
                <Button variant="outline">
                  <Plus className="h-4 w-4" />
                  Nouvelle demande
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-border">
              {filtered.map((room, i) => {
                const other   = room.other_participant
                const lastMsg = room.last_message
                const isMe    = lastMsg?.sender_id === user?.id

                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={`/chat/${room.request_id}`}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar fallback={other.avatar} size="lg" />
                        {other.is_online && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h3 className={cn(
                            'font-semibold truncate',
                            room.unread_count > 0 && 'text-foreground',
                          )}>
                            {other.name}
                          </h3>
                          <span className={cn(
                            'text-xs flex-shrink-0',
                            room.unread_count > 0
                              ? 'text-accent-700 dark:text-accent-300 font-semibold'
                              : 'text-muted-foreground',
                          )}>
                            {lastMsg ? formatRelative(lastMsg.created_at) : ''}
                          </span>
                        </div>

                        {other.profession && (
                          <p className="text-xs text-muted-foreground mb-0.5">{other.profession}</p>
                        )}

                        <div className="flex items-center justify-between gap-2">
                          <p className={cn(
                            'text-sm truncate',
                            room.unread_count > 0
                              ? 'text-foreground font-medium'
                              : 'text-muted-foreground',
                          )}>
                            {lastMsg
                              ? `${isMe ? 'Vous : ' : ''}${lastMsg.content}`
                              : room.request_title}
                          </p>
                          {room.unread_count > 0 && (
                            <Badge variant="accent" className="flex-shrink-0">
                              {room.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      <NewChatModal open={showNew} onClose={() => setShowNew(false)} />
    </>
  )
}
