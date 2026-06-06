import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions d'utilisation · SOSLocal",
  description: "Conditions générales d'utilisation de la plateforme SOSLocal — Programme Allô Maître du MEATFP, République de Guinée.",
}

export default function TermsPage() {
  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <div className="not-prose mb-8">
        <p className="text-sm text-muted-foreground">Dernière mise à jour : 18 mai 2026</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-2 text-foreground">
          Conditions générales d'utilisation
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Ces conditions régissent l'utilisation de la plateforme SOSLocal, service officiel du
          programme <strong className="text-foreground">Allô Maître</strong> du Ministère de l'Enseignement Technique
          et de la Formation Professionnelle (MEATFP), République de Guinée.
        </p>
      </div>

      <Section title="1. Présentation de la plateforme">
        <p>
          SOSLocal est une plateforme numérique de mise en relation géolocalisée entre des
          bénéficiaires ayant besoin de services techniques (plomberie, électricité, mécanique,
          menuiserie, etc.) et des artisans certifiés inscrits au programme Allô Maître du MEATFP.
        </p>
        <p>
          La plateforme est éditée par le programme Allô Maître, initiative du Ministère de
          l'Enseignement Technique et de la Formation Professionnelle de la République de Guinée,
          dont le siège est situé à Conakry, République de Guinée.
        </p>
      </Section>

      <Section title="2. Acceptation des conditions">
        <p>
          L'accès et l'utilisation de la plateforme SOSLocal impliquent l'acceptation pleine et
          entière des présentes conditions générales d'utilisation (CGU). Si vous n'acceptez pas
          ces conditions, vous devez cesser immédiatement d'utiliser la plateforme.
        </p>
        <p>
          Ces CGU sont susceptibles d'être modifiées à tout moment. Les utilisateurs seront
          informés de toute modification substantielle par email ou notification dans l'application.
          L'utilisation continue de la plateforme après modification vaut acceptation des nouvelles
          conditions.
        </p>
      </Section>

      <Section title="3. Inscription et compte utilisateur">
        <p>
          Pour accéder aux services de la plateforme, l'utilisateur doit créer un compte en
          fournissant des informations exactes, complètes et à jour. L'utilisateur s'engage à :
        </p>
        <ul>
          <li>Fournir une adresse email valide et un numéro de téléphone guinéen actif ;</li>
          <li>Maintenir la confidentialité de ses identifiants de connexion ;</li>
          <li>Notifier immédiatement SOSLocal de toute utilisation non autorisée de son compte ;</li>
          <li>N'ouvrir qu'un seul compte par personne physique ou morale.</li>
        </ul>
        <p>
          SOSLocal se réserve le droit de suspendre ou résilier tout compte en cas de violation
          des présentes CGU, de fourniture d'informations inexactes ou de comportement préjudiciable
          à la communauté.
        </p>
      </Section>

      <Section title="4. Rôles et obligations des utilisateurs">
        <h3>4.1 Bénéficiaires</h3>
        <p>
          Les bénéficiaires (clients) s'engagent à :
        </p>
        <ul>
          <li>Décrire avec précision la nature de l'intervention demandée ;</li>
          <li>Être présents ou disponibles lors de l'intervention convenue ;</li>
          <li>Régler le montant convenu à l'artisan à l'issue de l'intervention ;</li>
          <li>Laisser un avis honnête et constructif après chaque mission ;</li>
          <li>Ne pas solliciter des artisans en dehors de la plateforme afin de contourner les commissions.</li>
        </ul>

        <h3>4.2 Artisans certifiés</h3>
        <p>
          Les artisans inscrits au programme Allô Maître s'engagent à :
        </p>
        <ul>
          <li>Détenir les certifications et qualifications requises par leur corps de métier ;</li>
          <li>Accepter ou refuser les missions dans les délais indiqués par la plateforme ;</li>
          <li>Respecter les horaires convenus avec les bénéficiaires ;</li>
          <li>Exécuter les travaux dans les règles de l'art, conformément aux normes en vigueur ;</li>
          <li>Maintenir leur disponibilité à jour sur la plateforme ;</li>
          <li>Ne pas exercer de pratiques discriminatoires ou déloyales.</li>
        </ul>

        <h3>4.3 Opérateurs Allô Maître</h3>
        <p>
          Les opérateurs ont accès à des fonctionnalités de supervision et sont soumis à une
          charte déontologique spécifique signée lors de leur recrutement par le MEATFP.
        </p>
      </Section>

      <Section title="5. Tarification et paiements">
        <p>
          Les tarifs des interventions sont fixés librement par les artisans dans le cadre des
          grilles tarifaires indicatives établies par le programme Allô Maître. Les paiements
          s'effectuent via les systèmes de Mobile Money agréés (Orange Money, MTN MoMo) ou en
          espèces selon l'accord des parties.
        </p>
        <p>
          SOSLocal perçoit une commission de <strong>10 %</strong> sur chaque transaction réalisée
          via la plateforme, prélevée automatiquement sur le montant reversé à l'artisan. Cette
          commission contribue au financement du programme Allô Maître et à la maintenance de
          la plateforme.
        </p>
        <p>
          En cas de litige sur le montant d'une prestation, l'utilisateur peut saisir le service
          de médiation SOSLocal dans un délai de 7 jours ouvrables suivant la fin de l'intervention.
        </p>
      </Section>

      <Section title="6. Responsabilités">
        <p>
          SOSLocal agit en qualité d'intermédiaire technique et ne peut être tenu responsable :
        </p>
        <ul>
          <li>De la qualité des prestations réalisées par les artisans ;</li>
          <li>Des dommages matériels ou corporels résultant d'une intervention ;</li>
          <li>Des interruptions de service dues à des causes extérieures (réseau, force majeure) ;</li>
          <li>Des informations inexactes fournies par les utilisateurs.</li>
        </ul>
        <p>
          Les artisans certifiés sont des professionnels indépendants. Leur inscription sur la
          plateforme ne crée aucun lien de subordination avec SOSLocal ou le MEATFP.
        </p>
      </Section>

      <Section title="7. Propriété intellectuelle">
        <p>
          L'ensemble des éléments constituant la plateforme SOSLocal (logo, interface, code source,
          textes, données) est protégé par le droit de la propriété intellectuelle applicable en
          République de Guinée. Toute reproduction, distribution ou utilisation à des fins
          commerciales sans autorisation préalable est strictement interdite.
        </p>
      </Section>

      <Section title="8. Résiliation">
        <p>
          Tout utilisateur peut mettre fin à son compte à tout moment depuis la section
          « Paramètres » de son profil. La résiliation prend effet immédiatement et entraîne
          la suppression des données personnelles dans un délai de 30 jours, sous réserve des
          obligations légales de conservation.
        </p>
        <p>
          SOSLocal peut résilier un compte sans préavis en cas de violation grave des présentes
          CGU, d'activité frauduleuse ou sur injonction d'une autorité compétente.
        </p>
      </Section>

      <Section title="9. Droit applicable et juridiction compétente">
        <p>
          Les présentes CGU sont soumises au droit de la République de Guinée. Tout litige
          relatif à leur interprétation ou leur exécution sera soumis, à défaut de résolution
          amiable, à la compétence exclusive des tribunaux de Conakry.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Pour toute question relative aux présentes CGU, vous pouvez nous contacter :
        </p>
        <ul>
          <li>Par email : <a href="mailto:legal@soslocal.gn" className="text-accent-600 hover:underline">legal@soslocal.gn</a></li>
          <li>Par téléphone : +224 627 30 60 60</li>
          <li>Par courrier : Programme Allô Maître / MEATFP, Conakry, République de Guinée</li>
        </ul>
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
      <div className="space-y-4 text-muted-foreground leading-relaxed [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_strong]:text-foreground [&_a]:text-accent-600 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}
