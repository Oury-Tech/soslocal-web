'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User, Phone, Eye, EyeOff, Users, Wrench, CheckCircle2, MapPin, X } from 'lucide-react'
import { ServiceIcon } from '@/lib/utils/service-icons'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth.store'
import { cn } from '@/lib/utils/cn'
import { SERVICES } from '@/lib/mock-data'
import { passwordSchema } from '@/lib/validation/password'
import { PasswordChecklist } from '@/components/features/auth/PasswordChecklist'
import { normalizePhone, isValidGuineaPhone } from '@/lib/utils/phone'
import type { UserRole } from '@/types'

const registerSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  email: z.string().email('Email invalide'),
  phone: z.string().refine(isValidGuineaPhone, 'Numéro guinéen invalide (ex. +224 6XX XX XX XX)'),
  password: passwordSchema,
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
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle')
  const { register: registerUser, isLoading } = useAuthStore()

  // Position de l'artisan : indispensable pour la recherche par distance côté bénéficiaire.
  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      toast.error("La géolocalisation n'est pas disponible sur cet appareil.")
      setGeoStatus('denied')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setGeoStatus('granted')
        toast.success('Position enregistrée. Les bénéficiaires proches pourront vous trouver.')
      },
      () => {
        setGeoStatus('denied')
        toast.error("Position refusée. Vous pourrez l'ajouter plus tard depuis votre profil.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

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
  const password = watch('password') ?? ''

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
      const profession = selectedServices.length > 0
        ? SERVICES.filter((s) => selectedServices.includes(s.id)).map((s) => s.name).join(' / ')
        : 'Artisan'
      const user = await registerUser({
        name: data.name,
        email: data.email,
        phone: normalizePhone(data.phone),
        password: data.password,
        role: data.role,
        ...(data.role === 'technician' && {
          service_ids: selectedServices,
          profession,
          ...(coords && { latitude: coords.latitude, longitude: coords.longitude }),
        }),
      })
      toast.success(`Bienvenue ${user.name} ! Vérifiez votre email pour activer votre compte.`)
      // S'inscrire <<include>> Vérifier email (cf. diagramme Authentification)
      router.push(user.is_email_verified ? ROLE_REDIRECTS[user.role] : '/verify-email')
    } catch (err: any) {
      const msg = String(err?.message ?? '')
      const isPhoneDup = /phone|téléphone|numéro/i.test(msg) && /exist|already|déjà|utilis|registered|unique|duplicate/i.test(msg)
      toast.error(isPhoneDup ? 'Ce numéro de téléphone est déjà associé à un compte.' : (msg || "Erreur d'inscription"))
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
            {/* Liste déroulante : on défile jusqu'au métier voulu, puis on l'ajoute */}
            <select
              value=""
              onChange={(e) => {
                const id = Number(e.target.value)
                if (id) toggleService(id)
              }}
              className="w-full h-11 px-4 rounded-lg bg-white dark:bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Ajouter un service…</option>
              {SERVICES.filter((svc) => !selectedServices.includes(svc.id)).map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} · {svc.category}
                </option>
              ))}
            </select>

            {/* Services sélectionnés (puces retirables) */}
            {selectedServices.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {SERVICES.filter((svc) => selectedServices.includes(svc.id)).map((svc) => (
                  <span
                    key={svc.id}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-full border border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-sm font-medium text-brand-700 dark:text-brand-300"
                  >
                    <ServiceIcon slug={svc.slug} name={svc.name} className="h-4 w-4 flex-shrink-0" />
                    {svc.name}
                    <button
                      type="button"
                      onClick={() => toggleService(svc.id)}
                      aria-label={`Retirer ${svc.name}`}
                      className="ml-0.5 rounded-full p-0.5 text-brand-600 hover:bg-brand-500/15 dark:text-brand-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Position — permet aux bénéficiaires proches de trouver l'artisan */}
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium">
                Votre position
                <span className="ml-1 text-xs text-muted-foreground font-normal">(recommandé pour être trouvé près de chez vous)</span>
              </label>
              <button
                type="button"
                onClick={requestLocation}
                disabled={geoStatus === 'loading'}
                className={cn(
                  'flex w-full items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all',
                  geoStatus === 'granted'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-border hover:border-brand-300 dark:hover:border-brand-700 bg-card'
                )}
              >
                <MapPin className={cn('h-5 w-5 flex-shrink-0', geoStatus === 'granted' ? 'text-brand-600' : 'text-muted-foreground')} />
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {geoStatus === 'loading' && 'Localisation en cours…'}
                    {geoStatus === 'granted' && 'Position enregistrée'}
                    {geoStatus === 'denied' && 'Réessayer la localisation'}
                    {geoStatus === 'idle' && 'Partager ma position'}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {coords
                      ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
                      : 'Utilise la géolocalisation de votre navigateur'}
                  </div>
                </div>
                {geoStatus === 'granted' && (
                  <CheckCircle2 className="h-4 w-4 text-brand-500 flex-shrink-0 ml-auto" />
                )}
              </button>
            </div>
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
          <PasswordChecklist value={password} />
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
