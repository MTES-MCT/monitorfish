import { OPENLAYERS_PROJECTION } from '@features/Map/constants'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import GeoJSON from 'ol/format/GeoJSON'
import { useMemo } from 'react'

import { MissionOverlay } from '../MissionOverlay'

export function SelectedMissionOverlay() {
  const selectedMissionGeoJSON = useMainAppSelector(store => store.missionForm.selectedMissionGeoJSON)
  const isMissionsLayerDisplayed = useMainAppSelector(store => store.displayedComponent.isMissionsLayerDisplayed)

  const selectedMission = useMemo(() => {
    if (!selectedMissionGeoJSON || !isMissionsLayerDisplayed) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(selectedMissionGeoJSON)
  }, [selectedMissionGeoJSON, isMissionsLayerDisplayed])

  return <MissionOverlay feature={selectedMission} isSelected />
}
