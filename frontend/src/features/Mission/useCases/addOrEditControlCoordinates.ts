import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { boundingExtent } from 'ol/extent'
import { transformExtent } from 'ol/proj'

import { openDrawLayerModal } from './addOrEditMissionZone'
import { InteractionListener, InteractionType } from '../../../domain/entities/map/constants'
import { fitToExtent } from '../../../domain/shared_slices/Map'
import { getCoordinatesExtent } from '../../../domain/use_cases/map/getCoordinatesExtent'
import { unselectVessel } from '../../../domain/use_cases/vessel/unselectVessel'
import { setInitialGeometry, setInteractionTypeAndListener } from '../../Draw/slice'

import type { GeoJSON as GeoJSONNamespace, GeoJSON } from '../../../domain/types/GeoJSON'
import type { MainAppThunk } from '@store'
import type { Coordinate } from 'ol/coordinate'

export const addOrEditControlCoordinates =
  (geometry: GeoJSONNamespace.Geometry | undefined): MainAppThunk<void> =>
  (dispatch, getState) => {
    const { draft } = getState().missionForm
    if (!draft?.mainFormValues) {
      return
    }

    dispatch(unselectVessel())
    const missionGeometry = getPolygons(draft?.mainFormValues.geom)

    if (geometry) {
      dispatch(setInitialGeometry(geometry))

      const featureCoordinates = (geometry as GeoJSONNamespace.Point).coordinates
      const bufferedExtent = getCoordinatesExtent(featureCoordinates as Coordinate)
      dispatch(fitToExtent(bufferedExtent))
    } else if (missionGeometry) {
      const extent = getExtentOfPolygons(missionGeometry as Coordinate[][][])

      if (extent) {
        dispatch(fitToExtent(extent))
      }
    }

    dispatch(openDrawLayerModal)
    dispatch(
      setInteractionTypeAndListener({
        listener: InteractionListener.CONTROL_POINT,
        type: InteractionType.POINT
      })
    )
  }

const getPolygons = (geometry: GeoJSON.MultiPolygon | undefined): Coordinate[][][] => {
  if (!geometry) {
    return []
  }

  // @ts-ignore
  return geometry.coordinates || []
}

const getExtentOfPolygons = (polygons: Coordinate[][][]) => {
  const firstPolygon = polygons[0]
  if (!firstPolygon) {
    return undefined
  }

  const firstRing = firstPolygon[0]
  if (!firstRing) {
    return undefined
  }

  return transformExtent(boundingExtent(firstRing), WSG84_PROJECTION, OPENLAYERS_PROJECTION)
}
