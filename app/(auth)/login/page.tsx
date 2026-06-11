'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth.store'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})
type LoginForm = z.infer<typeof loginSchema>

const ROLE_REDIRECTS: Record<string, string> = {
  client: '/beneficiaire',
  technician: '/artisan',
  operator: '/operateur',
  admin: '/operateur',
}

/** Récupère une destination interne sûre depuis ?returnTo= (anti open-redirect). */
function getSafeReturnTo(): string | null {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('returnTo')
  if (!raw) return null
  let path: string
  try {
    path = decodeURIComponent(raw)
  } catch {
    return null
  }
  // Uniquement des chemins internes : commence par "/" mais pas "//" (évite //evil.com)
  if (!path.startsWith('/') || path.startsWith('//')) return null
  if (path === '/login' || path === '/register') return null
  return path
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const { login, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginForm) => {
    try {
      const user = await login(data, remember)
      toast.success(`Bienvenue, ${user.name}`)
      router.push(getSafeReturnTo() || ROLE_REDIRECTS[user.role] || '/beneficiaire')
    } catch (err: any) {
      toast.error(err.message || 'Erreur de connexion')
    }
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          Bon retour !
        </h1>
        <p className="mt-2 text-muted-foreground">
          Connectez-vous à votre compte SOSLocal pour continuer.
        </p>
      </div>

      {/* Mock mode notice */}
      {process.env.NEXT_PUBLIC_MOCK_AUTH === 'true' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Mode démo activé.</strong> Tapez n'importe quel email/mot de passe.
            Utilisez <code className="px-1 bg-amber-100 dark:bg-amber-900/40 rounded">artisan@…</code> pour le rôle artisan,
            <code className="px-1 bg-amber-100 dark:bg-amber-900/40 rounded">operateur@…</code> pour opérateur.
          </div>
        </div>
      )}

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

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Mot de passe"
            icon={<Lock className="h-4 w-4" />}
            placeholder="••••••••"
            error={errors.password?.message}
            autoComplete="current-password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[2.4rem] text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Cacher' : 'Afficher'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
            />
            <span className="text-muted-foreground">Se souvenir</span>
          </label>
          <Link href="/forgot-password" className="text-brand-700 dark:text-brand-300 hover:underline font-medium">
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full" loading={isLoading}>
          Se connecter
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold text-brand-700 dark:text-brand-300 hover:underline">
          Créer un compte
        </Link>
      </div>
    </div>
  )
}
