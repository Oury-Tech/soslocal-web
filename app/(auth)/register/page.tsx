'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Phone, Eye, EyeOff, Users, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types'

const registerSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro invalide'),
  password: z.string().min(8, 'Au moins 8 caractères'),
  confirmPassword: z.string(),
  role: z.enum(['client', 'technician']),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})
type RegisterForm = z.infer<typeof registerSchema>

const ROLE_REDIRECTS: Record<UserRole, string> = {
  client: '/beneficiaire',
  technician: '/artisan',
  operator: '/operateur',
  admin: '/operateur',
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') as 'client' | 'technician') || 'client'

  const [showPassword, setShowPassword] = useState(false)
  const { register: registerUser, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: initialRole },
  })
  const role = watch('role')

  const onSubmit = async (data: RegisterForm) => {
    try {
      const user = await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      })
      toast.success(`Bienvenue ${user.name} ! Votre compte a été créé. 🎉`)
      router.push(ROLE_REDIRECTS[user.role])
    } catch (err: any) {
      toast.error(err.message || 'Erreur d\'inscription')
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          Créer votre compte
        </h1>
        <p className="mt-2 text-muted-foreground">
          Rejoignez la communauté SOSLocal en quelques secondes.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role selector */}
        <div>
          <label className="block mb-2 text-sm font-medium">Je suis</label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { v: 'client', icon: Users, label: 'Bénéficiaire', desc: 'Je cherche un artisan' },
              { v: 'technician', icon: Wrench, label: 'Artisan', desc: 'Je propose mes services' },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setValue('role', opt.v)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  role === opt.v
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 ring-2 ring-accent-500/20'
                    : 'border-border hover:border-border/80'
                )}
              >
                <opt.icon className={cn('h-5 w-5 mb-2', role === opt.v ? 'text-accent-600' : 'text-muted-foreground')} />
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Nom complet"
          icon={<User className="h-4 w-4" />}
          placeholder="Mamadou Oury Diallo"
          error={errors.name?.message}
          autoComplete="name"
          {...register('name')}
        />

        <Input
          type="email"
          label="Email"
          icon={<Mail className="h-4 w-4" />}
          placeholder="vous@example.com"
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Input
          type="tel"
          label="Téléphone"
          icon={<Phone className="h-4 w-4" />}
          placeholder="+224 627 30 60 60"
          error={errors.phone?.message}
          autoComplete="tel"
          {...register('phone')}
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Mot de passe"
            icon={<Lock className="h-4 w-4" />}
            placeholder="Au moins 8 caractères"
            error={errors.password?.message}
            autoComplete="new-password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[2.4rem] text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Input
          type={showPassword ? 'text' : 'password'}
          label="Confirmer le mot de passe"
          icon={<Lock className="h-4 w-4" />}
          placeholder="Répétez le mot de passe"
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="accent" size="lg" className="w-full" loading={isLoading}>
          Créer mon compte
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          En vous inscrivant, vous acceptez nos{' '}
          <Link href="/legal/terms" className="underline hover:text-foreground">conditions d'utilisation</Link>{' '}
          et notre{' '}
          <Link href="/legal/privacy" className="underline hover:text-foreground">politique de confidentialité</Link>.
        </p>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link href="/login" className="font-semibold text-brand-700 dark:text-brand-300 hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  )
}
