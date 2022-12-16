import React, { useEffect } from 'react'

import {
  layerOfTypeAdministrativeLayer,
  layerOfTypeAdministrativeLayerInCurrentMap,
  layersNotInCurrentOLMap,
  layersNotInShowedLayers
} from '../../../domain/entities/administrative'
import { Layer, LayerType } from '../../../domain/entities/layers/constants'
import { getVectorOLLayer } from '../../../domain/use_cases/layer/administrative/showAdministrativeLayer'
import { useAppSelector } from '../../../hooks/useAppSelector'

export type AdministrativeLayersProps = {
  map?: any
}
function UnmemoizedAdministrativeLayers({ map }: AdministrativeLayersProps) {
  const { showedLayers } = useAppSelector(state => state.layer)
  const isBackoffice = useAppSelector(state => state.global.isBackoffice)

  const administrativeLayers = Object.keys(Layer)
    .map(topic => Layer[topic])
    .filter(layer => layer.type === LayerType.ADMINISTRATIVE)

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
