import { HALF_A_SECOND } from '@constants/index'
import { useHybridAppDispatch } from '@hooks/useHybridAppDispatch'
import { Feature } from 'ol'
import { Geometry } from 'ol/geom'
import { useEffect, useRef } from 'react'

import { LayerProperties } from '../../MainMap/constants'
import { getLayerNameNormalized } from '../../MainMap/utils'
import { monitorfishMap } from '../../map/monitorfishMap'
import { regulationActions } from '../slice'
import { getRegulatoryLayersToAdd } from '../useCases/getRegulatoryLayersToAdd'

import type { RegulatoryZone } from '../types'
import type { MainMap } from '@features/MainMap/MainMap.types'
import type VectorImageLayer from 'ol/layer/VectorImage'

export const METADATA_IS_SHOWED = 'metadataIsShowed'
const SIMPLIFIED_FEATURE_ZOOM_LEVEL = 9.5

export type RegulatoryLayersProps = Readonly<{
  lastShowedFeatures: Record<string, any>[]
  layersToFeatures: Record<string, any>[]
  mapMovingAndZoomEvent?: any
  regulatoryZoneMetadata: RegulatoryZone | undefined
  showedLayers: MainMap.ShowedLayer[]
  simplifiedGeometries: boolean
}>
export function RegulatoryLayers({
  lastShowedFeatures,
  layersToFeatures,
  mapMovingAndZoomEvent,
  regulatoryZoneMetadata,
  showedLayers,
  simplifiedGeometries
}: RegulatoryLayersProps) {
  const isThrottled = useRef(false)
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
    removeRegulatoryLayersToMap(showedLayers, olLayers)
  }, [dispatch, showedLayers])

  useEffect(() => {
    function addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers() {
      const regulatoryLayers = monitorfishMap
        .getLayers()
        .getArray()
        .filter(layer => (layer as MainMap.VectorLayerWithName)?.name?.includes(LayerProperties.REGULATORY.code))

      if (!regulatoryZoneMetadata) {
        removeMetadataIsShowedProperty(regulatoryLayers)

        return
      }

      const layerToAddProperty = regulatoryLayers.find(
        layer =>
          (layer as MainMap.VectorLayerWithName)?.name ===
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
          .filter(layer => (layer as MainMap.VectorLayerWithName)?.name?.includes(LayerProperties.REGULATORY.code))
        regulatoryLayers.forEach(layer => {
          const vectorSource = (layer as MainMap.VectorLayerWithName).getSource()

          if (vectorSource) {
            const layerToFeatures = layersToFeatures?.find(
              layerToFeature => layerToFeature.name === (layer as MainMap.VectorLayerWithName)?.name
            )
            if (layerToFeatures) {
              const features = showSimplifiedFeatures
                ? layerToFeatures.simplifiedFeatures || layerToFeatures.features
                : layerToFeatures.features

              vectorSource.clear(true)
              vectorSource.addFeatures(vectorSource.getFormat()?.readFeatures(features) as Feature<Geometry>[])
            }
          }
        })

        if (showSimplifiedFeatures) {
          dispatch(regulationActions.showSimplifiedGeometries())
        } else {
          dispatch(regulationActions.showWholeGeometries())
        }
      }
    }

    isThrottled.current = true
    setTimeout(() => {
      showSimplifiedOrWholeFeatures()
      isThrottled.current = false
    }, HALF_A_SECOND)
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
