import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react'

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

const SOCIALS = [
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
]

export function Footer() {
  return (
    <footer className="bg-[#0B1A33] text-white">
      <div className="container-app py-14 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">

          {/* Logo + infos */}
          <div className="lg:col-span-4">
            <div className="inline-flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="SOSLocal"
                width={48}
                height={48}
                className="rounded-xl flex-shrink-0 object-cover"
              />
              <span className="font-display font-extrabold tracking-tight text-2xl">
                <span className="text-white">SOS</span>
                <span className="text-accent-400">Local</span>
              </span>
            </div>

            <p className="mt-5 text-sm text-white/60 leading-relaxed max-w-xs">
              Plateforme de dépannage géolocalisé en temps réel. Trouvez un artisan certifié près de chez vous en quelques secondes.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <a href="mailto:contact@soslocal.gn"
                className="flex items-center gap-2.5 text-white/70 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-accent-400 flex-shrink-0" />
                contact@soslocal.gn
              </a>
              <a href="tel:+22462730606"
                className="flex items-center gap-2.5 text-white/70 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-accent-400 flex-shrink-0" />
                +224 627 30 60 60
              </a>
              <div className="flex items-center gap-2.5 text-white/70">
                <MapPin className="h-4 w-4 text-accent-400 flex-shrink-0" />
                Conakry, République de Guinée
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="mt-7 flex items-center gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 hover:bg-brand-500 hover:text-white transition-all duration-200"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Liens */}
          <nav aria-label="Liens de pied de page" className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {LINKS.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-xs uppercase tracking-[0.18em] text-white/40 mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="inline-block text-sm text-white/70 hover:text-white hover:translate-x-0.5 transition-all duration-200"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Barre du bas */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50 text-center sm:text-left">
            © {new Date().getFullYear()} SOSLocal · Tous droits réservés · Conakry, Guinée
          </p>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Tous les systèmes opérationnels
          </div>
        </div>
      </div>
    </footer>
  )
}
