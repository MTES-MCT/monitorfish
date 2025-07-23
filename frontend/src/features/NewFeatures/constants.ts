import { dummyNewFeatures } from '@features/NewFeatures/__tests__/__mocks__/dummyNewFeatures'
import { isCypress } from '@utils/isCypress'

import type { MonitorFishFeature } from '@features/NewFeatures/types'

export const NEW_FEATURES: Array<MonitorFishFeature> = isCypress()
  ? dummyNewFeatures
  : [
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
