import { addZones, readZonesFromWKT, removeZoneAt } from '@features/Reporting/zoneFilter'
import { describe, expect, it } from '@jest/globals'
import { Polygon } from 'ol/geom'

const FIRST_ZONE = new Polygon([
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0]
  ]
])
const SECOND_ZONE = new Polygon([
  [
    [5, 5],
    [5, 6],
    [6, 6],
    [6, 5],
    [5, 5]
  ]
])

describe('features/Reporting/zoneFilter', () => {
  it('readZonesFromWKT() should return no zone when the filter is unset', () => {
    expect(readZonesFromWKT(undefined)).toEqual([])
  })

  it('readZonesFromWKT() should read a plain polygon as a single zone', () => {
    expect(readZonesFromWKT('POLYGON((0 0,0 1,1 1,1 0,0 0))')).toHaveLength(1)
  })

  it('addZones() should append the zones to the existing ones', () => {
    const zoneFilter = addZones(undefined, [FIRST_ZONE])
    expect(zoneFilter).toEqual('MULTIPOLYGON(((0 0,0 1,1 1,1 0,0 0)))')

    const nextZoneFilter = addZones(zoneFilter, [SECOND_ZONE])
    expect(nextZoneFilter).toEqual('MULTIPOLYGON(((0 0,0 1,1 1,1 0,0 0)),((5 5,5 6,6 6,6 5,5 5)))')
    expect(readZonesFromWKT(nextZoneFilter)).toHaveLength(2)
  })

  it('removeZoneAt() should remove only the given zone', () => {
    const zoneFilter = addZones(undefined, [FIRST_ZONE, SECOND_ZONE])

    expect(removeZoneAt(zoneFilter, 0)).toEqual('MULTIPOLYGON(((5 5,5 6,6 6,6 5,5 5)))')
  })

  it('removeZoneAt() should unset the filter once the last one is removed', () => {
    const zoneFilter = addZones(undefined, [FIRST_ZONE])

    expect(removeZoneAt(zoneFilter, 0)).toBeUndefined()
  })
})
