import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { boundingExtent } from 'ol/extent'
import { transformExtent } from 'ol/proj'

import { openDrawLayerModal } from './addOrEditMissionZone'
import { InteractionListener, InteractionType } from '../../entities/map/constants'
import { setGeometry, setInteractionTypeAndListener } from '../../shared_slices/Draw'
import { fitToExtent } from '../../shared_slices/Map'
import { getCoordinatesExtent } from '../map/getCoordinatesExtent'
import { unselectVessel } from '../vessel/unselectVessel'

import type { MainAppThunk } from '../../../store'
import type { GeoJSON as GeoJSONNamespace, GeoJSON } from '../../types/GeoJSON'
import type { Coordinate } from 'ol/coordinate'

export const addControlCoordinates =
  (geometry: GeoJSONNamespace.Geometry | undefined): MainAppThunk<void> =>
  (dispatch, getState) => {
    dispatch(unselectVessel())
    const missionGeometry = getPolygons(getState().mission.draft?.mainFormValues.geom)

    if (geometry) {
      dispatch(setGeometry(geometry))

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
