'use client'

import { useState, Suspense, useMemo, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, MapPin, Camera, AlertCircle,
  CheckCircle2, Send, Upload, ShieldCheck, Star, Lock, X, Loader2,
  Navigation, ChevronDown, Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge, Avatar, Spinner } from '@/components/ui/badge'
import { useServices } from '@/hooks/queries/useServices'
import { useCreateRequest } from '@/hooks/queries/useRequests'
import { useUploadMedia } from '@/hooks/queries/useUpload'
import { useTechnician, useNearbyTechnicians } from '@/hooks/queries/useTechnicians'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils/cn'
import { ServiceIcon, ServiceTag } from '@/lib/utils/service-icons'
import { formatGNF, getInitials } from '@/lib/utils/format'
import { resolveTechnicianAvatar } from '@/lib/utils/technician-photos'
import { CONAKRY_CENTER } from '@/lib/constants'

/* ──────────────────────────────────────────────────────────────
   Flux UNIQUE et cohérent en 5 étapes, identique pour tout le monde
   (plus de variante 3/4 étapes qui créait des incohérences) :
     1. Service        — quel métier
     2. Artisan        — choisir un artisan disponible pour ce service
     3. Problème       — description + photos
     4. Localisation   — adresse + GPS
     5. Confirmation   — récapitulatif

   Les liens entrants (?service=, ?technician=) pré-remplissent les
   premières étapes et démarrent directement à l'étape utile, mais le
   parcours reste structurellement le même.
────────────────────────────────────────────────────────────── */

const STEPS = ['Service', 'Artisan', 'Problème', 'Localisation', 'Confirmation'] as const

