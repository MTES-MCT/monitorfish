import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import LayersEnum from '../domain/entities/layers'
import { showSimplifiedGeometries, showWholeGeometries } from '../domain/shared_slices/Regulatory'

export const metadataIsShowedPropertyName = 'metadataIsShowed'
const simplifiedFeaturesZoom = 9.5

const RegulatoryLayers = ({ map, mapMovingAndZoomEvent }) => {
  const throttleDuration = 500 // ms
  const dispatch = useDispatch()

  const {
    layers,
    layersAndAreas,
    lastShowedFeatures,
    layersToFeatures
  } = useSelector(state => state.layer)

  const {
    regulatoryZoneMetadata,
    simplifiedGeometries
  } = useSelector(state => state.regulatory)

  const previousMapZoom = useRef('')
  const isThrottled = useRef(false)

  useEffect(() => {
    sortRegulatoryLayersFromAreas()
  }, [layers, map, layersAndAreas])

  useEffect(() => {
    addOrRemoveRegulatoryLayersToMap()
  }, [layers])

  useEffect(() => {
    addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers()
  }, [regulatoryZoneMetadata, lastShowedFeatures])

  useEffect(() => {
    if (isThrottled.current || !map || !layersToFeatures) {
      return
    }

    isThrottled.current = true
    setTimeout(() => {
      showSimplifiedOrWholeFeatures()
      isThrottled.current = false
    }, throttleDuration)
  }, [map, mapMovingAndZoomEvent, layersToFeatures])

  function getShowSimplifiedFeatures (currentZoom) {
    let showSimplifiedFeatures = true

    if (currentZoom < simplifiedFeaturesZoom) {
      showSimplifiedFeatures = true
    } else if (currentZoom >= simplifiedFeaturesZoom) {
      showSimplifiedFeatures = false
    }

    return showSimplifiedFeatures
  }

  function featuresAreAlreadyDrawWithTheSameTolerance (showSimplifiedFeatures, simplifiedGeometries) {
    return (!showSimplifiedFeatures && !simplifiedGeometries) || (showSimplifiedFeatures && simplifiedGeometries)
  }

  function showSimplifiedOrWholeFeatures () {
    const currentZoom = map.getView().getZoom().toFixed(2)

    if (currentZoom !== previousMapZoom.current) {
      previousMapZoom.current = currentZoom

      const showSimplifiedFeatures = getShowSimplifiedFeatures(currentZoom)
      if (featuresAreAlreadyDrawWithTheSameTolerance(showSimplifiedFeatures, simplifiedGeometries)) {
        return
      }

      const regulatoryLayers = map.getLayers().getArray().filter(layer => layer?.name?.includes(LayersEnum.REGULATORY.code))
      regulatoryLayers.forEach(layer => {
        const vectorSource = layer.getSource()

        if (vectorSource) {
          const layerToFeatures = layersToFeatures?.find(layerToFeatures => layerToFeatures.name === layer?.name)
          if (layerToFeatures) {
            const features = showSimplifiedFeatures
              ? layerToFeatures.simplifiedFeatures
              : layerToFeatures.features

            vectorSource.clear(true)
            vectorSource.addFeatures(vectorSource.getFormat().readFeatures(features))
          }
        }
      })

      if (showSimplifiedFeatures) {
        dispatch(showSimplifiedGeometries())
      } else {
        dispatch(showWholeGeometries())
      }
    }
  }

  function addOrRemoveRegulatoryLayersToMap () {
    if (map && layers) {
      addRegulatoryLayersToMap()
      removeRegulatoryLayersToMap()
    }
  }

  function addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers () {
    if (map) {
      const regulatoryLayers = map.getLayers().getArray().filter(layer => layer?.name?.includes(LayersEnum.REGULATORY.code))
      if (regulatoryZoneMetadata) {
        const layerToAddProperty = regulatoryLayers.find(layer => {
          return layer?.name === `${LayersEnum.REGULATORY.code}:${regulatoryZoneMetadata.topic}:${regulatoryZoneMetadata.zone}`
        })

        if (layerToAddProperty) {
          addMetadataIsShowedProperty(layerToAddProperty)
        }
      } else {
        removeMetadataIsShowedProperty(regulatoryLayers)
      }
    }
  }

  function addMetadataIsShowedProperty (layerToAddProperty) {
    const features = layerToAddProperty.getSource().getFeatures()
    if (features?.length) {
      features.forEach(feature => feature.set(metadataIsShowedPropertyName, true))
    } else if (lastShowedFeatures?.length) {
      lastShowedFeatures
        .forEach(feature => feature.set(metadataIsShowedPropertyName, true))
    }
  }

  function removeMetadataIsShowedProperty (regulatoryLayers) {
    regulatoryLayers.forEach(layer => {
      layer.getSource().getFeatures()
        .filter(feature => feature.get(metadataIsShowedPropertyName))
        .forEach(feature => feature.set(metadataIsShowedPropertyName, false))
    })
  }

  function sortRegulatoryLayersFromAreas () {
    if (map && layers.length && layersAndAreas.length > 1) {
      const sortedLayersToArea = [...layersAndAreas].sort((a, b) => a.area - b.area).reverse()

      sortedLayersToArea.forEach((layerAndArea, index) => {
        index = index + 1
        const layer = map.getLayers().getArray().find(layer => layer?.name === layerAndArea.name)

        if (layer) {
          layer.setZIndex(index)
        }
      })
    }
  }

  function addRegulatoryLayersToMap () {
    if (layers.length) {
      const layersToInsert = layers
        .filter(layer => {
          return !map.getLayers().getArray().some(layer_ => layer === layer_)
        })
        .filter(layer => layer?.name?.includes(LayersEnum.REGULATORY.code))

      layersToInsert.forEach(layerToInsert => {
        if (!layerToInsert) {
          return
        }

        map.getLayers().push(layerToInsert)
      })
    }
  }

  function removeRegulatoryLayersToMap () {
    const layersOrEmptyArray = layers.length ? layers : []
    const layersToRemove = map.getLayers().getArray()
      .filter(showedLayer => !layersOrEmptyArray.some(layer_ => showedLayer === layer_))
      .filter(layer => layer?.name?.includes(LayersEnum.REGULATORY.code))

    layersToRemove.forEach(layerToRemove => {
      map.getLayers().remove(layerToRemove)
    })
  }

  return null
}

export default RegulatoryLayers
