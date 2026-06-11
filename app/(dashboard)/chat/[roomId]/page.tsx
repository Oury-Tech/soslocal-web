'use client'

import { use, useState, useRef, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Send, Phone,
  MoreVertical, MapPin, Check, CheckCheck, Clock, Loader2,
  Paperclip, Image as ImageIcon, Video as VideoIcon, FileText, Download, Mic, X,
  MessageCircle, ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useChatRooms, useChatMessages, useSendMessage, useCreateChatRoom, useUploadChatMedia } from '@/hooks/queries/useChat'
import { useTechnician } from '@/hooks/queries/useTechnicians'
import { useAuthStore } from '@/stores/auth.store'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useCall } from '@/hooks/useCall'
import { CallOverlay, type CallPhase, type CallMode } from '@/components/chat/CallOverlay'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { resolveApiUrl } from '@/lib/api/base-url'
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

// ─── Media helpers ──────────────────────────────────────────────────────────────

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'bmp', 'svg']
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'm4v', '3gp', 'avi', 'mkv']
const AUDIO_EXT = ['m4a', 'mp3', 'wav', 'aac', 'ogg', 'opus']

type MediaKind = 'image' | 'video' | 'audio' | 'file' | 'location' | 'text'

function extOf(url?: string | null): string {
  if (!url) return ''
  const clean = url.split('?')[0].split('#')[0]
  return clean.split('.').pop()?.toLowerCase() ?? ''
}

function mediaKind(msg: MockChatMessage): MediaKind {
  const t = msg.message_type
  const hasGeo = msg.meta_data?.latitude != null && msg.meta_data?.longitude != null
  if (t === 'location' || (hasGeo && !msg.media_url)) return 'location'
  if (!msg.media_url) return 'text'
  if (t === 'image') return 'image'
  if (t === 'video') return 'video'
  const ext = extOf(msg.media_url) || extOf(msg.file_name) || extOf(msg.content)
  if (IMAGE_EXT.includes(ext)) return 'image'
  if (VIDEO_EXT.includes(ext)) return 'video'
  if (AUDIO_EXT.includes(ext)) return 'audio'
  return 'file'
}

function humanSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

// ─── Message content (texte + médias) ────────────────────────────────────────────

