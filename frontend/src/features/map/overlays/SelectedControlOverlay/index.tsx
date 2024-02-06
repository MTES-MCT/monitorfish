import GeoJSON from 'ol/format/GeoJSON'
import { useMemo } from 'react'

import { OPENLAYERS_PROJECTION } from '../../../../domain/entities/map/constants'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ControlOverlay } from '../ControlOverlay'

export function SelectedControlOverlay() {
  const selectedControlGeoJSON = useMainAppSelector(store => store.mainMap.selectedMissionActionGeoJSON)
  const selectedControl = useMemo(() => {
    if (!selectedControlGeoJSON) {
      return undefined
    }

    return new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(selectedControlGeoJSON)
  }, [selectedControlGeoJSON])

  return <ControlOverlay feature={selectedControl} isSelected />
}
