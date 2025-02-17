import { MainFormLiveSchema } from '@features/Mission/components/MissionForm/MainForm/schemas'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { saveMission } from '@features/Mission/useCases/saveMission'
import { isEqual } from 'lodash-es'

import type { MissionMainFormValues } from '@features/Mission/components/MissionForm/types'
import type { MainAppThunk } from '@store'

export const autoSaveMission =
  (
    nextMainFormValues: MissionMainFormValues,
    previousMainFormValues: MissionMainFormValues,
    missionId: number | undefined,
    isAutoSaveEnabled: boolean
  ): MainAppThunk<Promise<MissionMainFormValues | undefined>> =>
  async dispatch => {
    if (isEqual(nextMainFormValues, previousMainFormValues)) {
      return undefined
    }

    if (!MainFormLiveSchema.isValidSync(nextMainFormValues) || !isAutoSaveEnabled) {
      dispatch(missionFormActions.setIsDraftDirty(true))

      return nextMainFormValues
    }

    return dispatch(saveMission(nextMainFormValues, missionId))
  }
