'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, CheckCircle2, Mail, Phone, LogOut, RefreshCw,
  ShieldCheck, Wrench, Bell, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils/cn'

const STEPS = [
  {
    icon: Wrench,
    label: 'Inscription soumise',
    sub: 'Votre profil artisan a été enregistré',
    done: true,
  },
  {
    icon: ShieldCheck,
    label: 'Vérification en cours',
    sub: 'Notre équipe examine votre profil',
    done: false,
    active: true,
  },
  {
    icon: Bell,
    label: 'Accès accordé',
    sub: 'Vous recevrez une notification',
    done: false,
  },
]

export default function ArtisanEnAttentePage() {
  const { user, logout, refreshTechnicianStatus, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(0)

  /* Redirection si non authentifié */
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
    }
  }, [isAuthenticated, user, router])

  /* Auto-vérification toutes les 60s */
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshTechnicianStatus()
      const approved = useAuthStore.getState().technicianApproved
      if (approved) {
        toast.success('Votre compte a été approuvé ! Bienvenue.')
        router.replace('/artisan')
      }
    }, 60000)
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /* Countdown depuis le dernier check */
  useEffect(() => {
    if (!lastCheck) return
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastCheck.getTime()) / 1000)
      const remaining = Math.max(0, 30 - elapsed)
      setCountdown(remaining)
    }, 1000)
    return () => clearInterval(id)
  }, [lastCheck])

  async function handleCheck() {
    if (countdown > 0) return
    setChecking(true)
    await refreshTechnicianStatus()
    const approved = useAuthStore.getState().technicianApproved
    setLastCheck(new Date())
    setCountdown(30)
    if (approved) {
      toast.success('Votre compte a été approuvé ! Bienvenue.')
      router.replace('/artisan')
    } else {
      toast.info('Votre compte est encore en attente. Notre équipe travaille dessus.')
    }
    setChecking(false)
  }

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  const firstName = user?.name?.split(' ')[0] ?? 'Artisan'

  return (
    <div className="min-h-screen flex flex-col bg-brand-700">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-6">
        <Logo size="lg" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </header>

      {/* Main */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg"
        >
          {/* Greeting */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative inline-flex mb-5"
            >
              {/* Pulsing rings */}
              <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" style={{ animationDuration: '2s' }} />
              <span className="absolute inset-[-8px] rounded-full border border-amber-500/20" />
              <div className="relative h-20 w-20 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Clock className="h-9 w-9 text-white" />
              </div>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Bienvenue, {firstName} !
            </h1>
            <p className="mt-3 text-white/60 text-base leading-relaxed max-w-sm mx-auto">
              Votre demande est bien reçue. Notre équipe va vérifier votre profil avant de vous donner accès.
            </p>
          </div>

          {/* Card principale */}
          <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm overflow-hidden">

            {/* Infos compte */}
            {user && (
              <div className="px-6 pt-6 pb-5 border-b border-white/10">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Votre compte</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-white/60" />
                    </div>
                    <span className="text-sm text-white/80 font-medium truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-4 w-4 text-white/60" />
                      </div>
                      <span className="text-sm text-white/80 font-medium">{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline des étapes */}
            <div className="px-6 py-5 border-b border-white/10">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Progression</p>
              <div className="space-y-0">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    {/* Ligne verticale + cercle */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                        step.done
                          ? 'bg-green-500 shadow-lg shadow-green-500/30'
                          : step.active
                          ? 'bg-amber-500 shadow-lg shadow-amber-500/30'
                          : 'bg-white/10 border border-white/20'
                      )}>
                        {step.done ? (
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        ) : step.active ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <RefreshCw className="h-4 w-4 text-white" />
                          </motion.div>
                        ) : (
                          <step.icon className="h-4 w-4 text-white/30" />
                        )}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={cn(
                          'w-0.5 flex-1 my-1',
                          step.done ? 'bg-green-500/40' : 'bg-white/10'
                        )} style={{ minHeight: 24 }} />
                      )}
                    </div>

                    {/* Texte */}
                    <div className={cn('pb-6', i === STEPS.length - 1 && 'pb-0')}>
                      <p className={cn(
                        'text-sm font-semibold leading-tight',
                        step.done ? 'text-green-400' : step.active ? 'text-amber-400' : 'text-white/30'
                      )}>
                        {step.label}
                      </p>
                      <p className={cn(
                        'text-xs mt-0.5',
                        step.done || step.active ? 'text-white/50' : 'text-white/20'
                      )}>
                        {step.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-5 space-y-3">
              <Button
                variant="accent"
                size="lg"
                className="w-full"
                onClick={handleCheck}
                loading={checking}
                disabled={countdown > 0}
              >
                <RefreshCw className={cn('h-4 w-4', checking && 'animate-spin')} />
                {countdown > 0
                  ? `Réessayer dans ${countdown}s`
                  : 'Vérifier mon statut'}
              </Button>

              {lastCheck && !checking && countdown === 0 && (
                <AnimatePresence>
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-xs text-white/40"
                  >
                    Vérifié à {lastCheck.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </motion.p>
                </AnimatePresence>
              )}

              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <p className="text-xs text-white/50">
                  Vérification automatique toutes les 60 secondes
                </p>
              </div>
            </div>
          </div>

          {/* Aide */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <a
              href="mailto:contact@soslocal.gn"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <Mail className="h-4 w-4" />
              Contacter le support
              <ChevronRight className="h-3.5 w-3.5 ml-auto" />
            </a>
            <a
              href="tel:+224620000000"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <Phone className="h-4 w-4" />
              Appeler
              <ChevronRight className="h-3.5 w-3.5 ml-auto" />
            </a>
          </div>

          <p className="text-center text-xs text-white/25 mt-6">
            © {new Date().getFullYear()} SOSLocal · Conakry, Guinée
          </p>
        </motion.div>
      </main>
    </div>
  )
}
