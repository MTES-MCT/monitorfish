import { useMapLayer } from '@features/Map/hooks/useMapLayer'
import { useWebGLLayerVisibility } from '@features/Map/hooks/useWebGLLayerVisibility'
import { NEW_MISSION_ID } from '@features/Mission/layers/constants'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { memo, useEffect, useMemo } from 'react'

import { MISSIONS_VECTOR_LAYER, MISSIONS_VECTOR_SOURCE } from './constants'
import { useGetFilteredMissionsQuery } from '../../components/MissionList/hooks/useGetFilteredMissionsQuery'
import { getMissionFeaturePoint } from '../../features'

import type { Feature } from 'ol'
import type { Point } from 'ol/geom'

function UnmemoizedMissionLayer() {
  const dispatch = useMainAppDispatch()
  const isMissionsLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isMissionsLayerDisplayed)
  const draft = useMainAppSelector(store => store.missionForm.draft)
  const missionId = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const { missions } = useGetFilteredMissionsQuery()

  useMapLayer(MISSIONS_VECTOR_LAYER)
  useWebGLLayerVisibility(MISSIONS_VECTOR_LAYER, isMissionsLayerDisplayed)

  const editedMissionFeaturePoint = useMemo(() => {
    if (!draft?.mainFormValues) {
      return undefined
    }

    return getMissionFeaturePoint({ ...draft?.mainFormValues, id: missionId ?? NEW_MISSION_ID })
  }, [draft?.mainFormValues, missionId])

  useEffect(() => {
    MISSIONS_VECTOR_SOURCE.clear()

    const features = missions
      .map(getMissionFeaturePoint)
      .filter((feature): feature is Feature<Point> => {
        if (missionId) {
          return feature !== undefined && !feature.getId()?.toString().includes(missionId.toString())
        }

        return feature !== undefined
      })
      .concat(editedMissionFeaturePoint ?? [])
    if (!features?.length) {
      return
    }

    MISSIONS_VECTOR_SOURCE.addFeatures(features)
  }, [dispatch, missions, missionId, editedMissionFeaturePoint])

  return null
}

export const MissionLayer = memo(UnmemoizedMissionLayer)
MissionLayer.displayName = 'MissionLayer'
