import { InteractionListener } from '@features/Map/constants'
import { closeDrawLayerModal } from '@features/Mission/useCases/addOrEditMissionZone'

import { setDisplayedComponents } from '../../../domain/shared_slices/DisplayedComponent'
import { resetInteraction } from '../slice'

export const closeDraw = (listener?: InteractionListener) => (dispatch, getState) => {
  const { editedVesselGroup } = getState().vesselGroup
  if (editedVesselGroup) {
    dispatch(setDisplayedComponents({ isVesselGroupMainWindowEditionDisplayed: true }))
  }

  dispatch(closeDrawLayerModal)

  /**
   * If the listener is the vessel group edition modal (EDIT_DYNAMIC_VESSEL_GROUP_DIALOG),
   * the latter is responsible for resetting the interaction.
   * This component needs to access the `drawedGeometry` when it is mounted after the draw closing.
   */
  if (listener === InteractionListener.EDIT_DYNAMIC_VESSEL_GROUP_DIALOG) {
    return
  }

  dispatch(resetInteraction())
}
