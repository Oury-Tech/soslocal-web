'use client'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useLogout } from '@/hooks/mutations/useAuth'
import Link from 'next/link'

const CERT_LABELS: Record<string, { label: string; cls: string }> = {
  bronze: { label: 'Bronze', cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'   },
  silver: { label: 'Argent', cls: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'    },
  gold:   { label: 'Or',     cls: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200'},
  expert: { label: 'Expert', cls: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'     },
}

const ROLE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  beneficiaire: { label: 'Bénéficiaire', icon: 'home',     color: 'text-brand-600 bg-brand-50'  },
  artisan:      { label: 'Artisan',       icon: 'tool',     color: 'text-green-700 bg-green-50'   },
  operateur:    { label: 'Opérateur',     icon: 'activity', color: 'text-purple-700 bg-purple-50' },
}

export default function ProfilPage() {
  const { user } = useAuthStore()
  const logout = useLogout()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.full_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  if (!user) return null

  const roleInfo = ROLE_LABELS[user.role]
  const initials = user.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  // Mock stats by role
  const STATS = user.role === 'artisan'
    ? [{ label: 'Missions', value: '48' }, { label: 'Note', value: '4.8' }, { label: 'Revenus', value: '2.4M GNF' }, { label: 'Avis', value: '42' }]
    : user.role === 'beneficiaire'
    ? [{ label: 'Demandes', value: '12' }, { label: 'Terminées', value: '10' }, { label: 'En cours', value: '1' }, { label: 'Dépensé', value: '850K GNF' }]
    : [{ label: 'Artisans', value: '124' }, { label: 'Demandes', value: '342' }, { label: 'Communes', value: '5' }, { label: 'Taux', value: '87%' }]

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ── Profile card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-brand-800 to-brand-600" />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-brand-500 border-4 border-white flex items-center justify-center text-2xl font-bold text-white shadow-sm">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                <i className="ti ti-camera text-xs text-gray-500" aria-hidden />
              </button>
            </div>
            <div className="flex gap-2 mb-1">
              <button onClick={() => setEditing(!editing)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editing ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                <i className={`ti ti-${editing ? 'check' : 'pencil'} text-sm`} aria-hidden />
                {editing ? 'Sauvegarder' : 'Modifier'}
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-1 mb-4">
            {editing ? (
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="text-xl font-bold text-gray-900 border-b-2 border-brand-400 outline-none bg-transparent w-full" />
            ) : (
              <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
            )}
            <p className="text-sm text-gray-400">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${roleInfo.color}`}>
                <i className={`ti ti-${roleInfo.icon} text-sm`} aria-hidden />
                {roleInfo.label}
              </span>
              {user.role === 'artisan' && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CERT_LABELS.gold.cls}`}>
                  Or
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <i className="ti ti-circle-check text-sm" aria-hidden />
                Vérifié
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="font-bold text-gray-900 text-base">{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Infos personnelles ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ti ti-user text-brand-500" aria-hidden />
          Informations personnelles
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Nom complet',  value: user.full_name, icon: 'user',   editable: true,  state: name,  setState: setName  },
            { label: 'Email',        value: user.email,     icon: 'mail',   editable: false                                    },
            { label: 'Téléphone',    value: user.phone,     icon: 'phone',  editable: true,  state: phone, setState: setPhone },
            { label: 'Rôle',         value: roleInfo.label, icon: 'shield', editable: false                                    },
          ].map((field: any) => (
            <div key={field.label} className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <i className={`ti ti-${field.icon} text-gray-500 text-base`} aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{field.label}</p>
                {editing && field.editable && field.setState ? (
                  <input value={field.state} onChange={(e) => field.setState(e.target.value)}
                    className="w-full text-sm text-gray-900 border-b border-brand-300 outline-none bg-transparent py-0.5" />
                ) : (
                  <p className="text-sm font-medium text-gray-900 truncate">{field.state ?? field.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sécurité ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="ti ti-shield-lock text-brand-500" aria-hidden />
          Sécurité
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Changer le mot de passe', icon: 'key',         href: '/parametres#password' },
            { label: 'Vérification en 2 étapes', icon: 'device-mobile', href: '/parametres#2fa'  },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3">
                <i className={`ti ti-${item.icon} text-gray-400 text-base`} aria-hidden />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <i className="ti ti-chevron-right text-gray-300 group-hover:text-gray-500 transition-colors" aria-hidden />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Artisan-only: services ── */}
      {user.role === 'artisan' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="ti ti-tool text-brand-500" aria-hidden />
            Mes services
          </h3>
          <div className="flex gap-2 flex-wrap">
            {['Électricité','Plomberie','Dépannage'].map((s) => (
              <span key={s} className="px-3 py-1.5 rounded-full text-sm font-medium bg-brand-50 text-brand-700">
                {s}
              </span>
            ))}
            <button className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-600 transition-colors">
              <i className="ti ti-plus text-sm" aria-hidden /> Ajouter
            </button>
          </div>
        </div>
      )}

      {/* ── Danger zone ── */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
          <i className="ti ti-alert-triangle" aria-hidden />
          Zone danger
        </h3>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => logout.mutate()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <i className="ti ti-logout text-base" aria-hidden />
            Se déconnecter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors">
            <i className="ti ti-trash text-base" aria-hidden />
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  )
}
