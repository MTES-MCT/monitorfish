import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { clearPreviousLineFeatures, getLabelsOfFeaturesInExtent } from './utils'
import { LayerProperties } from '../../../../../domain/entities/layers/constants'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { usePrevious } from '../../../../../hooks/usePrevious'
import { MissionLabelOverlay } from '../../../overlays/MissionUnitLabelOverlay'
import { useGetLineFeatureIdToCoordinates } from '../../hooks/useGetLineFeatureIdToCoordinates'
import { useIsZooming } from '../../hooks/useIsZooming'
import { getLabelLineStyle } from '../../styles/vesselLabelLine.style'

import type { VectorLayerWithName } from '../../../../../domain/types/layer'

export function MissionsLabelsLayer({ map, mapMovingAndZoomEvent }) {
  const { isAdmin } = useMainAppSelector(state => state.global)

  const [featuresAndLabels, setFeaturesAndLabels] = useState<
    {
      color: string
      coordinates: [number, number]
      featureId: string
      label: Record<string, any>
      offset: number[] | null
    }[]
  >([])
  const isZooming = useIsZooming(map, mapMovingAndZoomEvent)
  const previousFeaturesAndLabels = usePrevious(featuresAndLabels)

  const vectorSourceRef = useRef() as MutableRefObject<VectorSource>
  const layerRef = useRef() as MutableRefObject<VectorLayerWithName>
  const missionsLayerSourceRef = useRef() as MutableRefObject<VectorSource>

  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false
      })
    }

    return vectorSourceRef.current
  }, [])

  const { lineFeatureIdToCoordinates, moveVesselLabelLine } = useGetLineFeatureIdToCoordinates(getVectorSource())

  const getLayer = useCallback(() => {
    if (layerRef.current === undefined) {
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
    if (map) {
      getLayer().name = LayerProperties.MISSIONS_LABEL.code
      map.getLayers().push(getLayer())

      const missionsLayer = map
        .getLayers()
        .getArray()
        ?.find(olLayer => olLayer.name === LayerProperties.MISSION_PIN_POINT.code)
      missionsLayerSourceRef.current = missionsLayer?.getSource()
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [map, getLayer])

  const addLabelsToAllFeaturesInExtent = useDebouncedCallback(
    (_isAdmin, vectorSource, missionsLayerSource, extent, _lineFeatureIdToCoordinates, _previousFeaturesAndLabels) => {
      const nextFeaturesAndLabels = getLabelsOfFeaturesInExtent(
        _isAdmin,
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
    { leading: true }
  )

  useEffect(() => {
    if (!map) {
      return
    }

    addLabelsToAllFeaturesInExtent(
      isAdmin,
      getVectorSource(),
      missionsLayerSourceRef?.current,
      map.getView().calculateExtent(),
      lineFeatureIdToCoordinates,
      previousFeaturesAndLabels
    )
  }, [
    isAdmin,
    map,
    isZooming,
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
          map={map}
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
