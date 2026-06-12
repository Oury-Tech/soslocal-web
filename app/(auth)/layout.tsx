import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

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
          <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
            Le dépannage urbain<br />réinventé pour<br />la Guinée.
          </h2>
          <p className="mt-6 text-lg text-white/70 leading-relaxed">
            Trouvez ou proposez des services techniques en quelques secondes.
            Géolocalisation temps réel, chat intégré, paiement Mobile Money.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { value: '130+', label: 'Artisans vérifiés' },
              { value: '< 30s', label: 'Délai moyen' },
              { value: '4.8/5', label: 'Satisfaction' },
              { value: '24/7', label: 'Disponibilité' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 p-4">
                <div className="text-3xl font-extrabold">{stat.value}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
