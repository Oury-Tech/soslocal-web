'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Phone, Eye, EyeOff, Users, Wrench, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils/cn'
import { SERVICES } from '@/lib/mock-data'
import type { UserRole } from '@/types'

const registerSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro invalide'),
  password: z.string()
    .min(8, 'Au moins 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
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
  const [selectedServices, setSelectedServices] = useState<number[]>([])
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

  const toggleService = (id: number) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const onSubmit = async (data: RegisterForm) => {
    if (data.role === 'technician' && selectedServices.length === 0) {
      toast.error('Sélectionnez au moins un service que vous proposez.')
      return
    }
    try {
      const user = await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        ...(data.role === 'technician' && { service_ids: selectedServices }),
      } as any)
      toast.success(`Bienvenue ${user.name} ! Votre compte a été créé.`)
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                onClick={() => {
                  setValue('role', opt.v)
                  setSelectedServices([])
                }}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  role === opt.v
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-2 ring-brand-500/20'
                    : 'border-border hover:border-brand-300 dark:hover:border-brand-700'
                )}
              >
                <opt.icon className={cn('h-5 w-5 mb-2', role === opt.v ? 'text-brand-600' : 'text-muted-foreground')} />
                <div className="font-semibold text-sm">{opt.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Services — technicien uniquement */}
        {role === 'technician' && (
          <div>
            <label className="block mb-2 text-sm font-medium">
              Services proposés
              <span className="ml-1 text-xs text-muted-foreground font-normal">(sélectionnez au moins 1)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map((svc) => {
                const selected = selectedServices.includes(svc.id)
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className={cn(
                      'relative flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all',
                      selected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-border hover:border-brand-300 dark:hover:border-brand-700 bg-card'
                    )}
                  >
                    <span className="text-xl leading-none">{svc.icon}</span>
                    <div className="min-w-0">
                      <div className={cn('text-sm font-medium truncate', selected && 'text-brand-700 dark:text-brand-300')}>
                        {svc.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{svc.category}</div>
                    </div>
                    {selected && (
                      <CheckCircle2 className="h-4 w-4 text-brand-500 flex-shrink-0 absolute top-2 right-2" />
                    )}
                  </button>
                )
              })}
            </div>
            {selectedServices.length > 0 && (
              <p className="text-xs text-brand-600 dark:text-brand-400 mt-2 font-medium">
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} sélectionné{selectedServices.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

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
