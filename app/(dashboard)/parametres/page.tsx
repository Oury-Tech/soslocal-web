'use client'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'

type Section = 'compte' | 'notifications' | 'confidentialite' | 'paiement'

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: 'compte',          label: 'Compte',          icon: 'user-cog'        },
  { key: 'notifications',   label: 'Notifications',   icon: 'bell'            },
  { key: 'confidentialite', label: 'Confidentialité', icon: 'shield-lock'     },
  { key: 'paiement',        label: 'Paiement',        icon: 'credit-card'     },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} role="switch" aria-checked={checked}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-brand-600' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

export default function ParametresPage() {
  const { user } = useAuthStore()
  const [section, setSection] = useState<Section>('compte')

  const [notifs, setNotifs] = useState({
    nouvelleMission:  true,
    messageChat:      true,
    statutDemande:    true,
    promotions:       false,
    email:            true,
    sms:              false,
  })

  const [privacy, setPrivacy] = useState({
    profilVisible:    true,
    localisation:     true,
    historiqueVisible:false,
  })

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' })

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gérez vos préférences et la sécurité de votre compte</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar nav */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-0.5">
            {SECTIONS.map((s) => (
              <button key={s.key} onClick={() => setSection(s.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${section === s.key ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                <i className={`ti ti-${s.icon} text-base flex-shrink-0`} aria-hidden />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* COMPTE */}
          {section === 'compte' && (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-5">Changer le mot de passe</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Mot de passe actuel',   key: 'current' as const },
                    { label: 'Nouveau mot de passe',  key: 'next'    as const },
                    { label: 'Confirmer',             key: 'confirm' as const },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{f.label}</label>
                      <input type="password" value={pwd[f.key]} onChange={(e) => setPwd({ ...pwd, [f.key]: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-gray-300 transition-all bg-white text-gray-900" />
                    </div>
                  ))}
                  <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors">
                    Mettre à jour
                  </button>
                </div>
              </div>

              <div id="2fa" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold text-gray-900 mb-1">Vérification en deux étapes</h2>
                    <p className="text-sm text-gray-400">Ajoutez une couche de sécurité via SMS</p>
                  </div>
                  <Toggle checked={false} onChange={() => {}} />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-1">Sessions actives</h2>
                <p className="text-sm text-gray-400 mb-4">Appareils connectés à votre compte</p>
                <div className="space-y-3">
                  {[
                    { device: 'Chrome · Windows',      loc: 'Conakry, Guinée', current: true  },
                    { device: 'Safari · iPhone',       loc: 'Conakry, Guinée', current: false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <div className="flex items-center gap-3">
                        <i className={`ti ti-${i === 0 ? 'device-desktop' : 'device-mobile'} text-xl text-gray-400`} aria-hidden />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.device}</p>
                          <p className="text-xs text-gray-400">{s.loc}</p>
                        </div>
                      </div>
                      {s.current
                        ? <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Actuelle</span>
                        : <button className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Révoquer</button>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* NOTIFICATIONS */}
          {section === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="font-semibold text-gray-900">Préférences de notifications</h2>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Activité</p>
                {[
                  { key: 'nouvelleMission' as const,  label: 'Nouvelle mission disponible',  desc: 'Quand une mission correspond à votre profil' },
                  { key: 'messageChat'    as const,   label: 'Messages reçus',               desc: 'Nouveaux messages dans le chat'               },
                  { key: 'statutDemande' as const,    label: 'Changement de statut',         desc: 'Mises à jour de vos demandes'                 },
                  { key: 'promotions'    as const,    label: 'Offres et promotions',         desc: 'Actualités et offres spéciales'               },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{n.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle checked={notifs[n.key]} onChange={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })} />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Canaux</p>
                {[
                  { key: 'email' as const, label: 'Notifications email', desc: 'Recevoir les alertes par email'          },
                  { key: 'sms'   as const, label: 'SMS',                  desc: 'Recevoir les alertes par SMS (payant)'   },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{n.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle checked={notifs[n.key]} onChange={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONFIDENTIALITE */}
          {section === 'confidentialite' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-1">
              <h2 className="font-semibold text-gray-900 mb-4">Confidentialité</h2>
              {[
                { key: 'profilVisible'    as const, label: 'Profil public',         desc: 'Votre profil est visible par les autres utilisateurs'   },
                { key: 'localisation'     as const, label: 'Partage de localisation', desc: 'Permet aux artisans de vous trouver plus facilement' },
                { key: 'historiqueVisible' as const, label: 'Historique visible',    desc: 'Votre historique de demandes est visible'               },
              ].map((p) => (
                <div key={p.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
                  </div>
                  <Toggle checked={privacy[p.key]} onChange={() => setPrivacy({ ...privacy, [p.key]: !privacy[p.key] })} />
                </div>
              ))}
            </div>
          )}

          {/* PAIEMENT */}
          {section === 'paiement' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Méthodes de paiement</h2>
              <div className="space-y-3 mb-5">
                {[
                  { method: 'Orange Money', number: '+224 620 *** ***', icon: 'device-mobile', active: true  },
                  { method: 'MTN MoMo',     number: '+224 660 *** ***', icon: 'device-mobile', active: false },
                ].map((pm, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl border-2 ${pm.active ? 'border-brand-300 bg-brand-50' : 'border-gray-100 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pm.active ? 'bg-brand-100' : 'bg-gray-100'}`}>
                        <i className={`ti ti-${pm.icon} text-lg ${pm.active ? 'text-brand-600' : 'text-gray-400'}`} aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pm.method}</p>
                        <p className="text-xs text-gray-400">{pm.number}</p>
                      </div>
                    </div>
                    {pm.active
                      ? <span className="text-xs text-brand-600 font-semibold bg-brand-100 px-2 py-1 rounded-full">Par défaut</span>
                      : <button className="text-xs text-gray-500 hover:text-brand-600 font-medium transition-colors">Définir</button>
                    }
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-600 border-2 border-dashed border-brand-200 hover:border-brand-400 hover:bg-brand-50 transition-colors w-full justify-center">
                <i className="ti ti-plus" aria-hidden />
                Ajouter une méthode
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
