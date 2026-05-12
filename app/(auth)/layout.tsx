import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT — Form */}
      <div className="flex-1 flex flex-col">
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

        <footer className="text-center text-xs text-muted-foreground p-4">
          © {new Date().getFullYear()} SOSLocal · Programme Allô Maître / MEATFP Guinée
        </footer>
      </div>

      {/* RIGHT — Visual panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-accent-700">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 20%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-400/30 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-400/30 rounded-full filter blur-3xl animate-blob animation-delay-2000" />

        <div className="relative flex flex-col justify-center p-12 xl:p-16 text-white">
          <h2 className="font-display text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
            Le dépannage urbain<br />
            <span className="text-accent-300">réinventé</span> pour la Guinée.
          </h2>
          <p className="mt-6 text-lg text-brand-100 leading-relaxed max-w-md">
            Rejoignez la première plateforme géolocalisée du programme Allô Maître.
            Trouvez ou proposez des services techniques en quelques secondes.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-md">
            {[
              { value: '130+', label: 'Artisans certifiés' },
              { value: '< 30s', label: 'Délai moyen' },
              { value: '4.8/5', label: 'Satisfaction' },
              { value: '24/7', label: 'Disponibilité' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
                <div className="text-3xl font-display font-extrabold">{stat.value}</div>
                <div className="text-xs text-brand-100 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
