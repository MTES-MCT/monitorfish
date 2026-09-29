import { describe, expect, it } from '@jest/globals'

import { findRegulatoryZonesByIds } from '../utils'

describe('findRegulatoryZonesByIds()', () => {
  it('Should return the zones matching the ids, whatever their type, without the deleted ones', () => {
    const regulatoryZones = [{ id: 1 }, { id: 2 }, { id: '3' }]

    const foundZones = findRegulatoryZonesByIds(regulatoryZones, ['1', 3, '404'])

    expect(foundZones.map(({ id }) => id)).toEqual([1, '3'])
  })
})
