import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const SECTIONS = [
  {
    title: 'Plateforme',
    links: [
      { label: 'Fonctionnalités', href: '#features' },
      { label: 'Comment ça marche', href: '#how-it-works' },
      { label: 'Pour qui', href: '#audience' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Comptes',
    links: [
      { label: 'Se connecter', href: '/login' },
      { label: 'Devenir bénéficiaire', href: '/register?role=client' },
      { label: 'Devenir artisan', href: '/register?role=technician' },
      { label: 'Espace opérateur', href: '/login' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Conditions d\'utilisation', href: '/legal/terms' },
      { label: 'Politique de confidentialité', href: '/legal/privacy' },
      { label: 'Mentions légales', href: '/legal/notice' },
      { label: 'Protection des données', href: '/legal/data' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container-app py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Logo + description */}
          <div className="lg:col-span-4">
            <Logo size="lg" />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Plateforme intelligente de dépannage géolocalisé en temps réel pour les services
              techniques urbains en Guinée. Cas du programme Allô Maître du MEATFP.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <a
                href="mailto:contact@soslocal.gn"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4 text-accent-600" />
                contact@soslocal.gn
              </a>
              <a
                href="tel:+22462730606"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4 text-accent-600" />
                +224 627 30 60 60
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-accent-600 flex-shrink-0" />
                <span>Conakry, République de Guinée</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted hover:border-accent-500/50 transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Réseau social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {SECTIONS.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} SOSLocal · Tous droits réservés.
            <span className="block sm:inline sm:ml-2">
              Programme officiel <strong className="text-foreground">Allô Maître</strong> du{' '}
              <strong className="text-foreground">MEATFP</strong>.
            </span>
          </p>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Tous les systèmes opérationnels
          </div>
        </div>
      </div>
    </footer>
  )
}
