import { describe, expect, it } from '@jest/globals'

import { dummyControlUnits } from './__mock__/controlUnits'
import { getControlUnitsOptionsFromControlUnits } from '../utils'

describe('controlUnits/utils', () => {
  it('getControlUnitsOptionsFromControlUnits Should return active control units', async () => {
    // Given
    expect(dummyControlUnits).toHaveLength(226)

    // When
    const options = getControlUnitsOptionsFromControlUnits(dummyControlUnits)

    expect(options.activeControlUnits).toHaveLength(144)
    expect(options.activeControlUnits[143]).toEqual({
      administration: 'Conservatoire du littoral',
      contact: '',
      id: 10333,
      isArchived: false,
      name: 'Bebel - Viard',
      resources: [{ id: 1017, name: 'Voiture' }]
    })
    expect(options.activeAndSortedUnitsAsOptions).toHaveLength(143)
  })
})
