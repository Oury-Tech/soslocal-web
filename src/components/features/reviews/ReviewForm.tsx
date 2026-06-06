'use client'

import { useState } from 'react'
import { Star, ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/badge'
import { useCreateReview } from '@/hooks/queries/useReviews'
import { cn } from '@/lib/utils/cn'

function StarPicker({
  value,
  onChange,
  size = 'lg',
}: {
  value: number
  onChange: (v: number) => void
  size?: 'sm' | 'lg'
}) {
  const [hover, setHover] = useState(0)
  const dim = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'
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
              dim,
              'transition-colors',
              (hover || value) > i ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  )
}

const SUB_RATINGS = [
  { key: 'quality', label: 'Qualité' },
  { key: 'punctuality', label: 'Ponctualité' },
  { key: 'price', label: 'Prix' },
] as const

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
  const [subRatings, setSubRatings] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const [photoUrl, setPhotoUrl] = useState('')

  const canSubmit = rating > 0

  function addPhoto() {
    const url = photoUrl.trim()
    if (!url) return
    setPhotos((p) => [...p, url])
    setPhotoUrl('')
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium mb-2">Note globale</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Notes détaillées */}
      <div className="space-y-2.5">
        <p className="text-sm font-medium">
          Notes détaillées <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
        </p>
        {SUB_RATINGS.map((s) => (
          <div key={s.key} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{s.label}</span>
            <StarPicker
              size="sm"
              value={subRatings[s.key] ?? 0}
              onChange={(v) => setSubRatings((prev) => ({ ...prev, [s.key]: v }))}
            />
          </div>
        ))}
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

      {/* Photos avant / après */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Photos (avant / après)</label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://… lien de la photo"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPhoto() } }}
            className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="button" variant="outline" size="md" onClick={addPhoto}>
            <ImagePlus className="h-4 w-4" />
          </Button>
        </div>
        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {photos.map((url, i) => (
              <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
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
              rating_quality: subRatings.quality,
              rating_punctuality: subRatings.punctuality,
              rating_price: subRatings.price,
              comment: comment.trim() || undefined,
              photos: photos.length ? photos : undefined,
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
