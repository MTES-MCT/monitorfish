import { logSoftError } from '@mtes-mct/monitor-ui'
import { Feature } from 'ol'
import { GPX, IGC, KML, TopoJSON } from 'ol/format'
import GeoJSON from 'ol/format/GeoJSON'
import { Geometry } from 'ol/geom'
import { DragAndDrop } from 'ol/interaction'
import { v4 as uuidv4 } from 'uuid'

import { MonitorFishLayer } from '../../../domain/entities/layers/types'
import { WSG84_PROJECTION } from '../../../domain/entities/map/constants'
import { mainStore } from '../../../store'
import { monitorfishMap } from '../../map/monitorfishMap'
import { customZoneActions } from '../slice'
import { fitViewToFeatures } from '../utils/fitViewToFeatures'
import { getLayer } from '../utils/getLayer'

import type { GeoJSON as GeoJSONNamespace } from '../../../domain/types/GeoJSON'
import type { MainAppThunk } from '../../../store'
import type { DragAndDropEvent } from 'ol/interaction/DragAndDrop'
import type { AnyAction } from 'redux'
import type { ThunkDispatch } from 'redux-thunk'

/**
 * Show all custom showed with the `isShowed` property as true
 */
export const initDragAndDrop = (): MainAppThunk => dispatch => {
  const dragAndDropInteraction = new DragAndDrop({
    formatConstructors: [GPX, GeoJSON, IGC, KML, TopoJSON] as any
  })

  dragAndDropInteraction.on('addfeatures', saveAndShowCustomZones(dispatch))

  monitorfishMap.addInteraction(dragAndDropInteraction)
}

function saveAndShowCustomZones(dispatch: ThunkDispatch<ReturnType<typeof mainStore.getState>, undefined, AnyAction>) {
  return (event: DragAndDropEvent) => {
    const uuid = uuidv4()
    const fileName = event.file.name
    if (!event.features) {
      return
    }

    ;(event.features as Feature<Geometry>[]).forEach(feature => {
      // The `uuid` property helps us to remove features from the layer
      feature.set('uuid', uuid)

      // If no name is set on the feature, we show the filename on it
      if (!feature.get('name')) {
        feature.set('name', fileName)
      }

      // Delete the applied styled on this feature
      feature.setStyle()
    })

    const parser = new GeoJSON()
    const geoJSON = parser.writeFeaturesObject(event.features as Feature<Geometry>[], {
      dataProjection: WSG84_PROJECTION,
      featureProjection: event.projection
    }) as GeoJSONNamespace.GeoJson

    dispatch(
      customZoneActions.add({
        feature: geoJSON,
        isShown: true,
        name: fileName,
        uuid
      })
    )

    const layer = getLayer(MonitorFishLayer.CUSTOM)
    if (!layer) {
      logSoftError({
        isSideWindowError: false,
        message: 'Layer `CUSTOM` not found in `monitorfishMap` map object.'
      })

      return
    }

    layer.getSource()?.addFeatures(event.features as Feature<Geometry>[])

    fitViewToFeatures(event.features as Feature<Geometry>[])
  }
}