function MessageContent({
  msg,
  fromMe,
  onImageClick,
}: {
  msg: MockChatMessage
  fromMe: boolean
  onImageClick: (url: string) => void
}) {
  const kind = mediaKind(msg)
  const fileName = msg.file_name || msg.content || 'Document'

  if (kind === 'image' && msg.media_url) {
    return (
      <button type="button" onClick={() => onImageClick(msg.media_url!)} className="block text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={msg.media_url}
          alt={msg.content || 'Image'}
          className="rounded-xl max-h-72 w-auto object-cover"
        />
        {msg.content && msg.content !== fileName && (
          <p className="px-2.5 py-1.5">{msg.content}</p>
        )}
      </button>
    )
  }

  if (kind === 'video' && msg.media_url) {
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={msg.media_url}
        controls
        preload="metadata"
        className="rounded-xl max-h-72 w-full max-w-[280px] bg-black"
      />
    )
  }

  if (kind === 'audio' && msg.media_url) {
    return (
      <div className="flex items-center gap-2 py-1 min-w-[210px]">
        <Mic className={cn('h-5 w-5 flex-shrink-0', fromMe ? 'text-white/90' : 'text-brand-500')} />
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio src={msg.media_url} controls className="h-9 max-w-[230px]" />
      </div>
    )
  }

  if (kind === 'file' && msg.media_url) {
    return (
      <a
        href={msg.media_url}
        target="_blank"
        rel="noopener noreferrer"
        download={fileName}
        className="flex items-center gap-3 py-1 pr-1 min-w-[210px]"
      >
        <div className={cn(
          'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
          fromMe ? 'bg-white/20' : 'bg-brand-500/10',
        )}>
          <FileText className={cn('h-5 w-5', fromMe ? 'text-white' : 'text-brand-500')} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className={cn('text-[11px]', fromMe ? 'text-white/70' : 'text-muted-foreground')}>
            {humanSize(msg.file_size) || 'Document'}
          </p>
        </div>
        <Download className={cn('h-4 w-4 flex-shrink-0', fromMe ? 'text-white/80' : 'text-muted-foreground')} />
      </a>
    )
  }

  if (kind === 'location') {
    const lat = msg.meta_data?.latitude
    const lng = msg.meta_data?.longitude
    return (
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 py-1 min-w-[200px]"
      >
        <div className={cn(
          'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
          fromMe ? 'bg-white/20' : 'bg-green-500/10',
        )}>
          <MapPin className={cn('h-5 w-5', fromMe ? 'text-white' : 'text-green-600')} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Position partagée</p>
          <p className={cn('text-[11px] flex items-center gap-1', fromMe ? 'text-white/70' : 'text-muted-foreground')}>
            Ouvrir dans Maps <ExternalLink className="h-3 w-3" aria-hidden />
          </p>
        </div>
      </a>
    )
  }

  return <>{msg.content}</>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatRoomPage({ params }: PageProps) {
  const { roomId: requestId } = use(params)
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [chatRoomId, setChatRoomId] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [attachOpen, setAttachOpen] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  // ── Message vocal (enregistrement micro façon WhatsApp) ────────────────────────
  const [recording, setRecording] = useState(false)
  const [recordSecs, setRecordSecs] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordChunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordCancelRef = useRef(false)

  // ── Appels audio / vidéo ──────────────────────────────────────────────────────
  const call = useCall()
  const [callsEnabled, setCallsEnabled] = useState(false)
  const [callPhase, setCallPhase] = useState<CallPhase | null>(null)
  const [callMode, setCallMode] = useState<CallMode>('audio')

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

    // Try: room.id match first (direct rooms navigated via room.id)
    const byRoomId = rooms.find((r) => r.id === requestId)
    if (byRoomId) { setChatRoomId(byRoomId.id); return }

    // Then try: request_id match (request-based rooms)
    const byRequestId = rooms.find((r) => r.request_id === requestId)
    if (byRequestId) { setChatRoomId(byRequestId.id); return }

    // Create a request-based room if we have a numeric ID
    const numericId = Number(requestId)
    if (!isNaN(numericId) && !createRoom.isPending && !chatRoomId) {
      createRoom.mutate(
        { requestId: numericId },
        { onSuccess: (room) => setChatRoomId(room.id) },
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, roomsLoading, requestId, isTechDirect, techDirectId])

  const { data: messages = [], isLoading: msgsLoading } = useChatMessages(chatRoomId ?? undefined)
  const sendMutation = useSendMessage(chatRoomId ?? undefined)
  const uploadMedia = useUploadChatMedia()

  const room  = rooms.find((r) => r.id === requestId || r.request_id === requestId)
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
  const wsBase = resolveApiUrl().replace(/^http/, 'ws').replace(/\/api\/v1$/, '')

  const { send: wsSend } = useWebSocket({
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

      // ── Signalisation d'appel ──────────────────────────────────────────────────
      if (msg.type === 'call-invite') {
        // On ignore notre propre invitation relayée et les appels déjà en cours.
        if ((msg as any).sender_id === user?.id) return
        setCallMode(((msg as any).mode === 'video' ? 'video' : 'audio'))
        setCallPhase('incoming')
      } else if (msg.type === 'call-accept') {
        // Le correspondant a accepté → on passe en appel actif (média déjà connecté).
        setCallPhase((p) => (p === 'outgoing' ? 'active' : p))
      } else if (msg.type === 'call-decline') {
        toast.info('Appel refusé')
        call.disconnect()
        setCallPhase(null)
      } else if (msg.type === 'call-end' || msg.type === 'call-cancel') {
        call.disconnect()
        setCallPhase(null)
      } else if (msg.type === 'call-busy') {
        toast.info('Correspondant occupé')
        call.disconnect()
        setCallPhase(null)
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

  // ── Envoi d'un média (image / vidéo / document) ──────────────────────────────────
  const handleFileSelect = useCallback(async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: 'image' | 'video' | 'file',
  ) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    setAttachOpen(false)
    if (!file || !user || !chatRoomId) return

    const maxMb = kind === 'video' ? 50 : kind === 'file' ? 25 : 10
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Le fichier ne doit pas dépasser ${maxMb} Mo.`)
      return
    }
    if (kind === 'image' && !file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image.')
      return
    }
    if (kind === 'video' && !file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner une vidéo.')
      return
    }

    try {
      const res = await uploadMedia.mutateAsync(file)
      await sendMutation.mutateAsync({
        senderId: user.id,
        content: kind === 'file' ? (res.filename || file.name) : '',
        mediaUrl: res.url,
        messageType: kind,
        metaData: { file_name: res.filename || file.name, file_size: res.size ?? file.size },
      })
    } catch {
      toast.error("Échec de l'envoi du fichier.")
    }
  }, [user, chatRoomId, uploadMedia, sendMutation])

  // ── Enregistrement d'un message vocal ──────────────────────────────────────────
  const startRecording = useCallback(async () => {
    if (!chatRoomId || recording) return
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toast.error('Enregistrement audio non supporté par ce navigateur.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      recordChunksRef.current = []
      recordCancelRef.current = false

      mr.ondataavailable = (e) => { if (e.data.size > 0) recordChunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null }
        setRecording(false)
        setRecordSecs(0)
        if (recordCancelRef.current) return

        const type = mr.mimeType || 'audio/webm'
        const blob = new Blob(recordChunksRef.current, { type })
        if (blob.size < 800) return  // trop court / vide
        const ext = type.includes('ogg') ? 'ogg' : type.includes('mp4') || type.includes('mp4a') ? 'm4a' : 'webm'
        const file = new File([blob], `vocal-${Date.now()}.${ext}`, { type })

        try {
          const res = await uploadMedia.mutateAsync(file)
          if (!user) return
          await sendMutation.mutateAsync({
            senderId: user.id,
            content: '',
            mediaUrl: res.url,
            messageType: 'audio',
            metaData: { file_name: res.filename || file.name, file_size: res.size ?? file.size },
          })
        } catch {
          toast.error("Échec de l'envoi du message vocal.")
        }
      }

      mr.start()
      mediaRecorderRef.current = mr
      setRecording(true)
      setRecordSecs(0)
      recordTimerRef.current = setInterval(() => setRecordSecs((s) => s + 1), 1000)
    } catch {
      toast.error("Micro indisponible. Autorisez l'accès au microphone.")
    }
  }, [chatRoomId, recording, uploadMedia, sendMutation, user])

  const stopRecording = useCallback((cancel: boolean) => {
    recordCancelRef.current = cancel
    try { mediaRecorderRef.current?.stop() } catch { /* noop */ }
    mediaRecorderRef.current = null
  }, [])

  // ── Appels : disponibilité ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    apiClient.get<{ enabled: boolean }>(API.CALLS_CONFIG)
      .then(({ data }) => { if (!cancelled) setCallsEnabled(!!data.enabled) })
      .catch(() => { if (!cancelled) setCallsEnabled(false) })
    return () => { cancelled = true }
  }, [])

  const numericRoomId = chatRoomId ? Number(chatRoomId) : NaN

  // Démarrer un appel sortant
  const startCall = useCallback(async (mode: CallMode) => {
    if (!chatRoomId || isNaN(numericRoomId)) return
    if (!callsEnabled) {
      toast.error('Les appels ne sont pas disponibles pour le moment.')
      return
    }
    setCallMode(mode)
    setCallPhase('outgoing')
    const ok = await call.connect({ roomId: numericRoomId })
    if (!ok) {
      toast.error("Impossible de démarrer l'appel.")
      setCallPhase(null)
      return
    }
    wsSend({ type: 'call-invite', mode })
  }, [chatRoomId, numericRoomId, callsEnabled, call, wsSend])

  // Accepter un appel entrant
  const acceptCall = useCallback(async () => {
    if (isNaN(numericRoomId)) return
    const ok = await call.connect({ roomId: numericRoomId })
    if (!ok) {
      toast.error("Impossible de rejoindre l'appel.")
      wsSend({ type: 'call-decline', mode: callMode })
      setCallPhase(null)
      return
    }
    wsSend({ type: 'call-accept', mode: callMode })
    setCallPhase('active')
  }, [numericRoomId, callMode, call, wsSend])

  // Refuser un appel entrant
  const declineCall = useCallback(() => {
    wsSend({ type: 'call-decline', mode: callMode })
    setCallPhase(null)
  }, [callMode, wsSend])

  // Raccrocher / annuler
  const hangup = useCallback(() => {
    wsSend({ type: callPhase === 'outgoing' ? 'call-cancel' : 'call-end', mode: callMode })
    call.disconnect()
    setCallPhase(null)
  }, [callPhase, callMode, call, wsSend])

  const isCreatingRoom = roomsLoading || (createRoom.isPending && !chatRoomId)

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem-4rem)] lg:h-[calc(100dvh-4rem)] -m-4 sm:-m-6 lg:-m-8">

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
            {callsEnabled && chatRoomId && (
              <>
                <button
                  onClick={() => startCall('audio')}
                  disabled={callPhase !== null}
                  title="Appel audio"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground disabled:opacity-40"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  onClick={() => startCall('video')}
                  disabled={callPhase !== null}
                  title="Appel vidéo"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground disabled:opacity-40"
                >
                  <VideoIcon className="h-4 w-4" />
                </button>
              </>
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
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center shadow-sm">
              <MessageCircle className="h-8 w-8 text-muted-foreground" aria-hidden />
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
                <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" aria-hidden /> Retour aux demandes</Button>
              </Link>
            )}
          </div>

        ) : msgsLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner className="h-7 w-7" />
          </div>

        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="h-16 w-16 rounded-full bg-card flex items-center justify-center shadow-sm">
              <MessageCircle className="h-8 w-8 text-brand-500" aria-hidden />
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
              const kind = mediaKind(msg)
              const isBleed = kind === 'image' || kind === 'video'

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
                      isBleed ? 'overflow-hidden !p-1' : '',
                    )}>
                      <MessageContent msg={msg} fromMe={fromMe} onImageClick={setLightbox} />
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
          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'video')}
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,application/pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'file')}
          />

          {/* Attach menu */}
          <div className="relative flex-shrink-0">
            <AnimatePresence>
              {attachOpen && (
                <>
                  <motion.div
                    className="fixed inset-0 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setAttachOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-14 left-0 z-20 w-44 rounded-2xl border border-border bg-card shadow-lg p-1.5"
                  >
                    {[
                      { key: 'image' as const, label: 'Photo', icon: ImageIcon, color: 'text-purple-500', ref: imageInputRef },
                      { key: 'video' as const, label: 'Vidéo', icon: VideoIcon, color: 'text-red-500', ref: videoInputRef },
                      { key: 'file' as const, label: 'Document', icon: FileText, color: 'text-blue-500', ref: docInputRef },
                    ].map(({ key, label, icon: Icon, color, ref }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setAttachOpen(false); ref.current?.click() }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium"
                      >
                        <Icon className={cn('h-5 w-5', color)} />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setAttachOpen((o) => !o)}
              disabled={!chatRoomId || uploadMedia.isPending || sendMutation.isPending}
              title="Joindre un fichier"
              className="h-11 w-11 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {uploadMedia.isPending
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <Paperclip className="h-5 w-5" />}
            </button>
          </div>
          {recording ? (
            <div className="flex-1 h-11 px-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400 tabular-nums">
                {`${Math.floor(recordSecs / 60)}:${String(recordSecs % 60).padStart(2, '0')}`}
              </span>
              <span className="text-xs text-muted-foreground">Enregistrement…</span>
              <button
                type="button"
                onClick={() => stopRecording(true)}
                title="Annuler"
                className="ml-auto h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
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
          )}

          {recording ? (
            <motion.button
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              onClick={() => stopRecording(false)}
              title="Envoyer le vocal"
              className="h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-colors"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          ) : input.trim() ? (
            <motion.button
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
              onClick={handleSend}
              disabled={!chatRoomId}
              className="h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 bg-brand-500 text-white hover:bg-brand-600 shadow-sm transition-colors"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          ) : (
            <motion.button
              animate={{ scale: 0.92 }}
              transition={{ duration: 0.1 }}
              onClick={startRecording}
              disabled={!chatRoomId || uploadMedia.isPending}
              title="Enregistrer un message vocal"
              className="h-11 w-11 rounded-full flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              <Mic className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Overlay d'appel audio / vidéo ── */}
      <AnimatePresence>
        {callPhase && (
          <CallOverlay
            phase={callPhase}
            mode={callMode}
            otherName={other?.name ?? 'Correspondant'}
            otherAvatar={other?.avatar}
            room={call.room}
            onAccept={acceptCall}
            onDecline={declineCall}
            onHangup={hangup}
          />
        )}
      </AnimatePresence>

      {/* ── Lightbox image plein écran ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={lightbox}
              alt="Aperçu"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
