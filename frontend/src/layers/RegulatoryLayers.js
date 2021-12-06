import { useEffect, useRef } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import LayersEnum, { getLayerNameNormalized } from '../domain/entities/layers'
import { showSimplifiedGeometries, showWholeGeometries } from '../domain/shared_slices/Regulatory'
import { getVectorLayer } from '../domain/use_cases/showRegulatoryLayer'

export const metadataIsShowedPropertyName = 'metadataIsShowed'
const SIMPLIFIED_FEATURE_ZOOM_LEVEL = 9.5

const RegulatoryLayers = ({ map, mapMovingAndZoomEvent }) => {
  const throttleDuration = 500 // ms
  const dispatch = useDispatch()
  const { getState } = useStore()

  const {
    showedLayers,
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
    if (map) {
      sortRegulatoryLayersFromAreas()
    }
  }, [map, layersToFeatures])

  useEffect(() => {
    if (map && showedLayers) {
      addRegulatoryLayersToMap()
      removeRegulatoryLayersToMap()
    }
  }, [showedLayers])

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
    return currentZoom < SIMPLIFIED_FEATURE_ZOOM_LEVEL
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
    const sortedLayersToArea = [...layersToFeatures].sort((a, b) => a.area - b.area).reverse()

    sortedLayersToArea.forEach((layerAndArea, index) => {
      index = index + 1
      const layer = map.getLayers().getArray().find(layer => layer?.name === layerAndArea.name)

      if (layer) {
        layer.setZIndex(index)
      }
    })
  }

  function addRegulatoryLayersToMap () {
    if (showedLayers.length) {
      const layersToInsert = showedLayers
        .filter(layer => layersNotInCurrentOLMap(layer))
        .filter(layer => layersOfTypeRegulatoryLayer(layer))

      layersToInsert.forEach(layerToInsert => {
        if (!layerToInsert) {
          return
        }
        const getVectorLayerClosure = getVectorLayer(dispatch, getState)
        const vectorLayer = getVectorLayerClosure(layerToInsert)
        map.getLayers().push(vectorLayer)
      })
    }
  }

  function layersNotInCurrentOLMap (layer) {
    return !map.getLayers()?.getArray().some(olLayer => olLayer.name ===
      getLayerNameNormalized({ type: LayersEnum.REGULATORY.code, ...layer }))
  }

  function layersOfTypeRegulatoryLayer (layer) {
    return layer.type === LayersEnum.REGULATORY.code
  }

  function removeRegulatoryLayersToMap () {
    const _showedLayers = showedLayers.length ? showedLayers : []
    const layersToRemove = map?.getLayers()?.getArray()
      .filter(olLayer => layersOfTypeRegulatoryLayerInCurrentMap(olLayer))
      .filter(olLayer => layersNotPresentInShowedLayers(_showedLayers, olLayer))

    layersToRemove?.forEach(layerToRemove => {
      map.getLayers().remove(layerToRemove)
    })
  }

  function layersNotPresentInShowedLayers (_showedLayers, olLayer) {
    return !_showedLayers.some(layer_ => getLayerNameNormalized(layer_) === olLayer.name)
  }

  function layersOfTypeRegulatoryLayerInCurrentMap (olLayer) {
    return olLayer?.name?.includes(LayersEnum.REGULATORY.code)
  }

  return null
}

export default RegulatoryLayers
