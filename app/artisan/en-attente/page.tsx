'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, CheckCircle2, Mail, Phone, LogOut, RefreshCw,
  ShieldCheck, Wrench, Bell, ChevronRight, MapPin, Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { cn } from '@/lib/utils/cn'

const STEPS = [
  { icon: Wrench, label: 'Inscription soumise', sub: 'Votre profil artisan a été enregistré', done: true },
  { icon: ShieldCheck, label: 'Vérification en cours', sub: 'Notre équipe examine votre profil', done: false, active: true },
  { icon: Bell, label: 'Accès accordé', sub: 'Vous recevrez une notification', done: false },
]

const ASIDE_POINTS = [
  { icon: ShieldCheck, label: 'Vérification de qualité', desc: 'Chaque artisan est validé avant d’accéder aux demandes.' },
  { icon: MapPin, label: 'Demandes près de vous', desc: 'Recevez les interventions de votre quartier en temps réel.' },
  { icon: Star, label: 'Construisez votre réputation', desc: 'Avis et notes vous font gagner en visibilité.' },
]

export default function ArtisanEnAttentePage() {
  const { user, logout, refreshTechnicianStatus, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(0)

  /* Redirection si non authentifié */
  useEffect(() => {
    if (!isAuthenticated || !user) router.replace('/login')
  }, [isAuthenticated, user, router])

  /* Auto-vérification toutes les 60s */
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshTechnicianStatus()
      if (useAuthStore.getState().technicianApproved) {
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
      setCountdown(Math.max(0, 30 - elapsed))
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
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT — Statut (thème clair, comme les pages d'auth) */}
      <div className="flex-1 flex flex-col bg-background dark:bg-[#07070f]">
        <header className="flex items-center justify-between p-4 lg:p-6">
          <Link href="/" aria-label="Accueil SOSLocal">
            <Logo size="lg" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        <main id="main-content" className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-card dark:bg-brand-950/60 dark:border dark:border-border rounded-2xl p-6 sm:p-8 shadow-soft"
          >
            {/* En-tête */}
            <div className="text-center mb-7">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-500/10 border border-accent-500/20 mb-4">
                <Clock className="h-8 w-8 text-accent-600" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Bienvenue, {firstName}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Votre demande est bien reçue. Notre équipe vérifie votre profil avant de vous donner accès.
              </p>
            </div>

            {/* Infos compte */}
            {user && (
              <div className="rounded-xl border border-border bg-muted/40 p-4 mb-6">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Votre compte</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    <span className="text-foreground font-medium truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <Phone className="h-4 w-4 text-brand-600 flex-shrink-0" />
                      <span className="text-foreground font-medium">{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="mb-6">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">Progression</p>
              <div>
                {STEPS.map((step, i) => (
                  <div key={i} className="flex gap-3.5">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                        step.done
                          ? 'bg-green-500 text-white'
                          : step.active
                          ? 'bg-accent-500 text-white'
                          : 'bg-muted border border-border text-muted-foreground',
                      )}>
                        {step.done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : step.active ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}>
                            <RefreshCw className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <step.icon className="h-4 w-4" />
                        )}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={cn('w-0.5 flex-1 my-1', step.done ? 'bg-green-500/40' : 'bg-border')} style={{ minHeight: 22 }} />
                      )}
                    </div>
                    <div className={cn('pb-5', i === STEPS.length - 1 && 'pb-0')}>
                      <p className={cn(
                        'text-sm font-semibold leading-tight',
                        step.done ? 'text-green-600' : step.active ? 'text-accent-600' : 'text-muted-foreground',
                      )}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={handleCheck}
              loading={checking}
              disabled={countdown > 0}
            >
              <RefreshCw className={cn('h-4 w-4', checking && 'animate-spin')} />
              {countdown > 0 ? `Réessayer dans ${countdown}s` : 'Vérifier mon statut'}
            </Button>

            <AnimatePresence>
              {lastCheck && !checking && countdown === 0 && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center text-xs text-muted-foreground mt-3"
                >
                  Vérifié à {lastCheck.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-muted-foreground">Vérification automatique toutes les 60 secondes</p>
            </div>

            {/* Aide */}
            <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row gap-2">
              <a
                href="mailto:contact@soslocal.gn"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Mail className="h-4 w-4" /> Support <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              </a>
              <a
                href="tel:+224620000000"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Phone className="h-4 w-4" /> Appeler <ChevronRight className="h-3.5 w-3.5 ml-auto" />
              </a>
            </div>
          </motion.div>
        </main>

        <footer className="text-center text-xs text-muted-foreground p-4">
          © {new Date().getFullYear()} SOSLocal · Conakry, Guinée
        </footer>
      </div>

      {/* RIGHT — Panneau visuel artisan (même signature que les pages d'auth) */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center p-12 xl:p-16 bg-brand-600 dark:bg-brand-950">
        <div className="text-white max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold tracking-wide">
            <Clock className="h-3.5 w-3.5" /> Validation en cours
          </span>
          <h2 className="mt-6 text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
            Bientôt prêt à<br />intervenir.
          </h2>
          <p className="mt-5 text-lg text-white/70 leading-relaxed">
            Dès que votre profil est validé, vous recevrez les demandes de dépannage de votre zone.
          </p>

          <ul className="mt-9 space-y-4">
            {ASIDE_POINTS.map((b) => (
              <li key={b.label} className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/20">
                  <b.icon className="h-4 w-4 text-white" aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="font-semibold">{b.label}</div>
                  <div className="text-sm text-white/60 leading-relaxed">{b.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
