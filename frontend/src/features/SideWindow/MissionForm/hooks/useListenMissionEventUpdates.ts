import { useEffect, useRef, useState } from 'react'

import { Mission } from '../../../../domain/entities/mission/types'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { missionEventListener } from '../sse'

const MISSION_UPDATES_URL = `/api/v1/missions/sse`
const MISSION_UPDATE_EVENT = `MISSION_UPDATE`

export function useListenMissionEventUpdates() {
  const isListeningToEvents = useMainAppSelector(state => state.mission.isListeningToEvents)
  const eventSourceRef = useRef<EventSource>()
  const [missionEvent, setMissionEvent] = useState<Mission.Mission>()
  const listener = useRef(missionEventListener(mission => setMissionEvent(mission)))

  useEffect(() => {
    eventSourceRef.current = new EventSource(MISSION_UPDATES_URL)

    eventSourceRef.current?.addEventListener('open', () => {
      // eslint-disable-next-line no-console
      console.log(`SSE: Connected to missions endpoint.`)
    })

    return () => {
      eventSourceRef?.current?.close()
    }
  }, [])

  useEffect(() => {
    if (!isListeningToEvents) {
      // @ts-ignore: `MessageEvent` contains more properties than `Event` from `removeEventListener`
      eventSourceRef.current?.removeEventListener(MISSION_UPDATE_EVENT, listener.current)

      return
    }

    listener.current = missionEventListener(mission => setMissionEvent(mission))
    // @ts-ignore: `MessageEvent` contains more properties than `Event` from `removeEventListener`
    eventSourceRef.current?.addEventListener(MISSION_UPDATE_EVENT, listener.current)
  }, [isListeningToEvents])

  return missionEvent
}
