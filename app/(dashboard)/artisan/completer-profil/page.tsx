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
import { Sparkles, Loader2, Download } from 'lucide-react'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { useServices } from '@/hooks/queries/useServices'
import { useAuthStore } from '@/stores/auth.store'

export default function CompleterProfilPage() {
  const router = useRouter()
  const { user, technicianApproved, refreshTechnicianStatus } = useAuthStore()
  const { data: services = [], isLoading } = useServices()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [specialty, setSpecialty] = useState('')
  const [years, setYears] = useState('')
  const [bio, setBio] = useState('')
  const [bioTouched, setBioTouched] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiClient.get(API.ARTISAN_ME).then(({ data }) => {
      const first = (data?.services ?? [])[0] // un seul métier
      if (first) {
        setSelectedId(first.id)
        setSpecialty(first.specialty ?? '')
        setYears(first.specialty_experience_years != null ? String(first.specialty_experience_years) : '')
      }
      if (data?.bio) { setBio(data.bio); setBioTouched(true) }
    }).catch(() => { /* premier onboarding */ })
  }, [])

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
    if (specialty.trim()) parts.push(`Spécialité : ${specialty.trim()}.`)
    if (years) parts.push(`${years} an(s) d'expérience.`)
    return parts.join(' ')
  }

  // Système intelligent : la description se rédige automatiquement à partir du
  // métier / spécialité, tant que l'artisan ne l'a pas éditée lui-même.
  useEffect(() => {
    if (!bioTouched) setBio(computeSummary())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, specialty, years])

  const exportData = () => {
    const payload = {
      nom: user?.name, email: user?.email, telephone: (user as any)?.phone,
      metier: selectedName ?? null, specialite: specialty.trim() || null,
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
        services: [{
          service_id: selectedId,
          specialty: specialty.trim() || undefined,
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
          Choisissez votre métier et votre spécialité. Ces informations aident les clients à vous choisir.
        </p>
      </div>

      {/* 1. Métier (un seul) */}
      <section className="space-y-3">
        <h2 className="font-semibold text-foreground">1 · Mon métier</h2>
        <p className="text-sm text-muted-foreground">Sélectionnez le service que vous exercez (un seul).</p>
        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {list.map((sv) => {
                const on = selectedId === sv.id
                return (
                  <button key={sv.id} type="button" onClick={() => setSelectedId(sv.id)}
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
      </section>

      {/* 2. Spécialité */}
      {selectedId != null && (
        <section className="space-y-3">
          <h2 className="font-semibold text-foreground">2 · Ma spécialité</h2>
          <p className="text-sm text-muted-foreground">Précisez votre spécialité dans « {selectedName} » (ex : « Mécatronique »).</p>
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} maxLength={80}
              placeholder="Votre spécialité (optionnel)"
              className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <input value={years} onChange={(e) => setYears(e.target.value.replace(/[^\d]/g, ''))} maxLength={2} inputMode="numeric"
              placeholder="Années d'expérience (optionnel)"
              className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
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
