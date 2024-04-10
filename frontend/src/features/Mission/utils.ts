import { MainFormLiveSchema } from '@features/Mission/components/MissionForm/MainForm/schemas'
import { Mission } from '@features/Mission/mission.types'
import { MissionAction } from '@features/Mission/missionAction.types'
import { customDayjs, THEME } from '@mtes-mct/monitor-ui'

import type { MissionMainFormValues } from '@features/Mission/components/MissionForm/types'

import CompletionStatus = MissionAction.CompletionStatus
import FrontCompletionStatus = MissionAction.FrontCompletionStatus

export const getMissionColor = (missionStatus: Mission.MissionStatus | undefined) => {
  switch (missionStatus) {
    case Mission.MissionStatus.UPCOMING:
      return THEME.color.mayaBlue
    case Mission.MissionStatus.IN_PROGRESS:
      return THEME.color.blueGray
    case Mission.MissionStatus.DONE:
      return THEME.color.charcoal
    default:
      return THEME.color.blueGray
  }
}
export const getMissionStatus = ({
  endDateTimeUtc,
  startDateTimeUtc
}: {
  endDateTimeUtc?: string
  startDateTimeUtc?: string
}): Mission.MissionStatus | undefined => {
  if (!startDateTimeUtc) {
    return undefined
  }

  const now = customDayjs()
  if (customDayjs(startDateTimeUtc).isAfter(now)) {
    return Mission.MissionStatus.UPCOMING
  }

  if (endDateTimeUtc && customDayjs(endDateTimeUtc).isBefore(now)) {
    return Mission.MissionStatus.DONE
  }

  return Mission.MissionStatus.IN_PROGRESS
}

export function getMissionCompletionStatus(
  mission: Partial<MissionMainFormValues> | Mission.Mission | undefined,
  actionsCompletion: (CompletionStatus | undefined)[] | undefined
): CompletionStatus {
  if (!mission || !actionsCompletion) {
    return CompletionStatus.TO_COMPLETE
  }

  const hasAtLeastOnUncompletedAction = actionsCompletion.find(
    completion => !completion || completion === CompletionStatus.TO_COMPLETE
  )

  if (hasAtLeastOnUncompletedAction || !MainFormLiveSchema.isValidSync(mission)) {
    return CompletionStatus.TO_COMPLETE
  }

  return CompletionStatus.COMPLETED
}

export function getMissionCompletionFrontStatus(
  mission: Partial<MissionMainFormValues> | Mission.Mission | undefined,
  actionsCompletion: (CompletionStatus | undefined)[] | undefined
): FrontCompletionStatus | undefined {
  const missionCompletion = getMissionCompletionStatus(mission, actionsCompletion)

  if (!mission) {
    return FrontCompletionStatus.TO_COMPLETE
  }

  const missionStatus = getMissionStatus(mission)

  if (missionStatus === Mission.MissionStatus.IN_PROGRESS && missionCompletion === CompletionStatus.COMPLETED) {
    return FrontCompletionStatus.UP_TO_DATE
  }

  if (missionStatus === Mission.MissionStatus.IN_PROGRESS && missionCompletion === CompletionStatus.TO_COMPLETE) {
    return FrontCompletionStatus.TO_COMPLETE
  }

  if (missionStatus === Mission.MissionStatus.DONE && missionCompletion === CompletionStatus.COMPLETED) {
    return FrontCompletionStatus.COMPLETED
  }

  if (missionStatus === Mission.MissionStatus.DONE && missionCompletion === CompletionStatus.TO_COMPLETE) {
    return FrontCompletionStatus.TO_COMPLETE_MISSION_ENDED
  }

  return undefined
}
