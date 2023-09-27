export const CARTOCDN_BASEMAP = 'basemaps.'
export const MAPBOX_BASEMAP = 'mapbox.'
export const OPENSTREETMAP_BASEMAP = 'tile.'
export const SHOM_BASEMAP = 'data.shom.'

export const WHITELISTED_BASE_MAPS = [CARTOCDN_BASEMAP, MAPBOX_BASEMAP, OPENSTREETMAP_BASEMAP, SHOM_BASEMAP]

export const STATIC_ASSETS = ['/landing_background.png']

export const APPLICATION_ROUTES = [
  '/nav',
  '/load_offline',
  '/backoffice',
  'regulation',
  'regulation/new',
  'regulation/edit',
  'control_objectives',
  'fleet_segments',
  '/ext',
  '/side_window'
]

export const CACHED_REQUEST_SIZE = 'CACHED_REQUEST_SIZE'

/**
 * This mapping was calculated by hand using an online latitude/longitude coordinates to tile z/x/y coordinates converter.
 * The goal is to reduce the number of API calls done during precache of map tiles.
 *
 * Used coordinates ([lat, lon]):
 * - start: [60, -018]
 * - end: [37, 018]
 *
 * @notice: The key is the zoom level
 *
 * @see https://developer.tomtom.com/map-display-api/documentation/zoom-levels-and-tile-grid
 */
export const ZOOM_TO_START_END_TILE_INDICES: Record<
  number,
  {
    end: [number, number]
    start: [number, number]
  }
> = {
  0: {
    end: [0, 0],
    start: [0, 0]
  },
  1: {
    end: [1, 0],
    start: [0, 0]
  },
  10: {
    end: [563, 398],
    start: [463, 291]
  },
  2: {
    end: [2, 1],
    start: [1, 1]
  },
  3: {
    end: [4, 3],
    start: [3, 2]
  },
  4: {
    end: [8, 6],
    start: [7, 4]
  },
  5: {
    end: [17, 12],
    start: [14, 9]
  },
  6: {
    end: [35, 24],
    start: [28, 18]
  },
  7: {
    end: [70, 49],
    start: [57, 36]
  },
  8: {
    end: [140, 99],
    start: [115, 72]
  },
  9: {
    end: [281, 199],
    start: [231, 145]
  }
}
