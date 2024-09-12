import { describe, expect, it } from '@jest/globals'

import { displayOnboardFishingSpecies } from '../utils'

import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

describe('features/PriorNotification/components/PriorNotificationList/utils', () => {
  it('displayOnboardFishingSpecies() should return the expected result', () => {
    const onboardCatches = [
      { species: 'ABC', speciesName: 'ABC Name', weight: 0 },
      { species: 'DEF', speciesName: 'DEF Name', weight: 1 },
      { species: 'ABC', speciesName: 'ABC Name', weight: 2 },
      { species: 'DEF', speciesName: 'DEF Name', weight: 3 },
      { species: 'ABC', speciesName: 'ABC Name', weight: 4 }
    ] as LogbookMessage.Catch[]

    const result = displayOnboardFishingSpecies(onboardCatches)

    expect(result).toMatchSnapshot()
  })
})
