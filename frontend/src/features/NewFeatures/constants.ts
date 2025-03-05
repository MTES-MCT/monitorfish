import { dummyNewFeatures } from '@features/NewFeatures/__tests__/__mocks__/dummyNewFeatures'
import { isCypress } from '@utils/isCypress'

import type { MonitorFishFeature } from '@features/NewFeatures/types'

export const NEW_FEATURES: Array<MonitorFishFeature> = isCypress()
  ? dummyNewFeatures
  : [
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
