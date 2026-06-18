'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MailCheck, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'

const CODE_LENGTH = 6
const RESEND_DELAY = 60 // secondes

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, verifyEmail, resendVerificationCode } = useAuthStore()
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const code = digits.join('')
  const canSubmit = code.length === CODE_LENGTH

  function setDigit(i: number, v: string) {
    const clean = v.replace(/\D/g, '')
    if (!clean) {
      setDigits((d) => d.map((x, idx) => (idx === i ? '' : x)))
      return
    }
    // Collage d'un code complet
    if (clean.length > 1) {
      const next = clean.slice(0, CODE_LENGTH).split('')
      setDigits(Array.from({ length: CODE_LENGTH }, (_, idx) => next[idx] ?? ''))
      inputs.current[Math.min(clean.length, CODE_LENGTH) - 1]?.focus()
      return
    }
    setDigits((d) => d.map((x, idx) => (idx === i ? clean : x)))
    if (i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus()
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  async function handleVerify() {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await verifyEmail(code)
      toast.success('Email vérifié avec succès !')
      router.push(user?.role === 'technician' ? '/artisan' : '/beneficiaire')
    } catch (err: any) {
      toast.error(err?.message || 'Code invalide ou expiré')
      setDigits(Array(CODE_LENGTH).fill(''))
      inputs.current[0]?.focus()
    } finally {
      setSubmitting(false)
    }
  }

  function handleSkip() {
    router.push(user?.role === 'technician' ? '/artisan' : '/beneficiaire')
  }

  async function handleResend() {
    if (cooldown > 0) return
    try {
      await resendVerificationCode()
      setCooldown(RESEND_DELAY)
      toast.success('Nouveau code envoyé')
    } catch (err: any) {
      toast.error(err?.message || "Impossible d'envoyer le code")
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 mb-2">
          <MailCheck className="h-8 w-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Vérifiez votre email</h1>
        <p className="mt-2 text-muted-foreground">
          Saisissez le code à 6 chiffres envoyé à{' '}
          <span className="font-medium text-foreground">{user?.email ?? 'votre adresse'}</span>.
        </p>
      </div>

      <div className="flex justify-center gap-1.5 sm:gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={CODE_LENGTH}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="h-14 w-full min-w-0 max-w-[3rem] rounded-xl border-2 border-border bg-card text-center text-2xl font-bold text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        ))}
      </div>

      <Button
        variant="accent"
        size="lg"
        className="w-full"
        loading={submitting}
        disabled={!canSubmit}
        onClick={handleVerify}
      >
        Vérifier
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        Vous n'avez rien reçu ?{' '}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="font-semibold text-brand-700 dark:text-brand-300 hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : 'Renvoyer le code'}
        </button>
      </div>

      <div className="border-t border-border pt-4 text-center">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Passer pour l'instant
        </button>
        <p className="mt-1 text-xs text-muted-foreground">
          Vous pourrez vérifier votre email plus tard depuis vos paramètres.
        </p>
      </div>

      <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Retour à la connexion
      </Link>
    </div>
  )
}
