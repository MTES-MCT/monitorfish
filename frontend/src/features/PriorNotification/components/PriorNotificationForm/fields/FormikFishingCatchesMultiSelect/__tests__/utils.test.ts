import { describe, expect, it } from '@jest/globals'

import { sortFishingCatches } from '../utils'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

describe('@features/PriorNotification/components/PriorNotificationForm/fields/FormikFishingCatchesMultiSelectsortFishingCatches/utils.ts', () => {
  it('sortFishingCatches() should sort BFT specy codes as expected', () => {
    const fishingCatches = [
      { specyCode: 'AAA' },
      { specyCode: 'BF2' },
      { specyCode: 'BBB' },
      { specyCode: 'BF1' },
      { specyCode: 'BFT' },
      { specyCode: 'CCC' },
      { specyCode: 'BF3' }
    ] as PriorNotification.PriorNotificationDataFishingCatch[]

    const result = fishingCatches.sort(sortFishingCatches)

    expect(result).toEqual([
      { specyCode: 'BFT' },
      { specyCode: 'BF1' },
      { specyCode: 'BF2' },
      { specyCode: 'BF3' },
      { specyCode: 'AAA' },
      { specyCode: 'BBB' },
      { specyCode: 'CCC' }
    ] as PriorNotification.PriorNotificationDataFishingCatch[])
  })
})
