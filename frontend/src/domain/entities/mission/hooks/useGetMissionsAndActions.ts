import { useCallback, useEffect, useState } from 'react'

import { useGetMissionsQuery } from '../../../../api/mission'
import { missionActionApi } from '../../../../api/missionAction'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'

import type { Mission, MissionAndActions } from '../types'

export function useGetMissionsAndActions(): MissionAndActions[] {
  const dispatch = useMainAppDispatch()
  const missions = useGetMissionsQuery(undefined).data
  const [missionsAndActions, setMissionAndActions] = useState<MissionAndActions[]>([])

  const getMissionsAndActions = useCallback(
    (_missions: Mission.Mission[] | undefined) => {
      if (!_missions) {
        return []
      }

      const missionActionsPromises = _missions.map(async mission => {
        const { data: missionActions } = await dispatch(
          missionActionApi.endpoints.getMissionActions.initiate(mission.id)
        )

        return {
          actions: missionActions || [],
          mission
        }
      })

      return Promise.all(missionActionsPromises).then(nextMissionsAndActions =>
        setMissionAndActions(nextMissionsAndActions)
      )
    },
    [dispatch]
  )

  useEffect(() => {
    getMissionsAndActions(missions)
  }, [missions, getMissionsAndActions])

  return missionsAndActions
}
