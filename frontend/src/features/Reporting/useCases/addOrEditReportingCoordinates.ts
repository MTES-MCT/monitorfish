import { InteractionListener, InteractionType } from '@features/Map/constants'
import { getCoordinatesExtent } from '@features/Map/useCases/getCoordinatesExtent'

import { setDisplayedComponents } from '../../../domain/shared_slices/DisplayedComponent'
import { setInitialGeometry, setInteractionTypeAndListener } from '../../Draw/slice'
import { fitToExtent } from '../../Map/slice'

import type { MainAppThunk } from '@store'
import type { Point } from 'geojson'

export const addOrEditReportingCoordinates =
  (geometry: Point | undefined): MainAppThunk<void> =>
  dispatch => {
    if (geometry) {
      dispatch(setInitialGeometry(geometry))

      const featureCoordinates = geometry.coordinates
      const bufferedExtent = getCoordinatesExtent(featureCoordinates)
      dispatch(fitToExtent(bufferedExtent))
    }

    dispatch(
      setDisplayedComponents({
        isDrawLayerModalDisplayed: true
      })
    )
    dispatch(
      setInteractionTypeAndListener({
        listener: InteractionListener.REPORTING_POINT,
        type: InteractionType.POINT
      })
    )
  }
