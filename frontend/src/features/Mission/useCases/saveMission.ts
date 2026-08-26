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
import type { Mission } from '@features/Mission/mission.types'
import type { MainAppThunk } from '@store'

/**
 * Creation currently in flight, if any. Auto-save can fire a second save before the first `POST` has
 * returned the mission id: without this lock, that second save would create a duplicate mission
 * (see https://github.com/MTES-MCT/monitorfish/issues/5368).
 */
let pendingMissionCreation: Promise<Mission.Mission> | undefined

export function resetPendingMissionCreation() {
  pendingMissionCreation = undefined
}

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
        // A creation is already in flight: wait for it, then persist these values as an update of
        // the created mission instead of creating a duplicate one
        if (pendingMissionCreation) {
          const createdMission = await pendingMissionCreation

          return {
            ...(await updateMission(createdMission.id)),
            createdAtUtc: createdMission.createdAtUtc,
            id: createdMission.id
          }
        }

        const newMission = getMissionDataFromMissionFormValues(nextMainFormValues)
        pendingMissionCreation = dispatch(monitorenvMissionApi.endpoints.createMission.initiate(newMission)).unwrap()

        let createdMission: Mission.Mission
        try {
          createdMission = await pendingMissionCreation
        } finally {
          pendingMissionCreation = undefined
        }

        dispatch(missionFormActions.setLastSavedUpdatedAtUtc(createdMission.updatedAtUtc))
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

      return await updateMission(missionId)
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

    async function updateMission(missionIdToUpdate: number): Promise<MissionMainFormValues> {
      const nextMission = getUpdatedMissionFromMissionMainFormValues(missionIdToUpdate, nextMainFormValues)
      const updatedMission = await dispatch(monitorenvMissionApi.endpoints.updateMission.initiate(nextMission)).unwrap()

      dispatch(missionFormActions.setLastSavedUpdatedAtUtc(updatedMission.updatedAtUtc))
      initIsDraftDirtyAndListenToEvents(nextMainFormValues, actionsFormValuesFromDraft)

      return {
        ...nextMainFormValues,
        updatedAtUtc: updatedMission.updatedAtUtc
      }
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
