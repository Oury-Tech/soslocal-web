'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2, Mail, Phone, LogOut, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Logo } from '@/components/ui/logo'

export default function ArtisanEnAttentePage() {
  const { user, logout, refreshTechnicianStatus, technicianApproved } = useAuthStore()
  const router = useRouter()
  const [checking, setChecking] = useState(false)

  async function handleCheck() {
    setChecking(true)
    await refreshTechnicianStatus()
    const approved = useAuthStore.getState().technicianApproved
    if (approved) {
      toast.success('Votre compte a été approuvé ! Bienvenue.')
      router.replace('/artisan')
    } else {
      toast.info('Votre compte est encore en attente. Réessayez dans quelques instants.')
    }
    setChecking(false)
  }

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="xl" />
        </div>

        {/* Card principale */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-soft text-center">
          {/* Icône animée */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 border-2 border-card animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl font-extrabold mb-2">Compte en attente</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Votre demande d'inscription en tant qu'artisan a bien été reçue.
            Un administrateur doit valider votre profil avant que vous puissiez accéder à la plateforme.
          </p>

          {/* Info utilisateur */}
          {user && (
            <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">{user.phone}</span>
              </div>
            </div>
          )}

          {/* Étapes */}
          <div className="text-left space-y-3 mb-8">
            {[
              { label: 'Inscription soumise', done: true },
              { label: 'Vérification du profil par l\'équipe', done: false },
              { label: 'Accès à la plateforme accordé', done: false },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={
                  step.done
                    ? 'h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0'
                    : 'h-6 w-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0'
                }>
                  {step.done
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    : <span className="text-[10px] text-muted-foreground font-bold">{i + 1}</span>
                  }
                </div>
                <span className={step.done ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={handleCheck}
              loading={checking}
            >
              <RefreshCw className="h-4 w-4" />
              Vérifier le statut
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="w-full text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Une question ? Contactez-nous à{' '}
          <a href="mailto:contact@soslocal.gn" className="underline hover:text-foreground">
            contact@soslocal.gn
          </a>
        </p>
      </motion.div>
    </div>
  )
}
