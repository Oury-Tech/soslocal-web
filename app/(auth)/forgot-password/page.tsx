'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Lock, KeyRound, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth.store'
import { passwordSchema } from '@/lib/validation/password'
import { PasswordChecklist } from '@/components/features/auth/PasswordChecklist'

const emailSchema = z.object({ email: z.string().email('Email invalide') })
type EmailForm = z.infer<typeof emailSchema>

const resetSchema = z
  .object({
    code: z.string().length(6, 'Code à 6 chiffres'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
type ResetForm = z.infer<typeof resetSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { resendVerificationCode, resetPassword } = useAuthStore()
  const [step, setStep] = useState<'request' | 'reset'>('request')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })
  const password = resetForm.watch('password') ?? ''

  const onRequest = async (data: EmailForm) => {
    await new Promise((r) => setTimeout(r, 600))
    // Envoie le code de récupération (Service Email du diagramme)
    try { await resendVerificationCode() } catch { /* mock / non-fatal */ }
    setEmail(data.email)
    setStep('reset')
    toast.success(`Code envoyé à ${data.email}`)
  }

  const onReset = async (data: ResetForm) => {
    try {
      await resetPassword(email, data.code, data.password)
      toast.success('Mot de passe réinitialisé. Connectez-vous.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err?.message || 'Code invalide ou expiré')
    }
  }

  if (step === 'reset') {
    return (
      <div className="space-y-6 animate-slide-up">
        <div>
          <button
            onClick={() => setStep('request')}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Nouveau mot de passe</h1>
          <p className="mt-2 text-muted-foreground">
            Saisissez le code reçu à <span className="font-medium text-foreground">{email}</span> et
            choisissez un nouveau mot de passe.
          </p>
        </div>

        <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
          <Input
            label="Code de vérification"
            icon={<KeyRound className="h-4 w-4" />}
            placeholder="123456"
            inputMode="numeric"
            maxLength={6}
            error={resetForm.formState.errors.code?.message}
            {...resetForm.register('code')}
          />

          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Nouveau mot de passe"
              icon={<Lock className="h-4 w-4" />}
              placeholder="Au moins 8 caractères"
              error={resetForm.formState.errors.password?.message}
              autoComplete="new-password"
              {...resetForm.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[2.4rem] text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <PasswordChecklist value={password} />
          </div>

          <Input
            type={showPassword ? 'text' : 'password'}
            label="Confirmer le mot de passe"
            icon={<Lock className="h-4 w-4" />}
            placeholder="Répétez le mot de passe"
            error={resetForm.formState.errors.confirmPassword?.message}
            autoComplete="new-password"
            {...resetForm.register('confirmPassword')}
          />

          <Button type="submit" variant="accent" size="lg" className="w-full" loading={resetForm.formState.isSubmitting}>
            Réinitialiser le mot de passe
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Mot de passe oublié ?</h1>
        <p className="mt-2 text-muted-foreground">
          Saisissez votre email et nous vous enverrons un code de récupération.
        </p>
      </div>

      <form onSubmit={emailForm.handleSubmit(onRequest)} className="space-y-4">
        <Input
          type="email"
          label="Email"
          icon={<Mail className="h-4 w-4" />}
          placeholder="vous@example.com"
          error={emailForm.formState.errors.email?.message}
          autoComplete="email"
          {...emailForm.register('email')}
        />
        <Button type="submit" variant="accent" size="lg" className="w-full" loading={emailForm.formState.isSubmitting}>
          Envoyer le code
        </Button>
      </form>
    </div>
  )
}
