'use client'

import { use, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Send, Paperclip, Phone, Video,
  MoreVertical, Image as ImageIcon, MapPin, CheckCheck,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useChatRooms, useChatMessages, useSendMessage } from '@/hooks/queries/useChat'
import { useAuthStore } from '@/stores/auth.store'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils/cn'
import { formatTime } from '@/lib/utils/format'

interface PageProps {
  params: Promise<{ roomId: string }>
}

export default function ChatRoomPage({ params }: PageProps) {
  const { roomId }    = use(params)
  const { user }      = useAuthStore()
  const qc            = useQueryClient()
  const scrollRef     = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: rooms = [] }                              = useChatRooms()
  const { data: messages = [], isLoading }                = useChatMessages(roomId)
  const sendMutation                                       = useSendMessage(roomId)

  const room  = rooms.find((r) => r.id === roomId)
  const other = room?.other_participant

  // WebSocket — écoute les nouveaux messages en temps réel
  useWebSocket({
    url: `${process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws'}/chat/${roomId}`,
    onMessage: (msg) => {
      if (msg.type === 'chat_message' && (msg as any).room_id === roomId) {
        qc.invalidateQueries({ queryKey: ['chat', 'messages', roomId] })
        qc.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      }
      if (msg.type === 'typing' && (msg as any).room_id === roomId) {
        const isOther = (msg as any).user_id !== user?.id
        if (isOther) {
          setIsTyping(true)
          if (typingTimer.current) clearTimeout(typingTimer.current)
          typingTimer.current = setTimeout(() => setIsTyping(false), 3000)
        }
      }
    },
  })

  // Auto-scroll vers le bas à chaque nouveau message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  async function handleSend() {
    const text = input.trim()
    if (!text || !user) return
    setInput('')
    try {
      await sendMutation.mutateAsync({ senderId: user.id, content: text })
    } catch {
      setInput(text)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -m-4 sm:-m-6 lg:-m-8">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/chat" className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Link>

            {other ? (
              <>
                <div className="relative">
                  <Avatar fallback={other.avatar} size="md" />
                  {other.is_online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{other.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={cn('flex items-center gap-1', other.is_online ? 'text-green-600' : '')}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', other.is_online ? 'bg-green-500' : 'bg-gray-400')} />
                      {other.is_online ? 'En ligne' : 'Hors ligne'}
                    </span>
                    {other.profession && <><span>·</span><span>{other.profession}</span></>}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-1">
            {other && (
              <a href={`tel:${other.is_online ? '' : ''}`}>
                <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
              </a>
            )}
            <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>

      {/* Bannière mission */}
      {room && (
        <div className="bg-accent-50 dark:bg-accent-900/20 border-b border-accent-200 dark:border-accent-800 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-4 w-4 text-accent-700 dark:text-accent-300 flex-shrink-0" />
              <span className="truncate">
                <strong>Mission :</strong> {room.request_title}
              </span>
            </div>
            <Badge variant="accent" className="flex-shrink-0">#{room.request_id}</Badge>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
        ) : (
          messages.map((msg) => {
            const fromMe = msg.sender_id === user?.id
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={cn('flex', fromMe ? 'justify-end' : 'justify-start')}
              >
                <div className={cn(
                  'max-w-[75%] px-4 py-2.5 rounded-2xl',
                  fromMe
                    ? 'bg-brand-700 text-white rounded-br-sm'
                    : 'bg-card border border-border text-foreground rounded-bl-sm'
                )}>
                  <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                  <div className={cn(
                    'flex items-center justify-end gap-1 mt-1 text-[10px]',
                    fromMe ? 'text-brand-200' : 'text-muted-foreground'
                  )}>
                    <span>{formatTime(msg.created_at)}</span>
                    {fromMe && (
                      <CheckCheck className={cn('h-3 w-3', msg.read ? 'text-accent-300' : '')} />
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}

        {/* Indicateur de frappe */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <Card className="rounded-none border-x-0 border-b-0 p-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex"><ImageIcon className="h-5 w-5" /></Button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Écrire un message…"
            className="flex-1 h-11 px-4 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <Button
            variant="accent"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  )
}
