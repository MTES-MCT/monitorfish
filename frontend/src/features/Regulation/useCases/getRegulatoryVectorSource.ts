import { LayerProperties, OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@features/Map/constants'
import { layerActions } from '@features/Map/layer.slice'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { SIMPLIFIED_FEATURE_ZOOM_LEVEL } from '@features/Regulation/layers/constants'
import BaseEvent from 'ol/events/Event'
import { getArea, getCenter } from 'ol/extent'
import GeoJSON from 'ol/format/GeoJSON'
import { all } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'
import simplify from 'simplify-geojson'

import { getRegulatoryZoneFromAPI } from '../../../api/geoserver'
import { isNumeric } from '../../../utils/isNumeric'
import { animateToRegulatoryLayer } from '../../Map/slice'

import type { MonitorFishMap } from '@features/Map/Map.types'
import type { HybridAppThunk } from '@store/types'
import type { Feature } from 'ol'
import type { Geometry } from 'ol/geom'

class CustomBaseEvent extends BaseEvent {
  error: Error

  constructor(type: string, error: Error) {
    super(type)

    this.error = error
  }
}

const IRRETRIEVABLE_FEATURES_EVENT = 'IRRETRIEVABLE_FEATURES'

export const getRegulatoryVectorSource =
  (regulatoryZoneProperties: MonitorFishMap.ShowedLayer): HybridAppThunk<VectorSource<Feature<Geometry>>> =>
  (dispatch, getState) => {
    const zoneName = `${LayerProperties.REGULATORY.code}:${regulatoryZoneProperties.topic}:${regulatoryZoneProperties.zone}`

    const vectorSource = new VectorSource({
      format: new GeoJSON({
        dataProjection: WSG84_PROJECTION,
        featureProjection: OPENLAYERS_PROJECTION
      }),
      loader: async extent => {
        try {
          const regulatoryZone = await getRegulatoryZoneFromAPI(
            LayerProperties.REGULATORY.code,
            regulatoryZoneProperties,
            getState().global.isBackoffice
          )

          if (!regulatoryZone.geometry) {
            vectorSource.dispatchEvent(createIrretrievableFeaturesEvent(new Error('Aucune géometrie dans la zone')))
            vectorSource.removeLoadedExtent(extent)

            return
          }

          const simplifiedRegulatoryZone = trySimplifyRegulatoryZone(regulatoryZone)
          const geoJsonToLoad = resolveGeoJsonForCurrentZoom(regulatoryZone, simplifiedRegulatoryZone)
          loadFeaturesIntoSource(vectorSource, geoJsonToLoad)
          dispatchLayerLoadedActions(dispatch, vectorSource, zoneName, regulatoryZone, simplifiedRegulatoryZone)
        } catch (err) {
          vectorSource.dispatchEvent(createIrretrievableFeaturesEvent(err))
          vectorSource.removeLoadedExtent(extent)
        }
      },
      strategy: all
    })

    ;(vectorSource as any).once(IRRETRIEVABLE_FEATURES_EVENT, (event: CustomBaseEvent) => {
      console.error(event.error)
    })

    return vectorSource
  }

const createIrretrievableFeaturesEvent = (error: any) => new CustomBaseEvent(IRRETRIEVABLE_FEATURES_EVENT, error)

function isCenterValid(center: number[] | undefined): center is number[] {
  return !!center?.length && isNumeric(center[0]) && isNumeric(center[1])
}

function trySimplifyRegulatoryZone(regulatoryZone: any): string | null {
  try {
    return simplify(regulatoryZone, 0.01)
  } catch (e) {
    console.error(e)

    return null
  }
}

function loadFeaturesIntoSource(vectorSource: VectorSource<Feature<Geometry>>, geoJson: any): void {
  const format = vectorSource.getFormat()
  if (format) {
    // TODO Type this any.
    vectorSource.addFeatures(format.readFeatures(geoJson) as any)
  }
}

function dispatchLayerLoadedActions(
  dispatch: any,
  vectorSource: VectorSource<Feature<Geometry>>,
  zoneName: string,
  regulatoryZone: any,
  simplifiedRegulatoryZone: string | null
): void {
  const center = getCenter(vectorSource.getExtent())
  dispatch(
    layerActions.pushLayerToFeatures({
      area: getArea(vectorSource.getExtent()),
      center,
      features: regulatoryZone,
      name: zoneName,
      simplifiedFeatures: simplifiedRegulatoryZone
    })
  )
  dispatch(layerActions.setLastShowedFeatures(vectorSource.getFeatures()))
  if (isCenterValid(center)) {
    dispatch(animateToRegulatoryLayer({ center, name: zoneName }))
  }
}

function resolveGeoJsonForCurrentZoom(regulatoryZone: any, simplifiedRegulatoryZone: string | null): any {
  const currentZoom = monitorfishMap.getView().getZoom() ?? Infinity
  const shouldUseSimplifiedGeometry = currentZoom < SIMPLIFIED_FEATURE_ZOOM_LEVEL

  return shouldUseSimplifiedGeometry ? (simplifiedRegulatoryZone ?? regulatoryZone) : regulatoryZone
}
