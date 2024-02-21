import { RTK_FORCE_REFETCH_QUERY_OPTIONS } from '@api/constants'
import { type MissionWithActions } from 'domain/entities/mission/types'

import { missionActionApi } from '../../../api/missionAction'
import { monitorenvMissionApi } from '../monitorenvMissionApi'

import type { MainAppThunk } from '../../../store'

export const getMissionWithActions =
  (id: number): MainAppThunk<Promise<MissionWithActions>> =>
  async dispatch => {
    const mission = await dispatch(
      monitorenvMissionApi.endpoints.getMission.initiate(id, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()
    const actions = await dispatch(
      missionActionApi.endpoints.getMissionActions.initiate(id, RTK_FORCE_REFETCH_QUERY_OPTIONS)
    ).unwrap()

    const missionWithActions: MissionWithActions = {
      ...mission,
      actions
    }

    return missionWithActions
  }
