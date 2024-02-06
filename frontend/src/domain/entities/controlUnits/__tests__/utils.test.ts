import { describe, expect, it } from '@jest/globals'

import { dummyControlUnits } from './__mock__/controlUnits'
import { getControlUnitsOptionsFromControlUnits } from '../utils'

describe('controlUnits/utils', () => {
  it('getControlUnitsOptionsFromControlUnits Should return active control units', async () => {
    // Given
    expect(dummyControlUnits).toHaveLength(38)

    // When
    const options = getControlUnitsOptionsFromControlUnits(dummyControlUnits)

    expect(options.activeControlUnits).toHaveLength(31)
    expect(options.activeAndSortedUnitsAsOptions).toHaveLength(31)
  })
})
