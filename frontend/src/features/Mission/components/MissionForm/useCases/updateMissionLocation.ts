import { missionFormActions } from '@features/Mission/components/MissionForm/slice'
import { EnvMissionAction } from '@features/Mission/envMissionAction.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { getLastControlCircleGeometry } from '@features/Mission/useCases/getLastControlCircleGeometry'
import { first, orderBy } from 'lodash'

import type { Port } from '../../../../../domain/types/port'
import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export const updateMissionLocation =
  (
    dispatch,
    ports: Port.Port[] | undefined,
    envActions: EnvMissionAction.MissionAction[],
    actions: MissionAction.MissionAction[]
  ) =>
  async (
    isGeometryComputedFromControls: boolean | undefined,
    missionAction: MissionActionFormValues | MissionAction.MissionAction | undefined
  ) => {
    if (!missionAction || !ports || !isGeometryComputedFromControls) {
      return
    }

    const actionDateTimes = actions
      .filter(
        action =>
          action.actionType === MissionAction.MissionActionType.LAND_CONTROL ||
          action.actionType === MissionAction.MissionActionType.SEA_CONTROL ||
          action.actionType === MissionAction.MissionActionType.AIR_CONTROL
      )
      .map(action => action.actionDatetimeUtc)

    const lastFishActionDate = first(orderBy(actionDateTimes, dateTime => dateTime, ['desc']))

    if (lastFishActionDate && lastFishActionDate > missionAction.actionDatetimeUtc) {
      // As another action is newer, we do not update the mission location
      return
    }

    const envActionDateTimes = envActions
      .filter(
        action =>
          action.actionType === EnvMissionAction.MissionActionType.CONTROL ||
          action.actionType === EnvMissionAction.MissionActionType.SURVEILLANCE
      )
      .map(action => action.actionStartDateTimeUtc)
      .filter((actionStartDateTimeUtc): actionStartDateTimeUtc is string => actionStartDateTimeUtc !== null)

    const lastEnvActionDate = first(orderBy(envActionDateTimes, dateTime => dateTime, ['desc']))

    if (lastEnvActionDate && lastEnvActionDate > missionAction.actionDatetimeUtc) {
      // As another action from Env is newer, we do not update the mission location
      return
    }

    const nextMissionGeometry = await dispatch(getLastControlCircleGeometry(ports, missionAction))
    if (!nextMissionGeometry) {
      return
    }

    dispatch(missionFormActions.setGeometryComputedFromControls(nextMissionGeometry))
  }
