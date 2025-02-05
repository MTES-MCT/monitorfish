import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { ControlUnit } from '@mtes-mct/monitor-ui'

import type { MissionMainFormValues } from '@features/Mission/components/MissionForm/types'

export const updateOtherControlsCheckboxes =
  dispatch => async (mission: MissionMainFormValues, previousIsControlUnitPAM: boolean) => {
    const isControlUnitPAMOrULAM = mission.controlUnits?.some(
      controlUnit =>
        controlUnit.id &&
        (ControlUnit.PAMControlUnitIds.includes(controlUnit.id) ||
          ControlUnit.ULAMControlUnitIds.includes(controlUnit.id))
    )

    /**
     * If a PAM or ULAM was already in the control units, we do not reset the other controls
     */
    if (previousIsControlUnitPAM && isControlUnitPAMOrULAM) {
      return
    }

    dispatch(missionFormActions.mustResetOtherControlsCheckboxes(true))
  }
