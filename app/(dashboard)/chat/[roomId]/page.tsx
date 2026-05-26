'use client'

import { use, useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Send, Phone,
  MoreVertical, MapPin, Check, CheckCheck, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useChatRooms, useChatMessages, useSendMessage, useCreateChatRoom } from '@/hooks/queries/useChat'
import { useTechnician } from '@/hooks/queries/useTechnicians'
import { useAuthStore } from '@/stores/auth.store'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils/cn'
import { formatTime, formatDateSeparator, getInitials } from '@/lib/utils/format'
import { format } from 'date-fns'
import type { MockChatMessage } from '@/lib/mock-data'

interface PageProps {
  params: Promise<{ roomId: string }>
}

// ─── Date separator ───────────────────────────────────────────────────────────

function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-4">
      <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
      <span className="text-[11px] text-muted-foreground bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full flex-shrink-0 font-medium">
        {formatDateSeparator(date)}
      </span>
      <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
    </div>
  )
}

// ─── Status tick ─────────────────────────────────────────────────────────────

function MsgStatus({ msg }: { msg: MockChatMessage }) {
  if (msg.id.startsWith('opt-')) return <Clock className="h-3 w-3 opacity-50" />
  if (msg.read) return <CheckCheck className="h-3 w-3 text-brand-200" />
  return <Check className="h-3 w-3 opacity-60" />
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatRoomPage({ params }: PageProps) {
  const { roomId: requestId } = use(params)
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [chatRoomId, setChatRoomId] = useState<string | null>(null)

  /* Detect direct-tech mode: /chat/tech-{id} */
  const isTechDirect = requestId.startsWith('tech-')
  const techDirectId  = isTechDirect ? Number(requestId.replace('tech-', '')) : undefined
  const { data: techDirectData } = useTechnician(techDirectId)

  // ── Room resolution ──────────────────────────────────────────────────────────
  const { data: rooms = [], isLoading: roomsLoading } = useChatRooms()
  const createRoom = useCreateChatRoom()

  useEffect(() => {
    if (roomsLoading) return

    if (isTechDirect) {
      const existing = rooms.find(
        (r) => r.other_participant?.id === techDirectId || r.id === `direct-${techDirectId}`,
      )
      if (existing) { setChatRoomId(existing.id); return }
      if (!createRoom.isPending && !chatRoomId && techDirectId) {
        createRoom.mutate(
          { artisanId: techDirectId },
          { onSuccess: (room) => setChatRoomId(room.id) },
        )
      }
      return
    }

    const existing = rooms.find((r) => r.request_id === requestId)
    if (existing) { setChatRoomId(existing.id); return }
    if (!createRoom.isPending && !chatRoomId) {
      createRoom.mutate(
        { requestId: Number(requestId) },
        { onSuccess: (room) => setChatRoomId(room.id) },
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, roomsLoading, requestId, isTechDirect, techDirectId])

  const { data: messages = [], isLoading: msgsLoading } = useChatMessages(chatRoomId ?? undefined)
  const sendMutation = useSendMessage(chatRoomId ?? undefined)

  const room  = rooms.find((r) => r.request_id === requestId)
  const other = isTechDirect && techDirectData
    ? {
        id:         techDirectData.id,
        name:       techDirectData.name,
        avatar:     getInitials(techDirectData.name),
        profession: techDirectData.profession,
        is_online:  techDirectData.is_available ?? false,
      }
    : room?.other_participant

  // ── WebSocket ────────────────────────────────────────────────────────────────
  // Backend WS path: /api/v1/chat/ws/{room_id}?token=...
  const wsBase = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, 'ws').replace(/\/api\/v1$/, '')
    : 'ws://localhost:8000'

  useWebSocket({
    url: chatRoomId
      ? `${wsBase}/api/v1/chat/ws/${chatRoomId}`
      : null,
    onMessage: (msg) => {
      /* Backend sends "type": "message" for new chat messages */
      if (msg.type === 'message') {
        qc.invalidateQueries({ queryKey: ['chat', 'messages', chatRoomId] })
        qc.invalidateQueries({ queryKey: ['chat', 'rooms'] })
      }
      /* Typing indicator: backend sends sender_id, not user_id */
      if (msg.type === 'typing') {
        if ((msg as any).sender_id !== user?.id) {
          setIsTyping(true)
          if (typingTimer.current) clearTimeout(typingTimer.current)
          typingTimer.current = setTimeout(() => setIsTyping(false), 3000)
        }
      }
      /* Read receipt */
      if (msg.type === 'read') {
        qc.invalidateQueries({ queryKey: ['chat', 'messages', chatRoomId] })
      }
    },
  })

  // ── Auto-scroll ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  // ── Message grouping ──────────────────────────────────────────────────────────
  type GroupedItem =
    | { kind: 'separator'; date: string; key: string }
    | { kind: 'message'; msg: MockChatMessage; showAvatar: boolean; showTail: boolean }

  const grouped = useMemo((): GroupedItem[] => {
    const result: GroupedItem[] = []
    let lastDate = ''

    messages.forEach((msg, idx) => {
      const dateKey = format(new Date(msg.created_at), 'yyyy-MM-dd')
      if (dateKey !== lastDate) {
        result.push({ kind: 'separator', date: msg.created_at, key: `sep-${dateKey}` })
        lastDate = dateKey
      }

      const msgTime = new Date(msg.created_at).getTime()
      const nextMsg = messages[idx + 1]
      const nextSender = nextMsg?.sender_id ?? -1
      const nextTime = nextMsg ? new Date(nextMsg.created_at).getTime() : 0
      const nextDateKey = nextMsg ? format(new Date(nextMsg.created_at), 'yyyy-MM-dd') : ''

      const isLastInGroup =
        msg.sender_id !== nextSender ||
        nextTime - msgTime > 120_000 ||
        nextDateKey !== dateKey

      result.push({ kind: 'message', msg, showAvatar: isLastInGroup, showTail: isLastInGroup })
    })

    return result
  }, [messages])

  // ── Send ──────────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || !user || !chatRoomId) return
    setInput('')

    const optimistic: MockChatMessage = {
      id: `opt-${Date.now()}`,
      room_id: chatRoomId,
      sender_id: user.id,
      content: text,
      read: false,
      created_at: new Date().toISOString(),
    }
    qc.setQueryData<MockChatMessage[]>(
      ['chat', 'messages', chatRoomId],
      (prev) => [...(prev ?? []), optimistic],
    )

    try {
      await sendMutation.mutateAsync({ senderId: user.id, content: text })
    } catch {
      qc.setQueryData<MockChatMessage[]>(
        ['chat', 'messages', chatRoomId],
        (prev) => (prev ?? []).filter((m) => m.id !== optimistic.id),
      )
      setInput(text)
    }
  }, [input, user, chatRoomId, qc, sendMutation])

  const isCreatingRoom = roomsLoading || (createRoom.isPending && !chatRoomId)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8">

      {/* ── Header ── */}
      <div className="border-b border-border bg-card px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/chat"
              className="h-9 w-9 inline-flex items-center justify-center rounded-xl hover:bg-muted flex-shrink-0 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            {other ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar fallback={other.avatar} size="md" />
                  {other.is_online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-sm leading-tight truncate">{other.name}</h2>
                  <p className={cn(
                    'text-xs flex items-center gap-1',
                    other.is_online ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground',
                  )}>
                    {isTyping ? (
                      <span className="text-brand-500 italic">en train d'écrire…</span>
                    ) : (
                      <>
                        <span className={cn(
                          'h-1.5 w-1.5 rounded-full flex-shrink-0',
                          other.is_online ? 'bg-green-500' : 'bg-gray-400',
                        )} />
                        {other.is_online ? 'En ligne' : 'Hors ligne'}
                        {other.profession && <span className="opacity-60">· {other.profession}</span>}
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3 w-28 bg-muted rounded animate-pulse" />
                  <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            {other?.is_online && (
              <button className="h-9 w-9 inline-flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                <Phone className="h-4 w-4" />
              </button>
            )}
            <button className="h-9 w-9 inline-flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bannière mission ── */}
      {room && (
        <div className="bg-brand-50 dark:bg-brand-950/40 border-b border-brand-100 dark:border-brand-900 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <span className="text-xs truncate">
                <strong>Mission :</strong> {room.request_title}
              </span>
            </div>
            <Badge variant="primary" className="flex-shrink-0 text-xs">#{room.request_id}</Badge>
          </div>
        </div>
      )}

      {/* ── Zone messages — fond style messagerie ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-3 bg-[#f0f2f5] dark:bg-[#0b0f14]"
      >
        {isCreatingRoom ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Spinner className="h-7 w-7" />
            <p className="text-sm text-muted-foreground">Ouverture de la conversation…</p>
          </div>

        ) : createRoom.isError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-3xl shadow-sm">
              💬
            </div>
            <p className="font-semibold text-sm">
              {isTechDirect
                ? `Démarrer une conversation avec ${other?.name ?? 'cet artisan'}`
                : 'Chat indisponible'}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {isTechDirect
                ? 'Créez une demande de service avec cet artisan pour ouvrir le chat. Il vous répondra dès l\'acceptation.'
                : 'L\'artisan doit accepter la mission avant de pouvoir discuter.'}
            </p>
            {isTechDirect ? (
              <Link href={`/beneficiaire/nouvelle?technician=${techDirectId}`}>
                <Button variant="accent" size="sm">Créer une demande</Button>
              </Link>
            ) : (
              <Link href="/beneficiaire/demandes">
                <Button variant="outline" size="sm">← Retour aux demandes</Button>
              </Link>
            )}
          </div>

        ) : msgsLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner className="h-7 w-7" />
          </div>

        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="h-16 w-16 rounded-full bg-card flex items-center justify-center text-3xl shadow-sm">
              👋
            </div>
            <p className="font-semibold text-sm">Commencez la conversation</p>
            <p className="text-xs text-muted-foreground">Dites bonjour à {other?.name ?? 'l\'artisan'} !</p>
          </div>

        ) : (
          <div className="space-y-0.5 max-w-2xl mx-auto">
            {grouped.map((item) => {
              if (item.kind === 'separator') {
                return <DateSeparator key={item.key} date={item.date} />
              }

              const { msg, showAvatar, showTail } = item
              const fromMe = msg.sender_id === user?.id
              const isOptimistic = msg.id.startsWith('opt-')

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: isOptimistic ? 0.7 : 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className={cn(
                    'flex items-end gap-1.5',
                    fromMe ? 'flex-row-reverse' : 'flex-row',
                    showTail ? 'mb-1.5' : 'mb-0.5',
                  )}
                >
                  {/* Avatar (reçu uniquement) */}
                  {!fromMe && (
                    <div className="w-7 flex-shrink-0 self-end mb-1">
                      {showAvatar && <Avatar fallback={other?.avatar ?? '?'} size="sm" />}
                    </div>
                  )}

                  {/* Bulle */}
                  <div className={cn('flex flex-col max-w-[75%] sm:max-w-[60%]', fromMe ? 'items-end' : 'items-start')}>
                    <div className={cn(
                      'px-3.5 py-2 text-sm leading-relaxed break-words',
                      fromMe
                        ? cn(
                            'bg-brand-500 text-white',
                            showTail
                              ? 'rounded-2xl rounded-br-md shadow-[0_1px_3px_rgba(59,55,233,0.3)]'
                              : 'rounded-2xl',
                          )
                        : cn(
                            'bg-white dark:bg-[#1e2530] text-foreground border border-black/5 dark:border-white/5',
                            showTail
                              ? 'rounded-2xl rounded-bl-md shadow-sm'
                              : 'rounded-2xl',
                          ),
                    )}>
                      {msg.content}
                    </div>

                    {showTail && (
                      <div className={cn(
                        'flex items-center gap-1 mt-0.5 px-1',
                        fromMe ? 'flex-row-reverse' : 'flex-row',
                      )}>
                        <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                        {fromMe && <MsgStatus msg={msg} />}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}

            {/* Indicateur de frappe */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-end gap-1.5 mb-1.5"
                >
                  <div className="w-7 flex-shrink-0">
                    <Avatar fallback={other?.avatar ?? '?'} size="sm" />
                  </div>
                  <div className="bg-white dark:bg-[#1e2530] border border-black/5 dark:border-white/5 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Barre de saisie ── */}
      <div className="border-t border-border bg-card px-3 py-3 flex-shrink-0">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={chatRoomId ? 'Écrire un message…' : 'Connexion…'}
            disabled={!chatRoomId}
            autoComplete="off"
            className="flex-1 h-11 px-4 rounded-full bg-muted/60 border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm disabled:opacity-50"
          />

          <motion.button
            animate={{ scale: input.trim() ? 1 : 0.92 }}
            transition={{ duration: 0.1 }}
            onClick={handleSend}
            disabled={!input.trim() || !chatRoomId}
            className={cn(
              'h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
              input.trim()
                ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
