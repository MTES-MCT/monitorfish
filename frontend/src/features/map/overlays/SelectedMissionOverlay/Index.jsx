import {useMainAppSelector} from "../../../../hooks/useMainAppSelector";
import {useMemo} from "react";
import GeoJSON from "ol/format/GeoJSON";
import {OPENLAYERS_PROJECTION} from "../../../../domain/entities/map/constants";

export function SelectedMissionOverlay() {
  const selectedMissionGeoJSON = useMainAppSelector(store => store.mission.selectedMissionGeoJSON)
  const selectedMission = useMemo(() =>
    new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(selectedMissionGeoJSON), [selectedMissionGeoJSON])

  return <SelectedMissionOverlay/>
}
