import { Mission } from '../../../domain/entities/mission/types'
import { ReconnectingEventSource } from '../../../libs/ReconnectingEventSource'

import type { PatchCollection, Recipe } from '@reduxjs/toolkit/dist/query/core/buildThunks'
import {MONITORENV_API_URL} from "../../../api/api";

const MISSION_UPDATES_URL = `${MONITORENV_API_URL}/api/v1/missions/sse`
export const MISSION_UPDATE_EVENT = `MISSION_UPDATE`

export const EVENT_SOURCE = new ReconnectingEventSource(MISSION_UPDATES_URL, { max_retry_time: 10000 })
// eslint-disable-next-line no-console
console.log(`SSE: connected to missions endpoint.`)

const missionIdToListenerMap = new Map<number, (event: MessageEvent) => void>()

export function addNewMissionListener(missionId: number, listener: (event: MessageEvent) => void) {
  removeMissionListener(missionId)

  // eslint-disable-next-line no-console
  console.log(`SSE: listening for updates of mission id ${missionId}...`)

  missionIdToListenerMap.set(missionId, listener)

  EVENT_SOURCE.addEventListener(MISSION_UPDATE_EVENT, listener)
}

export function removeMissionListener(missionId: number) {
  const listener = missionIdToListenerMap.get(missionId)
  if (!listener) {
    return
  }

  EVENT_SOURCE.removeEventListener(MISSION_UPDATE_EVENT, listener)
  missionIdToListenerMap.delete(missionId)
  // eslint-disable-next-line no-console
  console.log(`SSE: removed listener of mission id ${missionId}.`)
}

export const missionEventListener =
  (id: number, updateCachedData: (updateRecipe: Recipe<any>) => PatchCollection) => (event: MessageEvent) => {
    const mission = JSON.parse(event.data) as Mission.Mission
    if (mission.id !== id) {
      // eslint-disable-next-line no-console
      console.log(`SSE: filtered an update for mission id ${id} (received mission id ${mission.id}).`)

      return
    }

    // eslint-disable-next-line no-console
    console.log(`SSE: received an update for mission id ${id}.`)

    updateCachedData(() => mission)
  }
