import GeoJSONOLFormat from 'ol/format/GeoJSON'
import { omit } from 'ramda'

import { OPENLAYERS_PROJECTION } from '../../../domain/entities/map/constants'

import type { RegulatoryZone } from '../../../domain/types/regulation'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

/**
 * Convert RegulatoryZone objects to OpenLayers Feature objects
 */
export function getFeaturesFromRegulatoryZones(geojsonFeatures: Partial<RegulatoryZone>[]): Feature[] {
  if (!geojsonFeatures?.length) {
    return []
  }

  return geojsonFeatures
    .filter(regulatoryZone => regulatoryZone)
    .map(regulatoryZone => {
      const properties = omit(['geometry'], regulatoryZone)

      const feature = new GeoJSONOLFormat({
        featureProjection: OPENLAYERS_PROJECTION
      }).readFeature(regulatoryZone.geometry)
      feature.setProperties(properties)

      return feature
    })
    .filter((feature): feature is Feature<Geometry> => Boolean(feature))
}
