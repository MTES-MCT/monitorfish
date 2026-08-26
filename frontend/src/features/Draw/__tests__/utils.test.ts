import { CoordinatesFormat } from '@features/Map/constants'
import { expect } from '@jest/globals'

import { isEchoFromMapClick, roundCoordinates, swapToLatLon } from '../utils'

const { DECIMAL_DEGREES, DEGREES_MINUTES_DECIMALS, DEGREES_MINUTES_SECONDS } = CoordinatesFormat

// 46° 20′ 40″ N 007° 47′ 37″ W, as the DMS CoordinatesInput emits it (decimal degrees, 6 decimals)
const POINT_GEOMETRY = { coordinates: [-7.793611, 46.344444], type: 'Point' as const }

describe('Draw/isEchoFromMapClick()', () => {
  it('returns false when geometry is undefined', () => {
    expect(isEchoFromMapClick(undefined, 47.4, -5.2, DEGREES_MINUTES_SECONDS)).toBe(false)
  })

  it('returns false when geometry is null', () => {
    expect(isEchoFromMapClick(null, 47.4, -5.2, DEGREES_MINUTES_SECONDS)).toBe(false)
  })

  it('returns false when geometry type is not Point', () => {
    const multiPolygon = { coordinates: [], type: 'MultiPolygon' as const }

    expect(isEchoFromMapClick(multiPolygon, 47.4, -5.2, DEGREES_MINUTES_SECONDS)).toBe(false)
  })

  it('returns true when coordinates match exactly', () => {
    expect(isEchoFromMapClick(POINT_GEOMETRY, 46.344444, -7.793611, DEGREES_MINUTES_SECONDS)).toBe(true)
  })

  it('returns false for clearly different coordinates', () => {
    expect(isEchoFromMapClick(POINT_GEOMETRY, 48.85, 2.35, DEGREES_MINUTES_SECONDS)).toBe(false)
  })

  describe('in DMS', () => {
    // A map click lands on a full-precision point that the input displays rounded to whole seconds,
    // so the echo comes back off by up to half a second.
    it('returns true for the second-rounded echo of a map click', () => {
      const clicked = { coordinates: [-7.7936543, 46.3444321], type: 'Point' as const }

      expect(isEchoFromMapClick(clicked, 46.344444, -7.793611, DEGREES_MINUTES_SECONDS)).toBe(true)
    })

    it('returns false when the user bumps two seconds (40″ → 42″)', () => {
      expect(isEchoFromMapClick(POINT_GEOMETRY, 46.345, -7.793611, DEGREES_MINUTES_SECONDS)).toBe(false)
    })

    it('returns false when the user bumps the smallest typable step (40″ → 41″)', () => {
      expect(isEchoFromMapClick(POINT_GEOMETRY, 46.344722, -7.793611, DEGREES_MINUTES_SECONDS)).toBe(false)
    })

    it('returns false when only the longitude changes (37″ → 38″)', () => {
      expect(isEchoFromMapClick(POINT_GEOMETRY, 46.344444, -7.793889, DEGREES_MINUTES_SECONDS)).toBe(false)
    })
  })

  describe('in DMD', () => {
    it('returns true below a thousandth of a minute, which the input cannot display', () => {
      expect(isEchoFromMapClick(POINT_GEOMETRY, 46.344449, -7.793611, DEGREES_MINUTES_DECIMALS)).toBe(true)
    })

    it('returns false when the user bumps a thousandth of a minute', () => {
      expect(isEchoFromMapClick(POINT_GEOMETRY, 46.344461, -7.793611, DEGREES_MINUTES_DECIMALS)).toBe(false)
    })
  })

  describe('in DD', () => {
    it('returns false when the user edits the fourth decimal place', () => {
      expect(isEchoFromMapClick(POINT_GEOMETRY, 46.345244, -7.793611, DECIMAL_DEGREES)).toBe(false)
    })

    it('returns false when the user edits the sixth decimal place', () => {
      expect(isEchoFromMapClick(POINT_GEOMETRY, 46.344445, -7.793611, DECIMAL_DEGREES)).toBe(false)
    })
  })
})

describe('Draw/roundCoordinates()', () => {
  it('strips floating-point noise from a projection round-trip', () => {
    expect(roundCoordinates([47.400000000000006, -51.09999999999999])).toStrictEqual([47.4, -51.1])
  })

  it('preserves meaningful decimals up to 6 places', () => {
    expect(roundCoordinates([47.123456, -51.654321])).toStrictEqual([47.123456, -51.654321])
  })

  it('truncates beyond 6 decimal places', () => {
    expect(roundCoordinates([47.1234567, -51.6543219])).toStrictEqual([47.123457, -51.654322])
  })

  it('handles integer coordinates without adding decimals', () => {
    expect(roundCoordinates([47, -51])).toStrictEqual([47, -51])
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
