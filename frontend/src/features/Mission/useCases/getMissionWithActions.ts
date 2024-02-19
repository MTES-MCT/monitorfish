import { type MissionWithActions } from 'domain/entities/mission/types'

import { missionActionApi } from '../../../api/missionAction'
import { monitorenvMissionApi } from '../components/MissionForm/apis'

import type { MainAppThunk } from '../../../store'

export const getMissionWithActions =
  (id: number): MainAppThunk<Promise<MissionWithActions>> =>
  async dispatch => {
    const mission = await dispatch(monitorenvMissionApi.endpoints.getMission.initiate(id)).unwrap()
    const actions = await dispatch(missionActionApi.endpoints.getMissionActions.initiate(id)).unwrap()

    const missionWithActions: MissionWithActions = {
      ...mission,
      actions
    }

    return missionWithActions
  }
