import { useContext, useMemo } from 'react'

import { MissionEventContext } from '../../../../context/MissionEventContext'
import { usePreviousNotNull } from '../../../../hooks/usePreviousNotNull'

import type { Mission } from '../../../../domain/entities/mission/types'

export function useListenMissionEventUpdatesById(missionId: number | string | undefined) {
  const missionEvent = useContext(MissionEventContext)

  const mission = useMemo(() => {
    // @ts-ignore: `missionId` is verified with `Number.isInteger(missionId)`
    if (!Number.isInteger(missionId) || missionEvent?.id !== missionId) {
      return undefined
    }

    return missionEvent as Mission.Mission
  }, [missionEvent, missionId])

  const previousMission = usePreviousNotNull(mission)

  return mission || previousMission
}
