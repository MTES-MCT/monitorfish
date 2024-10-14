import { describe, expect, it } from '@jest/globals'

import { displayOnboardFishingSpecies } from '../utils'

import type { Logbook } from '@features/Logbook/Logbook.types'

describe('features/PriorNotification/components/PriorNotificationList/utils', () => {
  it('displayOnboardFishingSpecies() should return the expected result', () => {
    const onboardCatches = [
      { species: 'ABC', speciesName: `ABC Name`, weight: 0 },
      { species: 'BF1', speciesName: `Thon rouge de l'Atlantique (Calibre 1)`, weight: 1 },
      { species: 'DEF', speciesName: `DEF Name`, weight: 2 },
      { species: 'ABC', speciesName: `ABC Name`, weight: 3 },
      { species: 'BFT', speciesName: `Thon rouge de l'Atlantique`, weight: 4 },
      { species: 'DEF', speciesName: `DEF Name`, weight: 5 },
      { species: 'BF2', speciesName: `Thon rouge de l'Atlantique (Calibre 2)`, weight: 6 },
      { species: 'BF3', speciesName: `Thon rouge de l'Atlantique (Calibre 3)`, weight: 7 }
    ] as Logbook.Catch[]

    const result = displayOnboardFishingSpecies(onboardCatches)

    expect(result).toMatchSnapshot()
  })
})
