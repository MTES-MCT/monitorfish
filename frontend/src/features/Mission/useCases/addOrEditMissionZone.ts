import { hideAllMainWindowComponentsAndSaveDisplayState } from '@features/MainWindow/useCases/hideAllMainWindowComponentsAndSaveDisplayState'
import { restoreMainWindowDisplayState } from '@features/MainWindow/useCases/restoreMainWindowDisplayState'

import { InteractionListener, InteractionType } from '../../../domain/entities/map/constants'
import { fitMultiPolygonToExtent } from '../../../domain/use_cases/map/fitMultiPolygonToExtent'
import { unselectVessel } from '../../../domain/use_cases/vessel/unselectVessel'
import { setInitialGeometry, setInteractionTypeAndListener } from '../../Draw/slice'

import type { GeoJSON as GeoJSONNamespace } from '../../../domain/types/GeoJSON'
import type { MainAppThunk } from '@store'

export const addOrEditMissionZone =
  (geometry: GeoJSONNamespace.Geometry | undefined): MainAppThunk =>
  dispatch => {
    dispatch(unselectVessel())

    if (geometry) {
      dispatch(setInitialGeometry(geometry))
      dispatch(fitMultiPolygonToExtent(geometry))
    }

    dispatch(openDrawLayerModal)
    dispatch(
      setInteractionTypeAndListener({
        listener: InteractionListener.MISSION_ZONE,
        type: InteractionType.POLYGON
      })
    )
  }

export const openDrawLayerModal = dispatch => {
  dispatch(hideAllMainWindowComponentsAndSaveDisplayState())
}

export const closeDrawLayerModal = dispatch => {
  dispatch(restoreMainWindowDisplayState())
}
