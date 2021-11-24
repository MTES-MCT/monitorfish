import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import layer from '../domain/shared_slices/Layer'
import Layers, { layersType } from '../domain/entities/layers'

const AdministrativeLayers = ({ map, namespace = 'homepage' }) => {
  const { removeLayer } = layer[namespace].actions
  const stateLayer = useSelector(state => state.layer)
  const { showedLayers, layers } = stateLayer
  const dispatch = useDispatch()
  const administrativeLayers = Object.keys(Layers)
    .map(topic => Layers[topic])
    .filter(layer => layer.type === layersType.ADMINISTRATIVE)

  useEffect(() => {
    if (map && layers && layers.length) {
      addAdministrativeLayersToMap()
    }
  }, [layers])

  useEffect(() => {
    if (map && showedLayers) {
      removeAdministrativeLayersToMap()
    }
  }, [showedLayers])

  function addAdministrativeLayersToMap () {
    const layersToInsert = layers
      .filter(layer => !map.getLayers().getArray().some(layer_ => layer === layer_))
      .filter(layer => administrativeLayers
        .some(administrativeLayer => layer.name?.includes(administrativeLayer.code)))

    layersToInsert.forEach(layerToInsert => {
      if (!layerToInsert) {
        return
      }

      map.getLayers().push(layerToInsert)
      dispatch(removeLayer(layerToInsert))
    })
  }

  function removeAdministrativeLayersToMap () {
    const _showedLayers = showedLayers?.length ? showedLayers : []

    const layersToRemove = map.getLayers().getArray()
      .filter(OLLayer => !_showedLayers.some(layer_ => OLLayer.name === layer_.type)) // les couches dans OL qui ne sont plus dans le state showedLayers
      .filter(OLLayer => administrativeLayers
        .some(administrativeLayer => OLLayer.name?.includes(administrativeLayer.code))) // les couches de type administrativeLayer

    layersToRemove.forEach(layerToRemove => {
      map.getLayers().remove(layerToRemove)
    })
  }

  return null
}

export default AdministrativeLayers
