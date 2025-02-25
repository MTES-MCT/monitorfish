import { dummyNewFeatures } from '@features/NewFeatures/__tests__/__mocks__/dummyNewFeatures'
import { isCypress } from '@utils/isCypress'

import type { MonitorFishFeature } from '@features/NewFeatures/types'

export const NEW_FEATURES: Array<MonitorFishFeature> = isCypress()
  ? dummyNewFeatures
  : [
      {
        date: '2024-02-24',
        description: "Cette section permet de vous partager l'ajout ou l'améliorations de fonctionnalités.",
        for: 'ALL',
        title: 'Ajout de la section "Nouveautés"',
        type: 'NEW_FEATURE'
      }
    ]
