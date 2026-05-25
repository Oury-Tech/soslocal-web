import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT — Formulaire */}
      <div className="flex-1 flex flex-col bg-[rgb(var(--bg))]">
        <header className="flex items-center justify-between p-4 lg:p-6">
          <Link href="/" aria-label="Accueil SOSLocal">
            <Logo size="md" />
          </Link>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>

        <footer className="text-center text-xs text-[rgb(var(--muted-fg))] p-4">
          © {new Date().getFullYear()} SOSLocal · Programme Allô Maître / MEATFP Guinée
        </footer>
      </div>

      {/* RIGHT — Panneau visuel épuré */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center p-12 xl:p-16" style={{ background: '#3B37E9' }}>
        <div className="text-white max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-sm font-medium mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Plateforme officielle Allô Maître
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
            Le dépannage urbain<br />réinventé pour<br />la Guinée.
          </h2>
          <p className="mt-6 text-lg text-white/65 leading-relaxed">
            Rejoignez la première plateforme géolocalisée du programme Allô Maître.
            Trouvez ou proposez des services techniques en quelques secondes.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { value: '130+', label: 'Artisans certifiés' },
              { value: '< 30s', label: 'Délai moyen' },
              { value: '4.8/5', label: 'Satisfaction' },
              { value: '24/7', label: 'Disponibilité' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 border border-white/20 p-4">
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
