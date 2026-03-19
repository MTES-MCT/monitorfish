import { HALF_A_SECOND } from '@constants/index'
import { LayerProperties } from '@features/Map/constants'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import { getLayerNameNormalized } from '@features/Map/utils'
import { METADATA_IS_SHOWED, SIMPLIFIED_FEATURE_ZOOM_LEVEL } from '@features/Regulation/layers/constants'
import { useHybridAppDispatch } from '@hooks/useHybridAppDispatch'
import { Feature } from 'ol'
import { Geometry } from 'ol/geom'
import { type MutableRefObject, useEffect, useRef } from 'react'
import { useThrottledCallback } from 'use-debounce'

import { getRegulatoryLayersToAdd } from '../useCases/getRegulatoryLayersToAdd'

import type { RegulatoryZone } from '../types'
import type { MonitorFishMap } from '@features/Map/Map.types'
import type VectorImageLayer from 'ol/layer/VectorImage'

export type RegulatoryLayersProps = Readonly<{
  lastShowedFeatures: Record<string, any>[]
  layersToFeatures: Record<string, any>[]
  mapMovingAndZoomEvent?: any
  regulatoryZoneMetadata: RegulatoryZone | undefined
  showedLayers: MonitorFishMap.ShowedLayer[]
}>
export function RegulatoryLayers({
  lastShowedFeatures,
  layersToFeatures,
  mapMovingAndZoomEvent,
  regulatoryZoneMetadata,
  showedLayers
}: RegulatoryLayersProps) {
  const previousMapZoom = useRef('')

  const dispatch = useHybridAppDispatch()

  useEffect(() => {
    sortRegulatoryLayersFromAreas(layersToFeatures, monitorfishMap.getLayers().getArray())
  }, [layersToFeatures])

  useEffect(() => {
    if (!showedLayers) {
      return
    }

    const olLayers = monitorfishMap.getLayers()
    // @ts-ignore
    const vectorLayersToAdd: Array<VectorImageLayer<Feature<Geometry>>> = dispatch(
      // @ts-ignore
      getRegulatoryLayersToAdd(olLayers.getArray(), showedLayers)
    )
    vectorLayersToAdd.forEach(vectorLayer => {
      olLayers.push(vectorLayer)
    })
    removeStaleRegulatoryLayers(showedLayers, olLayers)
  }, [dispatch, showedLayers])

  useEffect(() => {
    syncMetadataIsShowedProperty(regulatoryZoneMetadata, lastShowedFeatures)
  }, [lastShowedFeatures, regulatoryZoneMetadata])

  const throttledApplyZoomBasedSimplification = useThrottledCallback(
    () => applyZoomBasedSimplification(layersToFeatures, previousMapZoom),
    HALF_A_SECOND,
    { leading: false, trailing: true }
  )

  useEffect(() => {
    if (!layersToFeatures) {
      return
    }
    throttledApplyZoomBasedSimplification()
    // The `mapMovingAndZoomEvent` prop is used to refresh this effect
  }, [layersToFeatures, mapMovingAndZoomEvent, throttledApplyZoomBasedSimplification])

  return <></>
}

function applyZoomBasedSimplification(
  layersToFeatures: Record<string, any>[],
  previousMapZoom: MutableRefObject<string>
): void {
  const currentZoom = monitorfishMap.getView().getZoom()?.toFixed(2)
  if (!currentZoom || currentZoom === previousMapZoom.current) {
    return
  }
  // eslint-disable-next-line no-param-reassign
  previousMapZoom.current = currentZoom

  const useSimplified = shouldUseSimplifiedFeatures(currentZoom)
  monitorfishMap
    .getLayers()
    .getArray()
    .filter(isRegulatoryLayer)
    .forEach(layer => {
      const vectorSource = (layer as VectorImageLayer<Feature<Geometry>>).getSource()
      if (!vectorSource) {
        return
      }
      const layerToFeatures = layersToFeatures.find(ltf => ltf.name === layer.get('code'))
      if (!layerToFeatures) {
        return
      }
      const features = useSimplified
        ? (layerToFeatures.simplifiedFeatures ?? layerToFeatures.features)
        : layerToFeatures.features

      vectorSource.clear(true)
      vectorSource.addFeatures(vectorSource.getFormat()?.readFeatures(features) as Feature<Geometry>[])
    })
}

function syncMetadataIsShowedProperty(
  regulatoryZoneMetadata: RegulatoryZone | undefined,
  lastShowedFeatures: Record<string, any>[]
): void {
  const regulatoryLayers = monitorfishMap
    .getLayers()
    .getArray()
    .filter(layer => (layer.get('code') as string | undefined)?.includes(LayerProperties.REGULATORY.code))

  if (!regulatoryZoneMetadata) {
    removeMetadataIsShowedProperty(regulatoryLayers)

    return
  }

  const layerToAddProperty = regulatoryLayers.find(
    layer =>
      layer.get('code') ===
      `${LayerProperties.REGULATORY.code}:${regulatoryZoneMetadata.topic}:${regulatoryZoneMetadata.zone}`
  )

  if (layerToAddProperty) {
    addMetadataIsShowedProperty(lastShowedFeatures, layerToAddProperty)
  }
}

function sortRegulatoryLayersFromAreas(layersToFeatures, olLayers) {
  const sortedLayersToArea = [...layersToFeatures].sort((a, b) => a.area - b.area).reverse()

  sortedLayersToArea.forEach((layerAndArea, index) => {
    const foundLayer = olLayers.find(layer => layer?.get('code') === layerAndArea.name)

    if (foundLayer) {
      foundLayer.setZIndex(index + 1)
    }
  })
}

function shouldUseSimplifiedFeatures(currentZoom) {
  return currentZoom < SIMPLIFIED_FEATURE_ZOOM_LEVEL
}

function removeStaleRegulatoryLayers(showedLayers, olLayers) {
  const layersToRemove = olLayers
    .getArray()
    .filter(olLayer => isRegulatoryLayer(olLayer))
    .filter(olLayer => isLayerAbsentFromShowedLayers(showedLayers, olLayer))

  layersToRemove?.forEach(layerToRemove => {
    olLayers.remove(layerToRemove)
  })
}

function isLayerAbsentFromShowedLayers(showedLayers, olLayer) {
  return !showedLayers.some(showedLayer => getLayerNameNormalized(showedLayer) === olLayer.get('code'))
}

function isRegulatoryLayer(olLayer) {
  return (olLayer?.get('code') as string | undefined)?.includes(LayerProperties.REGULATORY.code)
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
