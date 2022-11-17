import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react'

import { Layer } from '../domain/entities/layers/constants'
import { getFishingActivityFeatureOnTrackLine } from '../domain/entities/logbook'
import {
  fishingActivityIsWithinTrackLineDates,
  getFeaturesFromPositions,
  getVesselTrackExtent,
  getVesselTrackLines,
  removeFishingActivitiesFeatures,
  removeVesselTrackFeatures,
  updateTrackCircleStyle
} from '../domain/entities/vessel/track'
import { getVesselId } from '../domain/entities/vessel/vessel'
import {
  endRedrawFishingActivitiesOnMap,
  updateFishingActivitiesOnMapCoordinates
} from '../domain/shared_slices/FishingActivities'
import { animateToCoordinates } from '../domain/shared_slices/Map'
import {
  setVesselTrackExtent,
  updateVesselTrackAsHidden,
  updateVesselTrackAsShowedWithExtend
} from '../domain/shared_slices/Vessel'
import CloseVesselTrackOverlay from '../features/map/overlays/CloseVesselTrackOverlay'
import FishingActivityOverlay from '../features/map/overlays/FishingActivityOverlay'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { useAppSelector } from '../hooks/useAppSelector'
import { usePrevious } from '../hooks/usePrevious'

import type { FishingActivityShowedOnMap } from '../domain/entities/vessel/types'
import type { FishingActivityFeatureIdAndCoordinates } from '../domain/types/fishingActivities'
import type { VectorLayerWithName } from '../domain/types/layer'
import type { Coordinate } from 'ol/coordinate'

