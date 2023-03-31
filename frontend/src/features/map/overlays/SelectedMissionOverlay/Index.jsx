import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { useMemo } from 'react'
import GeoJSON from 'ol/format/GeoJSON'
import { OPENLAYERS_PROJECTION } from '../../../../domain/entities/map/constants'
import { MissionOverlay } from '../MissionOverlay'

export function SelectedMissionOverlay({ map }) {
  const selectedMissionGeoJSON = useMainAppSelector(store => store.mission.selectedMissionGeoJSON)
  const selectedMission = useMemo(() => {
    if (!selectedMissionGeoJSON) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(selectedMissionGeoJSON)
  }, [selectedMissionGeoJSON])

  return <MissionOverlay
    feature={selectedMission}
    map={map}
    isSelected={true}
  />
}
