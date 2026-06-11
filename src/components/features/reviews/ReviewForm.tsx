'use client'

import { useRef, useState } from 'react'
import { Star, ImagePlus, X, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/badge'
import { useCreateReview } from '@/hooks/queries/useReviews'
import { useUploadMedia } from '@/hooks/queries/useUpload'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

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
          aria-label={`${i + 1} étoile${i > 0 ? 's' : ''}`}
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

// Critères détaillés — alignés sur le backend et le mobile (5 critères identiques).
const SUB_RATINGS = [
  { key: 'quality_rating', label: 'Qualité du travail' },
  { key: 'professionalism_rating', label: 'Professionnalisme' },
  { key: 'punctuality_rating', label: 'Ponctualité' },
  { key: 'communication_rating', label: 'Communication' },
  { key: 'value_rating', label: 'Rapport qualité/prix' },
] as const

const MAX_PHOTOS = 5

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
  const uploadMedia = useUploadMedia()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [rating, setRating] = useState(0)
  const [subRatings, setSubRatings] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [images, setImages] = useState<string[]>([])

  const canSubmit = rating > 0

  async function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // permet de re-sélectionner le même fichier
    if (!files.length) return
    const room = MAX_PHOTOS - images.length
    if (room <= 0) {
      toast.info(`Maximum ${MAX_PHOTOS} photos`)
      return
    }
    for (const file of files.slice(0, room)) {
      try {
        const media = await uploadMedia.mutateAsync(file)
        setImages((prev) => [...prev, media.url])
      } catch {
        toast.error('Échec de l’envoi d’une photo')
      }
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium mb-2">Note globale</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Critères détaillés */}
      <div className="space-y-2.5">
        <p className="text-sm font-medium">
          Critères détaillés <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
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
          maxLength={500}
          placeholder="Partagez votre expérience…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white dark:bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Recommandation */}
      <div>
        <p className="text-sm font-medium mb-2">Recommanderiez-vous cet artisan ?</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWouldRecommend(true)}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-semibold transition-colors',
              wouldRecommend === true
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-border text-muted-foreground hover:border-green-600'
            )}
            aria-pressed={wouldRecommend === true}
          >
            <ThumbsUp className="h-4 w-4" /> Oui
          </button>
          <button
            type="button"
            onClick={() => setWouldRecommend(false)}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-semibold transition-colors',
              wouldRecommend === false
                ? 'bg-red-600 border-red-600 text-white'
                : 'border-border text-muted-foreground hover:border-red-600'
            )}
            aria-pressed={wouldRecommend === false}
          >
            <ThumbsDown className="h-4 w-4" /> Non
          </button>
        </div>
      </div>

      {/* Photos avant / après — upload réel */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Photos (avant / après) <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                aria-label="Retirer la photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMedia.isPending}
              className="h-16 w-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-brand-500 hover:text-brand-500 transition-colors disabled:opacity-50"
              aria-label="Ajouter une photo"
            >
              {uploadMedia.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPickFiles}
          className="hidden"
        />
      </div>

      <Button
        variant="accent"
        size="md"
        className="w-full"
        disabled={!canSubmit || createReview.isPending || uploadMedia.isPending}
        onClick={() =>
          createReview.mutate(
            {
              request_id: requestId,
              technician_id: technicianId,
              rating,
              quality_rating: subRatings.quality_rating || undefined,
              professionalism_rating: subRatings.professionalism_rating || undefined,
              punctuality_rating: subRatings.punctuality_rating || undefined,
              communication_rating: subRatings.communication_rating || undefined,
              value_rating: subRatings.value_rating || undefined,
              would_recommend: wouldRecommend ?? undefined,
              comment: comment.trim() || undefined,
              images: images.length ? images : undefined,
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
