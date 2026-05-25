'use client'

import Link from 'next/link'
import { Star, MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge, Avatar } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTechnician } from '@/hooks/queries/useTechnicians'
import { getInitials } from '@/lib/utils/format'

export function TechnicianCard({
  technicianId,
  requestId,
}: {
  technicianId: number
  requestId?: number
}) {
  const { data: tech, isLoading } = useTechnician(technicianId)

  if (isLoading) {
    return (
      <Card className="p-5 animate-pulse">
        <div className="h-3 w-24 bg-muted rounded mb-3" />
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        </div>
      </Card>
    )
  }

  if (!tech) return null

  const certLabel = tech.is_verified
    ? 'Expert vérifié'
    : tech.total_reviews > 20
    ? 'Artisan confirmé'
    : 'Nouveau'

  const certVariant = tech.is_verified ? 'primary' : 'default'

  return (
    <Card className="p-5">
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">Votre artisan</p>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          {tech.avatar_url ? (
            <img
              src={tech.avatar_url}
              className="w-14 h-14 rounded-full object-cover"
              alt={tech.name}
            />
          ) : (
            <Avatar fallback={getInitials(tech.name)} size="lg" />
          )}
          {tech.is_available && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-semibold truncate text-[rgb(var(--fg))]">{tech.name}</span>
            <Badge variant={certVariant} className="text-[10px] px-1.5 py-0 flex-shrink-0">
              {certLabel}
            </Badge>
          </div>
          {tech.profession && (
            <p className="text-xs text-muted-foreground truncate">{tech.profession}</p>
          )}
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="flex items-center gap-0.5 text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              <span className="font-semibold">{tech.rating.toFixed(1)}</span>
            </span>
            <span className="text-muted-foreground">
              {tech.total_reviews} avis · {tech.total_jobs_completed} missions
            </span>
          </div>
        </div>
      </div>

      {requestId && (
        <Link href={`/chat/${requestId}`}>
          <Button variant="accent" size="sm" className="w-full">
            <MessageCircle className="h-4 w-4" />
            Envoyer un message
          </Button>
        </Link>
      )}
    </Card>
  )
}
