import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales · SOSLocal',
  description: 'Mentions légales de la plateforme SOSLocal — Programme Allô Maître du MEATFP, République de Guinée.',
}

export default function NoticePage() {
  return (
    <article>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Dernière mise à jour : 18 mai 2026</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-2 text-foreground">
          Mentions légales
        </h1>
        <p className="text-muted-foreground mt-2 text-lg leading-relaxed">
          Conformément aux dispositions légales applicables en République de Guinée,
          voici les informations légales relatives à l'édition et à l'hébergement de
          la plateforme SOSLocal.
        </p>
      </div>

      <Section title="1. Éditeur de la plateforme">
        <InfoGrid rows={[
          { label: 'Dénomination',        value: 'Programme Allô Maître — SOSLocal' },
          { label: 'Organisme de tutelle', value: "Ministère de l'Enseignement Technique et de la Formation Professionnelle (MEATFP)" },
          { label: 'Nature juridique',    value: 'Service public — initiative gouvernementale' },
          { label: 'Siège social',        value: 'Conakry, République de Guinée' },
          { label: 'Email de contact',    value: 'contact@soslocal.gn', isEmail: true },
          { label: 'Téléphone',           value: '+224 627 30 60 60' },
        ]} />
      </Section>

      <Section title="2. Directeur de la publication">
        <InfoGrid rows={[
          { label: 'Fonction',  value: 'Directeur du programme Allô Maître, MEATFP' },
          { label: 'Contact',   value: 'direction@soslocal.gn', isEmail: true },
        ]} />
      </Section>

      <Section title="3. Développement et conception">
        <InfoGrid rows={[
          { label: 'Maîtrise d\'œuvre', value: 'Mamadou Oury Diallo' },
          { label: 'Qualité',           value: 'Ingénieur en informatique, concepteur de la plateforme SOSLocal' },
          { label: 'Email',             value: 'ourying2003@gmail.com', isEmail: true },
          { label: 'Contexte',          value: 'Projet académique et institutionnel — Programme Allô Maître / MEATFP Guinée' },
        ]} />
      </Section>

      <Section title="4. Hébergement">
        <p>
          La plateforme SOSLocal est hébergée dans le respect des normes de sécurité et de
          disponibilité. Les données sont stockées sur des infrastructures sécurisées disposant
          des certifications ISO 27001.
        </p>
        <InfoGrid rows={[
          { label: 'Type d\'infrastructure', value: 'Cloud sécurisé — serveurs en Afrique de l\'Ouest' },
          { label: 'Contact hébergeur',      value: 'infra@soslocal.gn', isEmail: true },
        ]} />
      </Section>

      <Section title="5. Propriété intellectuelle">
        <p>
          L'ensemble des éléments de la plateforme SOSLocal — incluant, sans s'y limiter, le
          logo, la charte graphique, l'interface utilisateur, les textes, les illustrations,
          les bases de données et le code source — sont protégés par les droits de propriété
          intellectuelle applicables en République de Guinée.
        </p>
        <p>
          Toute reproduction totale ou partielle, par quelque procédé que ce soit, sans
          autorisation préalable et écrite du MEATFP, est strictement interdite et constitue
          une contrefaçon sanctionnée par la loi.
        </p>
        <p>
          Le logo et la marque <strong>« SOSLocal »</strong> ainsi que <strong>« Allô Maître »</strong>{' '}
          sont des marques appartenant au MEATFP, République de Guinée.
        </p>
      </Section>

      <Section title="6. Limitation de responsabilité">
        <p>
          SOSLocal s'efforce d'assurer l'exactitude et la mise à jour des informations
          diffusées sur la plateforme. Toutefois, SOSLocal ne peut garantir l'exactitude,
          la précision ou l'exhaustivité des informations mises à disposition.
        </p>
        <p>
          En conséquence, SOSLocal décline toute responsabilité pour :
        </p>
        <ul>
          <li>Toute imprécision, inexactitude ou omission portant sur des informations disponibles sur la plateforme ;</li>
          <li>Tout dommage résultant d'une intrusion frauduleuse d'un tiers ;</li>
          <li>Tout dommage matériel lié à l'utilisation de la plateforme, notamment en cas d'interruption temporaire du service ;</li>
          <li>La qualité des prestations réalisées par les artisans inscrits sur la plateforme.</li>
        </ul>
      </Section>

      <Section title="7. Liens hypertextes">
        <p>
          La plateforme SOSLocal peut contenir des liens vers des sites tiers. Ces liens
          sont fournis à titre informatif uniquement. SOSLocal n'exerce aucun contrôle sur
          ces sites et décline toute responsabilité quant à leur contenu.
        </p>
        <p>
          Tout site souhaitant créer un lien vers SOSLocal doit obtenir préalablement
          l'autorisation écrite de l'éditeur.
        </p>
      </Section>

      <Section title="8. Droit applicable">
        <p>
          Les présentes mentions légales sont soumises au droit de la République de Guinée.
          Tout litige relatif à leur interprétation sera soumis à la compétence exclusive
          des tribunaux de Conakry, République de Guinée.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          Pour toute question relative aux présentes mentions légales ou à l'utilisation
          de la plateforme, vous pouvez nous contacter :
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
      <div className="space-y-4 text-muted-foreground leading-relaxed text-sm [&_strong]:text-foreground [&_a]:text-accent-600 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  )
}

function InfoGrid({ rows }: { rows: { label: string; value: string; isEmail?: boolean }[] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {rows.map((row, i) => (
        <div key={i} className={`flex flex-col sm:flex-row ${i < rows.length - 1 ? 'border-b border-border' : ''}`}>
          <div className="sm:w-52 flex-shrink-0 px-4 py-3 bg-muted/40 text-xs font-semibold text-foreground uppercase tracking-wide">
            {row.label}
          </div>
          <div className="px-4 py-3 text-sm text-muted-foreground">
            {row.isEmail ? (
              <a href={`mailto:${row.value}`} className="text-accent-600 hover:underline">
                {row.value}
              </a>
            ) : (
              row.value
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
