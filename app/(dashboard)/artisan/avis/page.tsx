'use client'

import { Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ReviewCard } from '@/components/features/reviews/ReviewCard'
import { useTechnicianReviews } from '@/hooks/queries/useReviews'
import { useAuthStore } from '@/stores/auth.store'

export default function ArtisanAvisPage() {
  const { user } = useAuthStore()
  const { data: reviews, isLoading } = useTechnicianReviews(user?.id)

  const avg =
    reviews && reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Mes avis reçus</h1>
        <p className="text-muted-foreground mt-1">Les retours de vos clients sur vos interventions.</p>
      </div>

      {!isLoading && reviews && reviews.length > 0 && (
        <Card className="p-5 flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-extrabold text-foreground">{avg.toFixed(1)}</div>
            <div className="flex justify-center gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={i < Math.round(avg) ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-muted-foreground'} />
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Basé sur <span className="font-semibold text-foreground">{reviews.length}</span> avis client{reviews.length > 1 ? 's' : ''}.
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : !reviews || reviews.length === 0 ? (
        <EmptyState icon="star" title="Aucun avis" desc="Vos avis clients apparaîtront ici." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} canRespond />
          ))}
        </div>
      )}
    </div>
  )
}
