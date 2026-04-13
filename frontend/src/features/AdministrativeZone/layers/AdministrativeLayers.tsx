import { monitorfishMap } from '@features/Map/monitorfishMap'
import {
  administrativeLayers,
  layerOfTypeAdministrativeLayer,
  layerOfTypeAdministrativeLayerInCurrentMap,
  layersNotInCurrentOLMap,
  layersNotInShowedLayers
} from '@features/Map/utils'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import WebGLVectorLayer from 'ol/layer/WebGLVector'
import React, { useEffect } from 'react'

import { getAdministrativeLabelLayer, getVectorOLLayer } from './utils'

function UnmemoizedAdministrativeLayers() {
  const showedLayers = useMainAppSelector(state => state.layer.showedLayers)

  useEffect(() => {
    if (!showedLayers) {
      return
    }

    function addAdministrativeLayersToMap() {
      const olLayers = monitorfishMap.getLayers()
      const layersToInsert = showedLayers
        .filter(layer => layerOfTypeAdministrativeLayer(administrativeLayers, layer))
        .filter(layer => layersNotInCurrentOLMap(olLayers, layer))

      layersToInsert.forEach(layerToInsert => {
        if (!layerToInsert?.type) {
          return
        }

        const webglLayer = getVectorOLLayer(layerToInsert.type, layerToInsert.zone, false)
        const labelLayer = getAdministrativeLabelLayer(layerToInsert.type, layerToInsert.zone, webglLayer)
        olLayers.push(webglLayer)
        olLayers.push(labelLayer)
      })
    }

    function removeAdministrativeLayersToMap() {
      const layers = monitorfishMap.getLayers()
      const layersToRemove = layers
        .getArray()
        .filter(olLayer => layerOfTypeAdministrativeLayerInCurrentMap(administrativeLayers, olLayer))
        .filter(olLayer => layersNotInShowedLayers(showedLayers, olLayer))

      layersToRemove.forEach(layerToRemove => {
        if (layerToRemove instanceof WebGLVectorLayer) {
          try {
            layerToRemove.dispose()
          } catch {
            // WebGL context not yet initialized (layer removed before first render)
          }
        }
        layers.remove(layerToRemove)
      })
    }

    addAdministrativeLayersToMap()
    removeAdministrativeLayersToMap()
  }, [showedLayers])

  return <></>
}

export const AdministrativeLayers = React.memo(UnmemoizedAdministrativeLayers)

AdministrativeLayers.displayName = 'AdministrativeLayers'
