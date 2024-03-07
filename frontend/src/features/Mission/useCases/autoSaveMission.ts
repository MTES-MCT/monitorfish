import { MainFormLiveSchema } from '@features/Mission/components/MissionForm/MainForm/schemas'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { saveMission } from '@features/Mission/useCases/saveMission'
import { isEqual } from 'lodash'

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

    const mainFormValuesWithUpdatedIsClosedProperty = {
      ...nextMainFormValues,
      isClosed: !!previousMainFormValues.isClosed
    }

    if (!MainFormLiveSchema.isValidSync(mainFormValuesWithUpdatedIsClosedProperty) || !isAutoSaveEnabled) {
      dispatch(missionFormActions.setIsDraftDirty(true))

      return mainFormValuesWithUpdatedIsClosedProperty
    }

    return dispatch(saveMission(mainFormValuesWithUpdatedIsClosedProperty, missionId))
  }
