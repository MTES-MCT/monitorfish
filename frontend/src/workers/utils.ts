import { CARTOCDN_BASEMAP, MAPBOX_BASEMAP, OPENSTREETMAP_BASEMAP, REGULATIONS, SHOM_BASEMAP } from './constants'

export const getCacheKey = src => {
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

  if (src.includes(REGULATIONS)) {
    return REGULATIONS
  }

  return src
}
