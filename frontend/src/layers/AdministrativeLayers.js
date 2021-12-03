import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getVectorLayer } from '../domain/use_cases/showAdministrativeLayer'
import Layers, { getLayerNameNormalized, layersType } from '../domain/entities/layers'

const AdministrativeLayers = ({ map }) => {
  const { showedLayers } = useSelector(state => state.layer)
  const inBackofficeMode = useSelector(state => state.global.inBackofficeMode)

  const administrativeLayers = Object.keys(Layers)
    .map(topic => Layers[topic])
    .filter(layer => layer.type === layersType.ADMINISTRATIVE)

  useEffect(() => {
    if (map && showedLayers) {
      addAdministrativeLayersToMap()
      removeAdministrativeLayersToMap()
    }
  }, [showedLayers])

  function addAdministrativeLayersToMap () {
    const layersToInsert = showedLayers
      .filter(layer => layerOfTypeAdministrativeLayer(layer))
      .filter(layer => layersNotInCurrentOLMap(layer))

    layersToInsert.forEach(layerToInsert => {
      if (!layerToInsert) {
        return
      }
      const VectorLayer = getVectorLayer(layerToInsert.type, layerToInsert.zone, inBackofficeMode)
      map.getLayers().push(VectorLayer)
    })
  }

  function layersNotInCurrentOLMap (layer) {
    return !map.getLayers().getArray().some(layer_ => layer_.name === getLayerNameNormalized(layer))
  }

  function layerOfTypeAdministrativeLayer (layer) {
    return administrativeLayers
      .some(administrativeLayer => layer.type?.includes(administrativeLayer.code))
  }

  function removeAdministrativeLayersToMap () {
    const _showedLayers = showedLayers?.length ? showedLayers : []

    const layersToRemove = map.getLayers().getArray()
      .filter(olLayer => layerOfTypeAdministrativeLayerInCurrentMap(olLayer))
      .filter(olLayer => layersNotInShowedLayers(_showedLayers, olLayer))

    layersToRemove.forEach(layerToRemove => {
      map.getLayers().remove(layerToRemove)
    })
  }

  function layerOfTypeAdministrativeLayerInCurrentMap (olLayer) {
    return administrativeLayers
      .some(administrativeLayer => olLayer.name?.includes(administrativeLayer.code))
  }

  function layersNotInShowedLayers (_showedLayers, olLayer) {
    return !_showedLayers.some(layer_ => getLayerNameNormalized(layer_) === olLayer.name)
  }

  return null
}

export default AdministrativeLayers
