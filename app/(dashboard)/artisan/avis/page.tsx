'use client'

import { Star, MessageSquare } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { SectionCard } from '@/components/ui/section-card'
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
      <PageHeader
        title="Mes avis reçus"
        description="Les retours de vos clients sur vos interventions."
        icon={Star}
      />

      {!isLoading && reviews && reviews.length > 0 && (
        <SectionCard delay={0.05}>
          <div className="flex items-center gap-5">
            <div className="text-center flex-shrink-0">
              <div className="text-4xl font-extrabold tabular-nums text-[rgb(var(--fg))]">{avg.toFixed(1)}</div>
              <div className="flex justify-center gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={i < Math.round(avg) ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-[rgb(var(--muted-fg))]'} />
                ))}
              </div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-sm text-[rgb(var(--muted-fg))]">
              Basé sur <span className="font-semibold text-[rgb(var(--fg))]">{reviews.length}</span> avis client{reviews.length > 1 ? 's' : ''}.
            </div>
          </div>
        </SectionCard>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
              <div className="mt-4 h-3 w-full bg-muted rounded animate-pulse" />
              <div className="mt-2 h-3 w-4/5 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <SectionCard delay={0.05}>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
              <MessageSquare className="h-7 w-7 text-brand-500" />
            </div>
            <p className="mt-4 font-semibold text-[rgb(var(--fg))]">Aucun avis pour le moment</p>
            <p className="mt-1 text-sm text-[rgb(var(--muted-fg))]">
              Les retours de vos clients apparaîtront ici après vos interventions.
            </p>
          </div>
        </SectionCard>
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
