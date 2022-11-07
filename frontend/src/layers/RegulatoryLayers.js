import { useEffect, useRef } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { Layer } from '../domain/entities/layers/constants'
import { getLayerNameNormalized } from '../domain/entities/layers'
import { showSimplifiedGeometries, showWholeGeometries } from '../domain/shared_slices/Regulatory'
import { getVectorOLLayer } from '../domain/use_cases/layer/regulation/showRegulatoryZone'

export const METADATA_IS_SHOWED = 'metadataIsShowed'
const SIMPLIFIED_FEATURE_ZOOM_LEVEL = 9.5

/**
 * @param {{
 *   map?: any
 *   mapMovingAndZoomEvent?: any
 * }} props 
 */
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

  const {
    gears
  } = useSelector(state => state.gear)

  const previousMapZoom = useRef('')
  const isThrottled = useRef(false)

  useEffect(() => {
    if (map) {
      sortRegulatoryLayersFromAreas(layersToFeatures, map.getLayers().getArray())
    }
  }, [map, layersToFeatures])

  useEffect(() => {
    if (map && showedLayers && gears?.length) {
      const olLayers = map.getLayers()
      addRegulatoryLayersToMap(dispatch, getState, olLayers, showedLayers)
      removeRegulatoryLayersToMap(showedLayers, olLayers)
    }
  }, [showedLayers, gears])

  useEffect(() => {
    function addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers () {
      if (map) {
        const regulatoryLayers = map.getLayers().getArray().filter(layer => layer?.name?.includes(Layer.REGULATORY.code))
        if (regulatoryZoneMetadata) {
          const layerToAddProperty = regulatoryLayers.find(layer => {
            return layer?.name === `${Layer.REGULATORY.code}:${regulatoryZoneMetadata.topic}:${regulatoryZoneMetadata.zone}`
          })

          if (layerToAddProperty) {
            addMetadataIsShowedProperty(lastShowedFeatures, layerToAddProperty)
          }
        } else {
          removeMetadataIsShowedProperty(regulatoryLayers)
        }
      }
    }

    addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers()
  }, [regulatoryZoneMetadata, lastShowedFeatures])

  useEffect(() => {
    if (isThrottled.current || !map || !layersToFeatures) {
      return
    }

    function showSimplifiedOrWholeFeatures () {
      const currentZoom = map.getView().getZoom().toFixed(2)

      if (currentZoom !== previousMapZoom.current) {
        previousMapZoom.current = currentZoom

        const showSimplifiedFeatures = getShowSimplifiedFeatures(currentZoom)
        if (featuresAreAlreadyDrawWithTheSameTolerance(showSimplifiedFeatures, simplifiedGeometries)) {
          return
        }

        const regulatoryLayers = map.getLayers().getArray().filter(layer => layer?.name?.includes(Layer.REGULATORY.code))
        regulatoryLayers.forEach(layer => {
          const vectorSource = layer.getSource()

          if (vectorSource) {
            const layerToFeatures = layersToFeatures?.find(layerToFeatures => layerToFeatures.name === layer?.name)
            if (layerToFeatures) {
              const features = showSimplifiedFeatures
                ? layerToFeatures.simplifiedFeatures || layerToFeatures.features
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

    isThrottled.current = true
    setTimeout(() => {
      showSimplifiedOrWholeFeatures()
      isThrottled.current = false
    }, throttleDuration)
    // TODO Why is there an unused prop just to refresh this effect?
  }, [map, mapMovingAndZoomEvent, layersToFeatures])

  return null
}

function sortRegulatoryLayersFromAreas (layersToFeatures, olLayers) {
  const sortedLayersToArea = [...layersToFeatures].sort((a, b) => a.area - b.area).reverse()

  sortedLayersToArea.forEach((layerAndArea, index) => {
    index = index + 1
    const layer = olLayers.find(layer => layer?.name === layerAndArea.name)

    if (layer) {
      layer.setZIndex(index)
    }
  })
}

function layersNotInCurrentOLMap (olLayers, layer) {
  return !olLayers.some(olLayer => olLayer.name ===
    getLayerNameNormalized({ type: Layer.REGULATORY.code, ...layer }))
}

function layersOfTypeRegulatoryLayer (layer) {
  return layer.type === Layer.REGULATORY.code
}

function getShowSimplifiedFeatures (currentZoom) {
  return currentZoom < SIMPLIFIED_FEATURE_ZOOM_LEVEL
}

function featuresAreAlreadyDrawWithTheSameTolerance (showSimplifiedFeatures, simplifiedGeometries) {
  return (!showSimplifiedFeatures && !simplifiedGeometries) || (showSimplifiedFeatures && simplifiedGeometries)
}

function removeRegulatoryLayersToMap (showedLayers, olLayers) {
  const _showedLayers = showedLayers?.length ? showedLayers : []

  const layersToRemove = olLayers.getArray()
    .filter(olLayer => layersOfTypeRegulatoryLayerInCurrentMap(olLayer))
    .filter(olLayer => layersNotPresentInShowedLayers(_showedLayers, olLayer))

  layersToRemove?.forEach(layerToRemove => {
    olLayers.remove(layerToRemove)
  })
}

function layersNotPresentInShowedLayers (_showedLayers, olLayer) {
  return !_showedLayers.some(layer_ => getLayerNameNormalized(layer_) === olLayer.name)
}

function layersOfTypeRegulatoryLayerInCurrentMap (olLayer) {
  return olLayer?.name?.includes(Layer.REGULATORY.code)
}

function addMetadataIsShowedProperty (lastShowedFeatures, layerToAddProperty) {
  const features = layerToAddProperty.getSource().getFeatures()
  if (features?.length) {
    features.forEach(feature => feature.set(METADATA_IS_SHOWED, true))
  } else if (lastShowedFeatures?.length) {
    lastShowedFeatures
      .forEach(feature => feature.set(METADATA_IS_SHOWED, true))
  }
}

function removeMetadataIsShowedProperty (regulatoryLayers) {
  regulatoryLayers.forEach(layer => {
    layer.getSource().getFeatures()
      .filter(feature => feature.get(METADATA_IS_SHOWED))
      .forEach(feature => feature.set(METADATA_IS_SHOWED, false))
  })
}

function addRegulatoryLayersToMap (dispatch, getState, olLayers, showedLayers) {
  if (showedLayers.length) {
    const layersToInsert = showedLayers
      .filter(layer => layersNotInCurrentOLMap(olLayers.getArray(), layer))
      .filter(layer => layersOfTypeRegulatoryLayer(layer))

    layersToInsert.forEach(layerToInsert => {
      if (!layerToInsert) {
        return
      }
      const getVectorLayerClosure = getVectorOLLayer(dispatch, getState)
      const vectorLayer = getVectorLayerClosure(layerToInsert)
      olLayers.push(vectorLayer)
    })
  }
}

export default RegulatoryLayers
