'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, RefreshCw, LogOut, CheckCircle2, FileText, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'

export default function ArtisanEnAttentePage() {
  const router = useRouter()
  const { user, technicianApproved, refreshTechnicianStatus, logout } = useAuthStore()
  const [checking, setChecking] = useState(false)

  // Si le compte vient d'être approuvé, on bascule vers l'espace artisan.
  useEffect(() => {
    if (technicianApproved === true) router.replace('/artisan')
  }, [technicianApproved, router])

  async function handleRefresh() {
    setChecking(true)
    try {
      await refreshTechnicianStatus()
      const approved = useAuthStore.getState().technicianApproved
      if (approved === true) {
        toast.success('Votre compte a été validé !')
        router.replace('/artisan')
      } else {
        toast('Votre compte est toujours en cours de validation.')
      }
    } catch {
      toast.error('Impossible de vérifier le statut pour le moment.')
    } finally {
      setChecking(false)
    }
  }

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  const steps = [
    { icon: CheckCircle2, label: 'Inscription terminée', done: true },
    { icon: FileText, label: 'Vérification de votre profil', done: false },
    { icon: ShieldCheck, label: 'Activation de votre espace artisan', done: false },
  ]

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center">
        <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
          <Clock className="h-8 w-8 text-brand-600 dark:text-brand-400" />
        </div>

        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
          Compte en cours de validation
        </h1>
        <p className="mt-2 text-muted-foreground">
          Bonjour {user?.name?.split(' ')[0] ?? ''}, votre profil artisan est en cours de
          vérification par notre équipe. Vous recevrez une notification dès qu'il sera activé.
        </p>

        <ul className="mt-6 space-y-3 text-left">
          {steps.map((s) => {
            const Icon = s.icon
            return (
              <li key={s.label} className="flex items-center gap-3">
                <span
                  className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    s.done
                      ? 'bg-brand-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className={s.done ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                  {s.label}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="mt-8 space-y-3">
          <Button
            variant="accent"
            size="lg"
            className="w-full"
            loading={checking}
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Vérifier mon statut
          </Button>
          <Button variant="ghost" size="lg" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        La validation prend généralement moins de 24&nbsp;heures.
      </p>
    </div>
  )
}
