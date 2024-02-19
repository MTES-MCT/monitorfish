import { type MissionWithActions } from 'domain/entities/mission/types'

import { missionActionApi } from '../../../api/missionAction'
import { assertNotNullish } from '../../../utils/assertNotNullish'
import { rethrowErrorIfDefined } from '../../../utils/rethrowErrorIfDefined'
import { monitorenvMissionApi } from '../components/MissionForm/apis'

import type { MainAppThunk } from '../../../store'

export const getMissionWithActions =
  (id: number): MainAppThunk<Promise<MissionWithActions>> =>
  async dispatch => {
    const { data: mission, error: missionError } = await dispatch(
      monitorenvMissionApi.endpoints.getMission.initiate(id)
    )
    rethrowErrorIfDefined(missionError)
    assertNotNullish(mission)

    const { data: actions, error: getMissionActionsError } = await dispatch(
      missionActionApi.endpoints.getMissionActions.initiate(id)
    )
    rethrowErrorIfDefined(getMissionActionsError)

    const missionWithActions: MissionWithActions = {
      ...mission,
      actions: actions ?? []
    }

    return missionWithActions
  }
