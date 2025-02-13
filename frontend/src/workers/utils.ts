import { CARTOCDN_BASEMAP, MAPBOX_BASEMAP, OPENSTREETMAP_BASEMAP, SHOM_BASEMAP } from './constants'

export const getCacheKey = url => {
  if (url.includes(CARTOCDN_BASEMAP)) {
    return url.split(CARTOCDN_BASEMAP)[1] || ''
  }

  if (url.includes(MAPBOX_BASEMAP)) {
    return url.split(MAPBOX_BASEMAP)[1] || ''
  }

  if (url.includes(OPENSTREETMAP_BASEMAP)) {
    return url.split(OPENSTREETMAP_BASEMAP)[1] || ''
  }

  if (url.includes(SHOM_BASEMAP)) {
    return url.split(SHOM_BASEMAP)[1] || ''
  }

  return url
}
