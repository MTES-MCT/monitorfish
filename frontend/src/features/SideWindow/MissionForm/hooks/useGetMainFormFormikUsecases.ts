import { sortBy } from 'lodash'

import { useGetPortsQuery } from '../../../../api/port'
import { isAirOrSeaControl, isLandControl } from '../../../../domain/use_cases/mission/getLastControlCircleGeometry'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { formikUsecase } from '../formikUsecases'

import type { MissionMainFormValues } from '../types'

export function useGetMainFormFormikUsecases() {
  const dispatch = useMainAppDispatch()
  const draft = useMainAppSelector(state => state.missionForm.draft)

  const getPortsApiQuery = useGetPortsQuery()

  return {
    /**
     * When updating a control unit, we must reset the "Other controls" field checkboxes
     */
    updateMissionActionOtherControlsCheckboxes: (mission: MissionMainFormValues, previousIsControlUnitPAM: boolean) =>
      formikUsecase.updateOtherControlsCheckboxes(dispatch)(mission, previousIsControlUnitPAM),

    /**
     * When updating the mission location from the mission, we use the `RTK-Query` cache object to access the `missionAction` form.
     * Warning: the action MUST be VALID to be stored and available in the RTK cache
     *
     * We then select the last `missionAction` to update the mission location.
     * @return isSuccess - `true` if there is no errors
     */
    updateMissionLocation: async (isGeometryComputedFromControls: boolean): Promise<boolean> => {
      const missionActions = draft?.actionsFormValues
      if (!missionActions) {
        return false
      }

      const validControls = missionActions.filter(action => isLandControl(action) || isAirOrSeaControl(action))
      if (!validControls) {
        return false
      }

      const sortedValidControlsByDateTimeDesc = sortBy(
        validControls,
        ({ actionDatetimeUtc }) => actionDatetimeUtc
      ).reverse()

      // Get most recent control, by `actionDatetimeUtc`
      const lastControl = sortedValidControlsByDateTimeDesc.at(0)
      if (!lastControl) {
        return false
      }

      await formikUsecase.updateMissionLocation(dispatch, getPortsApiQuery.data)(
        isGeometryComputedFromControls,
        lastControl
      )

      return true
    }
  }
}
