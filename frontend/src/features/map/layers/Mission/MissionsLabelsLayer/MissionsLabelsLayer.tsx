import { usePrevious } from '@mtes-mct/monitor-ui'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { clearPreviousLineFeatures, getLabelsOfFeaturesInExtent } from './utils'
import { LayerProperties } from '../../../../../domain/entities/layers/constants'
import { useIsSuperUser } from '../../../../../hooks/authorization/useIsSuperUser'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { monitorfishMap } from '../../../monitorfishMap'
import { MissionLabelOverlay } from '../../../overlays/MissionUnitLabelOverlay'
import { useGetLineFeatureIdToCoordinates } from '../../hooks/useGetLineFeatureIdToCoordinates'
import { useIsZooming } from '../../hooks/useIsZooming'
import { getLabelLineStyle } from '../../styles/labelLine.style'

import type { VectorLayerWithName } from '../../../../../domain/types/layer'

const MIN_ZOOM = 7

export function MissionsLabelsLayer({ mapMovingAndZoomEvent }) {
  const isSuperUser = useIsSuperUser()
  const isMissionsLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isMissionsLayerDisplayed)
  const [featuresAndLabels, setFeaturesAndLabels] = useState<
    {
      color: string
      coordinates: [number, number]
      featureId: string
      label: Record<string, any>
      offset: number[] | null
    }[]
  >([])
  const isZooming = useIsZooming(monitorfishMap, mapMovingAndZoomEvent)
  const previousFeaturesAndLabels = usePrevious(featuresAndLabels)
  const currentZoom = Number(monitorfishMap.getView()?.getZoom()?.toFixed(2))

  const vectorSourceRef = useRef<VectorSource>()
  const layerRef = useRef<VectorLayerWithName>()

  const getVectorSource = useCallback(() => {
    if (!vectorSourceRef.current) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false
      })
    }

    return vectorSourceRef.current
  }, [])

  const { lineFeatureIdToCoordinates, moveVesselLabelLine } = useGetLineFeatureIdToCoordinates(getVectorSource())

  const getLayer = useCallback(() => {
    if (!layerRef.current) {
      layerRef.current = new Vector({
        renderBuffer: 7,
        source: getVectorSource(),
        style: getLabelLineStyle,
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.MISSIONS_LABEL.zIndex
      })
    }

    return layerRef.current
  }, [getVectorSource])

  useEffect(() => {
    getLayer().name = LayerProperties.MISSIONS_LABEL.code
    monitorfishMap.getLayers().push(getLayer())

    return () => {
      monitorfishMap.removeLayer(getLayer())
    }
  }, [getLayer])

  useEffect(() => {
    if (currentZoom < MIN_ZOOM) {
      getVectorSource().forEachFeature(feature => {
        feature.set('isHiddenByZoom', true)
      })
    } else {
      getVectorSource().forEachFeature(feature => {
        feature.set('isHiddenByZoom', false)
      })
    }
  }, [isZooming, currentZoom, getVectorSource])

  const addLabelsToAllFeaturesInExtent = useDebouncedCallback(
    (isHidden, vectorSource, missionsLayerSource, extent, _lineFeatureIdToCoordinates, _previousFeaturesAndLabels) => {
      const nextFeaturesAndLabels = getLabelsOfFeaturesInExtent(
        isHidden,
        vectorSource,
        missionsLayerSource,
        extent,
        _lineFeatureIdToCoordinates
      )
      if (!nextFeaturesAndLabels.length) {
        setFeaturesAndLabels([])
        getVectorSource().clear()

        return
      }

      setFeaturesAndLabels(nextFeaturesAndLabels)

      clearPreviousLineFeatures(_previousFeaturesAndLabels, featuresAndLabels, getVectorSource())
    },
    250,
    { leading: true, maxWait: 250 }
  )

  useEffect(() => {
    const missionsLayer = monitorfishMap
      .getLayers()
      .getArray()
      ?.find(olLayer => (olLayer as VectorLayerWithName).name === LayerProperties.MISSION_PIN_POINT.code)
    const missionsLayerSource = (missionsLayer as VectorLayerWithName)?.getSource()

    const isHidden = !isSuperUser || !isMissionsLayerDisplayed || !missionsLayerSource || currentZoom < MIN_ZOOM
    addLabelsToAllFeaturesInExtent(
      isHidden,
      getVectorSource(),
      missionsLayerSource,
      monitorfishMap.getView().calculateExtent(),
      lineFeatureIdToCoordinates,
      previousFeaturesAndLabels
    )
  }, [
    isSuperUser,
    isMissionsLayerDisplayed,
    isZooming,
    currentZoom,
    lineFeatureIdToCoordinates,
    getVectorSource,
    previousFeaturesAndLabels,
    addLabelsToAllFeaturesInExtent
  ])

  return (
    <>
      {featuresAndLabels.map(({ color, coordinates, featureId, label, offset }) => (
        <MissionLabelOverlay
          key={featureId}
          color={color}
          coordinates={coordinates}
          featureId={featureId}
          moveLine={moveVesselLabelLine}
          offset={offset}
          text={label}
          zoomHasChanged={isZooming}
        />
      ))}
      <div /> {/* returns at least a div */}
    </>
  )
}
