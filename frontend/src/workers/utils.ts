import { CARTOCDN_BASEMAP, MAPBOX_BASEMAP, OPENSTREETMAP_BASEMAP, SHOM_BASEMAP } from './constants'

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
