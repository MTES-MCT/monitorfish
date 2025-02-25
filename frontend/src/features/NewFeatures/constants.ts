import { dummyNewFeatures } from '@features/NewFeatures/__tests__/__mocks__/dummyNewFeatures'
import { isCypress } from '@utils/isCypress'

import type { MonitorFishFeature } from '@features/NewFeatures/types'

export const NEW_FEATURES: Array<MonitorFishFeature> = isCypress()
  ? dummyNewFeatures
  : [
      {
        date: '2024-04-24',
        description: 'Ajout de la section "Nouveautés" & Ajout de la section "Nouveautés"',
        for: 'ALL',
        title: 'Ajout de la section "Nouveautés"',
        type: 'NEW_FEATURE'
      },
      {
        date: '2024-03-24',
        description: 'Ajout de la section "Nouveautés" & Ajout de la section "Nouveautés"',
        for: 'ALL',
        title: 'Ajout de la section deux "Nouveautés"',
        type: 'NEW_FEATURE'
      },
      {
        date: '2024-02-24',
        description: 'Ajout de la section "Nouveautés" & Ajout de la section "Nouveautés"',
        for: 'CNSP',
        title: 'Ajout de la section quatre "Nouveautés"',
        type: 'IMPROVEMENT'
      },
      {
        date: '2024-02-25',
        description: 'Ajout de la section "Nouveautés" & Ajout de la section "Nouveautés"',
        for: 'EXTERNAL',
        title: 'Ajout de la section trois "Nouveautés"',
        type: 'NEW_FEATURE'
      },
      {
        date: '2024-01-24',
        description: 'Ajout de la section "Nouveautés" & Ajout de la section "Nouveautés"',
        for: 'ALL',
        title: 'Ajout de la section quatre "Nouveautés"',
        type: 'NEW_FEATURE'
      }
    ]
