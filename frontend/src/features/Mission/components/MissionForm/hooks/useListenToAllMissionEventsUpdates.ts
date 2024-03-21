import { MONITORENV_API_URL } from '@api/api'
import { Mission } from '@features/Mission/mission.types'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { logInDev } from '@utils/logInDev'
import { useEffect, useRef, useState } from 'react'

import { missionEventListener } from '../sse'

const MISSION_UPDATES_URL = `${MONITORENV_API_URL}/api/v1/missions/sse`
const MISSION_UPDATE_EVENT = `MISSION_UPDATE`

export function useListenToAllMissionEventsUpdates() {
  const isListeningToEvents = useMainAppSelector(state => state.missionForm.isListeningToEvents)
  const eventSourceRef = useRef<EventSource>()
  const [missionEvent, setMissionEvent] = useState<Mission.Mission | undefined>()
  const listener = useRef(missionEventListener(mission => setMissionEvent(mission)))

  useEffect(() => {
    eventSourceRef.current = new EventSource(MISSION_UPDATES_URL)

    eventSourceRef.current?.addEventListener('open', () => {
      logInDev(`SSE: Connected to missions endpoint.`)
    })

    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  useEffect(() => {
    if (!isListeningToEvents) {
      eventSourceRef.current?.removeEventListener(MISSION_UPDATE_EVENT, listener.current)
      setMissionEvent(undefined)

      return
    }

    const nextEventListener = missionEventListener(mission => setMissionEvent(mission))
    listener.current = nextEventListener
    eventSourceRef.current?.addEventListener(MISSION_UPDATE_EVENT, nextEventListener)
  }, [isListeningToEvents])

  return missionEvent
}
