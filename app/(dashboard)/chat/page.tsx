'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageCircle, Search, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge, Avatar } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

const CONVERSATIONS = [
  { id: 1, name: 'Mohamed Keita',    profession: 'Plombier',    lastMessage: 'Je suis sur place, j\'arrive dans 2 min', time: 'À l\'instant', unread: 2,   online: true,  avatar: 'MK' },
  { id: 2, name: 'Fatoumata Bah',    profession: 'Électricienne', lastMessage: 'Parfait, merci pour la rapidité !',   time: 'Il y a 1h',   unread: 0,   online: true,  avatar: 'FB' },
  { id: 3, name: 'Ibrahima Camara',  profession: 'Mécanicien',  lastMessage: 'Le devis vous convient ?',              time: 'Hier',        unread: 0,   online: false, avatar: 'IC' },
  { id: 4, name: 'Sékou Sylla',      profession: 'Menuisier',   lastMessage: 'Photos envoyées',                        time: '2 jours',     unread: 0,   online: false, avatar: 'SS' },
]

export default function ChatListPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Messages</h1>
        <p className="text-muted-foreground mt-1">Vos conversations avec les artisans.</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input icon={<Search className="h-4 w-4" />} placeholder="Rechercher une conversation…" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="divide-y divide-border">
          {CONVERSATIONS.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/chat/${conv.id}`}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  <Avatar fallback={conv.avatar} size="lg" />
                  {conv.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className={cn('font-semibold truncate', conv.unread > 0 && 'text-foreground')}>{conv.name}</h3>
                    <span className={cn('text-xs flex-shrink-0', conv.unread > 0 ? 'text-accent-700 dark:text-accent-300 font-semibold' : 'text-muted-foreground')}>
                      {conv.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{conv.profession}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('text-sm truncate', conv.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <Badge variant="accent" className="flex-shrink-0">{conv.unread}</Badge>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}
