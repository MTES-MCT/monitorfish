import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import {
  getMissionDataFromMissionFormValues,
  getUpdatedMissionFromMissionMainFormValues
} from '@features/Mission/components/MissionForm/utils'
import { validateMissionForms } from '@features/Mission/components/MissionForm/utils/validateMissionForms'
import { monitorenvMissionApi } from '@features/Mission/monitorenvMissionApi'
import { addSideWindowBanner } from '@features/SideWindow/useCases/addSideWindowBanner'
import { Level } from '@mtes-mct/monitor-ui'
import { createLatestOnlySaver } from '@utils/createLatestOnlySaver'
import { logSoftError } from '@utils/logSoftError'

import type { MissionMainFormValues, MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { Mission } from '@features/Mission/mission.types'
import type { MainAppThunk } from '@store'

const MISSION_SAVE_KEY = 'mission'

/** Mission created in this session: a later save may run with form values that miss its id. */
let createdMission: Mission.Mission | undefined
const latestOnlySaver = createLatestOnlySaver<MissionMainFormValues, MissionMainFormValues>()

export function resetMissionSaves() {
  createdMission = undefined
  latestOnlySaver.reset()
}

export const saveMission =
  (
    nextMainFormValues: MissionMainFormValues,
    missionId: number | undefined
  ): MainAppThunk<Promise<MissionMainFormValues>> =>
  async (dispatch, getState) =>
    latestOnlySaver.save(MISSION_SAVE_KEY, nextMainFormValues, async values => {
      const actionsFormValuesFromDraft = getState().missionForm.draft?.actionsFormValues ?? []
      dispatch(missionFormActions.setIsListeningToEvents(false))

      const missionIdToUpdate = missionId ?? createdMission?.id

      try {
        return missionIdToUpdate ? await updateMission(values, missionIdToUpdate) : await createMission(values)
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

        return values
      }

      async function createMission(values_: MissionMainFormValues): Promise<MissionMainFormValues> {
        const newMission = getMissionDataFromMissionFormValues(values_)
        createdMission = await dispatch(monitorenvMissionApi.endpoints.createMission.initiate(newMission)).unwrap()

        dispatch(missionFormActions.setLastSavedUpdatedAtUtc(createdMission.updatedAtUtc))
        initIsDraftDirtyAndListenToEvents(values_, actionsFormValuesFromDraft)

        // Wait for the mission to be updated in the form before displaying the banner
        setTimeout(async () => {
          await dispatch(missionFormActions.setIsMissionCreatedBannerDisplayed(true))
        }, 250)

        return {
          ...values_,
          createdAtUtc: createdMission.createdAtUtc,
          id: createdMission.id,
          updatedAtUtc: createdMission.updatedAtUtc
        }
      }

      async function updateMission(
        values_: MissionMainFormValues,
        missionIdToUpdate_: number
      ): Promise<MissionMainFormValues> {
        const nextMission = getUpdatedMissionFromMissionMainFormValues(missionIdToUpdate_, values_)
        const updatedMission = await dispatch(
          monitorenvMissionApi.endpoints.updateMission.initiate(nextMission)
        ).unwrap()

        dispatch(missionFormActions.setLastSavedUpdatedAtUtc(updatedMission.updatedAtUtc))
        initIsDraftDirtyAndListenToEvents(values_, actionsFormValuesFromDraft)

        return {
          ...values_,
          createdAtUtc: values_.createdAtUtc ?? createdMission?.createdAtUtc,
          id: missionIdToUpdate_,
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
    })
