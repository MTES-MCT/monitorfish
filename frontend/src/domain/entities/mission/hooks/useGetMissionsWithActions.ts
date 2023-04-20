import { useCallback, useEffect, useState } from 'react'

import { missionApi } from '../../../../api/mission'
import { missionActionApi } from '../../../../api/missionAction'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'

import type { Mission, MissionWithActions } from '../types'

export function useGetMissionsWithActions(): {
  fetchMissions: () => void
  missionsWithActions: MissionWithActions[]
} {
  const dispatch = useMainAppDispatch()
  const [missionsWithActions, setMissionWithActions] = useState<MissionWithActions[]>([])
  const [missions, setMissions] = useState<Mission.Mission[]>([])

  const getMissions = useCallback(async () => {
    const { data: nextMissions } = await dispatch(
      missionApi.endpoints.getMissions.initiate(undefined, { forceRefetch: true })
    )

    if (!nextMissions) {
      return
    }

    setMissions(nextMissions)
  }, [dispatch])

  useEffect(() => {
    getMissions()
  }, [getMissions])

  const getMissionsWithActions = useCallback(
    (_missions: Mission.Mission[] | undefined) => {
      if (!_missions) {
        return []
      }

      const missionActionsPromises = _missions.map(async mission => {
        const { data: missionActions } = await dispatch(
          missionActionApi.endpoints.getMissionActions.initiate(mission.id, { forceRefetch: true })
        )

        return {
          ...mission,
          actions: missionActions || []
        }
      })

      return Promise.all(missionActionsPromises).then(nextMissionsWithActions =>
        setMissionWithActions(nextMissionsWithActions)
      )
    },
    [dispatch]
  )

  useEffect(() => {
    getMissionsWithActions(missions)
  }, [missions, getMissionsWithActions])

  return {
    fetchMissions: getMissions,
    missionsWithActions
  }
}
