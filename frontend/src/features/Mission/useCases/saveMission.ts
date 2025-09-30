import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import {
  getMissionDataFromMissionFormValues,
  getUpdatedMissionFromMissionMainFormValues
} from '@features/Mission/components/MissionForm/utils'
import { validateMissionForms } from '@features/Mission/components/MissionForm/utils/validateMissionForms'
import { monitorenvMissionApi } from '@features/Mission/monitorenvMissionApi'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'
import { logSoftError } from '@utils/logSoftError'

import type { MissionMainFormValues, MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { MainAppThunk } from '@store'

export const saveMission =
  (
    nextMainFormValues: MissionMainFormValues,
    missionId: number | undefined
  ): MainAppThunk<Promise<MissionMainFormValues>> =>
  async (dispatch, getState) => {
    const actionsFormValuesFromDraft = getState().missionForm.draft?.actionsFormValues ?? []
    dispatch(missionFormActions.setIsListeningToEvents(false))

    try {
      if (!missionId) {
        const newMission = getMissionDataFromMissionFormValues(nextMainFormValues)
        const createdMission = await dispatch(
          monitorenvMissionApi.endpoints.createMission.initiate(newMission)
        ).unwrap()

        initIsDraftDirtyAndListenToEvents(nextMainFormValues, actionsFormValuesFromDraft)

        // Wait for the mission to be updated in the form before displaying the banner
        setTimeout(async () => {
          await dispatch(missionFormActions.setIsMissionCreatedBannerDisplayed(true))
        }, 250)

        return {
          ...nextMainFormValues,
          createdAtUtc: createdMission.createdAtUtc,
          id: createdMission.id,
          updatedAtUtc: createdMission.updatedAtUtc
        }
      }

      const nextMission = getUpdatedMissionFromMissionMainFormValues(missionId, nextMainFormValues)
      const updatedMission = await dispatch(monitorenvMissionApi.endpoints.updateMission.initiate(nextMission)).unwrap()

      initIsDraftDirtyAndListenToEvents(nextMainFormValues, actionsFormValuesFromDraft)

      return {
        ...nextMainFormValues,
        updatedAtUtc: updatedMission.updatedAtUtc
      }
    } catch (err) {
      logSoftError({
        callback: () =>
          dispatch(
            addSideWindowBanner({
              children: "Une erreur est survenue pendant l'enregistrement de la mission.",
              closingDelay: 6000,
              isClosable: true,
              level: Level.ERROR,
              withAutomaticClosing: true
            })
          ),
        message: '`createOrUpdate()` failed.',
        originalError: err
      })

      return nextMainFormValues
    }

    function initIsDraftDirtyAndListenToEvents(
      mainFormValues: MissionMainFormValues,
      actionsFormValues: MissionActionFormValues[]
    ) {
      const [areFormsValid] = validateMissionForms(mainFormValues, actionsFormValues, false, dispatch)
      if (areFormsValid) {
        dispatch(missionFormActions.setIsDraftDirty(false))
      }

      setTimeout(() => {
        dispatch(missionFormActions.setIsListeningToEvents(true))
      }, 500)
    }
  }
