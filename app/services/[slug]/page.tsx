'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock, Flame, ShieldCheck, Star, Wallet, Users } from 'lucide-react'
import { PublicShell } from '@/components/marketplace/PublicShell'
import { PublicTechnicianCard } from '@/components/marketplace/PublicTechnicianCard'
import { ContactArtisanButton } from '@/components/marketplace/ContactArtisanButton'
import { useServices } from '@/hooks/queries/useServices'
import { useNearbyTechnicians } from '@/hooks/queries/useTechnicians'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { CONAKRY_CENTER } from '@/lib/constants'
import { formatGNF } from '@/lib/utils/format'

function formatDuration(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null
  if (minutes < 60) return `~${minutes} min`
  return `~${Math.round((minutes / 60) * 10) / 10} h`
}

export default function ServiceDetailPage() {
  const params = useParams()
  const slug = String(params?.slug ?? '')
  const { data: services = [], isLoading: loadingServices } = useServices()
  const service = services.find((s) => s.slug === slug)

  const { data: technicians = [], isLoading: loadingTechs } = useNearbyTechnicians(
    CONAKRY_CENTER.lat,
    CONAKRY_CENTER.lng,
    service?.id,
  )

  if (loadingServices) {
    return (
      <PublicShell>
        <div className="container-app py-14 space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </PublicShell>
    )
  }

  if (!service) {
    return (
      <PublicShell>
        <div className="container-app py-20 text-center">
          <h1 className="text-2xl font-bold text-[rgb(var(--fg))]">Service introuvable</h1>
          <p className="text-[rgb(var(--muted-fg))] mt-2">Ce service n'existe pas ou n'est plus disponible.</p>
          <Link href="/services" className="inline-flex items-center gap-2 mt-5 text-brand-600 dark:text-brand-300 font-semibold">
            <ArrowLeft className="h-4 w-4" /> Retour au catalogue
          </Link>
        </div>
      </PublicShell>
    )
  }

  const duration = formatDuration(service.average_duration)
  const priceLabel =
    service.estimated_price_min != null && service.estimated_price_max != null
      ? `${formatGNF(service.estimated_price_min)} – ${formatGNF(service.estimated_price_max)}`
      : service.estimated_price_min != null
        ? `À partir de ${formatGNF(service.estimated_price_min)}`
        : 'Sur devis'

  return (
    <PublicShell>
      <div className="container-app py-8 lg:py-12 space-y-10">
        <Link href="/services" className="inline-flex items-center gap-2 text-sm font-medium text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))]">
          <ArrowLeft className="h-4 w-4" /> Tous les services
        </Link>

        {/* Hero service */}
        <header className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            <span className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center flex-shrink-0">
              <ServiceIcon slug={service.slug} name={service.name} className="h-8 w-8" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-[rgb(var(--fg))]">{service.name}</h1>
                {service.is_emergency && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <Flame className="h-3 w-3" /> Urgence 24/7
                  </span>
                )}
              </div>
              <p className="text-[rgb(var(--muted-fg))] mt-1 max-w-2xl">
                {service.description || service.short_description || `Faites appel à un artisan certifié en ${service.name.toLowerCase()} à Conakry.`}
              </p>
            </div>
            <div className="flex-shrink-0">
              <ContactArtisanButton serviceId={service.id} label="Demander ce service" />
            </div>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="rounded-2xl bg-[rgb(var(--muted))] p-3">
              <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-fg))]"><Wallet className="h-3.5 w-3.5" /> Tarif estimé</div>
              <div className="font-bold text-[rgb(var(--fg))] mt-1 text-sm">{priceLabel}</div>
            </div>
            <div className="rounded-2xl bg-[rgb(var(--muted))] p-3">
              <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-fg))]"><Clock className="h-3.5 w-3.5" /> Durée</div>
              <div className="font-bold text-[rgb(var(--fg))] mt-1 text-sm">{duration ?? 'Variable'}</div>
            </div>
            <div className="rounded-2xl bg-[rgb(var(--muted))] p-3">
              <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-fg))]"><Star className="h-3.5 w-3.5" /> Note</div>
              <div className="font-bold text-[rgb(var(--fg))] mt-1 text-sm">
                {typeof service.average_rating === 'number' && service.average_rating > 0 ? service.average_rating.toFixed(1) : '—'}
              </div>
            </div>
            <div className="rounded-2xl bg-[rgb(var(--muted))] p-3">
              <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-fg))]"><Users className="h-3.5 w-3.5" /> Artisans</div>
              <div className="font-bold text-[rgb(var(--fg))] mt-1 text-sm">{technicians.length}</div>
            </div>
          </div>
        </header>

        {/* Artisans pour ce service */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[rgb(var(--fg))]">Artisans pour ce service</h2>
            <span className="inline-flex items-center gap-1 text-xs text-[rgb(var(--muted-fg))]">
              <ShieldCheck className="h-4 w-4 text-brand-500" /> Tous vérifiés
            </span>
          </div>

          {loadingTechs ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : technicians.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgb(var(--border))] p-10 text-center">
              <p className="font-semibold text-[rgb(var(--fg))]">Aucun artisan disponible pour l'instant</p>
              <p className="text-sm text-[rgb(var(--muted-fg))] mt-1">Lancez une demande : nous vous trouverons le bon artisan dès qu'il est disponible.</p>
              <div className="mt-4 flex justify-center">
                <ContactArtisanButton serviceId={service.id} label="Lancer une demande" />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {technicians.map((t) => (
                <PublicTechnicianCard key={t.id} tech={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  )
}
