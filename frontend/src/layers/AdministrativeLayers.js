import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import Layers, { layersType } from '../domain/entities/layers'

const AdministrativeLayers = ({ map }) => {
  const layer = useSelector(state => state.layer)
  const administrativeLayers = Object.keys(Layers)
    .map(topic => Layers[topic])
    .filter(layer => layer.type === layersType.ADMINISTRATIVE)

  useEffect(() => {
    addOrRemoveAdministrativeLayers()
  }, [layer.layers])

  function addOrRemoveAdministrativeLayers () {
    if (map && layer.layers) {
      addAdministrativeLayersToMap()
      removeAdministrativeLayersToMap()
    }
  }

  function addAdministrativeLayersToMap () {
    if (layer.layers.length) {
      const layersToInsert = layer.layers
        .filter(layer => !map.getLayers().getArray().some(layer_ => layer === layer_))
        .filter(showedLayer => administrativeLayers
          .some(administrativeLayer => showedLayer.className_.includes(administrativeLayer.code)))

      layersToInsert.forEach(layerToInsert => {
        if (!layerToInsert) {
          return
        }

        map.getLayers().push(layerToInsert)
      })
    }
  }

  function removeAdministrativeLayersToMap () {
    const layers = layer.layers.length ? layer.layers : []

    const layersToRemove = map.getLayers().getArray()
      .filter(showedLayer => !layers.some(layer_ => showedLayer === layer_))
      .filter(showedLayer => administrativeLayers
        .some(administrativeLayer => showedLayer.className_.includes(administrativeLayer.code)))

    layersToRemove.forEach(layerToRemove => {
      map.getLayers().remove(layerToRemove)
    })
  }

  return null
}

export default AdministrativeLayers
