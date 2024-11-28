import { useMainAppSelector } from '@hooks/useMainAppSelector'
import React, { useEffect } from 'react'

import { getVectorOLLayer } from './utils'
import {
  administrativeLayers,
  layerOfTypeAdministrativeLayer,
  layerOfTypeAdministrativeLayerInCurrentMap,
  layersNotInCurrentOLMap,
  layersNotInShowedLayers
} from '../../MainMap/utils'
import { monitorfishMap } from '../../map/monitorfishMap'

function UnmemoizedAdministrativeLayers() {
  const showedLayers = useMainAppSelector(state => state.mainMap.showedLayers)
  // TODO Do we use administrative layers in the backoffice?
  const isBackoffice = useMainAppSelector(state => state.global.isBackoffice)

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

        const VectorLayer = getVectorOLLayer(layerToInsert.type, layerToInsert.zone, isBackoffice)
        olLayers.push(VectorLayer)
      })
    }

    function removeAdministrativeLayersToMap() {
      const layers = monitorfishMap.getLayers()
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
  }, [isBackoffice, showedLayers])

  return <></>
}

export const AdministrativeLayers = React.memo(UnmemoizedAdministrativeLayers)

AdministrativeLayers.displayName = 'AdministrativeLayers'
