'use client'

import { useState } from 'react'
import { useCreateReview } from '@/hooks/queries/useReviews'

type ScoreKey = 'punctuality' | 'quality' | 'communication'
type Scores = Record<ScoreKey, number>

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
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
          <i
            className={`ti ti-star${
              (hover || value) > i ? '-filled' : ''
            }`}
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

  const [scores, setScores] = useState<Scores>({
    punctuality: 0,
    quality: 0,
    communication: 0,
  })

  const [comment, setComment] = useState('')

  const canSubmit =
    rating > 0 && Object.values(scores).every((v) => v > 0)

  return (
    <div className="space-y-5">
      <StarPicker value={rating} onChange={setRating} />

      <button
        type="button"
        disabled={!canSubmit || createReview.isPending}
        onClick={() =>
          createReview.mutate(
            {
              request_id: requestId,
              technician_id: technicianId,
              rating,
              ...scores,
              comment: comment.trim(), // ✅ FIX
            },
            { onSuccess }
          )
        }
      >
        Envoyer
      </button>
    </div>
  )
}