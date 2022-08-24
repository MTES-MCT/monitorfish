import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

import {
  layerOfTypeAdministrativeLayer,
  layerOfTypeAdministrativeLayerInCurrentMap,
  layersNotInCurrentOLMap,
  layersNotInShowedLayers,
} from '../domain/entities/administrative'
import Layers, { layersType } from '../domain/entities/layers'
import { getVectorOLLayer } from '../domain/use_cases/layer/administrative/showAdministrativeLayer'

function AdministrativeLayers({ map }) {
  const { showedLayers } = useSelector(state => state.layer)
  const inBackofficeMode = useSelector(state => state.global.inBackofficeMode)

  const administrativeLayers = Object.keys(Layers)
    .map(topic => Layers[topic])
    .filter(layer => layer.type === layersType.ADMINISTRATIVE)

  useEffect(() => {
    if (map && showedLayers) {
      function addAdministrativeLayersToMap() {
        const olLayers = map.getLayers()
        const layersToInsert = showedLayers
          .filter(layer => layerOfTypeAdministrativeLayer(administrativeLayers, layer))
          .filter(layer => layersNotInCurrentOLMap(olLayers, layer))

        layersToInsert.forEach(layerToInsert => {
          if (!layerToInsert) {
            return
          }
          const VectorLayer = getVectorOLLayer(layerToInsert.type, layerToInsert.zone, inBackofficeMode)
          olLayers.push(VectorLayer)
        })
      }

      function removeAdministrativeLayersToMap() {
        const _showedLayers = showedLayers?.length ? showedLayers : []

        const layers = map.getLayers()
        const layersToRemove = layers
          .getArray()
          .filter(olLayer => layerOfTypeAdministrativeLayerInCurrentMap(administrativeLayers, olLayer))
          .filter(olLayer => layersNotInShowedLayers(_showedLayers, olLayer))

        layersToRemove.forEach(layerToRemove => {
          layers.remove(layerToRemove)
        })
      }

      addAdministrativeLayersToMap()
      removeAdministrativeLayersToMap()
    }
  }, [showedLayers])

  return null
}

export default React.memo(AdministrativeLayers)
