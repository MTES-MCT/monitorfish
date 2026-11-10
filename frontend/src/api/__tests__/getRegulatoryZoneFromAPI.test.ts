import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'

import { getRegulatoryZoneFromAPI } from '../geoserver'

const buildFeature = (topic: string, zone: string) => ({
  geometry: { coordinates: [], type: 'MultiPolygon' },
  id: `regulations.${topic}.${zone}`,
  properties: { topic, zone },
  type: 'Feature'
})

const ZONES = [
  { topic: 'Bretagne - Chaluts de fond', zone: 'Zone A' },
  { topic: 'Bretagne - Chaluts de fond', zone: "Zone d'été" },
  { topic: 'Normandie - Moules', zone: 'Zone B' }
]

describe('api/geoserver.getRegulatoryZoneFromAPI()', () => {
  const originalFetch = global.fetch
  let fetchMock: jest.Mock

  beforeEach(() => {
    fetchMock = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            features: ZONES.map(({ topic, zone }) => buildFeature(topic, zone)),
            type: 'FeatureCollection'
          }),
        status: 200
      })
    )
    global.fetch = fetchMock as any
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('Should fetch the zones requested at the same time in a single request', async () => {
    const results = await Promise.all(ZONES.map(zone => getRegulatoryZoneFromAPI('regulations', zone as any, false)))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = decodeURIComponent(fetchMock.mock.calls[0]![0] as string)
    ZONES.forEach(({ topic, zone }) =>
      expect(url).toContain(`(topic='${topic}' AND zone='${zone.replace(/'/g, "''")}')`)
    )
    expect(results.map(feature => feature.properties)).toEqual(ZONES)
  })

  it('Should reject only the zone missing from the response', async () => {
    const results = await Promise.allSettled([
      getRegulatoryZoneFromAPI('regulations', ZONES[0] as any, false),
      getRegulatoryZoneFromAPI('regulations', { topic: 'Unknown', zone: 'Unknown' } as any, false)
    ])

    expect(results[0]?.status).toBe('fulfilled')
    expect(results[1]?.status).toBe('rejected')
  })
})
