import GeoJSON from 'ol/format/GeoJSON'
import { all } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'

import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../domain/entities/map/constants'

import type { GeoJSON as GeoJSONType } from '../domain/types/GeoJSON'
import type { Extent } from 'ol/extent'

/**
 * Get the extent of the first feature found in the GeoJSON object
 */
export const getExtentFromGeoJSON = (features: GeoJSONType.GeoJson): Extent | undefined => {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    strategy: all
  })

  const [firstFeature] = vectorSource.getFormat()?.readFeatures(features) ?? []
  if (!firstFeature) {
    return undefined
  }

  return firstFeature.getGeometry()?.getExtent()
}
