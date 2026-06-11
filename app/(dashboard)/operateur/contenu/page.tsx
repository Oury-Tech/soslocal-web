'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  HelpCircle, Megaphone, Crown, Plus, Trash2, Pencil, Loader2, Send, FolderPlus,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, Spinner } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils/cn'
import { formatGNF, formatRelative } from '@/lib/utils/format'
import { toast } from 'sonner'
import {
  useAdminFaq, useCreateFaqCategory, useDeleteFaqCategory,
  useCreateFaq, useUpdateFaq, useDeleteFaq,
  useBroadcast, useSubscriptions, useUpdateSubscription,
  type FAQItem,
} from '@/hooks/queries/useBackOffice'

type Tab = 'faq' | 'broadcast' | 'subscriptions'

const TABS: { key: Tab; label: string; icon: typeof HelpCircle }[] = [
  { key: 'faq',           label: 'FAQ',          icon: HelpCircle },
  { key: 'broadcast',     label: 'Annonce',      icon: Megaphone },
  { key: 'subscriptions', label: 'Abonnements',  icon: Crown },
]

const FIELD =
  'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500'

function FaqTab() {
  const { data, isLoading } = useAdminFaq()
  const createCat = useCreateFaqCategory()
  const deleteCat = useDeleteFaqCategory()
  const createFaq = useCreateFaq()
  const updateFaq = useUpdateFaq()
  const deleteFaq = useDeleteFaq()

  const [catOpen, setCatOpen] = useState(false)
  const [catName, setCatName] = useState('')
  const [faqOpen, setFaqOpen] = useState(false)
  const [faqTarget, setFaqTarget] = useState<FAQItem | null>(null)
  const [faqForm, setFaqForm] = useState({ category_id: 0, question: '', answer: '' })

  const categories = data?.categories ?? []
  const questions = data?.questions ?? []

  function submitCat() {
    if (catName.trim().length < 2) { toast.error('Nom de catégorie trop court.'); return }
    createCat.mutate({ name: catName.trim() }, {
      onSuccess: () => { toast.success('Catégorie créée'); setCatOpen(false); setCatName('') },
      onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Échec.'),
    })
  }

  function openCreateFaq() {
    if (categories.length === 0) { toast.error('Créez d’abord une catégorie.'); return }
    setFaqTarget(null)
    setFaqForm({ category_id: categories[0].id, question: '', answer: '' })
    setFaqOpen(true)
  }
  function openEditFaq(f: FAQItem) {
    setFaqTarget(f)
    setFaqForm({ category_id: f.category_id, question: f.question, answer: f.answer })
    setFaqOpen(true)
  }

  function submitFaq() {
    if (faqForm.question.trim().length < 3) { toast.error('Question trop courte.'); return }
    if (faqForm.answer.trim().length < 1) { toast.error('La réponse est requise.'); return }
    const cb = {
      onSuccess: () => { toast.success(faqTarget ? 'Question mise à jour' : 'Question ajoutée'); setFaqOpen(false) },
      onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Échec.'),
    }
    if (faqTarget) updateFaq.mutate({ id: faqTarget.id, patch: faqForm }, cb)
    else createFaq.mutate(faqForm, cb)
  }

  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => setCatOpen(true)}><FolderPlus className="h-4 w-4" /> Catégorie</Button>
        <Button variant="accent" size="sm" onClick={openCreateFaq}><Plus className="h-4 w-4" /> Question</Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon="help" title="Aucune catégorie" desc="Créez une catégorie pour organiser la FAQ." />
      ) : (
        categories.map((cat) => {
          const items = questions.filter((q) => q.category_id === cat.id)
          return (
            <div key={cat.id}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">{cat.name}<Badge variant="outline">{items.length}</Badge></h3>
                <Button variant="ghost" size="sm" onClick={() => { if (confirm(`Supprimer la catégorie « ${cat.name} » et ses questions ?`)) deleteCat.mutate(cat.id, { onSuccess: () => toast.success('Catégorie supprimée') }) }}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground italic mb-2">Aucune question dans cette catégorie.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((f) => (
                    <Card key={f.id} className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{f.question}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{f.answer}</p>
                        {!f.is_active && <Badge variant="default">Inactif</Badge>}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => openEditFaq(f)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Supprimer cette question ?')) deleteFaq.mutate(f.id, { onSuccess: () => toast.success('Question supprimée') }) }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}

      <Modal open={catOpen} onClose={() => setCatOpen(false)} title="Nouvelle catégorie" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Nom</label>
            <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Paiements" className={FIELD} />
          </div>
          <Button variant="accent" size="md" className="w-full" onClick={submitCat} disabled={createCat.isPending}>
            {createCat.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer'}
          </Button>
        </div>
      </Modal>

      <Modal open={faqOpen} onClose={() => setFaqOpen(false)} title={faqTarget ? 'Modifier la question' : 'Nouvelle question'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Catégorie</label>
            <select value={faqForm.category_id} onChange={(e) => setFaqForm({ ...faqForm, category_id: Number(e.target.value) })} className={FIELD}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Question</label>
            <input value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className={FIELD} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-900">Réponse</label>
            <textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} rows={4} className={FIELD} />
          </div>
          <Button variant="accent" size="md" className="w-full" onClick={submitFaq} disabled={createFaq.isPending || updateFaq.isPending}>
            {(createFaq.isPending || updateFaq.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : faqTarget ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function BroadcastTab() {
  const broadcast = useBroadcast()
  const [form, setForm] = useState({ title: '', message: '', target: 'all', priority: 'normal' })

  function send() {
    if (form.title.trim().length < 2) { toast.error('Titre trop court.'); return }
    if (form.message.trim().length < 1) { toast.error('Le message est requis.'); return }
    if (!confirm('Envoyer cette annonce maintenant ?')) return
    broadcast.mutate(form, {
      onSuccess: (r) => { toast.success(`Annonce envoyée à ${r.sent} destinataire(s)`); setForm({ title: '', message: '', target: 'all', priority: 'normal' }) },
      onError: (e: any) => toast.error(e?.response?.data?.detail ?? 'Envoi impossible.'),
    })
  }

  return (
    <Card className="p-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-900">Titre</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Maintenance prévue" className={FIELD} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-900">Message</label>
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className={FIELD} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-900">Cible</label>
          <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className={FIELD}>
            <option value="all">Tout le monde</option>
            <option value="client">Clients</option>
            <option value="technician">Techniciens</option>
            <option value="admin">Opérateurs &amp; admins</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-900">Priorité</label>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={FIELD}>
            <option value="low">Basse</option>
            <option value="normal">Normale</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>
      <Button variant="accent" size="md" className="w-full" onClick={send} disabled={broadcast.isPending}>
        {broadcast.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Envoyer l’annonce</>}
      </Button>
    </Card>
  )
}

function SubscriptionsTab() {
  const { data: subs, isLoading } = useSubscriptions()
  const update = useUpdateSubscription()

  function setStatus(id: number, status: string, label: string) {
    update.mutate({ id, status }, { onSuccess: () => toast.success(label) })
  }

  if (isLoading) return <div className="flex justify-center py-12"><Spinner className="h-7 w-7" /></div>
  if (!subs || subs.length === 0) return <EmptyState icon="crown" title="Aucun abonnement" desc="Les abonnements Premium apparaîtront ici." />

  return (
    <div className="space-y-2">
      {subs.map((s) => (
        <Card key={s.id} className="p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{s.user_name ?? `Utilisateur #${s.user_id}`}</span>
              {s.plan && <Badge variant="accent"><Crown className="h-3 w-3" /> {s.plan}</Badge>}
              <Badge variant={s.status === 'active' ? 'success' : s.status === 'cancelled' ? 'danger' : 'default'}>{s.status}</Badge>
              {s.is_trial && <Badge variant="warning">Essai</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {s.price ? formatGNF(s.price) : '—'}{s.billing_cycle && ` / ${s.billing_cycle}`}
              {s.expires_at && ` · expire ${formatRelative(s.expires_at)}`}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {s.status === 'active'
              ? <Button variant="outline" size="sm" onClick={() => setStatus(s.id, 'cancelled', 'Abonnement annulé')}>Annuler</Button>
              : <Button variant="outline" size="sm" onClick={() => setStatus(s.id, 'active', 'Abonnement activé')}>Activer</Button>}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function ContenuPage() {
  const [tab, setTab] = useState<Tab>('faq')

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Contenu &amp; Support</h1>
        <p className="text-muted-foreground mt-1">FAQ, annonces globales et abonnements Premium.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {tab === 'faq' && <FaqTab />}
        {tab === 'broadcast' && <BroadcastTab />}
        {tab === 'subscriptions' && <SubscriptionsTab />}
      </motion.div>
    </div>
  )
}
