// app/(dashboard)/chat/[roomId]/page.tsx
'use client'

import { use, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Send, Paperclip, Smile, Phone, Video,
  MoreVertical, Image as ImageIcon, MapPin, CheckCheck,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Avatar } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

// Interface pour les props
interface PageProps {
  params: Promise<{ roomId: string }>
}

interface Message {
  id: number
  text: string
  fromMe: boolean
  time: string
  read?: boolean
  type?: 'text' | 'image' | 'location'
}

const INITIAL_MESSAGES: Message[] = [
  { id: 1, text: 'Bonjour ! Je vous confirme avoir bien reçu votre demande.', fromMe: false, time: '14:25', read: true },
  { id: 2, text: 'Pouvez-vous me décrire un peu plus le problème de fuite ?', fromMe: false, time: '14:25', read: true },
  { id: 3, text: 'Bonjour ! Il y a une fuite importante sous le lavabo de la salle de bain. L\'eau coule en continu.', fromMe: true, time: '14:27', read: true },
  { id: 4, text: 'D\'accord, je vois. Avez-vous coupé l\'arrivée d\'eau ?', fromMe: false, time: '14:28', read: true },
  { id: 5, text: 'Oui, c\'est fait. J\'attends maintenant.', fromMe: true, time: '14:29', read: true },
  { id: 6, text: 'Parfait. Je suis sur la route, j\'arrive dans 8 minutes 👍', fromMe: false, time: '14:30', read: true },
  { id: 7, text: 'Merci beaucoup pour la rapidité !', fromMe: true, time: '14:31', read: true },
  { id: 8, text: 'Je suis sur place, j\'arrive dans 2 min', fromMe: false, time: 'À l\'instant', read: false },
]

export default function ChatRoomPage({ params }: PageProps) {
  const { roomId } = use(params) // ✅ Correction : use() au lieu de destructuration directe
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isTyping])

  // Simulate typing indicator
  useEffect(() => {
    const t = setTimeout(() => setIsTyping(false), 3000)
    return () => clearTimeout(t)
  }, [isTyping])

  const sendMessage = () => {
    if (!input.trim()) return
    const newMsg: Message = {
      id: Date.now(),
      text: input,
      fromMe: true,
      time: 'À l\'instant',
      read: false,
    }
    setMessages([...messages, newMsg])
    setInput('')

    // Simulate reply
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          text: 'Bien noté, je m\'en occupe ! 👍',
          fromMe: false,
          time: 'À l\'instant',
          read: true,
        },
      ])
    }, 2500)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -m-4 sm:-m-6 lg:-m-8">
      {/* Header conv */}
      <Card className="rounded-none border-x-0 border-t-0 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/chat" className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="relative">
              <Avatar fallback="MK" size="md" />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
            </div>
            <div>
              <h2 className="font-semibold">Mohamed Keita</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  En ligne
                </span>
                <span>·</span>
                <span>Plombier · 1.2 km</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>

      {/* Banner mission */}
      <div className="bg-accent-50 dark:bg-accent-900/20 border-b border-accent-200 dark:border-accent-800 px-4 py-2">
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-accent-700 dark:text-accent-300 flex-shrink-0" />
            <span className="truncate">
              <strong>Mission en cours :</strong> Fuite d'eau salle de bain
            </span>
          </div>
          <Badge variant="accent" className="flex-shrink-0">SOS-2026-002</Badge>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn('flex', msg.fromMe ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[75%] px-4 py-2.5 rounded-2xl',
                msg.fromMe
                  ? 'bg-brand-700 text-white rounded-br-sm'
                  : 'bg-card border border-border text-foreground rounded-bl-sm'
              )}
            >
              <p className="text-sm leading-relaxed break-words">{msg.text}</p>
              <div className={cn('flex items-center justify-end gap-1 mt-1 text-[10px]', msg.fromMe ? 'text-brand-200' : 'text-muted-foreground')}>
                <span>{msg.time}</span>
                {msg.fromMe && (
                  <CheckCheck className={cn('h-3 w-3', msg.read ? 'text-accent-300' : '')} />
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse animation-delay-200" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse animation-delay-400" />
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
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder="Écrire un message…"
            className="flex-1 h-11 px-4 rounded-full bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex"><Smile className="h-5 w-5" /></Button>
          <Button variant="accent" size="icon" onClick={sendMessage} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}