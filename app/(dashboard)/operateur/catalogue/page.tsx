'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Loader2, Star, Zap, Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Spinner } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { formatGNF } from '@/lib/utils/format'
import { toast } from 'sonner'
import {
  useAdminServices, useCreateService, useUpdateService, useDeleteService,
  type AdminService, type ServiceInput,
} from '@/hooks/queries/useBackOffice'

const FIELD =
  'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500'

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
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Nom *</label>
            <input value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Plomberie" className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Catégorie *</label>
            <input value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Maison" className={FIELD} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-900">Description courte</label>
          <input value={form.short_description ?? ''} onChange={(e) => setForm({ ...form, short_description: e.target.value })} className={FIELD} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-900">Description</label>
          <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={FIELD} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Prix min (GNF)</label>
            <input type="number" value={form.estimated_price_min ?? ''} onChange={(e) => setForm({ ...form, estimated_price_min: e.target.value === '' ? undefined : Number(e.target.value) })} className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Prix max (GNF)</label>
            <input type="number" value={form.estimated_price_max ?? ''} onChange={(e) => setForm({ ...form, estimated_price_max: e.target.value === '' ? undefined : Number(e.target.value) })} className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Durée (min)</label>
            <input type="number" value={form.average_duration ?? ''} onChange={(e) => setForm({ ...form, average_duration: e.target.value === '' ? undefined : Number(e.target.value) })} className={FIELD} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Couleur (hex)</label>
            <input value={form.color ?? ''} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#635BFF" className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Ordre d’affichage</label>
            <input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} className={FIELD} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm text-gray-900">
            <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Actif
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-900">
            <input type="checkbox" checked={!!form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Mis en avant
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-900">
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Catalogue de services</h1>
          <p className="text-muted-foreground mt-1">Créez, modifiez et organisez les services proposés.</p>
        </div>
        <Button variant="accent" size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> Nouveau service</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
      ) : !services || services.length === 0 ? (
        <EmptyState icon="tools" title="Aucun service" desc="Ajoutez votre premier service au catalogue." />
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          {services.map((s) => (
            <Card key={s.id} className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{s.name}</span>
                  {s.category && <Badge variant="outline">{s.category}</Badge>}
                  {s.is_featured && <Badge variant="accent"><Star className="h-3 w-3" /> Vedette</Badge>}
                  {s.is_emergency && <Badge variant="warning"><Zap className="h-3 w-3" /> Urgence</Badge>}
                  <Badge variant={s.is_active ? 'success' : 'default'}>{s.is_active ? 'Actif' : 'Inactif'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(s.estimated_price_min || s.estimated_price_max)
                    ? `${formatGNF(s.estimated_price_min ?? 0)} – ${formatGNF(s.estimated_price_max ?? 0)}`
                    : 'Prix non défini'}
                  {typeof s.total_requests === 'number' && ` · ${s.total_requests} demandes`}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="sm" onClick={() => toggleActive(s)} title={s.is_active ? 'Désactiver' : 'Activer'}>
                  {s.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(s)} title="Modifier"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => remove(s)} title="Supprimer"><Trash2 className="h-4 w-4 text-red-600" /></Button>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      <ServiceModal open={modalOpen} onClose={() => setModalOpen(false)} target={editTarget} />
    </div>
  )
}
