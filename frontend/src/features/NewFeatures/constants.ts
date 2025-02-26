import { dummyNewFeatures } from '@features/NewFeatures/__tests__/__mocks__/dummyNewFeatures'
import { isCypress } from '@utils/isCypress'

import type { MonitorFishFeature } from '@features/NewFeatures/types'

export const NEW_FEATURES: Array<MonitorFishFeature> = isCypress()
  ? dummyNewFeatures
  : [
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
