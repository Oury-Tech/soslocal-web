'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/badge'
import { useCreateReview } from '@/hooks/queries/useReviews'
import { cn } from '@/lib/utils/cn'

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              'h-7 w-7 transition-colors',
              (hover || value) > i
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function ReviewForm({
  requestId,
  technicianId,
  onSuccess,
}: {
  requestId: number
  technicianId: number
  onSuccess: () => void
}) {
  const createReview = useCreateReview()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const canSubmit = rating > 0

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Note globale</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Commentaire (optionnel)</label>
        <textarea
          rows={3}
          placeholder="Partagez votre expérience…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
        />
      </div>

      <Button
        variant="accent"
        size="md"
        className="w-full"
        disabled={!canSubmit || createReview.isPending}
        onClick={() =>
          createReview.mutate(
            {
              request_id: requestId,
              technician_id: technicianId,
              rating,
              comment: comment.trim(),
            },
            { onSuccess }
          )
        }
      >
        {createReview.isPending ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <><Star className="h-4 w-4" /> Envoyer l'avis</>
        )}
      </Button>
    </div>
  )
}
