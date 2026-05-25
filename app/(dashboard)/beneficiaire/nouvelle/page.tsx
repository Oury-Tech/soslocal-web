'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, MapPin, Camera, AlertCircle,
  CheckCircle2, Sparkles, Upload, ShieldCheck, Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useServices } from '@/hooks/queries/useServices'
import { useCreateRequest } from '@/hooks/queries/useRequests'
import { useTechnician } from '@/hooks/queries/useTechnicians'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils/cn'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { CONAKRY_CENTER } from '@/lib/constants'

/* ──────────────────────────────────────────────────────────────
   When a technician is pre-selected (came from artisans page):
     Steps: Description → Localisation → Confirmation  (3 steps)
   Otherwise (open request, no technician):
     Steps: Service → Description → Localisation → Confirmation (4 steps)
────────────────────────────────────────────────────────────── */

function NouvelleDemande() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const techParam    = searchParams.get('technician')
  const serviceParam = searchParams.get('service')

  const techId    = techParam    ? Number(techParam)    : undefined
  const serviceId = serviceParam ? Number(serviceParam) : undefined

  /* Pre-selected technician */
  const { data: preselectedTech, isLoading: techLoading } = useTechnician(techId)

  /* Mode: artisan-first (tech chosen) vs open request */
  const artisanFirst = !!techId

  const STEPS_ARTISAN = ['Problème', 'Localisation', 'Confirmation'] as const
  const STEPS_OPEN    = ['Service', 'Problème', 'Localisation', 'Confirmation'] as const
  const STEPS         = artisanFirst ? STEPS_ARTISAN : STEPS_OPEN

  const { user }            = useAuthStore()
  const { data: services }  = useServices()
  const createRequest       = useCreateRequest()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    service_id:  serviceId ?? 0,
    title:       '',
    description: '',
    priority:    'normal' as 'normal' | 'high' | 'emergency',
    latitude:    user?.latitude  || CONAKRY_CENTER.lat,
    longitude:   user?.longitude || CONAKRY_CENTER.lng,
    address:     '',
  })

  const selectedService = services?.find((s) => s.id === form.service_id)
    ?? (preselectedTech?.services?.[0])

  /* Validation per step */
  const canNext = artisanFirst
    ? (step === 0 && form.description.length >= 10) ||
      (step === 1 && form.latitude !== 0 && form.longitude !== 0) ||
      step === 2
    : (step === 0 && form.service_id > 0) ||
      (step === 1 && form.description.length >= 10) ||
      (step === 2 && form.latitude !== 0 && form.longitude !== 0) ||
      step === 3

  async function handleSubmit() {
    const svcId = form.service_id || (preselectedTech?.services?.[0]?.id ?? 0)
    if (!svcId) {
      toast.error('Aucun service associé à cet artisan.')
      return
    }
    try {
      const result = await createRequest.mutateAsync({
        service_id:     svcId,
        technician_id:  techId,
        title:          form.title || form.description.slice(0, 60),
        description:    form.description,
        latitude:       form.latitude,
        longitude:      form.longitude,
        address:        form.address,
        priority:       form.priority,
        estimated_price: selectedService?.estimated_price_min ?? 100_000,
        photos:         [],
      })
      router.push(`/beneficiaire/demandes/${result.id}/succes`)
    } catch {
      toast.error('Erreur lors de la création de la demande.')
    }
  }

  /* ── Confirmation step content (last step) ── */
  const lastStep = STEPS.length - 1

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      {/* Title */}
      <div>
        <h1 className="font-display text-3xl font-extrabold">Nouvelle demande</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {artisanFirst
            ? 'Décrivez votre problème — votre artisan s'en charge.'
            : 'Décrivez votre besoin en quelques étapes simples.'}
        </p>
      </div>

      {/* Selected technician banner */}
      {artisanFirst && (
        <Card className="p-4 border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/20">
          {techLoading ? (
            <div className="flex items-center gap-3">
              <Spinner className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">Chargement de l'artisan…</span>
            </div>
          ) : preselectedTech ? (
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                {preselectedTech.avatar_url ? (
                  <img src={preselectedTech.avatar_url} className="w-10 h-10 rounded-full object-cover" alt={preselectedTech.name} />
                ) : (
                  <Avatar fallback={getInitials(preselectedTech.name)} size="md" />
                )}
                {preselectedTech.is_available && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="font-semibold text-sm truncate">{preselectedTech.name}</p>
                  {preselectedTech.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{preselectedTech.profession}</p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="font-semibold">{preselectedTech.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">· {preselectedTech.total_reviews} avis</span>
                </div>
              </div>
              <Badge variant="primary" className="flex-shrink-0 text-xs">Artisan choisi</Badge>
            </div>
          ) : null}
        </Card>
      )}

      {/* Progress bar */}
      <Card className="p-4">
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                  i < step  && 'bg-brand-500 text-white',
                  i === step && 'bg-brand-500 text-white ring-4 ring-brand-200 dark:ring-brand-900',
                  i > step  && 'bg-muted text-muted-foreground'
                )}>
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <div className={cn('text-[11px] mt-1.5 font-medium text-center', i <= step ? 'text-foreground' : 'text-muted-foreground')}>
                  {label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-0.5 flex-1 -mt-6 transition-colors', i < step ? 'bg-brand-500' : 'bg-muted')} />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step content */}
      <Card className="p-6 lg:p-8">
        <AnimatePresence mode="wait">

          {/* ── OPEN REQUEST: Service selection ── */}
          {!artisanFirst && step === 0 && (
            <motion.div key="svc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-xl font-bold">Quel service vous faut-il ?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {services?.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setForm({ ...form, service_id: s.id })}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all hover:shadow-soft',
                      form.service_id === s.id
                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 ring-2 ring-accent-500/20'
                        : 'border-border hover:border-border/80'
                    )}
                  >
                    <div className="text-3xl mb-2">{s.icon}</div>
                    <div className="font-semibold text-sm">{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.category}</div>
                    {s.is_emergency && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-red-500">
                        <AlertCircle className="h-2.5 w-2.5" /> Urgence 24h
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Description (step 0 artisan-first, step 1 open) ── */}
          {((artisanFirst && step === 0) || (!artisanFirst && step === 1)) && (
            <motion.div key="desc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-xl font-bold">Décrivez votre problème</h2>

              {selectedService && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <span className="text-2xl">{selectedService.icon}</span>
                  <div>
                    <div className="font-semibold text-sm">{selectedService.name}</div>
                    {selectedService.estimated_price_min && (
                      <div className="text-xs text-muted-foreground">
                        Tarif habituel : {formatGNF(selectedService.estimated_price_min)} – {formatGNF(selectedService.estimated_price_max ?? 0)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1.5 text-sm font-medium">
                  Décrivez le problème <span className="text-muted-foreground">(min. 10 caractères)</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Ex : Ma douche fuit depuis hier soir, l'eau coule sous le carrelage…"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white dark:bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {form.description.length}/500 · Le devis sera fixé par l'artisan après évaluation.
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Priorité</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'high', 'emergency'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm({ ...form, priority: p })}
                      className={cn(
                        'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                        form.priority === p ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20' : 'border-border'
                      )}
                    >
                      {p === 'normal'    && '🟢 Normale'}
                      {p === 'high'      && '🟡 Élevée'}
                      {p === 'emergency' && '🔴 Urgence'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos placeholder */}
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Photos (optionnel)</p>
                <p className="text-xs text-muted-foreground mt-1">Jusqu'à 5 photos · Max 5 Mo</p>
                <Button variant="outline" size="sm" className="mt-3">
                  <Upload className="h-4 w-4" /> Ajouter
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Localisation ── */}
          {((artisanFirst && step === 1) || (!artisanFirst && step === 2)) && (
            <motion.div key="loc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-xl font-bold">Où aura lieu l'intervention ?</h2>

              <Input
                label="Adresse"
                icon={<MapPin className="h-4 w-4" />}
                placeholder="Ex: Quartier Dixinn, Cité des Nations"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  label="Latitude"
                  step="0.0001"
                  value={form.latitude}
                  onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) })}
                />
                <Input
                  type="number"
                  label="Longitude"
                  step="0.0001"
                  value={form.longitude}
                  onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) })}
                />
              </div>

              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => {
                  if (!navigator.geolocation) return
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude })
                      toast.success('Position mise à jour')
                    },
                    () => toast.error('Impossible de récupérer la position')
                  )
                }}
              >
                <MapPin className="h-4 w-4" />
                Utiliser ma position GPS
              </Button>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-sm">
                <Sparkles className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
                <p className="text-brand-900 dark:text-brand-100">
                  La position est pré-remplie avec votre dernier emplacement connu.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Confirmation ── */}
          {step === lastStep && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-xl font-bold">Récapitulatif</h2>

              <div className="space-y-0">
                {[
                  artisanFirst
                    ? { label: 'Artisan',    value: preselectedTech ? `${preselectedTech.name} — ${preselectedTech.profession}` : '—' }
                    : { label: 'Service',    value: selectedService ? `${selectedService.icon} ${selectedService.name}` : '—' },
                  { label: 'Problème',  value: form.description },
                  { label: 'Priorité',  value: form.priority === 'normal' ? '🟢 Normale' : form.priority === 'high' ? '🟡 Élevée' : '🔴 Urgence' },
                  { label: 'Adresse',   value: form.address || 'Position GPS uniquement' },
                  { label: 'Devis',     value: 'Fixé par l'artisan après évaluation' },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-border last:border-0 gap-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide sm:w-28 flex-shrink-0 pt-0.5">{row.label}</div>
                    <div className="text-sm flex-1">{row.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 text-sm">
                <CheckCircle2 className="h-4 w-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                <p className="text-accent-900 dark:text-accent-100">
                  {preselectedTech
                    ? `Votre demande sera envoyée directement à ${preselectedTech.name}. Il vous fixera un devis et vous serez notifié dès acceptation.`
                    : "Votre demande sera diffusée aux artisans disponibles à proximité. Vous serez notifié dès qu'un artisan accepte."}
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>

          {step < lastStep ? (
            <Button variant="accent" size="md" disabled={!canNext} onClick={() => setStep(step + 1)}>
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="accent"
              size="md"
              loading={createRequest.isPending}
              onClick={handleSubmit}
            >
              <Sparkles className="h-4 w-4" />
              {preselectedTech ? `Envoyer à ${preselectedTech.name.split(' ')[0]}` : 'Envoyer la demande'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

export default function NouvelleDemandePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>}>
      <NouvelleDemande />
    </Suspense>
  )
}
