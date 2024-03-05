import { MissionEventContext } from 'context/MissionEventContext'
import { useContext, useMemo } from 'react'

export function useListenToMissionEventUpdatesById(missionId: number | string | undefined) {
  const missionEvent = useContext(MissionEventContext)

  const mission = useMemo(() => {
    if (!Number.isInteger(missionId) || !missionEvent || missionEvent.id !== missionId) {
      return undefined
    }

    return missionEvent
  }, [missionEvent, missionId])

  return mission
}
