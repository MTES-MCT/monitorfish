import { missionActionApi } from '@api/missionAction'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { getMissionActionDataFromFormValues } from '@features/Mission/components/MissionForm/utils'
import { isMissionActionFormValid } from '@features/Mission/components/MissionForm/utils/isMissionActionFormValid'
import { logSoftError } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { MainAppThunk } from '@store'

export const saveMissionAction =
  (
    actionFormValues: MissionActionFormValues,
    missionId: number | undefined,
    isMissionClosed: boolean | undefined,
    isAutoSaveEnabled: boolean
  ): MainAppThunk<Promise<number | undefined>> =>
  async dispatch => {
    if (!isMissionActionFormValid(actionFormValues, isMissionClosed ?? false) || !isAutoSaveEnabled) {
      dispatch(missionFormActions.setIsDraftDirty(true))

      return actionFormValues.id
    }

    try {
      assertNotNullish(missionId)

      const missionActionData = getMissionActionDataFromFormValues(actionFormValues, missionId)

      if (missionActionData.id === undefined) {
        const { id } = await dispatch(
          missionActionApi.endpoints.createMissionAction.initiate(missionActionData)
        ).unwrap()

        return id
      }

      await dispatch(
        missionActionApi.endpoints.updateMissionAction.initiate({
          ...missionActionData,
          id: missionActionData.id,
          /**
           * This field is not used in the backend use-case, we add this property to
           * respected the MissionAction type (using `portName` when fetching missions actions).
           */
          portName: undefined
        })
      ).unwrap()

      dispatch(missionFormActions.setIsDraftDirty(false))

      return missionActionData.id
    } catch (err) {
      logSoftError({
        isSideWindowError: true,
        message: '`await autoSaveAction()` failed.',
        originalError: err,
        userMessage: "Une erreur est survenue pendant l'enregistrement de la mission."
      })

      return actionFormValues.id
    }
  }
