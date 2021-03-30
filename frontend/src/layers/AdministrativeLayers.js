import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import LayersEnum, { layersType } from '../domain/entities/layers'

const AdministrativeLayers = ({ map }) => {
  const layer = useSelector(state => state.layer)
  const administrativeLayers = Object.keys(LayersEnum)
    .map(layerName => LayersEnum[layerName])
    .filter(layer => layer.type === layersType.ADMINISTRATIVE)

  useEffect(() => {
    if (map && layer.layers) {
      addAdministrativeLayersToMap();
      removeAdministrativeLayersToMap();
    }
  }, [layer.layers])

  function addAdministrativeLayersToMap() {
    if(layer.layers.length) {
      const layersToInsert = layer.layers
        .filter(layer => !map.getLayers().getArray().some(layer_ => layer === layer_))
        .filter(showedLayer => administrativeLayers
          .some(administrativeLayer => administrativeLayer.code === showedLayer.className_))

      layersToInsert.map(layerToInsert => {
        if (!layerToInsert) {
          return
        }

        map.getLayers().push(layerToInsert);
      })
    }
  }

  function removeAdministrativeLayersToMap() {
    let layers = layer.layers.length ? layer.layers : []

    const layersToRemove = map.getLayers().getArray()
      .filter(showedLayer => !layers.some(layer_ => showedLayer === layer_))
      .filter(showedLayer => administrativeLayers
        .some(administrativeLayer => administrativeLayer.code === showedLayer.className_))

    layersToRemove.map(layerToRemove => {
      map.getLayers().remove(layerToRemove)
    })
  }

  return null

}

export default AdministrativeLayers
