import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import {
  getMissionDataFromMissionFormValues,
  getUpdatedMissionFromMissionMainFormValues
} from '@features/Mission/components/MissionForm/utils'
import { monitorenvMissionApi } from '@features/Mission/monitorenvMissionApi'
import { logSoftError } from '@mtes-mct/monitor-ui'

import type { MissionMainFormValues } from '@features/Mission/components/MissionForm/types'
import type { MainAppThunk } from '@store'

export const saveMission =
  (
    nextMainFormValues: MissionMainFormValues,
    missionId: number | undefined
  ): MainAppThunk<Promise<MissionMainFormValues | undefined>> =>
  async dispatch => {
    try {
      dispatch(missionFormActions.setIsListeningToEvents(false))

      if (!missionId) {
        const newMission = getMissionDataFromMissionFormValues(nextMainFormValues)
        const createdMission = await dispatch(
          monitorenvMissionApi.endpoints.createMission.initiate(newMission)
        ).unwrap()

        return {
          ...nextMainFormValues,
          createdAtUtc: createdMission.createdAtUtc,
          id: createdMission.id,
          updatedAtUtc: createdMission.updatedAtUtc
        }
      }
      const nextMission = getUpdatedMissionFromMissionMainFormValues(missionId, nextMainFormValues)
      const updatedMission = await dispatch(monitorenvMissionApi.endpoints.updateMission.initiate(nextMission)).unwrap()

      dispatch(missionFormActions.setIsDraftDirty(false))
      setTimeout(() => {
        dispatch(missionFormActions.setIsListeningToEvents(true))
      }, 500)

      return {
        ...nextMainFormValues,
        updatedAtUtc: updatedMission.updatedAtUtc
      }
    } catch (err) {
      logSoftError({
        isSideWindowError: true,
        message: '`createOrUpdate()` failed.',
        originalError: err,
        userMessage: "Une erreur est survenue pendant l'enregistrement de la mission."
      })

      return undefined
    }
  }
