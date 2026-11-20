import { describe, expect, it } from '@jest/globals'

import { countRegulatoryZones, findRegulatoryZonesByIds } from '../utils'

import type { RegulatoryZone } from '../types'

describe('findRegulatoryZonesByIds()', () => {
  it('Should return the zones matching the ids, whatever their type, without the deleted ones', () => {
    const regulatoryZones = [{ id: 1 }, { id: 2 }, { id: '3' }]

    const foundZones = findRegulatoryZonesByIds(regulatoryZones, ['1', 3, '404'])

    expect(foundZones.map(({ id }) => id)).toEqual([1, '3'])
  })
})

describe('countRegulatoryZones()', () => {
  it('Should count the zones of every law type and topic', () => {
    const zone = {} as RegulatoryZone

    expect(countRegulatoryZones({ 'Reg. MED': { Topic1: [zone], Topic2: [zone, zone] }, 'Reg. NAMO': {} })).toEqual(3)
  })

  it('Should return 0 when there is no result', () => {
    expect(countRegulatoryZones(undefined)).toEqual(0)
    expect(countRegulatoryZones({})).toEqual(0)
  })
})
