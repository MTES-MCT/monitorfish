import ky from 'ky'
import { chunk, range } from 'lodash'

import {
  CARTOCDN_BASEMAP,
  MAPBOX_BASEMAP,
  OPENSTREETMAP_BASEMAP,
  SHOM_BASEMAP,
  ZOOM_TO_START_END_TILE_INDICES
} from './constants'

export const getImageCacheKey = src => {
  if (src.includes(CARTOCDN_BASEMAP)) {
    return src.split(CARTOCDN_BASEMAP)[1] || ''
  }

  if (src.includes(MAPBOX_BASEMAP)) {
    return src.split(MAPBOX_BASEMAP)[1] || ''
  }

  if (src.includes(OPENSTREETMAP_BASEMAP)) {
    return src.split(OPENSTREETMAP_BASEMAP)[1] || ''
  }

  if (src.includes(SHOM_BASEMAP)) {
    return src.split(SHOM_BASEMAP)[1] || ''
  }

  return ''
}

/**
 * @see https://developer.tomtom.com/map-display-api/documentation/zoom-levels-and-tile-grid
 * @return number[] - the array index is the zoom number
 */
export function getMaxXYRange(maxZoom: number): number[] {
  return range(maxZoom).map(zoom => getMaxXYAtZoom(zoom + 1))
}

/**
 * @see https://developer.tomtom.com/map-display-api/documentation/zoom-levels-and-tile-grid
 * @param zoomLevel
 */
export function getMaxXYAtZoom(zoomLevel: number) {
  return Math.sqrt(2 ** zoomLevel * 2 ** zoomLevel)
}

/**
 * Get the list of path to requests:
 * - The first array index is the zoom number
 * - The second array is the list of paths for a given zoom
 */
export function getListOfPath() {
  return Object.keys(ZOOM_TO_START_END_TILE_INDICES)
    .map(key => ZOOM_TO_START_END_TILE_INDICES[key])
    .map((value, index) => {
      const zoom = index

      // We add `+ 1` as the `range()` function is not including the `end` number
      const xRange = range(value.start[0], value.end[0] + 1)
      const yRange = range(value.start[1], value.end[1] + 1)

      return xRange.map(x => yRange.map(y => `${zoom}/${x}/${y}`)).flat()
    })
}

/**
 * This function is used to store tiles in the navigator Cache API.
 *
 * @desc Fetch all paths with a sleep time every 10 chunks (to avoid timeout)
 * @see `fetch` event of serviceWorker.ts
 */
export async function fetchAllByChunk(zoomToPaths: string[][], chunkSize: number) {
  const subDomains = ['a', 'b', 'c', 'd']
  const waitTime = 1000

  // eslint-disable-next-line no-restricted-syntax
  for (const paths of zoomToPaths) {
    const chunkedPaths = chunk(paths, chunkSize)

    // eslint-disable-next-line no-restricted-syntax
    for (const chunkOfPaths of chunkedPaths) {
      const subDomain = subDomains[Math.floor(Math.random() * subDomains.length)]

      chunkOfPaths.forEach(path => ky.get(`https://${subDomain}.basemaps.cartocdn.com/light_all/${path}.png`))

      // An await is used to reduce the number of HTTP requests send per second
      // eslint-disable-next-line no-await-in-loop
      await sleep(waitTime)
    }
  }
}

const sleep = (ms: number) =>
  new Promise(r => {
    setTimeout(r, ms)
  })
