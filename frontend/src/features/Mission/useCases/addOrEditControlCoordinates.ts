import { InteractionListener, InteractionType } from '@features/Map/constants'
import { getCoordinatesExtent } from '@features/Map/useCases/getCoordinatesExtent'
import { OPENLAYERS_PROJECTION, WSG84_PROJECTION } from '@mtes-mct/monitor-ui'
import { boundingExtent } from 'ol/extent'
import { transformExtent } from 'ol/proj'

import { openDrawLayerModal } from './addOrEditMissionZone'
import { setInitialGeometry, setInteractionTypeAndListener } from '../../Draw/slice'
import { fitToExtent } from '../../Map/slice'
import { unselectVessel } from '../../Vessel/useCases/unselectVessel'

import type { MainAppThunk } from '@store'
import type { MultiPolygon, Point, Position } from 'geojson'

export const addOrEditControlCoordinates =
  (geometry: Point | undefined): MainAppThunk<void> =>
  (dispatch, getState) => {
    const { draft } = getState().missionForm
    if (!draft?.mainFormValues) {
      return
    }

    dispatch(unselectVessel())
    const missionGeometry = getPolygons(draft?.mainFormValues.geom)

    if (geometry) {
      dispatch(setInitialGeometry(geometry))

      const featureCoordinates = geometry.coordinates
      const bufferedExtent = getCoordinatesExtent(featureCoordinates)
      dispatch(fitToExtent(bufferedExtent))
    } else if (missionGeometry) {
      const extent = getExtentOfPolygons(missionGeometry)

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

const getPolygons = (geometry: MultiPolygon | undefined): Position[][][] => {
  if (!geometry) {
    return []
  }

  return geometry.coordinates || []
}

const getExtentOfPolygons = (polygons: Position[][][]) => {
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
