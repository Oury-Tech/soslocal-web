'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const schema = z.object({ email: z.string().email('Email invalide') })
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(true)
    toast.success(`Email envoyé à ${data.email}`)
  }

  if (submitted) {
    return (
      <div className="space-y-6 animate-slide-up text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold">Email envoyé !</h1>
          <p className="mt-2 text-muted-foreground">
            Si un compte existe avec cette adresse, vous recevrez un email avec un code à 6 chiffres
            pour réinitialiser votre mot de passe.
          </p>
        </div>
        <Link href="/login">
          <Button variant="outline" size="md" className="w-full">
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Button>
        </Link>
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
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Mot de passe oublié ?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Saisissez votre email et nous vous enverrons un code de récupération.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="email"
          label="Email"
          icon={<Mail className="h-4 w-4" />}
          placeholder="vous@example.com"
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />
        <Button type="submit" variant="accent" size="lg" className="w-full" loading={isSubmitting}>
          Envoyer le code
        </Button>
      </form>
    </div>
  )
}
