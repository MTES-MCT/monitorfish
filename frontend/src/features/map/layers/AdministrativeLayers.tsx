import React, { useEffect } from 'react'

import {
  getAdministrativeLayers,
  layerOfTypeAdministrativeLayer,
  layerOfTypeAdministrativeLayerInCurrentMap,
  layersNotInCurrentOLMap,
  layersNotInShowedLayers
} from '../../../domain/entities/layers'
import { getVectorOLLayer } from '../../../domain/use_cases/layer/administrative/showAdministrativeZone'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'

export type AdministrativeLayersProps = {
  map?: any
}
function UnmemoizedAdministrativeLayers({ map }: AdministrativeLayersProps) {
  const { showedLayers } = useMainAppSelector(state => state.layer)
  const isBackoffice = useMainAppSelector(state => state.global.isBackoffice)

  const administrativeLayers = getAdministrativeLayers()

  useEffect(() => {
    if (!map && !showedLayers) {
      return
    }

    function addAdministrativeLayersToMap() {
      const olLayers = map.getLayers()
      const layersToInsert = showedLayers
        .filter(layer => layerOfTypeAdministrativeLayer(administrativeLayers, layer))
        .filter(layer => layersNotInCurrentOLMap(olLayers, layer))

      layersToInsert.forEach(layerToInsert => {
        if (!layerToInsert) {
          return
        }
        const VectorLayer = getVectorOLLayer(layerToInsert.type, layerToInsert.zone, isBackoffice)
        olLayers.push(VectorLayer)
      })
    }

    function removeAdministrativeLayersToMap() {
      const layers = map.getLayers()
      const layersToRemove = layers
        .getArray()
        .filter(olLayer => layerOfTypeAdministrativeLayerInCurrentMap(administrativeLayers, olLayer))
        .filter(olLayer => layersNotInShowedLayers(showedLayers, olLayer))

      layersToRemove.forEach(layerToRemove => {
        layers.remove(layerToRemove)
      })
    }

    addAdministrativeLayersToMap()
    removeAdministrativeLayersToMap()
  }, [administrativeLayers, isBackoffice, map, showedLayers])

  return <></>
}

export const AdministrativeLayers = React.memo(UnmemoizedAdministrativeLayers)

AdministrativeLayers.displayName = 'AdministrativeLayers'
