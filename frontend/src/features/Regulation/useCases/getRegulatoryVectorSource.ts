import { layerActions } from '@features/BaseMap/slice'
import BaseEvent from 'ol/events/Event'
import { getArea, getCenter } from 'ol/extent'
import GeoJSON from 'ol/format/GeoJSON'
import { all } from 'ol/loadingstrategy'
import VectorSource from 'ol/source/Vector'
import simplify from 'simplify-geojson'

import { getRegulatoryZoneFromAPI } from '../../../api/geoserver'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import { animateToRegulatoryLayer } from '../../../domain/shared_slices/Map'
import { isNumeric } from '../../../utils/isNumeric'

import type { HybridAppDispatch, HybridAppThunk } from '@store/types'
import type { ShowedLayer } from 'domain/entities/layers/types'
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

const setIrretrievableFeaturesEvent = (error: any) => new CustomBaseEvent(IRRETRIEVABLE_FEATURES_EVENT, error)

export const getRegulatoryVectorSource =
  <T extends HybridAppDispatch>(
    regulatoryZoneProperties: ShowedLayer
  ): HybridAppThunk<T, VectorSource<Feature<Geometry>>> =>
  // @ts-ignore Required to avoid reducers typing conflicts. Not fancy but allows us to keep Thunk context type-checks.
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
            vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(new Error('Aucune géometrie dans la zone')))
            vectorSource.removeLoadedExtent(extent)

            return
          }

          let simplifiedRegulatoryZone: string | null = null
          try {
            simplifiedRegulatoryZone = simplify(regulatoryZone, 0.01)
          } catch (e) {
            console.error(e)
          }

          const feature = getState().regulation.simplifiedGeometries
            ? (simplifiedRegulatoryZone ?? regulatoryZone)
            : regulatoryZone
          const format = vectorSource.getFormat()
          if (format) {
            // TODO Type this any.
            vectorSource.addFeatures(format.readFeatures(feature) as any)
          }
          const center = getCenter(vectorSource.getExtent())
          const centerHasValidCoordinates = center?.length && isNumeric(center[0]) && isNumeric(center[1])

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

          if (centerHasValidCoordinates) {
            dispatch(
              animateToRegulatoryLayer({
                center,
                name: zoneName
              })
            )
          }
        } catch (err) {
          vectorSource.dispatchEvent(setIrretrievableFeaturesEvent(err))
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
