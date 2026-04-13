import { AdminLayerProperties, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { getCenter } from 'ol/extent'
import Feature from 'ol/Feature'
import GeoJSON from 'ol/format/GeoJSON'
import Point from 'ol/geom/Point'
import VectorLayer from 'ol/layer/Vector'
import WebGLVectorLayer from 'ol/layer/WebGLVector'
import { bbox } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'
import simplify from 'simplify-geojson'

import { getAdministrativeLabelStyle, getAdministrativeWebGLStyle } from './styles/administrativeLayer.style'
import { getAdministrativeZoneFromAPI } from '../../../api/geoserver'

import type Geometry from 'ol/geom/Geometry'

export const getVectorOLLayer = (
  type: string,
  zone: string | undefined,
  isBackoffice: boolean
): WebGLVectorLayer<VectorSource<Feature<Geometry>>> => {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: WSG84_PROJECTION,
      featureProjection: OPENLAYERS_PROJECTION
    }),
    strategy: bbox
  })

  const labelSource = new VectorSource<Feature<Point>>()

  getAdministrativeZoneFromAPI(type, [-180, -55, 180, 62], zone, isBackoffice).then(data => {
    const features = vectorSource.getFormat()?.readFeatures(simplify(data, 0.05)) as Feature<Geometry>[] | undefined
    if (!features) {
      return
    }
    vectorSource.addFeatures(features)
    vectorSource.changed()

    const adminLayer = Object.values(AdminLayerProperties).find(p => p.code === type)
    if (adminLayer?.zoneNamePropertyKey) {
      const labelFeatures = features.flatMap(feature => {
        const geom = feature.getGeometry()
        if (!geom) {
          return []
        }
        const labelFeature = new Feature({
          ...feature.getProperties(),
          geometry: new Point(getCenter(geom.getExtent()))
        })

        return [labelFeature]
      })
      labelSource.addFeatures(labelFeatures)
    }
  })

  const layer = new WebGLVectorLayer({
    className: `administrative-${type}`,
    source: vectorSource,
    style: getAdministrativeWebGLStyle(type),
    zIndex: 1555
  })

  layer.setProperties({ code: getLayerNameFromTypeAndZone(type, zone), labelSource })

  return layer
}

export function getAdministrativeLabelLayer(
  type: string,
  zone: string | undefined,
  webglLayer: WebGLVectorLayer<VectorSource<Feature<Geometry>>>
): VectorLayer<VectorSource<Feature<Point>>> {
  const labelSource = webglLayer.get('labelSource') as VectorSource<Feature<Point>>

  const layer = new VectorLayer({
    className: 'administrative-labels',
    declutter: true,
    minZoom: 4,
    source: labelSource,
    style: feature => [getAdministrativeLabelStyle(type)(feature as Feature)]
  })

  layer.setProperties({ code: `${getLayerNameFromTypeAndZone(type, zone)}:labels` })

  return layer
}

export function getLayerNameFromTypeAndZone(type: string, zone: string | undefined): string {
  if (!zone) {
    return type
  }

  return `${type}:${zone}`
}
