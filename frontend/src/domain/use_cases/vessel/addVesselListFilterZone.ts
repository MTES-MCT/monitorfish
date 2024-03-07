import { setInteractionTypeAndListener } from '@features/Draw/slice'

import { InteractionListener, InteractionType } from '../../entities/map/constants'
import { setDisplayedComponents } from '../../shared_slices/DisplayedComponent'

export const addVesselListFilterZone = (interactionType: InteractionType) => dispatch => {
  dispatch(
    setDisplayedComponents({
      isVesselListModalDisplayed: false
    })
  )
  dispatch(
    setInteractionTypeAndListener({
      listener: InteractionListener.VESSELS_LIST,
      type: interactionType
    })
  )
}

export const closeDrawLayerModal = dispatch => {
  dispatch(
    setDisplayedComponents({
      isDrawLayerModalDisplayed: false,
      isInterestPointMapButtonDisplayed: true,
      isMeasurementMapButtonDisplayed: true,
      isVesselFiltersMapButtonDisplayed: true,
      isVesselLabelsMapButtonDisplayed: true,
      isVesselListDisplayed: true,
      isVesselSearchDisplayed: true,
      isVesselVisibilityMapButtonDisplayed: true
    })
  )
}
