import { PAMControlUnitIds } from '@features/Mission/components/MissionForm/constants'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'

import type { MissionMainFormValues } from '@features/Mission/components/MissionForm/types'

export const updateOtherControlsCheckboxes =
  dispatch => async (mission: MissionMainFormValues, previousIsControlUnitPAM: boolean) => {
    const isControlUnitPAM = mission.controlUnits?.some(
      controlUnit => controlUnit.id && PAMControlUnitIds.includes(controlUnit.id)
    )

    /**
     * If a PAM was already in the control units, we do not reset the other controls
     */
    if (previousIsControlUnitPAM && isControlUnitPAM) {
      return
    }

    dispatch(missionFormActions.mustResetOtherControlsCheckboxes(true))
  }
