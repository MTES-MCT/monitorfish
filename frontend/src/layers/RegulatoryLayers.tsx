import { useEffect, useRef } from 'react'
import { useStore } from 'react-redux'

import { getLayerNameNormalized } from '../domain/entities/layers'
import { Layer } from '../domain/entities/layers/constants'
import { showSimplifiedGeometries, showWholeGeometries } from '../domain/shared_slices/Regulatory'
import { getVectorOLLayer } from '../domain/use_cases/layer/regulation/showRegulatoryZone'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { useAppSelector } from '../hooks/useAppSelector'

export const METADATA_IS_SHOWED = 'metadataIsShowed'
const SIMPLIFIED_FEATURE_ZOOM_LEVEL = 9.5

export type RegulatoryLayersProps = {
  map?: any
  mapMovingAndZoomEvent?: any
}
export function RegulatoryLayers({ map, mapMovingAndZoomEvent }: RegulatoryLayersProps) {
  const throttleDuration = 500 // ms
  const dispatch = useAppDispatch()
  const { getState } = useStore()

  const { lastShowedFeatures, layersToFeatures, showedLayers } = useAppSelector(state => state.layer)

  const { regulatoryZoneMetadata, simplifiedGeometries } = useAppSelector(state => state.regulatory)

  const { gears } = useAppSelector(state => state.gear)

  const previousMapZoom = useRef('')
  const isThrottled = useRef(false)

  useEffect(() => {
    if (map) {
      sortRegulatoryLayersFromAreas(layersToFeatures, map.getLayers().getArray())
    }
  }, [layersToFeatures, map])

  useEffect(() => {
    if (map && showedLayers && gears?.length) {
      const olLayers = map.getLayers()
      // TODO Passing a `dispatch` and a `getState` to another function that's not a hook?
      addRegulatoryLayersToMap(dispatch, getState, olLayers, showedLayers)
      removeRegulatoryLayersToMap(showedLayers, olLayers)
    }
  }, [dispatch, gears, getState, map, showedLayers])

  useEffect(() => {
    function addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers() {
      if (map) {
        const regulatoryLayers = map
          .getLayers()
          .getArray()
          .filter(layer => layer?.name?.includes(Layer.REGULATORY.code))
        if (regulatoryZoneMetadata) {
          const layerToAddProperty = regulatoryLayers.find(
            layer =>
              layer?.name === `${Layer.REGULATORY.code}:${regulatoryZoneMetadata.topic}:${regulatoryZoneMetadata.zone}`
          )

          if (layerToAddProperty) {
            addMetadataIsShowedProperty(lastShowedFeatures, layerToAddProperty)
          }
        } else {
          removeMetadataIsShowedProperty(regulatoryLayers)
        }
      }
    }

    addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers()
  }, [lastShowedFeatures, map, regulatoryZoneMetadata])

  useEffect(() => {
    if (isThrottled.current || !map || !layersToFeatures) {
      return
    }

    function showSimplifiedOrWholeFeatures() {
      const currentZoom = map.getView().getZoom().toFixed(2)

      if (currentZoom !== previousMapZoom.current) {
        previousMapZoom.current = currentZoom

        const showSimplifiedFeatures = getShowSimplifiedFeatures(currentZoom)
        if (featuresAreAlreadyDrawWithTheSameTolerance(showSimplifiedFeatures, simplifiedGeometries)) {
          return
        }

        const regulatoryLayers = map
          .getLayers()
          .getArray()
          .filter(layer => layer?.name?.includes(Layer.REGULATORY.code))
        regulatoryLayers.forEach(layer => {
          const vectorSource = layer.getSource()

          if (vectorSource) {
            const layerToFeatures = layersToFeatures?.find(layerToFeature => layerToFeature.name === layer?.name)
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
  }, [dispatch, layersToFeatures, map, mapMovingAndZoomEvent, simplifiedGeometries])

  return <></>
}

function sortRegulatoryLayersFromAreas(layersToFeatures, olLayers) {
  const sortedLayersToArea = [...layersToFeatures].sort((a, b) => a.area - b.area).reverse()

  sortedLayersToArea.forEach((layerAndArea, index) => {
    const foundLayer = olLayers.find(layer => layer?.name === layerAndArea.name)

    if (foundLayer) {
      foundLayer.setZIndex(index + 1)
    }
  })
}

function layersNotInCurrentOLMap(olLayers, layer) {
  return !olLayers.some(olLayer => olLayer.name === getLayerNameNormalized({ type: Layer.REGULATORY.code, ...layer }))
}

function layersOfTypeRegulatoryLayer(layer) {
  return layer.type === Layer.REGULATORY.code
}

function getShowSimplifiedFeatures(currentZoom) {
  return currentZoom < SIMPLIFIED_FEATURE_ZOOM_LEVEL
}

function featuresAreAlreadyDrawWithTheSameTolerance(showSimplifiedFeatures, simplifiedGeometries) {
  return (!showSimplifiedFeatures && !simplifiedGeometries) || (showSimplifiedFeatures && simplifiedGeometries)
}

function removeRegulatoryLayersToMap(showedLayers, olLayers) {
  const layersToRemove = olLayers
    .getArray()
    .filter(olLayer => layersOfTypeRegulatoryLayerInCurrentMap(olLayer))
    .filter(olLayer => layersNotPresentInShowedLayers(showedLayers, olLayer))

  layersToRemove?.forEach(layerToRemove => {
    olLayers.remove(layerToRemove)
  })
}

function layersNotPresentInShowedLayers(showedLayers, olLayer) {
  return !showedLayers.some(layer_ => getLayerNameNormalized(layer_) === olLayer.name)
}

function layersOfTypeRegulatoryLayerInCurrentMap(olLayer) {
  return olLayer?.name?.includes(Layer.REGULATORY.code)
}

function addMetadataIsShowedProperty(lastShowedFeatures, layerToAddProperty) {
  const features = layerToAddProperty.getSource().getFeatures()
  if (features?.length) {
    features.forEach(feature => feature.set(METADATA_IS_SHOWED, true))
  } else if (lastShowedFeatures?.length) {
    lastShowedFeatures.forEach(feature => feature.set(METADATA_IS_SHOWED, true))
  }
}

function removeMetadataIsShowedProperty(regulatoryLayers) {
  regulatoryLayers.forEach(layer => {
    layer
      .getSource()
      .getFeatures()
      .filter(feature => feature.get(METADATA_IS_SHOWED))
      .forEach(feature => feature.set(METADATA_IS_SHOWED, false))
  })
}

function addRegulatoryLayersToMap(dispatch, getState, olLayers, showedLayers) {
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
