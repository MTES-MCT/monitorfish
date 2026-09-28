import { describe, expect, it } from '@jest/globals'

import { findCurrentRegulatoryZone, findCurrentRegulatoryZones } from '../utils'

const activeZone = (id: number) => ({ id, lawType: 'Reg. MEMN', nextId: undefined, topic: `Topic ${id}` })
const outdatedZone = (id: number, nextId: string | undefined) => ({ id, lawType: '', nextId, topic: '' })

describe('findCurrentRegulatoryZone()', () => {
  it('Should return the zone When it is active', () => {
    const regulatoryZones = [activeZone(1)]

    expect(findCurrentRegulatoryZone(regulatoryZones, '1')).toBe(regulatoryZones[0])
  })

  it('Should follow the next ids until the active zone', () => {
    const regulatoryZones = [outdatedZone(1, '2'), outdatedZone(2, '3'), activeZone(3)]

    expect(findCurrentRegulatoryZone(regulatoryZones, 1)?.id).toBe(3)
  })

  it('Should return undefined When the zone is deleted', () => {
    expect(findCurrentRegulatoryZone([activeZone(1)], '2')).toBeUndefined()
  })

  it('Should return undefined When an outdated zone has no next id', () => {
    expect(findCurrentRegulatoryZone([outdatedZone(1, undefined)], '1')).toBeUndefined()
  })

  it('Should return undefined When the next ids are cyclic', () => {
    const regulatoryZones = [outdatedZone(1, '2'), outdatedZone(2, '1')]

    expect(findCurrentRegulatoryZone(regulatoryZones, '1')).toBeUndefined()
  })
})

describe('findCurrentRegulatoryZones()', () => {
  it('Should return the current zones without duplicates nor deleted zones', () => {
    const regulatoryZones = [outdatedZone(1, '3'), activeZone(2), activeZone(3)]

    const currentZones = findCurrentRegulatoryZones(regulatoryZones, ['1', '3', '2', '404'])

    expect(currentZones.map(({ id }) => id)).toEqual([3, 2])
  })
})
