import { describe, expect, it } from '@jest/globals'

import { getControlUnitsOptionsFromControlUnits } from '../utils'
import { dummyControlUnits } from './__mock__/controlUnits'

describe('controlUnits/utils', () => {
  it('getControlUnitsOptionsFromControlUnits Should return active control units', async () => {
    // Given
    expect(dummyControlUnits).toHaveLength(38)

    // When
    const options = getControlUnitsOptionsFromControlUnits(dummyControlUnits)

    expect(options.allActiveControlUnits).toHaveLength(31)
    expect(options.activeAndFilteredUnitsAsOptions).toHaveLength(31)
  })
})
