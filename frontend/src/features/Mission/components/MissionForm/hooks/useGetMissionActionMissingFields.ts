import { getMissionActionMissingFields } from '@features/Mission/components/MissionForm/utils/getMissionActionMissingFields'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs } from '@mtes-mct/monitor-ui'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export function useGetMissionActionMissingFields(missionAction: MissionActionFormValues): {
  isMissionEnded: boolean
  missingFields: number
} {
  const draft = useMainAppSelector(state => state.missionForm.draft)
  const now = customDayjs()
  const endDateTimeUtc = draft?.mainFormValues.endDateTimeUtc

  return {
    isMissionEnded: endDateTimeUtc ? now.isAfter(endDateTimeUtc) : false,
    missingFields: getMissionActionMissingFields(missionAction)
  }
}
