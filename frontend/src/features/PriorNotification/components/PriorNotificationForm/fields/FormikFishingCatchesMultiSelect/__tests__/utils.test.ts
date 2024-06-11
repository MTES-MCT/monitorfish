import { describe, expect, it } from '@jest/globals'

import { sortFishingCatches } from '../utils'

describe('@features/PriorNotification/components/PriorNotificationForm/fields/FormikFishingCatchesMultiSelectsortFishingCatches/utils.ts', () => {
  it('sortFishingCatches() should sort BFT specy codes as expected', () => {
    const input = [
      { specyCode: 'AAA' },
      { specyCode: 'BF2' },
      { specyCode: 'BBB' },
      { specyCode: 'BF1' },
      { specyCode: 'BFT' },
      { specyCode: 'CCC' },
      { specyCode: 'BF3' }
    ]

    const expectedOutput = [
      { specyCode: 'BFT' },
      { specyCode: 'BF1' },
      { specyCode: 'BF2' },
      { specyCode: 'BF3' },
      { specyCode: 'AAA' },
      { specyCode: 'BBB' },
      { specyCode: 'CCC' }
    ]

    const sortedOutput = [...input].sort(sortFishingCatches)

    expect(sortedOutput).toEqual(expectedOutput)
  })
})
