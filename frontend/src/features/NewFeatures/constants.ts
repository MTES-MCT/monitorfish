import { dummyNewFeatures } from '@features/NewFeatures/__tests__/__mocks__/dummyNewFeatures'
import { isCypress } from '@utils/isCypress'

import type { MonitorFishFeature } from '@features/NewFeatures/types'

export const NEW_FEATURES: Array<MonitorFishFeature> = isCypress()
  ? dummyNewFeatures
  : [
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
