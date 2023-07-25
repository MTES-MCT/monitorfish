import { sortBy } from 'lodash'

import { useGetPortsQuery } from '../../../../api/port'
import { isAirOrSeaControl, isLandControl } from '../../../../domain/use_cases/mission/getLastControlCircleGeometry'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { updateMissionLocation } from '../formikUsecases'

import type { MissionActionFormValues } from '../types'

export function useGetMainFormFormikUsecases() {
  const dispatch = useMainAppDispatch()
  const draft = useMainAppSelector(store => store.mission.draft)

  const getPortsApiQuery = useGetPortsQuery()

  return {
    /**
     * When updating the mission location from the mission, we use the `draft` object to access the `missionAction` form.
     * We select the last `missionAction` to update the mission location.
     */
    updateMissionLocation: (isGeometryComputedFromControls: boolean) => {
      const validControls = draft?.actionsFormValues?.filter(
        action => isLandControl(action) || isAirOrSeaControl(action)
      )

      const sortedValidControlsByDateTimeDesc: MissionActionFormValues[] = sortBy(
        validControls,
        ({ actionDatetimeUtc }) => actionDatetimeUtc
      ).reverse()

      // Get most recent control, by `actionDatetimeUtc`
      const lastControl = sortedValidControlsByDateTimeDesc.at(0)
      if (!lastControl) {
        return
      }

      updateMissionLocation(dispatch, getPortsApiQuery.data)(isGeometryComputedFromControls, lastControl)
    }
  }
}
