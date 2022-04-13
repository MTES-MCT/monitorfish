import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'

import { usePrevious } from '../hooks/usePrevious'
import Layers from '../domain/entities/layers'
import {
  fishingActivityIsWithinTrackLineDates,
  getVesselTrackExtent,
  getVesselTrackLines,
  removeFishingActivitiesFeatures,
  removeVesselTrackFeatures,
  updateTrackCircleStyle,
  VesselTrack
} from '../domain/entities/vesselTrack'
import { animateToCoordinates } from '../domain/shared_slices/Map'
import {
  setVesselTrackExtent,
  updateVesselTrackAsHidden,
  updateVesselTrackAsShowedWithExtend
} from '../domain/shared_slices/Vessel'
import {
  endRedrawFishingActivitiesOnMap,
  updateFishingActivitiesOnMapCoordinates
} from '../domain/shared_slices/FishingActivities'
import { getVesselId } from '../domain/entities/vessel'
import CloseVesselTrackOverlay from '../features/map/overlays/CloseVesselTrackOverlay'
import FishingActivityOverlay from '../features/map/overlays/FishingActivityOverlay'
import { getFishingActivityFeatureOnTrackLine } from '../domain/entities/logbook'

const VesselsTracksLayer = ({ map }) => {
  const dispatch = useDispatch()
  const {
    selectedVessel,
    selectedVesselPositions,
    highlightedVesselTrackPosition,
    vesselsTracksShowed
  } = useSelector(state => state.vessel)
  const {
    /** @type {FishingActivityShowedOnMap[]} fishingActivitiesShowedOnMap */
    fishingActivitiesShowedOnMap,
    redrawFishingActivitiesOnMap
  } = useSelector(state => state.fishingActivities)
  const previousHighlightedVesselTrackPosition = usePrevious(highlightedVesselTrackPosition)
  /** @type {FishingActivityShowedOnMap[]} previousFishingActivitiesShowedOnMap */
  const previousFishingActivitiesShowedOnMap = usePrevious(fishingActivitiesShowedOnMap)
  const previousSelectedVessel = usePrevious(selectedVessel)

  const {
    doNotAnimate
  } = useSelector(state => state.map)

  const vectorSourceRef = useRef(null)
  function getVectorSource () {
    if (vectorSourceRef.current === null) {
      vectorSourceRef.current = new VectorSource({
        features: [],
        wrapX: false
      })
    }
    return vectorSourceRef.current
  }

  const layerRef = useRef(null)
  function getLayer () {
    if (layerRef.current === null) {
      layerRef.current = new Vector({
        renderBuffer: 4,
        source: getVectorSource(),
        zIndex: Layers.VESSEL_TRACK.zIndex,
        updateWhileAnimating: true,
        updateWhileInteracting: true
      })
    }
    return layerRef.current
  }

  useEffect(() => {
    if (map) {
      getLayer().name = Layers.VESSEL_TRACK.code
      map.getLayers().push(getLayer())
    }

    return () => {
      if (map) {
        map.removeLayer(getLayer())
      }
    }
  }, [map])

  useEffect(() => {
    function showSelectedVesselTrack () {
      if (map && selectedVessel && selectedVesselPositions?.length) {
        const features = getVectorSource().getFeatures()
        const vesselId = getVesselId(selectedVessel)
        removeVesselTrackFeatures(features, getVectorSource(), vesselId)

        const vesselTrack = new VesselTrack(selectedVesselPositions, vesselId)

        if (vesselTrack.features?.length) {
          getVectorSource().addFeatures(vesselTrack.features)
          const vesselTrackExtent = getVesselTrackExtent(vesselTrack.features, vesselId)

          dispatch(setVesselTrackExtent(vesselTrackExtent))
        }

        if (!doNotAnimate && vesselTrack.lastPositionCoordinates) {
          dispatch(animateToCoordinates(vesselTrack.lastPositionCoordinates))
        }
      }
    }

    showSelectedVesselTrack()
  }, [selectedVessel, selectedVesselPositions])

  useEffect(() => {
    function hidePreviouslySelectedVessel () {
      if (previousSelectedVessel && !selectedVessel) {
        const features = getVectorSource().getFeatures()
        const vesselIdentity = getVesselId(previousSelectedVessel)
        removeVesselTrackFeatures(features, getVectorSource(), vesselIdentity)

        dispatch(updateVesselTrackAsHidden(vesselIdentity))
      }
    }

    hidePreviouslySelectedVessel()
  }, [previousSelectedVessel, selectedVessel])

  useEffect(() => {
    if (!Object.keys(vesselsTracksShowed)?.length || !getVectorSource()) {
      return
    }

    const features = getVectorSource().getFeatures()
    function showVesselsTracks (features, vesselTracks) {
      vesselTracks
        .filter(vesselTrack => vesselTrack.toShow)
        .forEach(vesselTrack => {
          removeVesselTrackFeatures(features, getVectorSource(), vesselTrack.vesselId)

          const vesselTrackFeatures = new VesselTrack(vesselTrack.positions, vesselTrack.vesselId)
          if (vesselTrackFeatures.features?.length) {
            getVectorSource().addFeatures(vesselTrackFeatures.features)
            const vesselTrackExtent = getVesselTrackExtent(vesselTrackFeatures.features, vesselTrack.vesselId)

            dispatch(updateVesselTrackAsShowedWithExtend({
              vesselId: vesselTrack.vesselId,
              extent: vesselTrackExtent
            }))
          }
        })
    }

    function hideVesselsTracks (features, vesselTracks) {
      vesselTracks
        .filter(vesselTrack => vesselTrack.toHide)
        .forEach(vesselTrack => {
          removeVesselTrackFeatures(features, getVectorSource(), vesselTrack.vesselId)

          dispatch(updateVesselTrackAsHidden(vesselTrack.vesselId))
        })
    }

    const vesselTracks = Object.keys(vesselsTracksShowed)
      .map(vesselId => vesselsTracksShowed[vesselId])

    showVesselsTracks(features, vesselTracks)
    hideVesselsTracks(features, vesselTracks)
  }, [vesselsTracksShowed])

  useEffect(() => {
    const features = getVectorSource().getFeatures()
    if (highlightedVesselTrackPosition) {
      updateTrackCircleStyle(features, previousHighlightedVesselTrackPosition, null)
      updateTrackCircleStyle(features, highlightedVesselTrackPosition, 7)
    } else {
      updateTrackCircleStyle(features, previousHighlightedVesselTrackPosition, null)
    }
  }, [highlightedVesselTrackPosition, previousHighlightedVesselTrackPosition])

  useEffect(() => {
    function showFishingActivities () {
      const features = getVectorSource().getFeatures()
      if (!fishingActivitiesShowedOnMap?.length) {
        removeFishingActivitiesFeatures(features, getVectorSource())
        return
      }

      const noAddedOrRemovedFishingActivities = fishingActivitiesShowedOnMap?.length === previousFishingActivitiesShowedOnMap?.length
      if (noAddedOrRemovedFishingActivities && !redrawFishingActivitiesOnMap) {
        return
      }
      dispatch(endRedrawFishingActivitiesOnMap())

      if (!selectedVesselPositions?.length) {
        return
      }

      const lines = getVesselTrackLines(features)
      const coordinatesFeaturesAndIds = fishingActivitiesShowedOnMap.map(fishingActivity => {
        const fishingActivityDateTimestamp = new Date(fishingActivity.date).getTime()

        const lineOfFishingActivity = lines
          .find(line => fishingActivityIsWithinTrackLineDates(fishingActivityDateTimestamp, line))

        if (lineOfFishingActivity) {
          return getFishingActivityFeatureOnTrackLine(fishingActivity, lineOfFishingActivity, fishingActivityDateTimestamp)
        }
        return null
      }).filter(coordinatesFeaturesAndIds => coordinatesFeaturesAndIds)

      removeFishingActivitiesFeatures(features, getVectorSource())
      getVectorSource().addFeatures(coordinatesFeaturesAndIds.map(coordinatesFeatureAndId => coordinatesFeatureAndId.feature))
      getVectorSource().changed()
      dispatch(updateFishingActivitiesOnMapCoordinates(coordinatesFeaturesAndIds))
    }

    showFishingActivities()
  }, [fishingActivitiesShowedOnMap, selectedVesselPositions, redrawFishingActivitiesOnMap])

  return (
    <>
      {
        Object.keys(vesselsTracksShowed)
          .map(vesselId => vesselsTracksShowed[vesselId])
          .filter(vesselTrack => !vesselTrack.toShow && !vesselTrack.toHide)
          .map(vesselTrack => {
            return <CloseVesselTrackOverlay
              key={vesselTrack.vesselId}
              vesselId={vesselTrack.vesselId}
              map={map}
              coordinates={vesselTrack.coordinates}
            />
          })
      }
      {
        fishingActivitiesShowedOnMap
          .filter(fishingActivity => fishingActivity.coordinates)
          .map(fishingActivity => {
            return <FishingActivityOverlay
              key={fishingActivity.id}
              id={fishingActivity.id}
              map={map}
              name={fishingActivity.name}
              coordinates={fishingActivity.coordinates}
              isDeleted={fishingActivity.isDeleted}
              isNotAcknowledged={fishingActivity.isNotAcknowledged}
            />
          })
      }
    </>
  )
}

export default React.memo(VesselsTracksLayer)
