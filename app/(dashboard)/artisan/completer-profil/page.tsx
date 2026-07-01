'use client'

/**
 * Assistant de complétion du profil artisan (web).
 * Métiers → spécialités par métier (+ expérience) → compétences (tags) →
 * description auto-suggérée & éditable. Bloquant tant que non complété
 * (cf. auth-guard). Ré-éditable depuis le profil artisan.
 */
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, X, Sparkles, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api/axios'
import { API } from '@/lib/api/endpoints'
import { useServices } from '@/hooks/queries/useServices'
import { useAuthStore } from '@/stores/auth.store'

interface Picked { specialty: string; years: string }

export default function CompleterProfilPage() {
  const router = useRouter()
  const { user, technicianApproved, refreshTechnicianStatus } = useAuthStore()
  const { data: services = [], isLoading } = useServices()

  const [picked, setPicked] = useState<Record<number, Picked>>({})
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  // Pré-remplissage (ré-édition)
  useEffect(() => {
    apiClient.get(API.ARTISAN_ME).then(({ data }) => {
      const pre: Record<number, Picked> = {}
      ;(data?.services ?? []).forEach((sv: any) => {
        pre[sv.id] = {
          specialty: sv.specialty ?? '',
          years: sv.specialty_experience_years != null ? String(sv.specialty_experience_years) : '',
        }
      })
      setPicked(pre)
      if (Array.isArray(data?.specializations)) setSkills(data.specializations)
      if (data?.bio) setBio(data.bio)
    }).catch(() => { /* premier onboarding : pas de profil pré-existant */ })
  }, [])

  const grouped = useMemo(() => {
    const g: Record<string, typeof services> = {}
    for (const sv of services) (g[(sv as any).category || 'Autres'] ||= []).push(sv)
    return g
  }, [services])

  const selectedIds = Object.keys(picked).map(Number)

  const toggle = (id: number) =>
    setPicked((p) => {
      const n = { ...p }
      if (n[id]) delete n[id]
      else n[id] = { specialty: '', years: '' }
      return n
    })
  const setField = (id: number, k: keyof Picked, v: string) =>
    setPicked((p) => ({ ...p, [id]: { ...p[id], [k]: v } }))

  const addSkill = () => {
    const t = skillInput.trim()
    if (t && !skills.includes(t)) setSkills((k) => [...k, t].slice(0, 20))
    setSkillInput('')
  }

  const buildSummary = () => {
    const specialties = selectedIds.map((id) => picked[id]?.specialty?.trim()).filter(Boolean)
    const trades = selectedIds.map((id) => services.find((x) => x.id === id)?.name).filter(Boolean)
    const who = user?.name?.split(' ')[0]
    const parts: string[] = []
    if (trades.length) parts.push(`${who ? who + ', a' : 'A'}rtisan en ${trades.slice(0, 3).join(', ')}.`)
    if (specialties.length) parts.push(`Spécialités : ${specialties.join(', ')}.`)
    if (skills.length) parts.push(`Compétences : ${skills.join(', ')}.`)
    setBio(parts.join(' '))
  }

  const submit = async () => {
    if (selectedIds.length === 0) { toast.error('Choisissez au moins un métier.'); return }
    setSaving(true)
    try {
      await apiClient.put('/technicians/me/onboarding', {
        bio: bio.trim() || undefined,
        skills,
        services: selectedIds.map((id) => ({
          service_id: id,
          specialty: picked[id]?.specialty?.trim() || undefined,
          experience_years: picked[id]?.years ? Number(picked[id].years) : undefined,
        })),
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
          Ces informations aident les clients à vous choisir. Vous pourrez les modifier plus tard.
        </p>
      </div>

      {/* 1. Métiers */}
      <section className="space-y-3">
        <h2 className="font-semibold text-foreground">1 · Mes métiers</h2>
        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} className="space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {list.map((sv) => {
                const on = !!picked[sv.id]
                return (
                  <button key={sv.id} type="button" onClick={() => toggle(sv.id)}
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

      {/* 2. Spécialités */}
      {selectedIds.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-foreground">2 · Mes spécialités</h2>
          <p className="text-sm text-muted-foreground">Précisez votre spécialité par métier (ex : « Mécatronique »).</p>
          {selectedIds.map((id) => {
            const sv = services.find((x) => x.id === id)
            return (
              <div key={id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <p className="font-medium text-sm text-foreground">{sv?.name}</p>
                <input value={picked[id]?.specialty} onChange={(e) => setField(id, 'specialty', e.target.value)}
                  maxLength={80} placeholder="Votre spécialité (optionnel)"
                  className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <input value={picked[id]?.years} onChange={(e) => setField(id, 'years', e.target.value.replace(/[^\d]/g, ''))}
                  maxLength={2} inputMode="numeric" placeholder="Années d'expérience (optionnel)"
                  className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )
          })}
        </section>
      )}

      {/* 3. Compétences */}
      <section className="space-y-3">
        <h2 className="font-semibold text-foreground">3 · Mes compétences</h2>
        <div className="flex gap-2">
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
            placeholder="Ex : Soudure, Diagnostic OBD…"
            className="flex-1 h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button type="button" onClick={addSkill} className="h-11 w-11 rounded-lg bg-brand-500 text-white flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((t) => (
              <button key={t} type="button" onClick={() => setSkills((k) => k.filter((x) => x !== t))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-brand-500/10 text-brand-600 border border-brand-500/20">
                {t} <X className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 4. Description */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">4 · Ma description</h2>
          <button type="button" onClick={buildSummary} className="flex items-center gap-1.5 text-sm font-semibold text-brand-600">
            <Sparkles className="h-4 w-4" /> Générer un résumé
          </button>
        </div>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} maxLength={1000}
          placeholder="Présentez-vous en quelques lignes…"
          className="w-full px-3 py-3 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
      </section>

      <button type="button" onClick={submit} disabled={saving || selectedIds.length === 0}
        className="w-full h-12 rounded-xl bg-brand-500 text-white font-bold disabled:opacity-50 flex items-center justify-center">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enregistrer mon profil'}
      </button>
    </div>
  )
}
