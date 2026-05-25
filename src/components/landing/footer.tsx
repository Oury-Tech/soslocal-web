import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Mail, Phone, MapPin } from 'lucide-react'

const LINKS = [
  {
    title: 'Plateforme',
    items: [
      { label: 'Fonctionnalités', href: '#features' },
      { label: 'Comment ça marche', href: '#how-it-works' },
      { label: 'Pour qui', href: '#audience' },
    ],
  },
  {
    title: 'Accès',
    items: [
      { label: 'Se connecter', href: '/login' },
      { label: 'Devenir bénéficiaire', href: '/register?role=client' },
      { label: 'Devenir artisan', href: '/register?role=technician' },
      { label: 'Espace opérateur', href: '/login' },
    ],
  },
  {
    title: 'Légal',
    items: [
      { label: 'Conditions d\'utilisation', href: '/legal/terms' },
      { label: 'Confidentialité', href: '/legal/privacy' },
      { label: 'Mentions légales', href: '/legal/notice' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-[rgb(var(--border))] bg-[rgb(var(--card))]">
      <div className="container-app py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Logo + infos */}
          <div className="lg:col-span-4">
            <Logo size="md" />
            <p className="mt-4 text-sm text-[rgb(var(--muted-fg))] leading-relaxed max-w-xs">
              Plateforme de dépannage géolocalisé en temps réel. Trouvez un artisan certifié près de chez vous en quelques secondes.
            </p>

            <div className="mt-5 space-y-2.5 text-sm">
              <a href="mailto:contact@soslocal.gn"
                className="flex items-center gap-2 text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))] transition-colors">
                <Mail className="h-4 w-4 text-brand-500 flex-shrink-0" />
                contact@soslocal.gn
              </a>
              <a href="tel:+22462730606"
                className="flex items-center gap-2 text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))] transition-colors">
                <Phone className="h-4 w-4 text-brand-500 flex-shrink-0" />
                +224 627 30 60 60
              </a>
              <div className="flex items-center gap-2 text-[rgb(var(--muted-fg))]">
                <MapPin className="h-4 w-4 text-brand-500 flex-shrink-0" />
                Conakry, République de Guinée
              </div>
            </div>
          </div>

          {/* Liens */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {LINKS.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-sm text-[rgb(var(--fg))] mb-4">{section.title}</h4>
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-sm text-[rgb(var(--muted-fg))] hover:text-[rgb(var(--fg))] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Barre du bas */}
        <div className="mt-12 pt-8 border-t border-[rgb(var(--border))] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[rgb(var(--muted-fg))] text-center sm:text-left">
            © {new Date().getFullYear()} SOSLocal · Tous droits réservés · Conakry, Guinée
          </p>
          <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-fg))]">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Tous les systèmes opérationnels
          </div>
        </div>
      </div>
    </footer>
  )
}
