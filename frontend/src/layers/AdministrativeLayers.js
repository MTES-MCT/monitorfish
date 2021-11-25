import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { getVectorLayer } from '../domain/use_cases/showAdministrativeLayer'
import Layers, { layersType } from '../domain/entities/layers'

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
      .filter(layer => !map.getLayers().getArray().some(layer_ => layer.type === layer_.name)) // Les couches dans showedLayers qui ne sont pas dans OL
      .filter(layer => administrativeLayers
        .some(administrativeLayer => layer.type?.includes(administrativeLayer.code))) // Les couches de type administrativeLayer

    layersToInsert.forEach(layerToInsert => {
      if (!layerToInsert) {
        return
      }
      const VectorLayer = getVectorLayer(layerToInsert.type, layerToInsert.zone, inBackofficeMode)
      map.getLayers().push(VectorLayer)
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
