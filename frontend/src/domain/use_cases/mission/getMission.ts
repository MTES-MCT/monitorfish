import { monitorenvMissionApi } from '../../../api/mission'
import { missionActionApi } from '../../../api/missionAction'
import { displayOrLogError } from '../error/displayOrLogError'

import type { MissionWithActions } from '../../entities/mission/types'

export const getMission =
  (missionId: number) =>
  async (dispatch): Promise<MissionWithActions | undefined> => {
    try {
      const { data: mission, error: missionError } = await dispatch(
        monitorenvMissionApi.endpoints.getMission.initiate(missionId)
      )
      if (missionError) {
        throw missionError
      }

      const { data: missionActions, error: missionActionsError } = await dispatch(
        missionActionApi.endpoints.getMissionActions.initiate(missionId)
      )
      if (missionActionsError) {
        throw missionActionsError
      }

      return {
        ...mission,
        actions: missionActions
      }
    } catch (error) {
      // For this error, we do not permit the user to retry the use-case
      dispatch(displayOrLogError(error as Error, undefined, true, 'missionFormError'))
    }

    return undefined
  }
