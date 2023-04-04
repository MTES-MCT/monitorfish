import { useCallback, useEffect, useState } from 'react'

import { useGetMissionsQuery } from '../../../../api/mission'
import { missionActionApi } from '../../../../api/missionAction'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'

import type { Mission, MissionWithActions } from '../types'

export function useGetMissionsWithActions(): MissionWithActions[] {
  const dispatch = useMainAppDispatch()
  const missions = useGetMissionsQuery(undefined).data
  const [missionsAndActions, setMissionWithActions] = useState<MissionWithActions[]>([])

  const getMissionsWithActions = useCallback(
    (_missions: Mission.Mission[] | undefined) => {
      if (!_missions) {
        return []
      }

      const missionActionsPromises = _missions.map(async mission => {
        const { data: missionActions } = await dispatch(
          missionActionApi.endpoints.getMissionActions.initiate(mission.id)
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

  return missionsAndActions
}
