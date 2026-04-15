import { expect } from '@jest/globals'

import { DMS_ROUNDTRIP_TOLERANCE, isEchoFromMapClick, swapToLatLon } from '../utils'

const POINT_GEOMETRY = { coordinates: [-5.2, 47.4], type: 'Point' as const }

describe('Draw/isEchoFromMapClick()', () => {
  it('returns false when geometry is undefined', () => {
    expect(isEchoFromMapClick(undefined, 47.4, -5.2)).toBe(false)
  })

  it('returns false when geometry is null', () => {
    expect(isEchoFromMapClick(null, 47.4, -5.2)).toBe(false)
  })

  it('returns false when geometry type is not Point', () => {
    const multiPolygon = { coordinates: [], type: 'MultiPolygon' as const }

    expect(isEchoFromMapClick(multiPolygon, 47.4, -5.2)).toBe(false)
  })

  it('returns true when coordinates match exactly', () => {
    expect(isEchoFromMapClick(POINT_GEOMETRY, 47.4, -5.2)).toBe(true)
  })

  it('returns true when coordinates differ by less than DMS_ROUNDTRIP_TOLERANCE', () => {
    const almostSame = DMS_ROUNDTRIP_TOLERANCE * 0.99

    expect(isEchoFromMapClick(POINT_GEOMETRY, 47.4 + almostSame, -5.2 + almostSame)).toBe(true)
  })

  it('returns false when latitude differs by more than DMS_ROUNDTRIP_TOLERANCE', () => {
    const over = DMS_ROUNDTRIP_TOLERANCE * 1.01

    expect(isEchoFromMapClick(POINT_GEOMETRY, 47.4 + over, -5.2)).toBe(false)
  })

  it('returns false when longitude differs by more than DMS_ROUNDTRIP_TOLERANCE', () => {
    const over = DMS_ROUNDTRIP_TOLERANCE * 1.01

    expect(isEchoFromMapClick(POINT_GEOMETRY, 47.4, -5.2 + over)).toBe(false)
  })

  it('returns false for clearly different coordinates', () => {
    expect(isEchoFromMapClick(POINT_GEOMETRY, 48.85, 2.35)).toBe(false)
  })
})

describe('Draw/swapToLatLon()', () => {
  it('swaps GeoJSON [lon, lat] to [lat, lon]', () => {
    const point = { coordinates: [-5.2, 47.4], type: 'Point' as const }

    expect(swapToLatLon(point)).toStrictEqual([47.4, -5.2])
  })

  it('handles positive coordinates correctly', () => {
    const point = { coordinates: [2.35, 48.85], type: 'Point' as const }

    expect(swapToLatLon(point)).toStrictEqual([48.85, 2.35])
  })
})
