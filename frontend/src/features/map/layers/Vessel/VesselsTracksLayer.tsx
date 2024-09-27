import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { usePrevious } from '@mtes-mct/monitor-ui'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'

import { LayerProperties } from '../../../../domain/entities/layers/constants'
import {
  fishingActivityIsWithinTrackLineDates,
  getFeaturesFromPositions,
  getVesselTrackExtent,
  getVesselTrackLines,
  removeFishingActivitiesFeatures,
  removeVesselTrackFeatures,
  updateTrackCircleStyle
} from '../../../../domain/entities/vessel/track'
import { getVesselCompositeIdentifier } from '../../../../domain/entities/vessel/vessel'
import { animateToCoordinates } from '../../../../domain/shared_slices/Map'
import {
  setVesselTrackExtent,
  updateVesselTrackAsHidden,
  updateVesselTrackAsShowedWithExtend
} from '../../../../domain/shared_slices/Vessel'
import { logbookActions } from '../../../Logbook/slice'
import { getFishingActivityFeatureOnTrackLine } from '../../../Logbook/utils'
import { monitorfishMap } from '../../monitorfishMap'
import CloseVesselTrackOverlay from '../../overlays/CloseVesselTrackOverlay'
import FishingActivityOverlay from '../../overlays/FishingActivityOverlay'

import type { FishingActivityShowedOnMap } from '../../../../domain/entities/vessel/types'
import type { VectorLayerWithName } from '../../../../domain/types/layer'
import type { FishingActivityFeatureIdAndCoordinates } from '../../../Logbook/types'
import type { Feature } from 'ol'
import type { Coordinate } from 'ol/coordinate'
import type { Geometry } from 'ol/geom'