type VesselsTracksLayerProps = {
  map?: any
}
function VesselsTracksLayer({ map }: VesselsTracksLayerProps) {
  const dispatch = useAppDispatch()
  const { highlightedVesselTrackPosition, selectedVessel, selectedVesselPositions, vesselsTracksShowed } =
    useAppSelector(state => state.vessel)
  const { fishingActivitiesShowedOnMap, redrawFishingActivitiesOnMap } = useAppSelector(
    state => state.fishingActivities
  )
  const { doNotAnimate } = useAppSelector(state => state.map)

  const previousHighlightedVesselTrackPosition = usePrevious(highlightedVesselTrackPosition)
  const previousFishingActivitiesShowedOnMap: FishingActivityShowedOnMap[] | undefined =
    usePrevious(fishingActivitiesShowedOnMap)
  const previousSelectedVessel = usePrevious(selectedVessel)

  const fishingActivitiesShowedOnMapWithCoordinates = useMemo(
    () => fishingActivitiesShowedOnMap.filter(fishingActivity => fishingActivity.coordinates),
    [fishingActivitiesShowedOnMap]
  )

  const vesselsTracksShowedAndDefined = useMemo(
    () =>
      Object.keys(vesselsTracksShowed)
        .map(vesselId => vesselsTracksShowed[vesselId])
        // TODO Move these toShow and toHide properties in another state
        .filter(vesselTrack => !vesselTrack.toShow && !vesselTrack.toHide),
    [vesselsTracksShowed]
  )

  const vectorSourceRef = useRef() as MutableRefObject<VectorSource>
  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false
      })
    }

    return vectorSourceRef.current
  }, [])

  const layerRef = useRef() as MutableRefObject<VectorLayerWithName>
  const getLayer = useCallback(() => {
    if (layerRef.current === undefined) {
      layerRef.current = new Vector({
        renderBuffer: 4,
        source: getVectorSource(),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: Layer.VESSEL_TRACK.zIndex
      })
    }

    return layerRef.current
  }, [getVectorSource])

  useEffect(() => {
    if (map) {
      getLayer().name = Layer.VESSEL_TRACK.code
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [map, getLayer])

  useEffect(() => {
    function showSelectedVesselTrack() {
      if (map && selectedVessel && selectedVesselPositions?.length) {
        const features = getVectorSource().getFeatures()
        const vesselId = getVesselId(selectedVessel)
        removeVesselTrackFeatures(features, getVectorSource(), vesselId)

        const vesselTrackFeatures = getFeaturesFromPositions(selectedVesselPositions, vesselId)

        let lastPositionCoordinates: Coordinate | Coordinate[] | undefined
        if (vesselTrackFeatures[vesselTrackFeatures.length - 1]) {
          lastPositionCoordinates = vesselTrackFeatures[vesselTrackFeatures.length - 1]?.getGeometry()?.getCoordinates()
        }

        if (vesselTrackFeatures?.length) {
          getVectorSource().addFeatures(vesselTrackFeatures)
          const vesselTrackExtent = getVesselTrackExtent(vesselTrackFeatures, vesselId)

          dispatch(setVesselTrackExtent(vesselTrackExtent))
        }

        if (!doNotAnimate && lastPositionCoordinates) {
          dispatch(animateToCoordinates(lastPositionCoordinates))
        }
      }
    }

    showSelectedVesselTrack()
  }, [dispatch, doNotAnimate, map, selectedVessel, selectedVesselPositions, getVectorSource])

  useEffect(() => {
    function hidePreviouslySelectedVessel() {
      if (previousSelectedVessel && !selectedVessel) {
        const features = getVectorSource().getFeatures()
        const vesselIdentity = getVesselId(previousSelectedVessel)
        removeVesselTrackFeatures(features, getVectorSource(), vesselIdentity)

        dispatch(updateVesselTrackAsHidden(vesselIdentity))
      }
    }

    hidePreviouslySelectedVessel()
  }, [dispatch, previousSelectedVessel, selectedVessel, getVectorSource])

  useEffect(() => {
    if (!Object.keys(vesselsTracksShowed)?.length || !getVectorSource()) {
      return
    }

    function showVesselsTracks(showedFeatures, vesselTracks) {
      vesselTracks
        .filter(vesselTrack => vesselTrack.toShow)
        .forEach(vesselTrack => {
          removeVesselTrackFeatures(showedFeatures, getVectorSource(), vesselTrack.vesselId)

          const vesselTrackFeatures = getFeaturesFromPositions(vesselTrack.positions, vesselTrack.vesselId)
          if (vesselTrackFeatures.length) {
            getVectorSource().addFeatures(vesselTrackFeatures)
            const vesselTrackExtent = getVesselTrackExtent(vesselTrackFeatures, vesselTrack.vesselId)

            dispatch(
              updateVesselTrackAsShowedWithExtend({
                extent: vesselTrackExtent,
                vesselId: vesselTrack.vesselId
              })
            )
          }
        })
    }

    function hideVesselsTracks(showedFeatures, vesselTracks) {
      vesselTracks
        .filter(vesselTrack => vesselTrack.toHide)
        .forEach(vesselTrack => {
          removeVesselTrackFeatures(showedFeatures, getVectorSource(), vesselTrack.vesselId)

          dispatch(updateVesselTrackAsHidden(vesselTrack.vesselId))
        })
    }

    const vesselTracks = Object.keys(vesselsTracksShowed).map(vesselId => vesselsTracksShowed[vesselId])

    const features = getVectorSource().getFeatures()
    showVesselsTracks(features, vesselTracks)
    hideVesselsTracks(features, vesselTracks)
  }, [dispatch, vesselsTracksShowed, getVectorSource])

  useEffect(() => {
    const features = getVectorSource().getFeatures()
    if (highlightedVesselTrackPosition) {
      updateTrackCircleStyle(features, previousHighlightedVesselTrackPosition, null)
      updateTrackCircleStyle(features, highlightedVesselTrackPosition, 7)
    } else {
      updateTrackCircleStyle(features, previousHighlightedVesselTrackPosition, null)
    }
  }, [highlightedVesselTrackPosition, previousHighlightedVesselTrackPosition, getVectorSource])

  useEffect(() => {
    function showFishingActivities() {
      const features = getVectorSource().getFeatures()
      if (!fishingActivitiesShowedOnMap?.length) {
        removeFishingActivitiesFeatures(features, getVectorSource())

        return
      }

      const noAddedOrRemovedFishingActivities =
        fishingActivitiesShowedOnMap?.length === previousFishingActivitiesShowedOnMap?.length
      if (noAddedOrRemovedFishingActivities && !redrawFishingActivitiesOnMap) {
        return
      }
      dispatch(endRedrawFishingActivitiesOnMap())

      if (!selectedVesselPositions?.length) {
        return
      }

      const lines = getVesselTrackLines(features)
      const coordinatesFeaturesAndIds = fishingActivitiesShowedOnMap
        .map(fishingActivity => {
          const fishingActivityDateTimestamp = new Date(fishingActivity.date).getTime()

          const lineOfFishingActivity = lines.find(line =>
            fishingActivityIsWithinTrackLineDates(fishingActivityDateTimestamp, line)
          )

          if (lineOfFishingActivity) {
            return getFishingActivityFeatureOnTrackLine(
              fishingActivity,
              lineOfFishingActivity,
              fishingActivityDateTimestamp
            )
          }

          return null
        })
        .filter(
          (_coordinatesFeaturesAndIds): _coordinatesFeaturesAndIds is FishingActivityFeatureIdAndCoordinates =>
            _coordinatesFeaturesAndIds !== null
        )

      removeFishingActivitiesFeatures(features, getVectorSource())
      getVectorSource().addFeatures(
        coordinatesFeaturesAndIds.map(coordinatesFeatureAndId => coordinatesFeatureAndId.feature)
      )
      getVectorSource().changed()
      dispatch(updateFishingActivitiesOnMapCoordinates(coordinatesFeaturesAndIds))
    }

    showFishingActivities()
  }, [
    dispatch,
    previousFishingActivitiesShowedOnMap,
    fishingActivitiesShowedOnMap,
    selectedVesselPositions,
    redrawFishingActivitiesOnMap,
    getVectorSource
  ])

  return (
    <>
      {vesselsTracksShowedAndDefined.map(vesselTrack => (
        <CloseVesselTrackOverlay
          key={vesselTrack.vesselId}
          coordinates={vesselTrack.coordinates}
          map={map}
          vesselId={vesselTrack.vesselId}
        />
      ))}
      {fishingActivitiesShowedOnMapWithCoordinates.map(fishingActivity => (
        <FishingActivityOverlay
          key={fishingActivity.id}
          coordinates={fishingActivity.coordinates}
          id={fishingActivity.id}
          isDeleted={fishingActivity.isDeleted}
          isNotAcknowledged={fishingActivity.isNotAcknowledged}
          map={map}
          name={fishingActivity.name}
        />
      ))}
    </>
  )
}

export const VesselsTracksLayerMemoized = React.memo(VesselsTracksLayer)
