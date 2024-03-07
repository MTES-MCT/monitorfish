import { missionActionApi } from '@api/missionAction'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { MainAppThunk } from '@store'

export const deleteMissionAction =
  (
    actionsFormValues: MissionActionFormValues[],
    actionIndex: number,
    isAutoSaveEnabled: boolean
  ): MainAppThunk<Promise<MissionActionFormValues[]>> =>
  async dispatch => {
    const deletedAction = actionsFormValues.find((_, index) => index === actionIndex)
    const nextActionsFormValues = actionsFormValues.filter((_, index) => index !== actionIndex)

    if (!isAutoSaveEnabled) {
      dispatch(missionFormActions.setIsDraftDirty(true))

      return nextActionsFormValues
    }

    if (!deletedAction?.id) {
      return nextActionsFormValues
    }

    await dispatch(missionActionApi.endpoints.deleteMissionAction.initiate(deletedAction.id)).unwrap()

    return nextActionsFormValues
  }
