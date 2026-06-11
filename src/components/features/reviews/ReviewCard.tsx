'use client'

import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, Flag, MessageSquareReply } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatRelative, getInitials } from '@/lib/utils/format'
import { useVoteReview, useRespondReview, useReportReview, isReviewEditable } from '@/hooks/queries/useReviews'
import type { Review } from '@/types'

function Stars({ value, size = 'sm' }: { value?: number; size?: 'sm' | 'xs' }) {
  const dim = size === 'sm' ? 'h-4 w-4' : 'h-3 w-3'
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn(dim, (value ?? 0) > i ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground')} />
      ))}
    </div>
  )
}

const SUB_LABELS: { key: keyof Review; label: string }[] = [
  { key: 'quality_rating', label: 'Qualité' },
  { key: 'professionalism_rating', label: 'Professionnalisme' },
  { key: 'punctuality_rating', label: 'Ponctualité' },
  { key: 'communication_rating', label: 'Communication' },
  { key: 'value_rating', label: 'Qualité/prix' },
]

export function ReviewCard({ review, canRespond = false }: { review: Review; canRespond?: boolean }) {
  const vote = useVoteReview()
  const respond = useRespondReview()
  const report = useReportReview()

  const [myVote, setMyVote] = useState(review.my_vote ?? null)
  const [helpful, setHelpful] = useState(review.helpful_count ?? 0)
  const [responseText, setResponseText] = useState('')
  const [responded, setResponded] = useState(review.technician_response ?? '')
  const [showRespond, setShowRespond] = useState(false)

  function handleVote(v: 'helpful' | 'not_helpful') {
    if (myVote === v) return
    if (v === 'helpful') setHelpful((n) => n + 1)
    setMyVote(v)
    vote.mutate({ id: review.id, vote: v })
  }

  function handleReport() {
    const reason = window.prompt('Motif du signalement ?')
    if (!reason) return
    report.mutate({ id: review.id, reason }, { onSuccess: () => toast.success('Avis signalé') })
  }

  function handleRespond() {
    if (responseText.trim().length < 2) return
    respond.mutate(
      { id: review.id, response: responseText.trim() },
      {
        onSuccess: () => {
          setResponded(responseText.trim())
          setShowRespond(false)
          toast.success('Réponse publiée')
        },
      }
    )
  }

  const subRatings = SUB_LABELS.filter((s) => typeof review[s.key] === 'number')

  return (
    <Card className="p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar src={review.client_avatar} fallback={getInitials(review.client_name)} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold truncate">{review.client_name ?? 'Client'}</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">{formatRelative(review.created_at)}</span>
          </div>
          <Stars value={review.rating} />
        </div>
      </div>

      {subRatings.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {subRatings.map((s) => (
            <span key={s.key} className="flex items-center gap-1">
              {s.label} <Stars value={review[s.key] as number} size="xs" />
            </span>
          ))}
        </div>
      )}

      {review.comment && <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>}

      {(() => {
        const photos = review.images ?? review.photos ?? []
        return photos.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {photos.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="h-20 w-20 rounded-lg object-cover border border-border" />
            ))}
          </div>
        ) : null
      })()}

      {/* Réponse du technicien */}
      {responded ? (
        <div className="rounded-xl bg-muted/60 p-3 border-l-2 border-brand-500">
          <p className="text-xs font-semibold text-brand-600 mb-0.5">Réponse de l'artisan</p>
          <p className="text-sm text-foreground">{responded}</p>
        </div>
      ) : canRespond && showRespond ? (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Votre réponse…"
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex gap-2">
            <Button variant="accent" size="sm" onClick={handleRespond} loading={respond.isPending}>Publier</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowRespond(false)}>Annuler</Button>
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
        <button
          onClick={() => handleVote('helpful')}
          className={cn('flex items-center gap-1 hover:text-foreground transition-colors', myVote === 'helpful' && 'text-brand-600 font-medium')}
        >
          <ThumbsUp className="h-3.5 w-3.5" /> Utile{helpful ? ` (${helpful})` : ''}
        </button>
        <button
          onClick={() => handleVote('not_helpful')}
          className={cn('flex items-center gap-1 hover:text-foreground transition-colors', myVote === 'not_helpful' && 'text-foreground font-medium')}
        >
          <ThumbsDown className="h-3.5 w-3.5" /> Pas utile
        </button>
        {canRespond && !responded && !showRespond && (
          <button onClick={() => setShowRespond(true)} className="flex items-center gap-1 hover:text-foreground transition-colors">
            <MessageSquareReply className="h-3.5 w-3.5" /> Répondre
          </button>
        )}
        <button onClick={handleReport} className="flex items-center gap-1 hover:text-red-500 transition-colors ml-auto">
          <Flag className="h-3.5 w-3.5" /> Signaler
        </button>
      </div>

      {canRespond && isReviewEditable(review) && (
        <p className="text-[10px] text-muted-foreground">Le client peut encore modifier cet avis (fenêtre de 7 jours).</p>
      )}
    </Card>
  )
}
