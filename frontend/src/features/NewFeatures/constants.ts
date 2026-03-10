import { dummyNewFeatures } from '@features/NewFeatures/__tests__/__mocks__/dummyNewFeatures'
import { isCypress } from '@utils/isCypress'

import type { MonitorFishFeature } from '@features/NewFeatures/types'

export const NEW_FEATURES: Array<MonitorFishFeature> = isCypress()
  ? dummyNewFeatures
  : [
      {
        date: '2026-03-10',
        description: `Les signalements sont désormais affichés sur la carte.

Vous pouvez :
- **filtrer** les signalements par type, statut et période,
- **cliquer** sur une icône pour afficher le détail du signalement.

Les points d'intérêts se retrouvent maintenant en-dessous de l'outil de mesure.`,
        for: 'CNSP',
        title: `Affichage des signalements sur la carte`,
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-12-17',
        description: `Les infractions (codes NATINF) sont désormais catégorisées selon leur famille et leur type dans les comptes rendus de contrôles à partir de l'année 2026.

Cette catégorisation s'articule autour de **7 familles principales** :
- **Activités INN**,
- **Entrave au contrôle**,
- **Mesures techniques et de conservation**,
- **Obligation de débarquement**,
- **Obligations déclaratives**,
- **Filière**,
- **Sécurité**,
- **Gens de mer**,
- **TAAF**.

Cette nouvelle classification permet d'affiner la définition des infractions, et facilite donc leur analyse.

Exemple:
Différentes familles et types viennent préciser le **NATINF 27689** :


1. **Obligation de débarquement**
- BMS (JPE)
- DIS/DIM (JPE)

2. **Obligations déclaratives**
- Certification capture
- COE/COX
- DEP
- Engin/maillage (JPE)
- EOF
- FAR (JPE)
- JPE non fonctionnel/absent
- LAN (JPE)
- Marge de tolérance
- LSC (JPE)
- RTP

Les catégories s'affichent dans les détails des contrôles et lors de la saisie d'infractions.`,
        for: 'ALL',
        title: `Ajout de la catégorisation des infractions (NATINF)`,
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-12-11',
        description: `Un nouveau champ **"Modalités de contact"** a été ajouté dans l'onglet "Identité" de la fiche navire.

Cette fonctionnalité facilite la communication avec les navires, en permettant aux équipes opérationnelles de savoir immédiatement quel numéro appeler.`,
        for: 'ALL',
        title: `Ajout des modalités de contact dans la fiche navire`,
        type: 'IMPROVEMENT'
      },
      {
        date: '2025-10-14',
        description: `Vous pouvez désormais créer des alertes paramétrables dans l'onglet "Gestion des alertes" situé dans le menu "Alertes" de la deuxième fenêtre.

Les critères des alertes sont, dans un premier temps :
- Navires,
- Organisations de producteurs,
- Départements et quartiers,
- Nationalités,
- Zones administratives et réglementaires.

La liste vous permet de visualiser les critères de déclenchement des alertes fixes et paramétrables.

⚠️  Toute modification ou suppression affectera tous les utilisateurs du CNSP.
`,
        for: 'CNSP',
        title: `Ajout des alertes paramétrables`,
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-10-14',
        description: `Le filtre "Port de débarque" prends également en comptes les préavis de débarquement émis par les navires ne disposant pas de JPE.

Cela permet de suivre le retour au port des navires soumis au préavis de débarquement.`,
        for: 'ALL',
        title: `Ajout des préavis manuels dans le filte "Port de débarque" de la liste des navires`,
        type: 'IMPROVEMENT'
      },
      {
        date: '2025-09-05',
        description: `Le filtre "Dernier contrôle" de la liste des navires a été remplacé par deux filtres :
- Dernier contrôle à quai,
- Dernier contrôle en mer.

Cela permet d'affiner le ciblage d'un navire avec son dernier contrôle.

Si vous aviez créé des groupes de navires dynamiques avec ce critère, les deux filtres "Dernier contrôle à quai" et "Dernier contrôle en mer" prennent l'ancienne valeur.
`,
        for: 'ALL',
        title: `Amélioration du filtre "Dernier contrôle" de la liste des navires`,
        type: 'IMPROVEMENT'
      },
      {
        date: '2025-08-27',
        description: `La création d'un groupe de navires fixe est simplifiée, le nom du navire et son pavillon ne sont plus requis.
Vous pouvez désormais créer une liste CSV seulement avec :
- CFR (optionel)
- Call Sign (optionel)
- Marquage externe (optionel)

⚠️  Au moins un identifiant parmis les trois est nécessaire, mais le CFR est le plus précis pour identifier un navire.`,
        for: 'ALL',
        title: `Simplification de la création des groupes fixes depuis une liste (CSV)`,
        type: 'IMPROVEMENT'
      },
      {
        date: '2025-08-26',
        description: `Vous pouvez désormais filtrer les navires par **port de débarque**.

Lorsqu’un navire a transmis un **préavis de débarquement** (message JPE PNO) encore actif, il apparaîtra dans les résultats si ce filtre est appliqué. Ce filtre peut également être utilisé dans les groupes de navires.

Cette fonctionnalité permet de visualiser directement sur la cartographie les navires en approche d’un port, afin de mieux planifier les contrôles à la débarque.
`,
        for: 'ALL',
        title: `Ajout du filtre "Port de débarque" dans la liste des navires et les groupes`,
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-07-23',
        description: `Vous pouvez retrouver l'identité du patron dans les coordonnées en bas de la fiche "Identité" de la fiche navire.

Ces coordonnées sont récupérées à partir des messages du journal de pêche électronique (JPE).
`,
        for: 'ALL',
        title: `Affichage de l'identité du patron dans l'onglet "Identité" de la fiche navire`,
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-07-23',
        description: `Il est désormais possible de créer des groupes de navires avec une **date de début**.
Cela permet par exemple de constituer un groupe de navire en avance d'un suivi réglementaire limité dans le temps (ex. fermeture spatio-temporelle).`,
        for: 'ALL',
        title: `Ajout de la date de début de validité dans les groupes de navires`,
        type: 'IMPROVEMENT'
      },
      {
        date: '2025-07-23',
        description: `Le type de transmission des messages JPE est maintenant affiché dans la vue "JPE" de la fiche navire, vous y trouverez :
- **JPE: Journal de pêche électronique** (via les logiciels de bord IKTUS ou TurboCatch),
- **JPP: Journal de pêche papier** (numérisé par FranceAgriMer via VisioCaptures avec un délai),
- **FPP: Fiches de pêche papier** (numérisé par FranceAgriMer via VisioCaptures avec un délai),
- **VIS: VisioCaptures** (Fiche de pêche télétransmise ou journal de pêche télétransmis via VisioCaptures).
`,
        for: 'ALL',
        title: `Affichage du type de transmission des messages JPE`,
        type: 'IMPROVEMENT'
      },
      {
        date: '2025-07-22',
        description: `Vous pouvez désormais afficher les données d'activité aggregées de l'année en cours dans une nouvelle carte accessible depuis le bouton "📊 Données d'activité" situé à gauche de la cartographie.

Vous trouverez dans cette visualisation un lien entre les messages de captures (à partir de sa position ou du carré statistique) et le port de débarquement.
`,
        for: 'ALL',
        title: `Affichage des données d'activité`,
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-06-25',
        description: `Vous pouvez désormais retrouver dans l'onglet "Règles des alerte" de la fenêtre des alertes l'explication
du fonctionnement de celles-ci.`,
        for: 'CNSP',
        title: `Explication du fonctionnement des alertes`,
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-06-11',
        description: `Il est désormais possible d'afficher directement sur la cartographie les segments de flottes des
 navires depuis l'onglet "Gérer l'affichage des dernières positions".`,
        for: 'EXTERNAL',
        title: `Affichage des segments de flottes sur la carte`,
        type: 'IMPROVEMENT'
      },
      {
        date: '2025-06-09',
        description: `
Nous analysons désormais l'activité annuelle des navires afin de déterminer s'ils disposent de VisioCaptures.

Cette information est disponible dans l'onglet ERS/VMS de la fiche navire.
      `,
        for: 'ALL',
        title: `Affichage des navires sous VisioCaptures`,
        type: 'IMPROVEMENT'
      },
      {
        date: '2025-06-04',
        description: `Il est désormais possible de créer des groupes de navires partagés entre les utilisateurs du CNSP.
Les groupes, qu’ils soient fixes ou dynamiques, peuvent être partagés au sein des pôles :
- OPS métropole
- OPS outre-mer
- Réglementation/Planification
- SIP

⚠️ Attention : tous les utilisateurs ayant accès à un groupe partagé peuvent le modifier ou le supprimer.`,
        for: 'CNSP',
        title: `Ajout du groupes partagés`,
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-05-30',
        description: `Le filtre "Organisation de Producteurs" (OP) a été ajouté à la liste des navires.
Il est désormais possible de créer des groupes dynamiques en utilisant ce critère, ce qui peut s’avérer utile pour surveiller une fermeture de quotas.`,
        for: 'ALL',
        title: `Ajout du filtre "Organisation de Producteur"`,
        type: 'IMPROVEMENT'
      },
      {
        date: '2025-05-26',
        description: `L’onglet "Résumé" de la fiche navire intègre désormais un **profil d’activité** basé sur les données de l’année écoulée. Ce profil permet d’identifier les caractéristiques récurrentes du navire :
- Engins de pêche les plus fréquemment utilisés
- Espèces principalement capturées
- Zones de pêche les plus exploitées
- Ports de débarquement les plus fréquentés

Ces informations sont calculées automatiquement à partir des **déclarations de captures**.
`,
        for: 'ALL',
        title: 'Ajout du profil de navire',
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-05-20',
        description: `La liste des navires inclut désormais **l’ensemble des navires ayant eu une activité**, qu’ils soient équipés ou non du VMS.
Cela comprend :
- les navires avec VMS ;
- les navires sans VMS, mais ayant une activité identifiée via le JPE, VisioCaptures ou fiches papier.

Grâce à cette amélioration, vous pouvez créer des groupes fixes - intégrant des navires sans VMS - mais également des groupes dynamiques, en s’appuyant sur les données du JPE en temps réél (lorsqu’elles sont disponibles), ou sur **les engins utilisés et les segments de flotte récents.**
  `,
        for: 'ALL',
        title: 'Affichage des navires actifs et filtrage selon l’activité récente',
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-05-15',
        description: `La fiche détaillée de chaque navire affiche désormais les groupes auxquels il est rattaché. Cela vous permet de visualiser d’un coup d’œil son appartenance à différents groupes, qu’ils soient fixes ou dynamiques.`,
        for: 'ALL',
        title: `Consultation des groupes depuis la fiche navire`,
        type: 'IMPROVEMENT'
      },
      {
        date: '2025-05-1',
        description: `Il est désormais possible de créer des **groupes de navires fixes**, permettant de regrouper manuellement une sélection de navires.

Deux méthodes sont disponibles pour créer ces groupes :
- **Depuis la liste des navires**, en cochant les navires souhaités ;
- Par **import de fichier CSV**, directement depuis la fenêtre de création d’un groupe fixe (un exemple de fichier est fourni pour vous guider).`,
        for: 'ALL',
        title: 'Ajout des groupes de navires fixes',
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-04-8',
        description: `Les filtres ont été remplacés par les Groupes de navires dynamiques.

Cette nouvelle fonctionnalité permet :
- D’afficher sur la carte les navires correspondant à des critères définis.
- De visualiser plusieurs groupes en simultané.
  - Vous pouvez épingler un groupe pour qu’il soit affiché en priorité.

⚠️ Important: si vous aviez enregistré des filtres auparavant, il est nécessaire de les recréer en tant que groupes.
          `,
        for: 'ALL',
        title: 'Ajout des groupes de navires dynamiques',
        type: 'NEW_FEATURE'
      },
      {
        date: '2025-04-7',
        description: `La liste des navires équipés de VMS a été repensée : elle s’ouvre désormais dans une seconde fenêtre.

Elle vous permet :
- De filtrer les navires selon de nombreux critères : note de risque, segment de flotte, engins, espèces à bord, date du dernier contrôle, zone, quartier, etc.
- De créer des groupes de navires dynamiques à partir des filtres appliqués.
`,
        for: 'ALL',
        title: 'Nouvelle interface pour la liste des navires avec VMS',
        type: 'IMPROVEMENT'
      },
      {
        date: '2024-03-10',
        description:
          "Ajout d'alertes opérationnelles signalant qu'un navire a atteint la quantité maximale autorisée " +
          'de lingue bleue par le R(UE) 1241 de 6 tonnes à bord en zone 27.6.a.',
        for: 'CNSP',
        title: 'Alertes captures accessoires de lingue bleue',
        type: 'NEW_FEATURE'
      },
      {
        date: '2024-03-10',
        description:
          "Ajout d'alertes opérationnelles de détection d'activité de pêche en zone NEAFC (pêche soumise à " +
          'autorisation).',
        for: 'CNSP',
        title: 'Alertes pêche en zone NEAFC',
        type: 'NEW_FEATURE'
      },
      {
        date: '2024-03-5',
        description:
          "Il est désormais possible d'afficher les positions et la marée du navire grâce au bouton " +
          '"Voir la marée du contrôle", accessible dans les détails du contrôle de la fiche navire.',
        for: 'ALL',
        title: 'Affichage de la marée depuis le contrôle',
        type: 'IMPROVEMENT'
      },
      {
        date: '2024-03-5',
        description:
          "Pour faciliter la consultation des marées d'un navire, la recherche de ses positions " +
          "affiche la marée correspondante dans l'onglet JPE. Cette amélioration permet de retrouver plus rapidement " +
          'une marée sur une période donnée.',
        for: 'ALL',
        title: 'Affichage de la marée à partir de la piste du navire',
        type: 'IMPROVEMENT'
      },
      {
        date: '2024-02-26',
        description:
          "Pour améliorer les performances de l'application, il est désormais possible de stocker " +
          'les fonds de cartes sur votre poste. Pour activer la fonctionnalité, cochez "Télécharger les ' +
          'cartes en local" dans l\'onglet "Mon compte".',
        for: 'ALL',
        title: 'Téléchargement des fonds de cartes en local',
        type: 'NEW_FEATURE'
      },
      {
        date: '2024-02-24',
        description: "Cette section permet de vous partager l'ajout ou l'améliorations de fonctionnalités.",
        for: 'ALL',
        title: 'Ajout de la section "Nouveautés"',
        type: 'NEW_FEATURE'
      }
    ]
