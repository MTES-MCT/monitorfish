import { missionActionApi } from '@api/missionAction'
import { portApi } from '@api/port'
import { formikUsecase } from '@features/Mission/components/MissionForm/formikUsecases'
import { missionFormActions } from '@features/Mission/components/MissionForm/slice'

import { MissionAction } from '../../../domain/types/missionAction'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'
import type { MainAppThunk } from '@store'

export const deleteMissionAction =
  (
    actionsFormValues: MissionActionFormValues[],
    actionIndex: number,
    isAutoSaveEnabled: boolean,
    isGeometryComputedFromControls: boolean
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

    const nextControlActionsWithGeometry = nextActionsFormValues
      .filter(
        missionAction =>
          missionAction.actionType === MissionAction.MissionActionType.AIR_CONTROL ||
          missionAction.actionType === MissionAction.MissionActionType.LAND_CONTROL ||
          missionAction.actionType === MissionAction.MissionActionType.SEA_CONTROL
      )
      .filter(missionAction => missionAction.portLocode || (missionAction.latitude && missionAction.longitude))
      .sort((a, b) =>
        a.actionDatetimeUtc && b.actionDatetimeUtc && a.actionDatetimeUtc < b.actionDatetimeUtc ? 1 : -1
      )

    if (nextControlActionsWithGeometry.length === 0) {
      await formikUsecase.initMissionLocation(dispatch)(isGeometryComputedFromControls)
    } else {
      const { data: ports } = await dispatch(portApi.endpoints.getPorts.initiate())

      await formikUsecase.updateMissionLocation(dispatch, ports)(
        isGeometryComputedFromControls,
        nextControlActionsWithGeometry[0]
      )
    }

    return nextActionsFormValues
  }
