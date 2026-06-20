import Link from 'next/link'
import { ShieldCheck, MapPin, Smartphone, Star } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const BENEFITS = [
  { icon: ShieldCheck, label: 'Artisans certifiés', desc: 'Identité et compétences vérifiées avant l’accès.' },
  { icon: MapPin, label: 'Suivi en temps réel', desc: 'L’arrivée de votre artisan sur la carte, minute par minute.' },
  { icon: Smartphone, label: 'Paiement Mobile Money', desc: 'Orange Money, MTN MoMo ou espèces, en toute simplicité.' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT — Formulaire */}
      <div className="flex-1 flex flex-col bg-background dark:bg-[#07070f]">
        <header className="flex items-center justify-between p-4 lg:p-6">
          <Link href="/" aria-label="Accueil SOSLocal">
            <Logo size="lg" />
          </Link>
          <ThemeToggle />
        </header>

        <main id="main-content" className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md bg-card dark:bg-brand-950/60 dark:border dark:border-border rounded-2xl p-6 sm:p-8 shadow-soft">
            {children}
          </div>
        </main>

        <footer className="text-center text-xs text-muted-foreground p-4">
          © {new Date().getFullYear()} SOSLocal · Conakry, Guinée
        </footer>
      </div>

      {/* RIGHT — Panneau visuel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center p-12 xl:p-16 bg-brand-600 dark:bg-brand-950">
        <div className="text-white max-w-md">
          {/* Pastille d'accroche */}
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1.5 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-accent-400" aria-hidden />
            Plateforme de dépannage géolocalisée
          </span>

          <h2 className="mt-6 text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
            Le dépannage urbain<br />réinventé pour<br />la Guinée.
          </h2>
          <p className="mt-5 text-lg text-white/70 leading-relaxed">
            Trouvez ou proposez des services techniques en quelques secondes.
          </p>

          {/* Liste de bénéfices — signature des landings SaaS */}
          <ul className="mt-9 space-y-4">
            {BENEFITS.map((b) => (
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

          {/* Témoignage compact */}
          <figure className="mt-10 rounded-2xl bg-white/10 border border-white/20 p-5">
            <div className="flex items-center gap-1 text-accent-400" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-white/90">
              « En moins de 10 minutes, un plombier certifié était chez moi. Le suivi
              sur la carte change tout. »
            </blockquote>
            <figcaption className="mt-3 text-xs text-white/60">
              Aïssatou B. · Bénéficiaire à Conakry
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  )
}
