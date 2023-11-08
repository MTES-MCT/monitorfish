import { useEffect, useRef } from 'react'
import { useStore } from 'react-redux'

import { getLayerNameNormalized } from '../../../domain/entities/layers'
import { LayerProperties } from '../../../domain/entities/layers/constants'
import { showSimplifiedGeometries, showWholeGeometries } from '../../../domain/shared_slices/Regulatory'
import { getRegulatoryLayersToAdd } from '../../../domain/use_cases/layer/regulation/getRegulatoryLayersToAdd'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { monitorfishMap } from '../monitorfishMap'

import type { VectorLayerWithName } from '../../../domain/types/layer'

export const METADATA_IS_SHOWED = 'metadataIsShowed'
const SIMPLIFIED_FEATURE_ZOOM_LEVEL = 9.5

export type RegulatoryLayersProps = {
  mapMovingAndZoomEvent?: any
}
export function RegulatoryLayers({ mapMovingAndZoomEvent }: RegulatoryLayersProps) {
  const throttleDuration = 500 // ms
  const dispatch = useMainAppDispatch()
  const { getState } = useStore()

  const { lastShowedFeatures, layersToFeatures, showedLayers } = useMainAppSelector(state => state.layer)

  const { regulatoryZoneMetadata, simplifiedGeometries } = useMainAppSelector(state => state.regulatory)

  const previousMapZoom = useRef('')
  const isThrottled = useRef(false)

  useEffect(() => {
    sortRegulatoryLayersFromAreas(layersToFeatures, monitorfishMap.getLayers().getArray())
  }, [layersToFeatures])

  useEffect(() => {
    if (!showedLayers) {
      return
    }

    const olLayers = monitorfishMap.getLayers()
    const vectorLayersToAdd = dispatch(getRegulatoryLayersToAdd(olLayers.getArray(), showedLayers))
    vectorLayersToAdd.forEach(vectorLayer => {
      olLayers.push(vectorLayer)
    })
    removeRegulatoryLayersToMap(showedLayers, olLayers)
  }, [dispatch, getState, showedLayers])

  useEffect(() => {
    function addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers() {
      const regulatoryLayers = monitorfishMap
        .getLayers()
        .getArray()
        .filter(layer => (layer as VectorLayerWithName)?.name?.includes(LayerProperties.REGULATORY.code))

      if (!regulatoryZoneMetadata) {
        removeMetadataIsShowedProperty(regulatoryLayers)

        return
      }

      const layerToAddProperty = regulatoryLayers.find(
        layer =>
          (layer as VectorLayerWithName)?.name ===
          `${LayerProperties.REGULATORY.code}:${regulatoryZoneMetadata.topic}:${regulatoryZoneMetadata.zone}`
      )

      if (layerToAddProperty) {
        addMetadataIsShowedProperty(lastShowedFeatures, layerToAddProperty)
      }
    }

    addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers()
  }, [lastShowedFeatures, regulatoryZoneMetadata])

  useEffect(() => {
    if (isThrottled.current || !layersToFeatures) {
      return
    }

    function showSimplifiedOrWholeFeatures() {
      const currentZoom = monitorfishMap.getView().getZoom()?.toFixed(2)

      if (currentZoom && currentZoom !== previousMapZoom.current) {
        previousMapZoom.current = currentZoom

        const showSimplifiedFeatures = getShowSimplifiedFeatures(currentZoom)
        if (featuresAreAlreadyDrawWithTheSameTolerance(showSimplifiedFeatures, simplifiedGeometries)) {
          return
        }

        const regulatoryLayers = monitorfishMap
          .getLayers()
          .getArray()
          .filter(layer => (layer as VectorLayerWithName)?.name?.includes(LayerProperties.REGULATORY.code))
        regulatoryLayers.forEach(layer => {
          // @ts-ignore
          const vectorSource = layer.getSource()

          if (vectorSource) {
            const layerToFeatures = layersToFeatures?.find(
              layerToFeature => layerToFeature.name === (layer as VectorLayerWithName)?.name
            )
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
    // The `mapMovingAndZoomEvent` prop is used to refresh this effect
  }, [dispatch, layersToFeatures, mapMovingAndZoomEvent, simplifiedGeometries])

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
  return olLayer?.name?.includes(LayerProperties.REGULATORY.code)
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