function NouvelleDemande() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const techParam    = searchParams.get('technician')
  const serviceParam = searchParams.get('service')

  const techId    = techParam    ? Number(techParam)    : undefined
  const serviceParamId = serviceParam ? Number(serviceParam) : undefined

  /* Artisan pré-sélectionné via un lien (page artisans) */
  const { data: preselectedTech, isLoading: techLoading } = useTechnician(techId)

  const { user }            = useAuthStore()
  const { data: services }  = useServices()
  const createRequest       = useCreateRequest()
  const uploadMedia         = useUploadMedia()
  const photoInputRef       = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>([])

  // Artisans à proximité (pour connaître les services couverts ET lister les
  // artisans disponibles à l'étape 2).
  const { data: technicians = [], isLoading: techsLoading } = useNearbyTechnicians(
    user?.latitude  ?? CONAKRY_CENTER.lat,
    user?.longitude ?? CONAKRY_CENTER.lng,
  )
  const activeServiceIds = useMemo(() => {
    const ids = new Set<number>()
    technicians.forEach((t) => t.services?.forEach((s: any) => ids.add(s.id)))
    return ids
  }, [technicians])

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    service_id:    serviceParamId ?? 0,
    technician_id: techId ?? 0,
    title:         '',
    description:   '',
    priority:      'normal' as 'normal' | 'emergency',
    latitude:      user?.latitude  || CONAKRY_CENTER.lat,
    longitude:     user?.longitude || CONAKRY_CENTER.lng,
    address:       '',
  })

  // Localisation : état lisible pour un client non-technique.
  const [geoLoading, setGeoLoading]   = useState(false)
  const [posConfirmed, setPosConfirmed] = useState<boolean>(!!(user?.latitude && user?.longitude))
  const [showManual, setShowManual]   = useState(false)

  function useMyLocation() {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas disponible sur cet appareil.")
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }))
        setPosConfirmed(true)
        setGeoLoading(false)
        toast.success('Position localisée avec précision')
      },
      () => {
        setGeoLoading(false)
        toast.error("Activez la localisation, ou saisissez votre adresse ci-dessous.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60_000 },
    )
  }

  // Brouillon : conserve la saisie au retour dans le wizard.
  const draftKey = `soslocal:nd:${techId ?? 'open'}:${serviceParamId ?? '0'}`
  const draftRestored = useRef(false)
  useEffect(() => {
    if (draftRestored.current) return
    draftRestored.current = true
    try {
      const raw = sessionStorage.getItem(draftKey)
      if (!raw) return
      const d = JSON.parse(raw)
      if (d.form) setForm((f) => ({ ...f, ...d.form }))
      if (typeof d.step === 'number') setStep(Math.min(Math.max(0, d.step), STEPS.length - 1))
      if (Array.isArray(d.photos)) setPhotos(d.photos)
    } catch { /* brouillon illisible → ignoré */ }
  }, [draftKey])
  useEffect(() => {
    if (!draftRestored.current) return
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ form, step, photos }))
    } catch { /* quota/SSR → ignoré */ }
  }, [draftKey, form, step, photos])

  // Pré-remplissage depuis un artisan choisi sur la page artisans :
  // on fixe service + artisan et on démarre à l'étape « Problème ».
  const seeded = useRef(false)
  useEffect(() => {
    if (seeded.current) return
    if (preselectedTech) {
      seeded.current = true
      const svc = preselectedTech.services?.[0]?.id ?? 0
      setForm((f) => ({
        ...f,
        technician_id: preselectedTech.id,
        service_id: f.service_id || svc,
      }))
      // Ne pas écraser une reprise de brouillon plus avancée.
      setStep((s) => (s > 0 ? s : 2))
    } else if (serviceParamId && !techId) {
      // Service pré-choisi → on démarre à l'étape « Artisan ».
      setStep((s) => (s > 0 ? s : 1))
    }
  }, [preselectedTech, serviceParamId, techId])

  const selectedService = services?.find((s) => s.id === form.service_id)

  // Artisans disponibles pour le service choisi.
  const availableArtisans = useMemo(() => {
    if (!form.service_id) return []
    return technicians.filter(
      (t) => t.is_available && t.services?.some((s: any) => s.id === form.service_id),
    )
  }, [technicians, form.service_id])

  const selectedArtisan = useMemo(
    () => technicians.find((t) => t.id === form.technician_id) ?? (preselectedTech || null),
    [technicians, form.technician_id, preselectedTech],
  )

  /* Validation par étape */
  const canNext =
    (step === 0 && form.service_id > 0) ||
    (step === 1 && form.technician_id > 0) ||
    (step === 2 && form.description.length >= 10) ||
    (step === 3 && form.latitude !== 0 && form.longitude !== 0) ||
    step === 4

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return
    const remaining = 5 - photos.length
    if (remaining <= 0) {
      toast.error('Maximum 5 photos.')
      return
    }
    const toUpload = files.slice(0, remaining)
    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" n'est pas une image.`)
        continue
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error(`"${file.name}" dépasse 8 Mo.`)
        continue
      }
      try {
        const { url } = await uploadMedia.mutateAsync(file)
        setPhotos((prev) => [...prev, url])
      } catch {
        toast.error(`Échec de l'envoi de "${file.name}".`)
      }
    }
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((u) => u !== url))
  }

  // Garde synchrone : empêche un double-clic de créer deux demandes.
  const submitLockRef = useRef(false)
  async function handleSubmit() {
    if (submitLockRef.current || createRequest.isPending) return
    if (!form.service_id) {
      toast.error('Veuillez sélectionner un service.')
      setStep(0)
      return
    }
    if (!form.technician_id) {
      toast.error('Veuillez choisir un artisan disponible.')
      setStep(1)
      return
    }
    submitLockRef.current = true
    try {
      const result = await createRequest.mutateAsync({
        service_id:      form.service_id,
        technician_id:   form.technician_id,
        title:           form.title || form.description.slice(0, 60),
        description:     form.description,
        latitude:        form.latitude,
        longitude:       form.longitude,
        address:         form.address,
        priority:        form.priority,
        // 💡 Aucun montant à la création : l'artisan fixe son prix en acceptant.
        media_urls:      photos,
      })
      try { sessionStorage.removeItem(draftKey) } catch { /* ignore */ }
      router.push(`/beneficiaire/demandes/${result.id}/succes`)
    } catch {
      toast.error('Erreur lors de la création de la demande.')
      submitLockRef.current = false
    }
  }

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
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Nouvelle demande</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Décrivez votre besoin en 5 étapes simples.
        </p>
      </div>

      {/* Progress bar */}
      <Card className="p-3 sm:p-4 overflow-x-auto">
        <div className="flex items-center min-w-[320px]">
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
                <div className={cn('text-[10px] sm:text-[11px] mt-1.5 font-medium text-center', i <= step ? 'text-foreground' : 'text-muted-foreground')}>
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
      <Card className="p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">

          {/* ── 1. Service ── */}
          {step === 0 && (
            <motion.div key="svc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Quel service vous faut-il ?</h2>
                <p className="text-sm text-muted-foreground mt-1">Uniquement les services avec artisans disponibles</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {services?.map((s) => {
                  const hasArtisan = activeServiceIds.size === 0 || activeServiceIds.has(s.id)
                  const selected = form.service_id === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (!hasArtisan) return
                        // Changer de service réinitialise l'artisan choisi.
                        setForm({ ...form, service_id: s.id, technician_id: s.id === form.service_id ? form.technician_id : 0 })
                      }}
                      disabled={!hasArtisan}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all relative',
                        selected
                          ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 ring-2 ring-accent-500/20'
                          : hasArtisan
                          ? 'border-border hover:border-brand-300 hover:shadow-soft'
                          : 'border-border opacity-40 cursor-not-allowed'
                      )}
                    >
                      <ServiceIcon slug={s.slug} name={s.name} className="h-8 w-8 mb-2 text-brand-500" />
                      <div className="font-semibold text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.category}</div>
                      {!hasArtisan && (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Lock className="h-2.5 w-2.5" /> Aucun artisan
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── 2. Artisan disponible ── */}
          {step === 1 && (
            <motion.div key="artisan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Choisissez un artisan</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Artisans disponibles pour {selectedService?.name ?? 'ce service'}
                </p>
              </div>

              {(techLoading || techsLoading) ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner className="h-6 w-6" />
                </div>
              ) : availableArtisans.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Aucun artisan disponible pour ce service.</p>
                  <Button variant="outline" size="sm" onClick={() => setStep(0)}>Changer de service</Button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {availableArtisans.map((t, idx) => {
                    const selected = form.technician_id === t.id
                    const recommended = idx === 0 // liste déjà triée par score (meilleur + plus proche)
                    const spec = (t.services?.[0] as any)?.specialty
                    return (
                      <button
                        key={t.id}
                        onClick={() => setForm({ ...form, technician_id: t.id })}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border-2 text-left transition-all',
                          selected
                            ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 ring-2 ring-accent-500/20'
                            : 'border-border hover:border-brand-300 hover:shadow-soft',
                        )}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar
                            src={resolveTechnicianAvatar(t)}
                            alt={t.name}
                            fallback={getInitials(t.name)}
                            className="h-11 w-11 text-sm"
                          />
                          {t.is_available && (
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-sm truncate">{t.name}</p>
                            {t.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-brand-500 flex-shrink-0" />}
                            {recommended && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                <Sparkles className="h-2.5 w-2.5" /> Recommandé
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{spec || t.profession}</p>
                          {selectedService && (
                            <div className="mt-1">
                              <ServiceTag slug={selectedService.slug} name={selectedService.name} size="sm" />
                            </div>
                          )}
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-amber-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="font-semibold">{(t.rating ?? 0).toFixed(1)}</span>
                            <span className="text-muted-foreground">
                              · {t.total_reviews ?? 0} avis · {(t as any).total_jobs_completed ?? 0} mission{((t as any).total_jobs_completed ?? 0) > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        {selected && <CheckCircle2 className="h-5 w-5 text-accent-600 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── 3. Problème ── */}
          {step === 2 && (
            <motion.div key="desc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold">Décrivez votre problème</h2>

              {selectedService && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <ServiceIcon slug={selectedService.slug} name={selectedService.name} className="h-7 w-7 text-brand-500" />
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
                  {form.description.length}/500 · Le prix sera annoncé par l'artisan en acceptant.
                </p>
              </div>

              {/* Priorité / urgence */}
              <div>
                <label className="block text-sm font-medium mb-2">Niveau d'urgence</label>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { v: 'normal' as const, label: 'Normale', desc: 'Intervention planifiée' },
                    { v: 'emergency' as const, label: 'Urgente', desc: 'Au plus vite' },
                  ]).map((opt) => {
                    const active = form.priority === opt.v
                    return (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setForm({ ...form, priority: opt.v })}
                        className={`rounded-lg border p-3 text-left transition-all ${
                          active
                            ? 'border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/30'
                            : 'border-border bg-white dark:bg-muted hover:border-brand-400'
                        }`}
                      >
                        <span className={`block text-sm font-semibold ${active ? 'text-brand-600' : 'text-foreground'}`}>
                          {opt.label}
                        </span>
                        <span className="block text-xs text-muted-foreground mt-0.5">{opt.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Photos */}
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Photos (optionnel)</p>
                <p className="text-xs text-muted-foreground mt-1">Jusqu'à 5 photos · Max 8 Mo</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  disabled={uploadMedia.isPending || photos.length >= 5}
                  onClick={() => photoInputRef.current?.click()}
                >
                  {uploadMedia.isPending
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</>
                    : <><Upload className="h-4 w-4" /> Ajouter</>}
                </Button>

                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {photos.map((url) => (
                      <div key={url} className="relative group aspect-square">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Photo" className="h-full w-full object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removePhoto(url)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── 4. Localisation ── */}
          {step === 3 && (
            <motion.div key="loc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">Où aura lieu l'intervention ?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Partagez votre position pour que l'artisan vous trouve facilement.
                </p>
              </div>

              {/* Action principale : localisation en un clic */}
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                loading={geoLoading}
                onClick={useMyLocation}
              >
                <Navigation className="h-5 w-5" />
                {posConfirmed ? 'Actualiser ma position' : 'Localiser ma position'}
              </Button>

              {/* Retour d'état clair, lisible par tout le monde */}
              {posConfirmed ? (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="h-9 w-9 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">Position enregistrée</p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      L'artisan saura exactement où se rendre.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/50 border border-border">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Touchez le bouton ci-dessus, ou indiquez simplement votre adresse.
                  </p>
                </div>
              )}

              {/* Adresse en clair : champ humain, pas de coordonnées */}
              <Input
                label="Adresse ou point de repère"
                icon={<MapPin className="h-4 w-4" />}
                placeholder="Ex: Quartier Dixinn, près de la pharmacie"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              {/* Coordonnées exactes repliées : réservées aux utilisateurs avancés */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowManual((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform', showManual && 'rotate-180')} />
                  Saisir les coordonnées manuellement
                </button>

                {showManual && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <Input
                      type="number"
                      label="Latitude"
                      step="0.0001"
                      value={form.latitude}
                      onChange={(e) => {
                        setForm({ ...form, latitude: parseFloat(e.target.value) })
                        setPosConfirmed(true)
                      }}
                    />
                    <Input
                      type="number"
                      label="Longitude"
                      step="0.0001"
                      value={form.longitude}
                      onChange={(e) => {
                        setForm({ ...form, longitude: parseFloat(e.target.value) })
                        setPosConfirmed(true)
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── 5. Confirmation ── */}
          {step === 4 && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold">Récapitulatif</h2>

              <div className="space-y-0">
                {[
                  { label: 'Service',  value: selectedService ? selectedService.name : '—' },
                  { label: 'Artisan',  value: selectedArtisan ? `${selectedArtisan.name} — ${selectedArtisan.profession}` : '—' },
                  { label: 'Problème', value: form.description },
                  { label: 'Adresse',  value: form.address || 'Position GPS uniquement' },
                  { label: 'Prix',     value: "Annoncé par l'artisan en acceptant (négociable)" },
                ].map((row) => (
                  <div key={row.label} className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-border last:border-0 gap-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide sm:w-28 flex-shrink-0 pt-0.5">{row.label}</div>
                    <div className="text-sm flex-1 break-words">{row.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 text-sm">
                <CheckCircle2 className="h-4 w-4 text-accent-600 dark:text-accent-400 flex-shrink-0 mt-0.5" />
                <p className="text-accent-900 dark:text-accent-100">
                  {selectedArtisan
                    ? `Votre demande sera envoyée à ${selectedArtisan.name}. Il vous annoncera son prix en acceptant, et vous pourrez négocier avant de payer.`
                    : "Votre demande sera envoyée à l'artisan choisi. Vous serez notifié dès qu'il accepte."}
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-border flex-wrap">
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
              <Send className="h-4 w-4" />
              {selectedArtisan ? `Envoyer à ${selectedArtisan.name.split(' ')[0]}` : 'Envoyer la demande'}
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
