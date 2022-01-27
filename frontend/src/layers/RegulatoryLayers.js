import { useEffect, useRef } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import LayersEnum from '../domain/entities/layers'
import { showSimplifiedGeometries, showWholeGeometries } from '../domain/shared_slices/Regulatory'
import {
  addMetadataIsShowedProperty,
  addRegulatoryLayersToMap,
  featuresAreAlreadyDrawWithTheSameTolerance,
  getShowSimplifiedFeatures,
  removeMetadataIsShowedProperty,
  removeRegulatoryLayersToMap,
  sortRegulatoryLayersFromAreas
} from '../domain/entities/regulatory'

export const metadataIsShowedPropertyName = 'metadataIsShowed'
export const SIMPLIFIED_FEATURE_ZOOM_LEVEL = 9.5

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
      sortRegulatoryLayersFromAreas(layersToFeatures, map.getLayers().getArray())
    }
  }, [map, layersToFeatures])

  useEffect(() => {
    if (map && showedLayers) {
      const olLayers = map.getLayers()
      addRegulatoryLayersToMap(dispatch, getState, olLayers, showedLayers)
      removeRegulatoryLayersToMap(showedLayers, olLayers)
    }
  }, [showedLayers])

  useEffect(() => {
    function addOrRemoveMetadataIsShowedPropertyToShowedRegulatoryLayers () {
      if (map) {
        const regulatoryLayers = map.getLayers().getArray().filter(layer => layer?.name?.includes(LayersEnum.REGULATORY.code))
        if (regulatoryZoneMetadata) {
          const layerToAddProperty = regulatoryLayers.find(layer => {
            return layer?.name === `${LayersEnum.REGULATORY.code}:${regulatoryZoneMetadata.topic}:${regulatoryZoneMetadata.zone}`
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

        const regulatoryLayers = map.getLayers().getArray().filter(layer => layer?.name?.includes(LayersEnum.REGULATORY.code))
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
  }, [map, mapMovingAndZoomEvent, layersToFeatures])

  return null
}

export default RegulatoryLayers
