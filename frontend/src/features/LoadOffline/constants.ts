/* eslint-disable sort-keys-fix/sort-keys-fix */
/**
 * This mapping was calculated manually using an online latitude/longitude coordinates to tile z/x/y coordinates converter (see below).
 * The goal is to reduce the number of API calls done during the precache of map tiles.
 *
 * Used coordinates ([lat, lon]):
 * - start (top right): [60, -018]
 * - end (bottom left): [37, 018]
 *
 * @notice: The key is the zoom level: we cache from zoom 0 to zoom 11.
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
  },
  10: {
    end: [563, 398],
    start: [463, 291]
  },
  11: {
    end: [1126, 797],
    start: [926, 594]
  }
}
/* eslint-enable sort-keys-fix/sort-keys-fix */
