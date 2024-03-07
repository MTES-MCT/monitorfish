import { missionActionApi } from '@api/missionAction'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import { getMissionActionsDataFromMissionActionsFormValues } from '@features/Mission/components/MissionForm/utils'
import { getMissionWithActions } from '@features/Mission/useCases/getMissionWithActions'
import { saveMission } from '@features/Mission/useCases/saveMission'
import { logSoftError } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'

import type { MissionMainFormValues } from '@features/Mission/components/MissionForm/types'
import type { MainAppThunk } from '@store'

export const saveMissionAndMissionActionsByDiff =
  (
    nextMainFormValues: MissionMainFormValues,
    actionsFormValues: MissionActionFormValues[],
    missionId: number | undefined
  ): MainAppThunk<Promise<MissionMainFormValues>> =>
  async dispatch => {
    try {
      const savedMission = await dispatch(saveMission(nextMainFormValues, missionId))

      assertNotNullish(savedMission.id)

      const currentMissionWithActions = await dispatch(getMissionWithActions(savedMission.id))
      const { deletedMissionActionIds, updatedMissionActionDatas } = getMissionActionsDataFromMissionActionsFormValues(
        savedMission.id,
        actionsFormValues,
        currentMissionWithActions.actions
      )

      await Promise.all([
        ...deletedMissionActionIds.map(async missionActionId => {
          await dispatch(missionActionApi.endpoints.deleteMissionAction.initiate(missionActionId)).unwrap()
        }),
        ...updatedMissionActionDatas.map(async missionActionData => {
          if (missionActionData.id === undefined) {
            await dispatch(missionActionApi.endpoints.createMissionAction.initiate(missionActionData)).unwrap()
          } else {
            missionActionApi.endpoints.updateMissionAction.initiate({
              ...missionActionData,
              id: missionActionData.id,
              /**
               * This field is not used in the backend use-case, we add this property to
               * respected the MissionAction type (using `portName` when fetching missions actions).
               */
              portName: undefined
            })
          }
        })
      ])

      dispatch(missionFormActions.setIsDraftDirty(false))

      return savedMission
    } catch (err) {
      logSoftError({
        isSideWindowError: true,
        message: '`createOrUpdate()` failed.',
        originalError: err,
        userMessage: "Une erreur est survenue pendant l'enregistrement de la mission."
      })

      return nextMainFormValues
    }
  }
