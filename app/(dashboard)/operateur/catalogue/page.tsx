'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Loader2, Star, Zap, Eye, EyeOff, LayoutGrid, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge, Spinner } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/page-header'
import { StatCard } from '@/components/ui/StatCard'
import { SectionCard } from '@/components/ui/section-card'
import { formatGNF } from '@/lib/utils/format'
import { toast } from 'sonner'
import {
  useAdminServices, useCreateService, useUpdateService, useDeleteService,
  type AdminService, type ServiceInput,
} from '@/hooks/queries/useBackOffice'

const FIELD =
  'w-full px-3 py-2.5 rounded-lg border border-border bg-card text-[rgb(var(--fg))] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500'

const EMPTY: ServiceInput = {
  name: '', category: '', short_description: '', description: '',
  estimated_price_min: undefined, estimated_price_max: undefined,
  currency: 'GNF', average_duration: undefined, color: '',
  is_active: true, is_featured: false, is_emergency: false, display_order: 0,
}

function ServiceModal({
  open, onClose, target,
}: { open: boolean; onClose: () => void; target: AdminService | null }) {
  const create = useCreateService()
  const update = useUpdateService()
  const [form, setForm] = useState<ServiceInput>(EMPTY)

  useEffect(() => {
    if (target) {
      setForm({
        name: target.name, category: target.category ?? '',
        short_description: target.short_description ?? '', description: target.description ?? '',
        estimated_price_min: target.estimated_price_min ?? undefined,
        estimated_price_max: target.estimated_price_max ?? undefined,
        currency: target.currency ?? 'GNF', average_duration: target.average_duration ?? undefined,
        color: target.color ?? '', is_active: target.is_active, is_featured: target.is_featured,
        is_emergency: target.is_emergency, display_order: target.display_order,
      })
    } else {
      setForm(EMPTY)
    }
  }, [target, open])

  const pending = create.isPending || update.isPending

  function submit() {
    if (!form.name?.trim()) { toast.error('Le nom du service est requis.'); return }
    if (!form.category?.trim()) { toast.error('La catégorie est requise.'); return }
    const cb = {
      onSuccess: () => { toast.success(target ? 'Service mis à jour' : 'Service créé'); onClose() },
      onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Échec de l’enregistrement.'),
    }
    if (target) update.mutate({ id: target.id, patch: form }, cb)
    else create.mutate(form, cb)
  }

  return (
    <Modal open={open} onClose={onClose} title={target ? 'Modifier le service' : 'Nouveau service'} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Nom *</label>
            <input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Plomberie" className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Catégorie *</label>
            <input value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Maison" className={FIELD} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Description courte</label>
          <input value={form.short_description ?? ''} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className={FIELD} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Description</label>
          <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={FIELD} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Prix min (GNF)</label>
            <input type="number" value={form.estimated_price_min ?? ''} onChange={(e) => setForm({ ...form, estimated_price_min: e.target.value === '' ? undefined : Number(e.target.value) })} className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Prix max (GNF)</label>
            <input type="number" value={form.estimated_price_max ?? ''} onChange={(e) => setForm({ ...form, estimated_price_max: e.target.value === '' ? undefined : Number(e.target.value) })} className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Durée (min)</label>
            <input type="number" value={form.average_duration ?? ''} onChange={(e) => setForm({ ...form, average_duration: e.target.value === '' ? undefined : Number(e.target.value) })} className={FIELD} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Couleur (hex)</label>
            <input value={form.color ?? ''} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#0078FF" className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--fg))]">Ordre d’affichage</label>
            <input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className={FIELD} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm text-[rgb(var(--fg))]">
            <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Actif
          </label>
          <label className="flex items-center gap-2 text-sm text-[rgb(var(--fg))]">
            <input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Mis en avant
          </label>
          <label className="flex items-center gap-2 text-sm text-[rgb(var(--fg))]">
            <input type="checkbox" checked={!!form.is_emergency} onChange={(e) => setForm({ ...form, is_emergency: e.target.checked })} /> Urgence
          </label>
        </div>

        <Button variant="accent" size="md" className="w-full" onClick={submit} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : target ? 'Enregistrer' : 'Créer le service'}
        </Button>
      </div>
    </Modal>
  )
}

export default function CataloguePage() {
  const { data: services, isLoading } = useAdminServices()
  const update = useUpdateService()
  const del = useDeleteService()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminService | null>(null)

  function openCreate() { setEditTarget(null); setModalOpen(true) }
  function openEdit(s: AdminService) { setEditTarget(s); setModalOpen(true) }

  function toggleActive(s: AdminService) {
    update.mutate(
      { id: s.id, patch: { is_active: !s.is_active } },
      { onSuccess: () => toast.success(s.is_active ? 'Service désactivé' : 'Service activé') },
    )
  }

  function remove(s: AdminService) {
    if (!confirm(`Supprimer le service « ${s.name} » ?`)) return
    del.mutate(s.id, {
      onSuccess: (r) => toast.success(r.mode === 'soft' ? 'Service désactivé (données liées)' : 'Service supprimé'),
      onError: () => toast.error('Suppression impossible.'),
    })
  }

  const total = services?.length ?? 0
  const activeCount = services?.filter((s) => s.is_active).length ?? 0
  const featuredCount = services?.filter((s) => s.is_featured).length ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Catalogue de services"
        description="Créez, modifiez et organisez les services proposés."
        icon={LayoutGrid}
      >
        <Button variant="accent" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Nouveau service</Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Services" value={total} icon={LayoutGrid} tone="brand" loading={isLoading} />
        <StatCard label="Actifs" value={activeCount} icon={CheckCircle2} tone="success" loading={isLoading} />
        <StatCard label="Mis en avant" value={featuredCount} icon={Star} tone="accent" loading={isLoading} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
      ) : !services || services.length === 0 ? (
        <EmptyState icon="tools" title="Aucun service" desc="Ajoutez votre premier service au catalogue." />
      ) : (
        <SectionCard title="Services" icon={LayoutGrid} flush>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Service</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Tarif</th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[rgb(var(--fg))]">{s.name}</span>
                        {s.category && <Badge variant="outline">{s.category}</Badge>}
                        {s.is_featured && <Badge variant="accent"><Star className="h-3 w-3" /> Vedette</Badge>}
                        {s.is_emergency && <Badge variant="warning"><Zap className="h-3 w-3" /> Urgence</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={s.is_active ? 'success' : 'default'}>{s.is_active ? 'Actif' : 'Inactif'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {(s.estimated_price_min || s.estimated_price_max)
                        ? `${formatGNF(s.estimated_price_min ?? 0)} – ${formatGNF(s.estimated_price_max ?? 0)}`
                        : 'Prix non défini'}
                      {typeof s.total_requests === 'number' && (
                        <span className="block">{s.total_requests} demandes</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleActive(s)} title={s.is_active ? 'Désactiver' : 'Activer'} aria-label={s.is_active ? 'Désactiver' : 'Activer'}>
                          {s.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)} title="Modifier" aria-label="Modifier"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(s)} title="Supprimer" aria-label="Supprimer"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </SectionCard>
      )}

      <ServiceModal open={modalOpen} onClose={() => setModalOpen(false)} target={editTarget} />
    </div>
  )
}
