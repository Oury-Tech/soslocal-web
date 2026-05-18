'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserCog, Bell, ShieldCheck, CreditCard,
  Lock, Smartphone, Monitor, Save, Plus,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

type Section = 'compte' | 'notifications' | 'confidentialite' | 'paiement'

const SECTIONS: { key: Section; label: string; icon: typeof Bell }[] = [
  { key: 'compte',          label: 'Compte',          icon: UserCog     },
  { key: 'notifications',   label: 'Notifications',   icon: Bell        },
  { key: 'confidentialite', label: 'Confidentialité', icon: ShieldCheck },
  { key: 'paiement',        label: 'Paiement',        icon: CreditCard  },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-accent-600' : 'bg-muted'
      )}
    >
      <span className={cn(
        'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0'
      )} />
    </button>
  )
}

export default function ParametresPage() {
  const [section, setSection] = useState<Section>('compte')
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })

  const [notifs, setNotifs] = useState({
    nouvelleMission: true,
    messageChat:     true,
    statutDemande:   true,
    promotions:      false,
    email:           true,
    sms:             false,
  })

  const [privacy, setPrivacy] = useState({
    profilVisible:     true,
    localisation:      true,
    historiqueVisible: false,
  })

  function handlePwdSave() {
    if (!pwd.current || !pwd.next) { toast.error('Remplissez tous les champs.'); return }
    if (pwd.next !== pwd.confirm)  { toast.error('Les mots de passe ne correspondent pas.'); return }
    toast.success('Mot de passe mis à jour !')
    setPwd({ current: '', next: '', confirm: '' })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Gérez vos préférences et la sécurité de votre compte.</p>
      </div>

      <div className="flex gap-5 items-start">
        {/* Nav latérale */}
        <Card className="p-2 w-48 flex-shrink-0 sticky top-24">
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
                  section === s.key ? 'bg-brand-700 text-white' : 'text-foreground hover:bg-muted'
                )}
              >
                <s.icon className="h-4 w-4 flex-shrink-0" />
                {s.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Contenu */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ── COMPTE ──────────────────────────────────── */}
          {section === 'compte' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="p-6">
                <h2 className="font-bold text-lg mb-4">Changer le mot de passe</h2>
                <div className="space-y-4">
                  <Input
                    type="password"
                    label="Mot de passe actuel"
                    icon={<Lock className="h-4 w-4" />}
                    value={pwd.current}
                    onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                  />
                  <Input
                    type="password"
                    label="Nouveau mot de passe"
                    icon={<Lock className="h-4 w-4" />}
                    value={pwd.next}
                    onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                  />
                  <Input
                    type="password"
                    label="Confirmer le nouveau mot de passe"
                    icon={<Lock className="h-4 w-4" />}
                    value={pwd.confirm}
                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  />
                </div>
                <Button variant="accent" className="mt-4" onClick={handlePwdSave}>
                  <Save className="h-4 w-4" />
                  Mettre à jour
                </Button>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-lg">Vérification en deux étapes</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Ajoutez une couche de sécurité via SMS</p>
                  </div>
                  <Toggle checked={false} onChange={() => toast.info('Disponible bientôt')} />
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="font-bold text-lg mb-1">Sessions actives</h2>
                <p className="text-sm text-muted-foreground mb-4">Appareils connectés à votre compte</p>
                <div className="space-y-3">
                  {[
                    { label: 'Chrome · Windows', loc: 'Conakry, Guinée', current: true,  Icon: Monitor     },
                    { label: 'Safari · iPhone',  loc: 'Conakry, Guinée', current: false, Icon: Smartphone  },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <s.Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{s.label}</p>
                          <p className="text-xs text-muted-foreground">{s.loc}</p>
                        </div>
                      </div>
                      {s.current ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                          Actuelle
                        </span>
                      ) : (
                        <button
                          onClick={() => toast.success('Session révoquée')}
                          className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                        >
                          Révoquer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── NOTIFICATIONS ────────────────────────────── */}
          {section === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 space-y-5">
                <h2 className="font-bold text-lg">Préférences de notifications</h2>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Activité</p>
                  <div className="space-y-0">
                    {([
                      { key: 'nouvelleMission', label: 'Nouvelle mission disponible', desc: 'Quand une mission correspond à votre profil' },
                      { key: 'messageChat',     label: 'Messages reçus',              desc: 'Nouveaux messages dans le chat'               },
                      { key: 'statutDemande',   label: 'Changement de statut',        desc: 'Mises à jour de vos demandes'                 },
                      { key: 'promotions',      label: 'Offres et promotions',        desc: 'Actualités et offres spéciales'               },
                    ] as const).map((n) => (
                      <div key={n.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium">{n.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                        </div>
                        <Toggle
                          checked={notifs[n.key]}
                          onChange={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Canaux</p>
                  <div className="space-y-0">
                    {([
                      { key: 'email', label: 'Notifications email', desc: 'Recevoir les alertes par email'        },
                      { key: 'sms',   label: 'SMS',                 desc: 'Recevoir les alertes par SMS (payant)' },
                    ] as const).map((n) => (
                      <div key={n.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium">{n.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                        </div>
                        <Toggle
                          checked={notifs[n.key]}
                          onChange={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── CONFIDENTIALITÉ ──────────────────────────── */}
          {section === 'confidentialite' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6">
                <h2 className="font-bold text-lg mb-4">Confidentialité</h2>
                <div className="space-y-0">
                  {([
                    { key: 'profilVisible',     label: 'Profil public',            desc: 'Votre profil est visible par les autres utilisateurs'   },
                    { key: 'localisation',      label: 'Partage de localisation',  desc: 'Permet aux artisans de vous trouver plus facilement'    },
                    { key: 'historiqueVisible', label: 'Historique visible',       desc: 'Votre historique de demandes est visible'               },
                  ] as const).map((p) => (
                    <div key={p.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{p.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                      </div>
                      <Toggle
                        checked={privacy[p.key]}
                        onChange={() => setPrivacy({ ...privacy, [p.key]: !privacy[p.key] })}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── PAIEMENT ─────────────────────────────────── */}
          {section === 'paiement' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6">
                <h2 className="font-bold text-lg mb-4">Méthodes de paiement</h2>
                <div className="space-y-3 mb-5">
                  {[
                    { method: 'Orange Money', number: '+224 620 *** ***', active: true  },
                    { method: 'MTN MoMo',     number: '+224 660 *** ***', active: false },
                  ].map((pm, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border-2 transition-colors',
                        pm.active ? 'border-accent-400 bg-accent-50/50 dark:bg-accent-900/10' : 'border-border'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          pm.active ? 'bg-accent-100 dark:bg-accent-900/30' : 'bg-muted'
                        )}>
                          <Smartphone className={cn('h-5 w-5', pm.active ? 'text-accent-600' : 'text-muted-foreground')} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{pm.method}</p>
                          <p className="text-xs text-muted-foreground">{pm.number}</p>
                        </div>
                      </div>
                      {pm.active ? (
                        <span className="text-xs font-semibold text-accent-700 dark:text-accent-300 bg-accent-100 dark:bg-accent-900/30 px-2 py-1 rounded-full">
                          Par défaut
                        </span>
                      ) : (
                        <button
                          onClick={() => toast.success('Méthode définie par défaut')}
                          className="text-xs text-muted-foreground hover:text-brand-600 font-medium transition-colors"
                        >
                          Définir
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => toast.info('Bientôt disponible')}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-brand-600 border-2 border-dashed border-brand-200 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors w-full justify-center"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une méthode
                </button>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
