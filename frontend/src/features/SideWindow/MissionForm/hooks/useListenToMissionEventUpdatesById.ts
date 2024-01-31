import { useContext, useMemo, useRef } from 'react'

import { MissionEventContext } from '../../../../context/MissionEventContext'
import { Mission } from '../../../../domain/entities/mission/types'

export function useListenToMissionEventUpdatesById(missionId: number | string | undefined) {
  const missionEvent = useContext(MissionEventContext)
  const previousMission = useRef<Mission.Mission | undefined>()

  const mission = useMemo(() => {
    if (!Number.isInteger(missionId) || !missionEvent || missionEvent.id !== missionId) {
      return previousMission.current
    }

    previousMission.current = missionEvent

    return missionEvent
  }, [missionEvent, missionId])

  return mission || previousMission.current
}
