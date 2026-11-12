import { beforeEach, describe, expect, it } from '@jest/globals'
import { get as getProjection } from 'ol/proj'

import { getAdministrativeZoneFromAPI } from '../../../../api/geoserver'
import { getVectorOLLayer } from '../utils'

import type { Extent } from 'ol/extent'

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
const INSIDE_BRITTANY_EXTENT: Extent = [-1_200_000, 5_750_000, 200_000, 6_700_000]
const ZOOMED_IN_EXTENT: Extent = [-700_000, 6_000_000, -270_000, 6_280_000]
const MEDITERRANEAN_EXTENT: Extent = [300_000, 4_800_000, 2_000_000, 5_900_000]

const getRequestedExtents = (): Extent[] => getAdministrativeZoneFromAPIMock.mock.calls.map(call => call[1] as Extent)

describe('AdministrativeZone/layers/utils', () => {
  beforeEach(() => {
    getAdministrativeZoneFromAPIMock.mockClear()
  })

  it('Should download the zones of the visible extent in a single request', async () => {
    const source = getVectorOLLayer('cgpm_areas', undefined).getSource()!

    source.loadFeatures(BRITTANY_EXTENT, RESOLUTION_AT_ZOOM_7, PROJECTION)
    await flushPromises()

    // Large zones (as EEZ or FAO areas) would be downloaded once per tile with a tile strategy
    expect(getRequestedExtents()).toEqual([BRITTANY_EXTENT])
  })

  it('Should not download again the zones of an extent already downloaded, when moving or zooming in it', async () => {
    const source = getVectorOLLayer('cgpm_areas', undefined).getSource()!
    source.loadFeatures(BRITTANY_EXTENT, RESOLUTION_AT_ZOOM_7, PROJECTION)
    await flushPromises()

    source.loadFeatures(INSIDE_BRITTANY_EXTENT, RESOLUTION_AT_ZOOM_7, PROJECTION)
    source.loadFeatures(ZOOMED_IN_EXTENT, RESOLUTION_AT_ZOOM_9, PROJECTION)
    await flushPromises()

    expect(getRequestedExtents()).toEqual([BRITTANY_EXTENT])
  })

  it('Should download the zones of a new extent, keeping the ones already downloaded', async () => {
    const source = getVectorOLLayer('cgpm_areas', undefined).getSource()!
    source.loadFeatures(BRITTANY_EXTENT, RESOLUTION_AT_ZOOM_7, PROJECTION)
    await flushPromises()

    source.loadFeatures(MEDITERRANEAN_EXTENT, RESOLUTION_AT_ZOOM_7, PROJECTION)
    await flushPromises()
    source.loadFeatures(BRITTANY_EXTENT, RESOLUTION_AT_ZOOM_7, PROJECTION)
    await flushPromises()

    // Back to Brittany: still displayed, not downloaded again
    expect(getRequestedExtents()).toEqual([BRITTANY_EXTENT, MEDITERRANEAN_EXTENT])
  })
})
