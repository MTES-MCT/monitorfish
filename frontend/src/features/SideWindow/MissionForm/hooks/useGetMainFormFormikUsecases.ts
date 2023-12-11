import {sortBy} from 'lodash'

import {missionActionApi} from '../../../../api/missionAction'
import {useGetPortsQuery} from '../../../../api/port'
import {MissionAction} from '../../../../domain/types/missionAction'
import {isAirOrSeaControl, isLandControl} from '../../../../domain/use_cases/mission/getLastControlCircleGeometry'
import {useMainAppDispatch} from '../../../../hooks/useMainAppDispatch'
import {useMainAppSelector} from '../../../../hooks/useMainAppSelector'
import {formikUsecase} from '../formikUsecases'

import type {MissionMainFormValues} from '../types'

export function useGetMainFormFormikUsecases() {
  const dispatch = useMainAppDispatch()
  const missionId = useMainAppSelector(store => store.sideWindow.selectedPath.id)

  const getPortsApiQuery = useGetPortsQuery()

  return {
    /**
     * When updating a control unit, we must reset the "Other controls" field checkboxes
     */
    updateMissionActionOtherControlsCheckboxes: (mission: MissionMainFormValues, previousIsControlUnitPAM: boolean) =>
      formikUsecase.updateOtherControlsCheckboxes(dispatch)(mission, previousIsControlUnitPAM),

    /**
     * When updating the mission location from the mission, we use the `RTK-Query` cache object to access the `missionAction` form.
     * We select the last `missionAction` to update the mission location.
     */
    updateMissionLocation: (isGeometryComputedFromControls: boolean) => {
      if (!missionId) {
        return
      }

      const missionActions = missionActionApi.endpoints.getMissionActions.select(
        missionId
      ) as unknown as MissionAction.MissionAction[]
      const validControls = missionActions.filter(action => isLandControl(action) || isAirOrSeaControl(action))
      if (!validControls) {
        return
      }

      const sortedValidControlsByDateTimeDesc = sortBy(
        validControls,
        ({ actionDatetimeUtc }) => actionDatetimeUtc
      ).reverse()

      // Get most recent control, by `actionDatetimeUtc`
      const lastControl = sortedValidControlsByDateTimeDesc.at(0)
      if (!lastControl) {
        return
      }

      formikUsecase.updateMissionLocation(dispatch, getPortsApiQuery.data)(isGeometryComputedFromControls, lastControl)
    }
  }
}
