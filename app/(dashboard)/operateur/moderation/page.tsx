'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star, MessageSquare, Flag, EyeOff, Eye, Trash2, RotateCcw, Award, Search,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Spinner } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { cn } from '@/lib/utils/cn'
import { formatRelative } from '@/lib/utils/format'
import { toast } from 'sonner'
import {
  useAdminReviews, useModerateReview,
  useAdminMessages, useModerateMessage,
  type ReviewAction,
} from '@/hooks/queries/useBackOffice'

type Tab = 'reviews' | 'messages'

const TABS: { key: Tab; label: string; icon: typeof Star }[] = [
  { key: 'reviews',  label: 'Avis',     icon: Star },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
]

function ReviewsTab() {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'hidden'>('all')
  const [q, setQ] = useState('')
  const { data: reviews, isLoading } = useAdminReviews({
    flagged: filter === 'flagged' || undefined,
    hidden: filter === 'hidden' || undefined,
    q: q.trim() || undefined,
  })
  const moderate = useModerateReview()

  function act(id: number, action: ReviewAction, label: string) {
    if (action === 'delete' && !confirm('Supprimer définitivement cet avis ?')) return
    moderate.mutate({ id, action }, { onSuccess: () => toast.success(label) })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 p-1 rounded-lg bg-muted">
          {(['all', 'flagged', 'hidden'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f === 'all' ? 'Tous' : f === 'flagged' ? 'Signalés' : 'Masqués'}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un avis…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
      ) : !reviews || reviews.length === 0 ? (
        <EmptyState icon="star" title="Aucun avis" desc="Aucun avis ne correspond à ce filtre." />
      ) : (
        <div className="space-y-2">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm">{'★'.repeat(r.rating ?? 0)}<span className="text-muted-foreground">{'★'.repeat(Math.max(0, 5 - (r.rating ?? 0)))}</span></span>
                    {!r.is_public && <Badge variant="default">Masqué</Badge>}
                    {r.is_flagged && <Badge variant="danger"><Flag className="h-3 w-3" /> Signalé</Badge>}
                    {r.is_featured && <Badge variant="accent"><Award className="h-3 w-3" /> Vedette</Badge>}
                  </div>
                  {r.title && <p className="font-medium text-sm">{r.title}</p>}
                  {r.comment && <p className="text-sm text-muted-foreground mt-0.5">{r.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.reviewer_name ?? 'Anonyme'} → {r.reviewed_name ?? '—'}
                    {r.created_at && ` · ${formatRelative(r.created_at)}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {r.is_public
                  ? <Button variant="outline" size="sm" onClick={() => act(r.id, 'hide', 'Avis masqué')}><EyeOff className="h-3.5 w-3.5" /> Masquer</Button>
                  : <Button variant="outline" size="sm" onClick={() => act(r.id, 'show', 'Avis affiché')}><Eye className="h-3.5 w-3.5" /> Afficher</Button>}
                {r.is_flagged
                  ? <Button variant="outline" size="sm" onClick={() => act(r.id, 'unflag', 'Signalement levé')}><Flag className="h-3.5 w-3.5" /> Lever</Button>
                  : <Button variant="outline" size="sm" onClick={() => act(r.id, 'flag', 'Avis signalé')}><Flag className="h-3.5 w-3.5" /> Signaler</Button>}
                {r.is_featured
                  ? <Button variant="ghost" size="sm" onClick={() => act(r.id, 'unfeature', 'Retiré des vedettes')}><Award className="h-3.5 w-3.5" /> Retirer</Button>
                  : <Button variant="ghost" size="sm" onClick={() => act(r.id, 'feature', 'Mis en vedette')}><Award className="h-3.5 w-3.5" /> Vedette</Button>}
                <Button variant="destructive" size="sm" onClick={() => act(r.id, 'delete', 'Avis supprimé')}><Trash2 className="h-3.5 w-3.5" /> Supprimer</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function MessagesTab() {
  const [showDeleted, setShowDeleted] = useState(false)
  const [q, setQ] = useState('')
  const { data: messages, isLoading } = useAdminMessages({
    deleted: showDeleted ? true : undefined,
    q: q.trim() || undefined,
  })
  const moderate = useModerateMessage()

  function act(id: number, action: 'delete' | 'restore', label: string) {
    if (action === 'delete' && !confirm('Masquer ce message ?')) return
    moderate.mutate({ id, action }, { onSuccess: () => toast.success(label) })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
          Supprimés uniquement
        </label>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un message…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
      ) : !messages || messages.length === 0 ? (
        <EmptyState icon="message" title="Aucun message" desc="Aucun message ne correspond à ce filtre." />
      ) : (
        <div className="space-y-2">
          {messages.map((m) => (
            <Card key={m.id} className={cn('p-4', m.is_deleted && 'opacity-60')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{m.sender_name ?? `Utilisateur #${m.sender_id}`}</span>
                    <span className="text-xs text-muted-foreground">Salon #{m.chat_room_id}</span>
                    {m.is_deleted && <Badge variant="default">Supprimé</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground break-words">{m.content || <em>(média)</em>}</p>
                  {m.created_at && <p className="text-xs text-muted-foreground mt-1">{formatRelative(m.created_at)}</p>}
                </div>
                <div className="flex-shrink-0">
                  {m.is_deleted
                    ? <Button variant="ghost" size="sm" onClick={() => act(m.id, 'restore', 'Message restauré')}><RotateCcw className="h-4 w-4" /></Button>
                    : <Button variant="ghost" size="sm" onClick={() => act(m.id, 'delete', 'Message masqué')}><Trash2 className="h-4 w-4 text-red-600" /></Button>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ModerationPage() {
  const [tab, setTab] = useState<Tab>('reviews')

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Modération avancée</h1>
        <p className="text-muted-foreground mt-1">Avis clients et messages de la messagerie.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'reviews' && <ReviewsTab />}
        {tab === 'messages' && <MessagesTab />}
      </motion.div>
    </div>
  )
}
