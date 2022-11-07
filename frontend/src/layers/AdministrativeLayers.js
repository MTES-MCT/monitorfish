import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getVectorOLLayer } from '../domain/use_cases/layer/administrative/showAdministrativeLayer'
import { Layer, LayerType } from '../domain/entities/layers/constants'
import {
  layerOfTypeAdministrativeLayer,
  layerOfTypeAdministrativeLayerInCurrentMap,
  layersNotInCurrentOLMap, layersNotInShowedLayers
} from '../domain/entities/administrative'

/**
 * @param {{
 *   map?: any
 * }} props 
 */
const AdministrativeLayers = ({ map }) => {
  const { showedLayers } = useSelector(state => state.layer)
  const isBackoffice = useSelector(state => state.global.isBackoffice)

  const administrativeLayers = Object.keys(Layer)
    .map(topic => Layer[topic])
    .filter(layer => layer.type === LayerType.ADMINISTRATIVE)

  useEffect(() => {
    if (map && showedLayers) {
      function addAdministrativeLayersToMap () {
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

      function removeAdministrativeLayersToMap () {
        const _showedLayers = showedLayers?.length ? showedLayers : []

        const layers = map.getLayers()
        const layersToRemove = layers.getArray()
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

// TODO This is strange and I don't think it works since hooks are inner-component dependant.
// Either memoize it within the parent components or maybe memoize only its props values.
export default React.memo(AdministrativeLayers)
