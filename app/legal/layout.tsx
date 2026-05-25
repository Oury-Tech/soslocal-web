import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const LEGAL_LINKS = [
  { href: '/legal/terms',   label: "Conditions d'utilisation" },
  { href: '/legal/privacy', label: 'Politique de confidentialité' },
  { href: '/legal/notice',  label: 'Mentions légales' },
  { href: '/legal/data',    label: 'Protection des données' },
]

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="container-app flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Accueil">
              <Logo size="sm" />
            </Link>
            <span className="hidden sm:block text-sm text-muted-foreground">/ Informations légales</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </div>
        </div>
      </header>

      <div className="container-app py-10 lg:py-16">
        <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Sidebar navigation */}
          <aside className="lg:col-span-1">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Documents légaux
              </p>
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-6 px-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pour toute question, contactez-nous à{' '}
                  <a href="mailto:legal@soslocal.gn" className="text-brand-600 hover:underline">
                    legal@soslocal.gn
                  </a>
                </p>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="container-app flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} SOSLocal · Programme Allô Maître / MEATFP Guinée</span>
          <Link href="/" className="hover:text-foreground transition-colors">Retour à l'accueil</Link>
        </div>
      </footer>
    </div>
  )
}
