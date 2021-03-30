import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import LayersEnum from '../domain/entities/layers'

const RegulatoryLayers = ({ map }) => {
  const layer = useSelector(state => state.layer)
  const regulatoryZoneMetadata = useSelector(state => state.regulatory.regulatoryZoneMetadata)

  useEffect(() => {
    if (map && layer.layers.length) {
      reorganizeRegulatoryLayers();
    }
  }, [layer.layers, map, layer.layersAndAreas])

  useEffect(() => {
    if (map && layer.layers) {
      addRegulatoryLayersToMap();
      removeRegulatoryLayersToMap();
    }
  }, [layer.layers])

  useEffect(() => {
    if (map) {
      let metadataIsShowedPropertyName = "metadataIsShowed";
      let regulatoryLayers = map.getLayers().getArray().filter(layer => layer.className_.includes(LayersEnum.REGULATORY.code))
      if (regulatoryZoneMetadata) {
        let layerToAddProperty = regulatoryLayers.find(layer => {
          return layer.className_ === `${LayersEnum.REGULATORY.code}:${regulatoryZoneMetadata.layerName}:${regulatoryZoneMetadata.zone}`
        })

        if (layerToAddProperty) {
          addMetadataIsShowedProperty(layerToAddProperty, metadataIsShowedPropertyName);
        }
      } else {
        removeMetadataIsShowedProperty(regulatoryLayers, metadataIsShowedPropertyName);
      }
    }
  }, [regulatoryZoneMetadata, layer.lastShowedFeatures])

  function addMetadataIsShowedProperty(layerToAddProperty, metadataIsShowedPropertyName) {
    const features = layerToAddProperty.getSource().getFeatures()
    if (features.length) {
      features.forEach(feature => feature.set(metadataIsShowedPropertyName, true))
    } else if (layer.lastShowedFeatures.length) {
      layer.lastShowedFeatures
        .forEach(feature => feature.set(metadataIsShowedPropertyName, true))
    }
  }

  function removeMetadataIsShowedProperty(regulatoryLayers, metadataIsShowedPropertyName) {
    regulatoryLayers.forEach(layer => {
      layer.getSource().getFeatures()
        .filter(feature => feature.getProperties().metadataIsShowed)
        .forEach(feature => feature.set(metadataIsShowedPropertyName, false))
    })
  }

  function reorganizeRegulatoryLayers() {
    if(layer.layersAndAreas.length > 1) {
      let sortedLayersToArea = [...layer.layersAndAreas].sort((a, b) => a.area - b.area).reverse()

      sortedLayersToArea.forEach((layerAndArea, index) => {
        index = index + 1
        let layer = map.getLayers().getArray().find(layer => layer.className_ === layerAndArea.name)

        if(layer) {
          layer.setZIndex(index)
        }
      })
    }
  }

  function addRegulatoryLayersToMap() {
    if(layer.layers.length) {
      const layersToInsert = layer.layers
        .filter(layer => {
          return !map.getLayers().getArray().some(layer_ => layer === layer_)
        })
        .filter(layer => layer.className_.includes(LayersEnum.REGULATORY.code))

      layersToInsert.map(layerToInsert => {
        if (!layerToInsert) {
          return
        }

        map.getLayers().push(layerToInsert);
      })
    }
  }

  function removeRegulatoryLayersToMap() {
    let layers = layer.layers.length ? layer.layers : []
    const layersToRemove = map.getLayers().getArray()
      .filter(showedLayer => !layers.some(layer_ => showedLayer === layer_))
      .filter(layer => layer.className_.includes(LayersEnum.REGULATORY.code))

    layersToRemove.map(layerToRemove => {
      map.getLayers().remove(layerToRemove)
    })
  }

  return null

}

export default RegulatoryLayers