function VesselsTracksLayer() {
  const dispatch = useMainAppDispatch()
  const highlightedVesselTrackPosition = useMainAppSelector(state => state.vessel.highlightedVesselTrackPosition)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const fishingActivitiesShowedOnMap = useMainAppSelector(state => state.fishingActivities.fishingActivitiesShowedOnMap)
  const redrawFishingActivitiesOnMap = useMainAppSelector(state => state.fishingActivities.redrawFishingActivitiesOnMap)
  const doNotAnimate = useMainAppSelector(state => state.map.doNotAnimate)

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
        .map(vesselCompositeIdentifier => vesselsTracksShowed[vesselCompositeIdentifier])
        // TODO Move these toShow and toHide properties in another state
        .filter(vesselTrack => !vesselTrack?.toShow && !vesselTrack?.toHide),
    [vesselsTracksShowed]
  )

  const vectorSourceRef = useRef<VectorSource>()
  const getVectorSource = useCallback(() => {
    if (vectorSourceRef.current === undefined) {
      vectorSourceRef.current = new VectorSource<Feature<Geometry>>({
        features: [],
        wrapX: false
      })
    }

    return vectorSourceRef.current as VectorSource
  }, [])

  const layerRef = useRef<VectorLayerWithName>()
  const getLayer = useCallback(() => {
    if (layerRef.current === undefined) {
      layerRef.current = new Vector({
        renderBuffer: 4,
        source: getVectorSource(),
        updateWhileAnimating: true,
        updateWhileInteracting: true,
        zIndex: LayerProperties.VESSEL_TRACK.zIndex
      })
    }

    return layerRef.current as VectorLayerWithName
  }, [getVectorSource])

  useEffect(() => {
    getLayer().name = LayerProperties.VESSEL_TRACK.code
    monitorfishMap.getLayers().push(getLayer())

    return () => {
      monitorfishMap.removeLayer(getLayer())
    }
  }, [getLayer])

  useEffect(() => {
    function showSelectedVesselTrack() {
      if (selectedVessel && selectedVesselPositions?.length) {
        const features = getVectorSource().getFeatures()
        const vesselCompositeIdentifier = getVesselCompositeIdentifier(selectedVessel)
        removeVesselTrackFeatures(features, getVectorSource(), vesselCompositeIdentifier)

        const vesselTrackFeatures = getFeaturesFromPositions(selectedVesselPositions, vesselCompositeIdentifier)

        let lastPositionCoordinates: Coordinate | Coordinate[] | undefined
        if (vesselTrackFeatures[vesselTrackFeatures.length - 1]) {
          lastPositionCoordinates = vesselTrackFeatures[vesselTrackFeatures.length - 1]?.getGeometry()?.getCoordinates()
        }

        if (vesselTrackFeatures?.length) {
          getVectorSource().addFeatures(vesselTrackFeatures)
          const vesselTrackExtent = getVesselTrackExtent(vesselTrackFeatures, vesselCompositeIdentifier)

          dispatch(setVesselTrackExtent(vesselTrackExtent))
        }

        if (!doNotAnimate && lastPositionCoordinates) {
          dispatch(animateToCoordinates(lastPositionCoordinates))
        }
      }
    }

    showSelectedVesselTrack()
  }, [dispatch, doNotAnimate, selectedVessel, selectedVesselPositions, getVectorSource])

  useEffect(() => {
    function hidePreviouslySelectedVessel() {
      if (previousSelectedVessel && !selectedVessel) {
        const features = getVectorSource().getFeatures()
        const vesselCompositeIdentifier = getVesselCompositeIdentifier(previousSelectedVessel)
        removeVesselTrackFeatures(features, getVectorSource(), vesselCompositeIdentifier)

        dispatch(updateVesselTrackAsHidden(vesselCompositeIdentifier))
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
          removeVesselTrackFeatures(showedFeatures, getVectorSource(), vesselTrack.vesselCompositeIdentifier)

          const vesselTrackFeatures = getFeaturesFromPositions(
            vesselTrack.positions,
            vesselTrack.vesselCompositeIdentifier
          )
          if (vesselTrackFeatures.length) {
            getVectorSource().addFeatures(vesselTrackFeatures)
            const vesselTrackExtent = getVesselTrackExtent(vesselTrackFeatures, vesselTrack.vesselCompositeIdentifier)

            dispatch(
              updateVesselTrackAsShowedWithExtend({
                extent: vesselTrackExtent,
                vesselCompositeIdentifier: vesselTrack.vesselCompositeIdentifier
              })
            )
          }
        })
    }

    function hideVesselsTracks(showedFeatures, vesselTracks) {
      vesselTracks
        .filter(vesselTrack => vesselTrack.toHide)
        .forEach(vesselTrack => {
          removeVesselTrackFeatures(showedFeatures, getVectorSource(), vesselTrack.vesselCompositeIdentifier)

          dispatch(updateVesselTrackAsHidden(vesselTrack.vesselCompositeIdentifier))
        })
    }

    const vesselTracks = Object.keys(vesselsTracksShowed).map(
      vesselCompositeIdentifier => vesselsTracksShowed[vesselCompositeIdentifier]
    )

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
      dispatch(logbookActions.endRedrawOnMap())

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
      dispatch(
        logbookActions.updateShowedOnMapCoordinates(
          coordinatesFeaturesAndIds.map(coordinatesFeatureAndId => ({
            coordinates: coordinatesFeatureAndId.coordinates,
            id: coordinatesFeatureAndId.id
          }))
        )
      )
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
          key={vesselTrack?.vesselCompositeIdentifier}
          coordinates={vesselTrack?.coordinates}
          vesselCompositeIdentifier={vesselTrack?.vesselCompositeIdentifier}
        />
      ))}
      {fishingActivitiesShowedOnMapWithCoordinates.map(fishingActivity => (
        <FishingActivityOverlay
          key={fishingActivity.id}
          coordinates={fishingActivity.coordinates}
          id={fishingActivity.id}
          isDeleted={fishingActivity.isDeleted}
          isNotAcknowledged={fishingActivity.isNotAcknowledged}
          name={fishingActivity.name}
        />
      ))}
      <div /> {/* returns at least a div */}
    </>
  )
}

export const VesselsTracksLayerMemoized = memo(VesselsTracksLayer)
