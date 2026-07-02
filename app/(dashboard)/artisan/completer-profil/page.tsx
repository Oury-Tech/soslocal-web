'use client'

/**
 * Assistant de complétion du profil artisan (web).
 * Un technicien exerce UN SEUL métier (pas de polyvalence) : métier →
 * spécialité (+ expérience) → description auto-suggérée & éditable.
 * Bloquant tant que non complété (cf. auth-guard). Ré-éditable + export.
 */
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles, Loader2, Download, ImagePlus, X, Briefcase, DownloadCloud, Check, Plus } from 'lucide-react'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { useServices } from '@/hooks/queries/useServices'
import { useAuthStore } from '@/stores/auth.store'

export default function CompleterProfilPage() {
  const router = useRouter()
  const { user, technicianApproved, refreshTechnicianStatus } = useAuthStore()
  const { data: services = [], isLoading } = useServices()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  // Métier verrouillé = celui choisi à l'inscription : on ne le redemande pas.
  const [lockedName, setLockedName] = useState<string | null>(null)
  const [changing, setChanging] = useState(false)
  // Domaines (sous-services) du métier : options prédéfinies + sélection + « Autre ».
  const [domainOptions, setDomainOptions] = useState<string[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [customDomain, setCustomDomain] = useState('')
  const [years, setYears] = useState('')
  const [bio, setBio] = useState('')
  const [bioTouched, setBioTouched] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)

  const norm = (x?: string) =>
    (x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

  useEffect(() => {
    if (isLoading) return
    apiClient.get(API.ARTISAN_ME).then(({ data }) => {
      const first = (data?.services ?? [])[0] // un seul métier
      let svcId: number | null = first?.id ?? null
      let svcName: string | null = first?.name ?? null
      // Repli : retrouver le service par la profession choisie à l'inscription.
      if (svcId == null && data?.profession) {
        const m = services.find(
          (sv) =>
            norm(sv.name) === norm(data.profession) ||
            norm(data.profession).includes(norm(sv.name)) ||
            norm(sv.name).includes(norm(data.profession)),
        )
        if (m) { svcId = m.id; svcName = m.name }
      }
      if (svcId != null) {
        setSelectedId(svcId)
        setLockedName(svcName ?? services.find((s) => s.id === svcId)?.name ?? null)
        loadDomainOptions(svcId)
      }
      // Domaines déjà déclarés (repli : ancienne spécialité libre).
      if (Array.isArray(data?.domains) && data.domains.length) setDomains(data.domains)
      else if (first?.specialty) setDomains([first.specialty])
      if (first) {
        setYears(first.specialty_experience_years != null ? String(first.specialty_experience_years) : '')
      }
      if (data?.bio) { setBio(data.bio); setBioTouched(true) }
      if (Array.isArray(data?.portfolio_images)) setPhotos(data.portfolio_images)
    }).catch(() => { /* premier onboarding */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, services])

  // Sélection MULTIPLE : on peut choisir plusieurs réalisations d'un coup.
  const addPhotos = async (files: FileList) => {
    const remaining = 8 - photos.length
    if (remaining <= 0) { toast.error('Maximum 8 photos.'); return }
    const list = Array.from(files).slice(0, remaining)
    setUploadingPhoto(true)
    try {
      let latest = photos
      for (const file of list) {
        const fd = new FormData()
        fd.append('file', file)
        const { data } = await apiClient.post('/technicians/me/portfolio', fd, { headers: { 'Content-Type': undefined } as any })
        latest = data.portfolio_images ?? latest
        setPhotos(latest)
      }
      toast.success(`${list.length} photo(s) ajoutée(s)`)
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Envoi impossible.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Domaines prédéfinis d'un métier (repli silencieux → « Autre »).
  const loadDomainOptions = async (serviceId: number) => {
    try {
      const { data } = await apiClient.get(`/services/${serviceId}/domains`)
      setDomainOptions(Array.isArray(data?.domains) ? data.domains : [])
    } catch { setDomainOptions([]) }
  }
  const toggleDomain = (d: string) =>
    setDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  const addCustomDomain = () => {
    const v = customDomain.trim()
    if (!v) return
    if (!domains.includes(v)) setDomains((prev) => [...prev, v])
    if (!domainOptions.includes(v)) setDomainOptions((prev) => [...prev, v])
    setCustomDomain('')
  }

  // « Importer / auto-remplir » : régénère la description depuis les infos connues.
  const autoFill = () => {
    setBioTouched(false)
    setBio(computeSummary())
    toast.success('Infos importées — complétez si besoin.')
  }
  const removePhoto = async (url: string) => {
    try {
      const { data } = await apiClient.delete('/technicians/me/portfolio', { data: { url } })
      setPhotos(data.portfolio_images ?? photos.filter((p) => p !== url))
    } catch { toast.error('Suppression impossible.') }
  }

  const grouped = useMemo(() => {
    const g: Record<string, typeof services> = {}
    for (const sv of services) (g[(sv as any).category || 'Autres'] ||= []).push(sv)
    return g
  }, [services])

  const selectedName = services.find((x) => x.id === selectedId)?.name

  const computeSummary = () => {
    const who = user?.name?.split(' ')[0]
    const parts: string[] = []
    if (selectedName) parts.push(`${who ? who + ', a' : 'A'}rtisan ${selectedName}.`)
    if (domains.length) parts.push(`Spécialités : ${domains.join(', ')}.`)
    if (years) parts.push(`${years} an(s) d'expérience.`)
    return parts.join(' ')
  }

  // La description se rédige automatiquement à partir du métier / des domaines,
  // tant que l'artisan ne l'a pas éditée lui-même.
  useEffect(() => {
    if (!bioTouched) setBio(computeSummary())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, domains.join('|'), years])

  const exportData = () => {
    const payload = {
      nom: user?.name, email: user?.email, telephone: (user as any)?.phone,
      metier: selectedName ?? null, domaines: domains,
      experience_annees: years ? Number(years) : null, a_propos: bio.trim() || null,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'profil-artisan-soslocal.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Informations exportées')
  }

  const submit = async () => {
    if (selectedId == null) { toast.error('Choisissez votre métier.'); return }
    setSaving(true)
    try {
      await apiClient.put('/technicians/me/onboarding', {
        bio: bio.trim() || undefined,
        skills: [],
        domains,
        services: [{
          service_id: selectedId,
          experience_years: years ? Number(years) : undefined,
        }],
      })
      await refreshTechnicianStatus()
      toast.success('Profil enregistré')
      router.replace(technicianApproved ? '/artisan' : '/artisan/en-attente')
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? 'Échec de l’enregistrement.')
      setSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Complétez votre profil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Votre métier est défini à l'inscription. Cochez vos domaines et ajoutez vos réalisations — la description est automatique.
        </p>
      </div>

      {/* Import / auto-remplissage */}
      <button type="button" onClick={autoFill}
        className="w-full h-11 rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-600 font-semibold flex items-center justify-center gap-2 hover:bg-brand-500/15 transition">
        <DownloadCloud className="h-4 w-4" /> Importer mes infos automatiquement
      </button>

      {/* 1. Métier — verrouillé sur le choix de l'inscription */}
      <section className="space-y-3">
        <h2 className="font-semibold text-foreground">1 · Mon métier</h2>
        {lockedName && !changing ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-brand-600" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{lockedName}</p>
                <p className="text-xs text-muted-foreground">Défini à l'inscription</p>
              </div>
            </div>
            <button type="button" onClick={() => setChanging(true)} className="text-sm font-semibold text-brand-600 shrink-0">
              Changer
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Sélectionnez le service que vous exercez (un seul).</p>
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat} className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {list.map((sv) => {
                    const on = selectedId === sv.id
                    return (
                      <button key={sv.id} type="button" onClick={() => { setSelectedId(sv.id); setLockedName(sv.name); setChanging(false); setDomains([]); loadDomainOptions(sv.id) }}
                        className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                          on ? 'bg-brand-500 border-brand-500 text-white' : 'bg-card border-border text-foreground hover:border-brand-400'
                        }`}>
                        {sv.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </section>

      {/* 2. Domaines (sous-services) — cochés, + « Autre » */}
      {selectedId != null && (
        <section className="space-y-3">
          <h2 className="font-semibold text-foreground">2 · Mes domaines</h2>
          <p className="text-sm text-muted-foreground">Cochez ce que vous savez faire dans « {selectedName} ». Le client le verra.</p>
          <div className="flex flex-wrap gap-2">
            {domainOptions.map((d) => {
              const on = domains.includes(d)
              return (
                <button key={d} type="button" onClick={() => toggleDomain(d)}
                  className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                    on ? 'bg-brand-500 border-brand-500 text-white' : 'bg-card border-border text-foreground hover:border-brand-400'
                  }`}>
                  {on && <Check className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}{d}
                </button>
              )
            })}
          </div>
          {/* Autre (préciser) — jamais bloqué si un domaine manque */}
          <div className="flex items-center gap-2">
            <input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} maxLength={40}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomDomain() } }}
              placeholder="Autre domaine (préciser)"
              className="flex-1 h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button type="button" onClick={addCustomDomain} aria-label="Ajouter le domaine"
              className="h-11 w-11 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 shrink-0">
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <input value={years} onChange={(e) => setYears(e.target.value.replace(/[^\d]/g, ''))} maxLength={2} inputMode="numeric"
            placeholder="Années d'expérience (optionnel)"
            className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </section>
      )}

      {/* 3. Description */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">3 · Ma description</h2>
          <button type="button" onClick={() => setBio(computeSummary())} className="flex items-center gap-1.5 text-sm font-semibold text-brand-600">
            <Sparkles className="h-4 w-4" /> Régénérer
          </button>
        </div>
        <textarea value={bio} onChange={(e) => { setBio(e.target.value); setBioTouched(true) }} rows={5} maxLength={1000}
          placeholder="Présentez-vous en quelques lignes…"
          className="w-full px-3 py-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
      </section>

      {/* 4. Réalisations (galerie photos) */}
      <section className="space-y-3">
        <h2 className="font-semibold text-foreground">4 · Mes réalisations <span className="text-xs font-normal text-muted-foreground">(photos de vos travaux)</span></h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {photos.map((src) => (
            <div key={src} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Réalisation" className="h-full w-full object-cover" />
              <button type="button" onClick={() => removePhoto(src)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {photos.length < 8 && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-brand-400 hover:text-brand-600">
              {uploadingPhoto ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
              <span className="text-[11px] font-medium">Ajouter</span>
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => { const fs = e.target.files; if (fs && fs.length) addPhotos(fs); e.target.value = '' }} />
            </label>
          )}
        </div>
      </section>

      <div className="space-y-3">
        <button type="button" onClick={submit} disabled={saving || selectedId == null}
          className="w-full h-12 rounded-xl bg-brand-500 text-white font-bold disabled:opacity-50 flex items-center justify-center">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enregistrer mon profil'}
        </button>
        <button type="button" onClick={exportData}
          className="w-full h-11 rounded-xl border border-border text-brand-600 font-semibold flex items-center justify-center gap-2">
          <Download className="h-4 w-4" /> Exporter mes informations
        </button>
      </div>
    </div>
  )
}
