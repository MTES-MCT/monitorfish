import { geoserverApi } from '@api/geoserverApi'
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'

import { RegulationActionType } from '../../utils'
import { getRegulatoryZone } from '../getRegulatoryZone'
import { updateRegulation } from '../updateRegulation'

import type { MainAppDispatch } from '@store'

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

function createStore() {
  const store = configureStore({
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }).concat(geoserverApi.middleware),
    reducer: {
      [geoserverApi.reducerPath]: geoserverApi.reducer,
      global: () => ({ isBackoffice: false })
    }
  })

  return { dispatch: store.dispatch as MainAppDispatch }
}

function mockGeoserverResponse(zones: Array<{ topic: string; zone: string }>) {
  // As GeoServer, only returns the zones of the CQL filter
  return jest.fn((url: string) =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          features: zones
            .filter(({ zone }) => decodeURIComponent(url).includes(`zone='${zone.replace(/'/g, "''")}'`))
            .map(({ topic, zone }) => buildFeature(topic, zone)),
          type: 'FeatureCollection'
        }),
      ok: true,
      status: 200
    })
  )
}

describe('features/Regulation/useCases/getRegulatoryZone()', () => {
  const originalFetch = global.fetch
  let fetchMock: jest.Mock

  beforeEach(() => {
    fetchMock = mockGeoserverResponse(ZONES)
    global.fetch = fetchMock as any
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('Should fetch the zones displayed together in a single request', async () => {
    const store = createStore()

    const results = await Promise.all(ZONES.map(zone => store.dispatch(getRegulatoryZone(zone, ZONES))))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = decodeURIComponent(fetchMock.mock.calls[0]![0] as string)
    ZONES.forEach(({ topic, zone }) =>
      expect(url).toContain(`(topic='${topic}' AND zone='${zone.replace(/'/g, "''")}')`)
    )
    expect(results.map(feature => feature.properties)).toEqual(ZONES)
  })

  it('Should not fetch again a zone already fetched', async () => {
    const store = createStore()
    await store.dispatch(getRegulatoryZone(ZONES[0]!))

    await store.dispatch(getRegulatoryZone(ZONES[0]!))

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('Should fetch again a zone after a regulation update', async () => {
    const store = createStore()
    await store.dispatch(getRegulatoryZone(ZONES[0]!))

    await store.dispatch(updateRegulation({ updates: [] }, RegulationActionType.Update) as any)
    await store.dispatch(getRegulatoryZone(ZONES[0]!))

    const getFeatureCalls = fetchMock.mock.calls.filter(([url]) => (url as string).includes('request=GetFeature'))
    expect(getFeatureCalls).toHaveLength(2)
  })

  it('Should split many zones in several requests, to keep the URLs short enough for the proxies', async () => {
    const zones = Array.from({ length: 15 }, (_, index) => ({
      topic: 'Bretagne - Chaluts de fond',
      zone: `Zone ${index}`
    }))
    fetchMock.mockImplementation(mockGeoserverResponse(zones))
    const store = createStore()

    await Promise.all(zones.map(zone => store.dispatch(getRegulatoryZone(zone, zones))))

    expect(fetchMock).toHaveBeenCalledTimes(2)
    // Apache and Tomcat reject request lines (or headers) longer than 8 KB
    fetchMock.mock.calls.forEach(([url]) => expect((url as string).length).toBeLessThan(4 * 1024))
  })

  it('Should reject only the zone missing from the response', async () => {
    const store = createStore()
    const unknownZone = { topic: 'Unknown', zone: 'Unknown' }

    const results = await Promise.allSettled([
      store.dispatch(getRegulatoryZone(ZONES[0]!, [ZONES[0]!, unknownZone])),
      store.dispatch(getRegulatoryZone(unknownZone, [ZONES[0]!, unknownZone]))
    ])

    expect(results[0]?.status).toBe('fulfilled')
    expect(results[1]?.status).toBe('rejected')
  })

  it('Should reject all the zones When GeoServer fails', async () => {
    fetchMock.mockImplementation(() => Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve('KO') }))
    const store = createStore()

    await expect(store.dispatch(getRegulatoryZone(ZONES[0]!))).rejects.toThrow(
      "Nous n'avons pas pu récupérer la zone réglementaire Bretagne - Chaluts de fond/Zone A"
    )
  })
})
