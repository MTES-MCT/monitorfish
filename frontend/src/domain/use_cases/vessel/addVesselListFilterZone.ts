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
