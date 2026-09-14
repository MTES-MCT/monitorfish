import { InteractionListener } from '@features/Map/constants'
import { closeDrawLayerModal } from '@features/Mission/useCases/addOrEditMissionZone'
import { applyDrawedZoneFilter } from '@features/Reporting/useCases/applyDrawedZoneFilter'

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

  /**
   * The reporting map menu is hidden while drawing, so no mounted component can read the drawn
   * geometry before it is reset below.
   */
  if (listener === InteractionListener.REPORTINGS_ZONE) {
    dispatch(applyDrawedZoneFilter())
  }

  dispatch(resetInteraction())
}
