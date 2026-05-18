import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Protection des données · SOSLocal',
  description: 'Vos droits ARCO et la protection de vos données personnelles sur SOSLocal — Programme Allô Maître, République de Guinée.',
}

export default function DataPage() {
  return (
    <article>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Dernière mise à jour : 18 mai 2026</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-2 text-foreground">
          Protection des données personnelles
        </h1>
        <p className="text-muted-foreground mt-2 text-lg leading-relaxed">
          SOSLocal s'engage fermement à protéger la vie privée de ses utilisateurs.
          Cette page détaille concrètement vos droits, nos engagements et les mesures
          mises en place pour sécuriser vos données.
        </p>
      </div>

      {/* Banner CTA */}
      <div className="mb-10 p-5 rounded-2xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
        <h2 className="font-semibold text-foreground mb-1">Exercer vos droits simplement</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Accédez à vos données, demandez leur correction ou leur suppression directement
          depuis votre espace personnel, ou contactez notre DPO.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-xl text-sm font-semibold hover:bg-accent-700 transition-colors"
          >
            Mon espace personnel
          </Link>
          <a
            href="mailto:dpo@soslocal.gn"
            className="inline-flex items-center gap-2 px-4 py-2 border border-accent-400 text-accent-700 dark:text-accent-300 rounded-xl text-sm font-semibold hover:bg-accent-50 dark:hover:bg-accent-900/30 transition-colors"
          >
            Contacter le DPO
          </a>
        </div>
      </div>

      <Section title="1. Nos principes fondamentaux">
        <div className="grid sm:grid-cols-2 gap-4 not-prose">
          {[
            { emoji: '🔒', title: 'Minimisation', desc: 'Nous ne collectons que les données strictement nécessaires au fonctionnement du service.' },
            { emoji: '🎯', title: 'Finalité', desc: 'Vos données ne sont utilisées que pour les finalités déclarées et ne sont jamais revendues.' },
            { emoji: '⏳', title: 'Durée limitée', desc: 'Les données sont conservées uniquement le temps nécessaire, puis supprimées ou anonymisées.' },
            { emoji: '🛡️', title: 'Sécurité', desc: 'Des mesures techniques robustes protègent vos données contre tout accès non autorisé.' },
            { emoji: '👁️', title: 'Transparence', desc: 'Vous savez exactement quelles données nous collectons et pourquoi.' },
            { emoji: '✅', title: 'Consentement', desc: 'Votre consentement est explicitement recueilli pour les traitements qui le nécessitent.' },
          ].map((p) => (
            <div key={p.title} className="flex gap-3 p-4 rounded-xl bg-muted/40 border border-border">
              <span className="text-2xl">{p.emoji}</span>
              <div>
                <div className="font-semibold text-foreground text-sm">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="2. Vos droits ARCO+ en détail">
        <div className="space-y-4">
          {[
            {
              droit: 'Droit d\'Accès',
              code: 'A',
              color: 'brand',
              desc: 'Vous pouvez obtenir une copie de toutes les données personnelles vous concernant que nous détenons. Cette copie vous sera transmise dans un format lisible dans un délai de 30 jours.',
              comment: 'Via "Mon profil → Télécharger mes données" ou par email à dpo@soslocal.gn',
            },
            {
              droit: 'Droit de Rectification',
              code: 'R',
              color: 'accent',
              desc: 'Vous pouvez corriger à tout moment des données inexactes ou incomplètes. Les modifications sont effectives immédiatement depuis votre profil.',
              comment: 'Directement dans "Mon profil → Informations personnelles"',
            },
            {
              droit: 'Droit à l\'Effacement',
              code: 'E',
              color: 'amber',
              desc: 'Vous pouvez demander la suppression de vos données personnelles, sous réserve de nos obligations légales de conservation (notamment les données comptables et fiscales).',
              comment: 'Via "Paramètres → Compte → Supprimer mon compte" ou par email',
            },
            {
              droit: 'Droit d\'Opposition',
              code: 'O',
              color: 'red',
              desc: 'Vous pouvez vous opposer à tout moment au traitement de vos données à des fins de marketing, de profilage ou lorsque le traitement est basé sur notre intérêt légitime.',
              comment: 'Via "Paramètres → Notifications" pour le marketing',
            },
            {
              droit: 'Droit à la Portabilité',
              code: 'P',
              color: 'purple',
              desc: 'Vous pouvez récupérer vos données dans un format structuré et interopérable (JSON, CSV) pour les transférer à un autre service.',
              comment: 'Sur demande à dpo@soslocal.gn — délai : 30 jours',
            },
            {
              droit: 'Droit à la Limitation',
              code: 'L',
              color: 'gray',
              desc: 'Vous pouvez demander la suspension temporaire du traitement de vos données, par exemple pendant la vérification d\'une demande de rectification.',
              comment: 'Sur demande à dpo@soslocal.gn',
            },
          ].map((item) => (
            <div key={item.droit} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-3">
                <span className="h-8 w-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.code}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm mb-1">{item.droit}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  <p className="text-xs text-accent-700 dark:text-accent-400 mt-2 font-medium">
                    → {item.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="3. Sécurité technique des données">
        <p>
          SOSLocal met en œuvre les mesures de sécurité suivantes pour protéger vos données :
        </p>
        <div className="grid sm:grid-cols-2 gap-3 not-prose">
          {[
            { icon: '🔐', label: 'Chiffrement TLS 1.3', desc: 'Toutes les communications entre votre appareil et nos serveurs sont chiffrées' },
            { icon: '🔑', label: 'Hachage bcrypt', desc: 'Les mots de passe ne sont jamais stockés en clair' },
            { icon: '🛡️', label: 'Authentification 2FA', desc: 'Option de double authentification disponible pour les comptes artisans et opérateurs' },
            { icon: '👤', label: 'Accès restreint', desc: 'Seul le personnel habilité peut accéder aux données personnelles, sur base du besoin d\'en connaître' },
            { icon: '📋', label: 'Journalisation', desc: 'Tous les accès aux données sont tracés et audités régulièrement' },
            { icon: '🔔', label: 'Alertes intrusion', desc: 'Un système de détection d\'anomalies surveille les accès suspects en temps réel' },
            { icon: '🗑️', label: 'Suppression sécurisée', desc: 'Les données supprimées sont effacées de manière irréversible via des procédures certifiées' },
            { icon: '📡', label: 'Réseau privé', desc: 'Les bases de données ne sont pas exposées directement sur internet (accès via VPN interne)' },
          ].map((m) => (
            <div key={m.label} className="flex gap-3 p-3 rounded-lg border border-border bg-muted/20">
              <span className="text-xl">{m.icon}</span>
              <div>
                <div className="text-sm font-semibold text-foreground">{m.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="4. Données des mineurs">
        <p>
          La plateforme SOSLocal est réservée aux personnes majeures (18 ans et plus) ou aux
          mineurs disposant d'une autorisation parentale. Si nous apprenons qu'un mineur de
          moins de 16 ans a fourni des données personnelles sans autorisation parentale, nous
          supprimerons ces informations dans les plus brefs délais.
        </p>
        <p>
          Les parents ou tuteurs légaux peuvent nous contacter à{' '}
          <a href="mailto:dpo@soslocal.gn" className="text-accent-600 hover:underline">dpo@soslocal.gn</a>{' '}
          pour toute demande concernant les données d'un mineur.
        </p>
      </Section>

      <Section title="5. Notification en cas de violation">
        <p>
          En cas de violation de données personnelles susceptible d'engendrer un risque élevé
          pour vos droits et libertés, SOSLocal s'engage à vous en informer dans les{' '}
          <strong className="text-foreground">72 heures</strong> suivant la détection de
          l'incident, conformément aux meilleures pratiques internationales.
        </p>
        <p>
          La notification précisera la nature de la violation, les catégories de données
          concernées, les mesures prises et les recommandations pour limiter les risques
          potentiels.
        </p>
      </Section>

      <Section title="6. Délégué à la Protection des Données (DPO)">
        <p>
          SOSLocal a désigné un Délégué à la Protection des Données (DPO) chargé de veiller
          au respect de la réglementation applicable et de répondre à vos demandes.
        </p>
        <div className="p-4 rounded-xl bg-muted/40 border border-border text-sm space-y-2">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-24 flex-shrink-0">Fonction :</span>
            <span className="text-foreground font-medium">Délégué à la Protection des Données</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-24 flex-shrink-0">Email :</span>
            <a href="mailto:dpo@soslocal.gn" className="text-accent-600 hover:underline">dpo@soslocal.gn</a>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-24 flex-shrink-0">Délai :</span>
            <span className="text-foreground">Réponse garantie sous 30 jours calendaires</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-24 flex-shrink-0">Courrier :</span>
            <span className="text-foreground">DPO SOSLocal / MEATFP, Conakry, République de Guinée</span>
          </div>
        </div>
      </Section>

      <Section title="7. Liens utiles">
        <div className="flex flex-wrap gap-3 not-prose">
          {[
            { label: 'Politique de confidentialité',  href: '/legal/privacy' },
            { label: "Conditions d'utilisation",      href: '/legal/terms'   },
            { label: 'Mentions légales',               href: '/legal/notice'  },
            { label: 'Paramètres de confidentialité', href: '/parametres'     },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </Section>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-xl font-bold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed text-sm [&_strong]:text-foreground [&_a]:text-accent-600 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}
