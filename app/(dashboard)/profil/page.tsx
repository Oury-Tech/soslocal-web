'use client'

import { useState, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { useLogout } from '@/hooks/mutations/useAuth'
import Link from 'next/link'

// ✅ Typage strict basé sur UserRole
type UserRole = 'beneficiaire' | 'artisan' | 'operateur'

const ROLE_LABELS: Record<
  UserRole,
  { label: string; icon: string; color: string }
> = {
  beneficiaire: {
    label: 'Bénéficiaire',
    icon: 'home',
    color: 'text-brand-600 bg-brand-50',
  },
  artisan: {
    label: 'Artisan',
    icon: 'tool',
    color: 'text-green-700 bg-green-50',
  },
  operateur: {
    label: 'Opérateur',
    icon: 'activity',
    color: 'text-purple-700 bg-purple-50',
  },
}

export default function ProfilPage() {
  const { user } = useAuthStore()
  const logout = useLogout()

  const [editing, setEditing] = useState(false)

  const fullName =
    (user as any)?.full_name ??
    (user as any)?.name ??
    'Utilisateur'

  const email = (user as any)?.email ?? '—'
  const phone = (user as any)?.phone ?? ''

  const [name, setName] = useState(fullName)
  const [phoneState, setPhoneState] = useState(phone)

  if (!user) return null

  // ✅ CAST SAFE (corrige ton erreur TS)
  const role = user.role as UserRole

  const roleInfo = ROLE_LABELS[role]

  const initials = useMemo(() => {
    return fullName
      .split(' ')
      .map((n: string) => n[0]) // ✅ FIX implicit any
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [fullName])

  const STATS =
    role === 'artisan'
      ? [
          { label: 'Missions', value: '48' },
          { label: 'Note', value: '4.8' },
          { label: 'Revenus', value: '2.4M GNF' },
          { label: 'Avis', value: '42' },
        ]
      : role === 'beneficiaire'
        ? [
            { label: 'Demandes', value: '12' },
            { label: 'Terminées', value: '10' },
            { label: 'En cours', value: '1' },
            { label: 'Dépensé', value: '850K GNF' },
          ]
        : [
            { label: 'Artisans', value: '124' },
            { label: 'Demandes', value: '342' },
            { label: 'Communes', value: '5' },
            { label: 'Taux', value: '87%' },
          ]

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* PROFILE */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

        <div className="h-28 bg-gradient-to-r from-brand-800 to-brand-600" />

        <div className="px-6 pb-6">

          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-brand-500 border-4 border-white flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>

            <button
              onClick={() => setEditing((v) => !v)}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                editing
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border text-gray-700'
              }`}
            >
              {editing ? 'Sauvegarder' : 'Modifier'}
            </button>
          </div>

          {/* Infos */}
          <div className="space-y-1 mb-4">
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="text-sm text-gray-400">{email}</p>

            <span className={`px-3 py-1 rounded-full text-xs ${roleInfo.color}`}>
              {roleInfo.label}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {STATS.map((s: { label: string; value: string }) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="font-bold">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INFO */}
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <h3 className="font-semibold">Informations</h3>

        <div>
          <p className="text-xs text-gray-400">Nom</p>
          <p>{name}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Email</p>
          <p>{email}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Téléphone</p>
          <p>{phoneState || '—'}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">Rôle</p>
          <p>{roleInfo.label}</p>
        </div>
      </div>

      {/* SECURITY */}
      <div className="bg-white rounded-2xl border p-6 space-y-2">
        <h3 className="font-semibold">Sécurité</h3>

        <Link href="/parametres#password">Changer mot de passe</Link>
        <Link href="/parametres#2fa">2FA</Link>
      </div>

      {/* DANGER */}
      <div className="bg-white border border-red-100 rounded-2xl p-6">
        <button onClick={() => logout.mutate()}>
          Déconnexion
        </button>
      </div>

    </div>
  )
}