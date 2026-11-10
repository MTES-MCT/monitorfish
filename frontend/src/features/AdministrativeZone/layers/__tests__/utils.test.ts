import { beforeEach, describe, expect, it } from '@jest/globals'
import { getArea, getIntersection, type Extent } from 'ol/extent'
import { get as getProjection } from 'ol/proj'

import { getAdministrativeZoneFromAPI } from '../../../../api/geoserver'
import { getVectorOLLayer } from '../utils'

jest.mock('../../../../api/geoserver', () => ({
  getAdministrativeZoneFromAPI: jest.fn(() => Promise.resolve({ features: [], type: 'FeatureCollection' }))
}))
jest.mock('../styles/administrativeLayer.style', () => ({
  getAdministrativeLayerStyle: () => () => undefined
}))

const getAdministrativeZoneFromAPIMock = getAdministrativeZoneFromAPI as jest.Mock

const flushPromises = () =>
  new Promise(resolve => {
    setTimeout(resolve, 0)
  })

const PROJECTION = getProjection('EPSG:3857')!
// Map resolutions (meters per pixel) at zoom levels 7 and 9
const RESOLUTION_AT_ZOOM_7 = 1222.99
const RESOLUTION_AT_ZOOM_9 = 305.75
// A 1400x900 px viewport over Brittany at zoom 7
const BRITTANY_EXTENT: Extent = [-1_350_000, 5_700_000, 362_000, 6_800_000]
const PANNED_EXTENT: Extent = [-1_200_000, 5_750_000, 512_000, 6_850_000]
const ZOOMED_IN_EXTENT: Extent = [-700_000, 6_000_000, -270_000, 6_280_000]

const getRequestedExtents = (): Extent[] => getAdministrativeZoneFromAPIMock.mock.calls.map(call => call[1] as Extent)

describe('AdministrativeZone/layers/utils', () => {
  beforeEach(() => {
    getAdministrativeZoneFromAPIMock.mockClear()
  })

  it('Should not download again the zones of an area already downloaded, when moving or zooming in the map', async () => {
    const source = getVectorOLLayer('cgpm_areas', undefined).getSource()!

    source.loadFeatures(BRITTANY_EXTENT, RESOLUTION_AT_ZOOM_7, PROJECTION)
    await flushPromises()
    const firstDisplayExtents = getRequestedExtents()

    source.loadFeatures(PANNED_EXTENT, RESOLUTION_AT_ZOOM_7, PROJECTION)
    await flushPromises()
    source.loadFeatures(BRITTANY_EXTENT, RESOLUTION_AT_ZOOM_7, PROJECTION)
    await flushPromises()
    source.loadFeatures(ZOOMED_IN_EXTENT, RESOLUTION_AT_ZOOM_9, PROJECTION)
    await flushPromises()
    const nextExtents = getRequestedExtents().slice(firstDisplayExtents.length)

    expect(firstDisplayExtents.length).toBeGreaterThan(0)
    // Tiles exceeding the visible extent are downloaded, but not much more
    const firstDisplayArea = firstDisplayExtents.reduce((total, extent) => total + getArea(extent), 0)
    expect(firstDisplayArea / getArea(BRITTANY_EXTENT)).toBeLessThan(3)
    // Only the areas not yet downloaded are requested
    const reDownloadedArea = nextExtents
      .flatMap(nextExtent => firstDisplayExtents.map(firstExtent => getIntersection(nextExtent, firstExtent)))
      .reduce((total, intersection) => total + getArea(intersection), 0)
    expect(reDownloadedArea).toBe(0)
  })
})
