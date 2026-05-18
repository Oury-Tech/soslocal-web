import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité · SOSLocal',
  description: 'Comment SOSLocal collecte, utilise et protège vos données personnelles — Programme Allô Maître du MEATFP, République de Guinée.',
}

export default function PrivacyPage() {
  return (
    <article>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Dernière mise à jour : 18 mai 2026</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-2 text-foreground">
          Politique de confidentialité
        </h1>
        <p className="text-muted-foreground mt-2 text-lg leading-relaxed">
          La protection de vos données personnelles est une priorité pour SOSLocal.
          Cette politique explique comment nous collectons, utilisons et protégeons vos
          informations dans le cadre du programme{' '}
          <strong className="text-foreground">Allô Maître</strong> du MEATFP.
        </p>
      </div>

      <Section title="1. Responsable du traitement">
        <p>
          Le responsable du traitement des données personnelles collectées via la plateforme
          SOSLocal est le <strong>Ministère de l'Enseignement Technique et de la Formation
          Professionnelle (MEATFP)</strong>, représenté par la direction du programme
          Allô Maître, dont le siège est situé à Conakry, République de Guinée.
        </p>
        <p>
          Délégué à la Protection des Données (DPO) :<br />
          Email : <a href="mailto:dpo@soslocal.gn">dpo@soslocal.gn</a><br />
          Téléphone : +224 627 30 60 60
        </p>
      </Section>

      <Section title="2. Données collectées">
        <h3>2.1 Données fournies directement</h3>
        <ul>
          <li><strong>Identité :</strong> nom complet, photo de profil (optionnel)</li>
          <li><strong>Contact :</strong> adresse email, numéro de téléphone mobile</li>
          <li><strong>Localisation :</strong> adresse, coordonnées GPS (avec consentement explicite)</li>
          <li><strong>Documents professionnels (artisans) :</strong> certificats, diplômes, pièce d'identité</li>
          <li><strong>Paiement :</strong> numéro de compte Mobile Money (jamais stocké en clair)</li>
        </ul>

        <h3>2.2 Données collectées automatiquement</h3>
        <ul>
          <li>Adresse IP et données de navigation</li>
          <li>Type et version de navigateur / appareil</li>
          <li>Données d'utilisation : pages visitées, durée de session, actions effectuées</li>
          <li>Géolocalisation en temps réel (uniquement si activée par l'utilisateur)</li>
          <li>Journaux d'activité (logs) pour la sécurité et la détection de fraudes</li>
        </ul>

        <h3>2.3 Données générées par l'utilisation</h3>
        <ul>
          <li>Historique des demandes et missions</li>
          <li>Évaluations et avis laissés</li>
          <li>Messages échangés via le chat intégré</li>
          <li>Transactions financières</li>
        </ul>
      </Section>

      <Section title="3. Finalités et base légale du traitement">
        <table>
          <thead>
            <tr>
              <th>Finalité</th>
              <th>Base légale</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Création et gestion des comptes utilisateurs</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Mise en relation bénéficiaire / artisan</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Géolocalisation pour trouver un artisan proche</td>
              <td>Consentement explicite</td>
            </tr>
            <tr>
              <td>Traitement des paiements Mobile Money</td>
              <td>Exécution du contrat</td>
            </tr>
            <tr>
              <td>Envoi de notifications push et emails</td>
              <td>Consentement / intérêt légitime</td>
            </tr>
            <tr>
              <td>Amélioration de la plateforme (analytics)</td>
              <td>Intérêt légitime</td>
            </tr>
            <tr>
              <td>Prévention des fraudes et sécurité</td>
              <td>Obligation légale / intérêt légitime</td>
            </tr>
            <tr>
              <td>Statistiques pour le programme Allô Maître / MEATFP</td>
              <td>Mission de service public</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="4. Durée de conservation des données">
        <ul>
          <li><strong>Données de compte actif :</strong> pendant toute la durée d'utilisation + 3 ans après désactivation</li>
          <li><strong>Historique des transactions :</strong> 10 ans (obligation comptable et fiscale)</li>
          <li><strong>Logs de sécurité :</strong> 12 mois</li>
          <li><strong>Messages du chat :</strong> 2 ans après la fin de la mission</li>
          <li><strong>Documents d'identité (artisans) :</strong> durée de l'inscription + 5 ans</li>
          <li><strong>Données de géolocalisation en temps réel :</strong> non stockées de manière permanente</li>
        </ul>
        <p>
          Au-delà de ces durées, les données sont supprimées ou anonymisées de manière
          irréversible.
        </p>
      </Section>

      <Section title="5. Vos droits">
        <p>
          Conformément à la réglementation applicable, vous disposez des droits suivants sur
          vos données personnelles :
        </p>
        <ul>
          <li><strong>Droit d'accès :</strong> obtenir une copie de toutes les données vous concernant</li>
          <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes</li>
          <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données (sous réserve des obligations légales de conservation)</li>
          <li><strong>Droit à la limitation :</strong> restreindre temporairement le traitement de vos données</li>
          <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et lisible par machine</li>
          <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements (notamment à des fins de marketing)</li>
          <li><strong>Droit de retrait du consentement :</strong> à tout moment pour les traitements basés sur le consentement</li>
        </ul>
        <p>
          Pour exercer vos droits, contactez notre DPO à{' '}
          <a href="mailto:dpo@soslocal.gn">dpo@soslocal.gn</a> ou via votre espace
          « Paramètres → Confidentialité ». Nous répondons dans un délai de 30 jours.
        </p>
      </Section>

      <Section title="6. Partage des données">
        <p>Vos données peuvent être partagées avec :</p>
        <ul>
          <li>
            <strong>Les autres utilisateurs de la plateforme :</strong> les informations de profil
            visibles (nom, photo, note, profession) sont partagées entre bénéficiaires et artisans
            pour faciliter la mise en relation ;
          </li>
          <li>
            <strong>Les prestataires de paiement :</strong> Orange Guinée (Orange Money),
            MTN Guinée (MoMo) — uniquement les données nécessaires à la transaction ;
          </li>
          <li>
            <strong>Le MEATFP :</strong> données statistiques agrégées et anonymisées pour
            le pilotage du programme Allô Maître ;
          </li>
          <li>
            <strong>Les autorités compétentes :</strong> sur réquisition judiciaire ou
            administrative conformément à la loi guinéenne.
          </li>
        </ul>
        <p>
          SOSLocal ne vend jamais vos données personnelles à des tiers à des fins commerciales.
        </p>
      </Section>

      <Section title="7. Sécurité des données">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour
          protéger vos données contre tout accès non autorisé, perte ou divulgation :
        </p>
        <ul>
          <li>Chiffrement des communications (HTTPS/TLS 1.3)</li>
          <li>Chiffrement des mots de passe (bcrypt)</li>
          <li>Authentification à deux facteurs disponible</li>
          <li>Accès aux données restreint au personnel habilité</li>
          <li>Audits de sécurité réguliers</li>
          <li>Journalisation et monitoring des accès</li>
        </ul>
        <p>
          En cas de violation de données susceptible d'engendrer un risque pour vos droits
          et libertés, nous vous en informerons dans les meilleurs délais.
        </p>
      </Section>

      <Section title="8. Cookies et technologies similaires">
        <p>
          La plateforme web utilise des cookies essentiels au fonctionnement du service
          (session, préférences de thème) ainsi que des cookies analytiques anonymisés
          pour mesurer l'audience. Vous pouvez configurer votre navigateur pour refuser
          les cookies non essentiels.
        </p>
      </Section>

      <Section title="9. Transferts internationaux">
        <p>
          Les données sont hébergées en priorité sur des serveurs situés en Afrique de l'Ouest.
          Tout transfert vers d'autres régions est encadré par des garanties contractuelles
          appropriées conformément aux meilleures pratiques internationales en matière de
          protection des données.
        </p>
      </Section>

      <Section title="10. Modifications de la politique">
        <p>
          Nous nous réservons le droit de modifier cette politique à tout moment. La date
          de dernière mise à jour figure en haut de ce document. Les modifications
          substantielles feront l'objet d'une notification par email ou notification
          dans l'application au moins 15 jours avant leur entrée en vigueur.
        </p>
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
      <div className="space-y-4 text-muted-foreground leading-relaxed text-sm [&_h3]:text-foreground [&_h3]:font-semibold [&_h3]:text-base [&_h3]:mt-5 [&_h3]:mb-2 [&_strong]:text-foreground [&_a]:text-accent-600 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_table]:w-full [&_table]:border-collapse [&_th]:text-left [&_th]:py-2 [&_th]:px-3 [&_th]:bg-muted [&_th]:text-foreground [&_th]:font-semibold [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide [&_td]:py-2 [&_td]:px-3 [&_td]:border-b [&_td]:border-border">
        {children}
      </div>
    </section>
  )
}
