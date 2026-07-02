'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Star, ShieldCheck, Briefcase, CheckCircle2, Wallet, MapPin, Quote,
} from 'lucide-react'
import { PublicShell } from '@/components/marketplace/PublicShell'
import { ContactArtisanButton } from '@/components/marketplace/ContactArtisanButton'
import { useTechnician } from '@/hooks/queries/useTechnicians'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { useIsUserOnline } from '@/stores/ws.store'
import { Avatar } from '@/components/ui/badge'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { resolveTechnicianAvatar } from '@/lib/utils/technician-photos'

export default function TechnicianPublicProfilePage() {
  const params = useParams()
  const id = params?.id ? Number(params.id) : undefined
  const { data: tech, isLoading } = useTechnician(id)
  const liveOnline = useIsUserOnline(id)

  // Avis clients (les avis sont indexés sur l'user_id de l'artisan)
  const reviewKey = (tech as any)?.user_id ?? id
  const { data: reviews = [] } = useQuery<any[]>({
    queryKey: ['technician-reviews', reviewKey],
    queryFn: async () => {
      const { data } = await apiClient.get(API.TECHNICIAN_REVIEWS(reviewKey as number))
      return Array.isArray(data) ? data : []
    },
    enabled: !!reviewKey,
  })

  if (isLoading) {
    return (
      <PublicShell>
        <div className="container-app py-14"><Skeleton className="h-64 rounded-3xl" /></div>
      </PublicShell>
    )
  }

  if (!tech) {
    return (
      <PublicShell>
        <div className="container-app py-20 text-center">
          <h1 className="text-2xl font-bold text-[rgb(var(--fg))]">Artisan introuvable</h1>
          <p className="text-[rgb(var(--muted-fg))] mt-2">Ce profil n'existe pas ou n'est plus disponible.</p>
          <Link href="/artisans" className="inline-flex items-center gap-2 mt-5 text-brand-600 dark:text-brand-300 font-semibold">
            <ArrowLeft className="h-4 w-4" /> Tous les artisans
          </Link>
        </div>
      </PublicShell>
    )
  }

  const online = liveOnline ?? tech.is_online
  const primaryServiceId = tech.services?.[0]?.id

  const stats = [
    { icon: Star, label: 'Note moyenne', value: tech.rating > 0 ? tech.rating.toFixed(1) : '—' },
    { icon: CheckCircle2, label: 'Missions', value: String(tech.total_jobs_completed) },
    { icon: Briefcase, label: 'Avis', value: String(tech.total_reviews) },
    { icon: Wallet, label: 'Tarif horaire', value: tech.hourly_rate ? formatGNF(tech.hourly_rate) : 'Sur devis' },
  ]

  return (
    <PublicShell>
      <div className="container-app py-8 lg:py-12 space-y-8">
        <Link href="/artisans" className="inline-flex items-center gap-2 text-sm font-medium text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))]">
          <ArrowLeft className="h-4 w-4" /> Tous les artisans
        </Link>

        {/* En-tête profil */}
        <header className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative flex-shrink-0 mx-auto sm:mx-0">
              <Avatar
                src={resolveTechnicianAvatar(tech, 240)}
                alt={tech.name}
                fallback={getInitials(tech.name)}
                className="h-24 w-24 text-2xl rounded-2xl"
              />
              <span
                className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ring-4 ring-[rgb(var(--card))] ${online ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                aria-label={online ? 'En ligne' : 'Hors ligne'}
              />
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-[rgb(var(--fg))]">{tech.name}</h1>
                {tech.is_verified && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300">
                    <ShieldCheck className="h-3.5 w-3.5" /> Vérifié
                  </span>
                )}
              </div>
              <p className="text-[rgb(var(--muted-fg))] mt-1 inline-flex items-center gap-1.5 justify-center sm:justify-start">
                <Briefcase className="h-4 w-4" /> {tech.profession || 'Artisan'}
              </p>
              {(() => {
                const svc = tech.services?.[0] as any
                if (!svc?.specialty) return null
                return (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-sm font-semibold text-brand-600">
                    <Star className="h-3.5 w-3.5" />
                    {svc.specialty}
                    {svc.specialty_experience_years ? ` · ${svc.specialty_experience_years} an(s)` : ''}
                  </p>
                )
              })()}

              <div className="flex items-center gap-2 justify-center sm:justify-start mt-4 flex-wrap">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    tech.is_available
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-fg))]'
                  }`}
                >
                  {tech.is_available ? 'Disponible maintenant' : 'Actuellement occupé'}
                </span>
                <ContactArtisanButton technicianId={tech.id} serviceId={primaryServiceId} label="Entrer en contact" />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-[rgb(var(--muted))] p-3 text-center sm:text-left">
                <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-fg))] justify-center sm:justify-start">
                  <s.icon className="h-3.5 w-3.5" /> {s.label}
                </div>
                <div className="font-bold text-[rgb(var(--fg))] mt-1">{s.value}</div>
              </div>
            ))}
          </div>
        </header>

        {/* À propos (description) */}
        <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 lg:p-8">
          <h2 className="text-lg font-bold text-[rgb(var(--fg))]">À propos</h2>
          <p className="text-sm leading-relaxed text-[rgb(var(--muted-fg))] mt-3 whitespace-pre-line">
            {tech.bio?.trim()
              || `${tech.name.split(' ')[0]} est un artisan ${tech.profession || ''} sur SOSLocal.`}
          </p>
        </section>

        {/* Domaines (sous-services) — ce que l'artisan sait faire */}
        {(() => {
          const domains = ((tech as any).domains ?? []) as string[]
          if (!domains.length) return null
          return (
            <section className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-6 lg:p-8">
              <h2 className="text-lg font-bold text-[rgb(var(--fg))]">Domaines</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                {domains.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-sm font-semibold text-brand-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {d}
                  </span>
                ))}
              </div>
            </section>
          )
        })()}

        {/* Réalisations (galerie photos) */}
        {(() => {
          const photos = ((tech as any).portfolio_images ?? []) as string[]
          if (!photos.length) return null
          return (
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-[rgb(var(--fg))]">Réalisations</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <a key={i} href={src} target="_blank" rel="noopener noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))]">
                    <img src={src} alt={`Réalisation ${i + 1}`} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </a>
                ))}
              </div>
            </section>
          )
        })()}

        {/* Avis clients */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[rgb(var(--fg))]">Avis clients</h2>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              {tech.rating > 0 ? tech.rating.toFixed(1) : '—'}
              <span className="text-[rgb(var(--muted-fg))] font-normal">({tech.total_reviews} avis)</span>
            </span>
          </div>
          {reviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[rgb(var(--border))] p-8 text-center text-sm text-[rgb(var(--muted-fg))]">
              Aucun avis pour le moment. Soyez le premier à faire appel à {tech.name.split(' ')[0]} !
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {reviews.slice(0, 6).map((r: any) => (
                <div key={r.id} className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[rgb(var(--fg))]">
                      {r.reviewer_name ?? r.reviewer?.name ?? 'Client'}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-amber-500 text-sm font-semibold">
                      <Star className="h-3.5 w-3.5 fill-current" /> {Number(r.rating ?? 0).toFixed(1)}
                    </span>
                  </div>
                  {(r.comment ?? r.content) && (
                    <p className="text-sm text-[rgb(var(--muted-fg))] mt-2 inline-flex gap-1.5">
                      <Quote className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 opacity-50" />
                      <span>{r.comment ?? r.content}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Services proposés */}
        {tech.services && tech.services.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-[rgb(var(--fg))]">Services proposés</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tech.services.map((s: any) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug ?? s.id}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                >
                  <span className="h-10 w-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center flex-shrink-0">
                    <ServiceIcon slug={s.slug} name={s.name} className="h-5 w-5" />
                  </span>
                  <span className="font-semibold text-sm text-[rgb(var(--fg))] truncate">{s.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bandeau de mise en relation */}
        <section className="rounded-3xl border border-[rgb(var(--border))] bg-brand-50 dark:bg-brand-900/20 p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold text-[rgb(var(--fg))]">Besoin de {tech.name.split(' ')[0]} ?</h2>
            <p className="text-sm text-[rgb(var(--muted-fg))] mt-1 inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Décrivez votre besoin, on s'occupe du reste.
            </p>
          </div>
          <ContactArtisanButton technicianId={tech.id} serviceId={primaryServiceId} label="Entrer en contact" />
        </section>
      </div>
    </PublicShell>
  )
}
