import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import LayersEnum from '../domain/entities/layers'

const RegulatoryLayers = ({ map }) => {
  const layer = useSelector(state => state.layer)
  const regulatoryZoneMetadata = useSelector(state => state.regulatory.regulatoryZoneMetadata)

  useEffect(() => {
    sortRegulatoryLayersFromAreas()
  }, [layer.layers, map, layer.layersAndAreas])

  useEffect(() => {
    addOrRemoveRegulatoryLayersToMap()
  }, [layer.layers])

  useEffect(() => {
    addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers()
  }, [regulatoryZoneMetadata, layer.lastShowedFeatures])

  function addOrRemoveRegulatoryLayersToMap () {
    if (map && layer.layers) {
      addRegulatoryLayersToMap()
      removeRegulatoryLayersToMap()
    }
  }

  function addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers () {
    if (map) {
      const metadataIsShowedPropertyName = 'metadataIsShowed'
      const regulatoryLayers = map.getLayers().getArray().filter(layer => layer.className_.includes(LayersEnum.REGULATORY.code))
      if (regulatoryZoneMetadata) {
        const layerToAddProperty = regulatoryLayers.find(layer => {
          return layer.className_ === `${LayersEnum.REGULATORY.code}:${regulatoryZoneMetadata.topic}:${regulatoryZoneMetadata.zone}`
        })

        if (layerToAddProperty) {
          addMetadataIsShowedProperty(layerToAddProperty, metadataIsShowedPropertyName)
        }
      } else {
        removeMetadataIsShowedProperty(regulatoryLayers, metadataIsShowedPropertyName)
      }
    }
  }

  function addMetadataIsShowedProperty (layerToAddProperty, metadataIsShowedPropertyName) {
    const features = layerToAddProperty.getSource().getFeatures()
    if (features.length) {
      features.forEach(feature => feature.set(metadataIsShowedPropertyName, true))
    } else if (layer.lastShowedFeatures.length) {
      layer.lastShowedFeatures
        .forEach(feature => feature.set(metadataIsShowedPropertyName, true))
    }
  }

  function removeMetadataIsShowedProperty (regulatoryLayers, metadataIsShowedPropertyName) {
    regulatoryLayers.forEach(layer => {
      layer.getSource().getFeatures()
        .filter(feature => feature.getProperties().metadataIsShowed)
        .forEach(feature => feature.set(metadataIsShowedPropertyName, false))
    })
  }

  function sortRegulatoryLayersFromAreas () {
    if (map && layer.layers.length && layer.layersAndAreas.length > 1) {
      const sortedLayersToArea = [...layer.layersAndAreas].sort((a, b) => a.area - b.area).reverse()

      sortedLayersToArea.forEach((layerAndArea, index) => {
        index = index + 1
        const layer = map.getLayers().getArray().find(layer => layer.className_ === layerAndArea.name)

        if (layer) {
          layer.setZIndex(index)
        }
      })
    }
  }

  function addRegulatoryLayersToMap () {
    if (layer.layers.length) {
      const layersToInsert = layer.layers
        .filter(layer => {
          return !map.getLayers().getArray().some(layer_ => layer === layer_)
        })
        .filter(layer => layer.className_.includes(LayersEnum.REGULATORY.code))

      layersToInsert.forEach(layerToInsert => {
        if (!layerToInsert) {
          return
        }

        map.getLayers().push(layerToInsert)
      })
    }
  }

  function removeRegulatoryLayersToMap () {
    const layers = layer.layers.length ? layer.layers : []
    const layersToRemove = map.getLayers().getArray()
      .filter(showedLayer => !layers.some(layer_ => showedLayer === layer_))
      .filter(layer => layer.className_.includes(LayersEnum.REGULATORY.code))

    layersToRemove.forEach(layerToRemove => {
      map.getLayers().remove(layerToRemove)
    })
  }

  return null
}

export default RegulatoryLayers
