'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useChatRooms } from '@/hooks/queries/useChat'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils/cn'
import { formatRelative } from '@/lib/utils/format'

export default function ChatListPage() {
  const { user }                    = useAuthStore()
  const { data: rooms = [], isLoading } = useChatRooms()
  const [search, setSearch]         = useState('')

  const filtered = rooms.filter((r) =>
    r.other_participant.name.toLowerCase().includes(search.toLowerCase()) ||
    r.request_title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Messages</h1>
        <p className="text-muted-foreground mt-1">Vos conversations en cours.</p>
      </div>

      <Card className="p-4">
        <Input
          icon={<Search className="h-4 w-4" />}
          placeholder="Rechercher une conversation…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-1">Aucune conversation</h3>
          <p className="text-sm text-muted-foreground">
            Les conversations apparaissent ici dès qu'une mission est en cours.
          </p>
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
                        <h3 className={cn('font-semibold truncate', room.unread_count > 0 && 'text-foreground')}>
                          {other.name}
                        </h3>
                        <span className={cn(
                          'text-xs flex-shrink-0',
                          room.unread_count > 0 ? 'text-accent-700 dark:text-accent-300 font-semibold' : 'text-muted-foreground'
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
                          room.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                        )}>
                          {lastMsg
                            ? `${isMe ? 'Vous : ' : ''}${lastMsg.content}`
                            : room.request_title}
                        </p>
                        {room.unread_count > 0 && (
                          <Badge variant="accent" className="flex-shrink-0">{room.unread_count}</Badge>
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
  )
}
