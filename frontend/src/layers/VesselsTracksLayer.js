import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { extend } from 'ol/extent'
import { Vector } from 'ol/layer'
import VectorSource from 'ol/source/Vector'
import Layers from '../domain/entities/layers'
import { VesselTrack } from '../domain/entities/vesselTrack'
import { getCircleStyle } from './styles/vesselTrack.style'
import { animateToCoordinates } from '../domain/shared_slices/Map'
import { usePrevious } from '../hooks/usePrevious'
import {
  updateVesselTrackAsHidden,
  setVesselTrackExtent,
  updateVesselTrackAsShowed
} from '../domain/shared_slices/Vessel'
import {
  updateFishingActivitiesOnMapCoordinates
} from '../domain/shared_slices/FishingActivities'
import { getVesselFeatureIdFromVessel } from '../domain/entities/vessel'
import CloseVesselTrackOverlay from '../features/map/overlays/CloseVesselTrackOverlay'
import FishingActivityOverlay from '../features/map/overlays/FishingActivityOverlay'
import { setError } from '../domain/shared_slices/Global'
import { getFishingActivityFeatureOnTrackLine } from '../domain/entities/fishingActivities'

const VesselsTracksLayer = ({ map }) => {
  const {
    selectedVessel,
    highlightedVesselTrackPosition,
    vesselsTracksShowed
  } = useSelector(state => state.vessel)
  const {
    /** @type {FishingActivityShowedOnMap[]} fishingActivitiesShowedOnMap */
    fishingActivitiesShowedOnMap
  } = useSelector(state => state.fishingActivities)
  const previousHighlightedVesselTrackPosition = usePrevious(highlightedVesselTrackPosition)
  /** @type {FishingActivityShowedOnMap[]} previousFishingActivitiesShowedOnMap */
  const previousFishingActivitiesShowedOnMap = usePrevious(fishingActivitiesShowedOnMap)
  const previousSelectedVessel = usePrevious(selectedVessel)

  const {
    updatedFromCron
  } = useSelector(state => state.map)

  const dispatch = useDispatch()

  const [vectorSource] = useState(new VectorSource({
    features: []
  }))
  const [layer] = useState(new Vector({
    renderBuffer: 4,
    source: vectorSource,
    zIndex: Layers.VESSEL_TRACK.zIndex,
    updateWhileAnimating: true,
    updateWhileInteracting: true
  }))

  useEffect(() => {
    addLayerToMap()
  }, [map])

  useEffect(() => {
    showVesselTrack()
  }, [selectedVessel])

  useEffect(() => {
    hidePreviouslySelectedVessel()
  }, [previousSelectedVessel, selectedVessel])

  useEffect(() => {
    if (!Object.keys(vesselsTracksShowed)?.length) {
      return
    }

    const vesselTracks = Object.keys(vesselsTracksShowed)
      .map(identity => vesselsTracksShowed[identity])

    showVesselsTracks(vesselTracks)
    hideVesselsTracks(vesselTracks)
  }, [vesselsTracksShowed])

  useEffect(() => {
    if (highlightedVesselTrackPosition) {
      updateTrackCircleStyle(previousHighlightedVesselTrackPosition, null)
      updateTrackCircleStyle(highlightedVesselTrackPosition, 7)
    } else {
      updateTrackCircleStyle(previousHighlightedVesselTrackPosition, null)
    }
  }, [highlightedVesselTrackPosition, previousHighlightedVesselTrackPosition])

  useEffect(() => {
    showFishingActivities()
  }, [fishingActivitiesShowedOnMap])

  function showFishingActivities () {
    if (!fishingActivitiesShowedOnMap?.length) {
      removeFishingActivitiesFeatures()
      return
    }

    const noAddedOrRemovedFishingActivities = fishingActivitiesShowedOnMap?.length === previousFishingActivitiesShowedOnMap?.length
    if (noAddedOrRemovedFishingActivities) {
      return
    }

    const lines = getVesselTrackLines()
    let someMessagesCouldNotBeSeenOnTrack = false
    const coordinatesFeaturesAndIds = fishingActivitiesShowedOnMap.map(fishingActivity => {
      const fishingActivityDateTimestamp = new Date(fishingActivity.date).getTime()

      const lineOfFishingActivity = lines
        .find(line => fishingActivityIsWithinTrackLineDates(fishingActivityDateTimestamp, line))

      if (lineOfFishingActivity) {
        return getFishingActivityFeatureOnTrackLine(fishingActivity, lineOfFishingActivity, fishingActivityDateTimestamp)
      }

      someMessagesCouldNotBeSeenOnTrack = true
      return null
    }).filter(coordinatesFeaturesAndIds => coordinatesFeaturesAndIds)

    if (someMessagesCouldNotBeSeenOnTrack) {
      dispatch(setError(new Error('Certain messages n\'ont pas pu être placés sur la piste selectionnée. ' +
        'Changez la date des positions affichées pour voir tous les messages.')))
    }

    removeFishingActivitiesFeatures()
    vectorSource.addFeatures(coordinatesFeaturesAndIds.map(coordinatesFeatureAndId => coordinatesFeatureAndId.feature))
    vectorSource.changed()
    dispatch(updateFishingActivitiesOnMapCoordinates(coordinatesFeaturesAndIds))
    if (coordinatesFeaturesAndIds.length) {
      dispatch(animateToCoordinates(coordinatesFeaturesAndIds[coordinatesFeaturesAndIds.length - 1].coordinates))
    }
  }

  function fishingActivityIsWithinTrackLineDates (fishingActivityDateTimestamp, line) {
    return fishingActivityDateTimestamp > new Date(line.firstPositionDate).getTime() &&
      fishingActivityDateTimestamp < new Date(line.secondPositionDate).getTime()
  }

  function removeFishingActivitiesFeatures () {
    vectorSource
      .getFeatures()
      .filter(feature =>
        feature?.getId()?.toString()?.includes(Layers.VESSEL_TRACK.code) &&
        feature?.getId()?.toString()?.includes('ers'))
      .forEach(feature => vectorSource.removeFeature(feature))
  }

  function getVesselTrackLines () {
    return vectorSource.getFeatures()
      .filter(feature =>
        feature?.getId()?.toString()?.includes(Layers.VESSEL_TRACK.code) &&
        feature?.getId()?.toString()?.includes('line'))
  }

  function removeVesselTrackFeatures (identity) {
    vectorSource.getFeatures()
      .filter(feature => feature?.getId()?.toString()?.includes(identity))
      .map(feature => vectorSource.removeFeature(feature))
  }

  function hidePreviouslySelectedVessel () {
    if (previousSelectedVessel && !selectedVessel) {
      const vesselIdentity = getVesselFeatureIdFromVessel(previousSelectedVessel)
      removeVesselTrackFeatures(vesselIdentity)

      dispatch(updateVesselTrackAsHidden(vesselIdentity))
    }
  }

  function showVesselsTracks (vesselTracks) {
    vesselTracks
      .filter(positionsAndTrackDepth => positionsAndTrackDepth.toShow)
      .forEach(vesselTrack => {
        removeVesselTrackFeatures(vesselTrack.identity)

        const vesselTrackFeatures = new VesselTrack(vesselTrack.positions, vesselTrack.identity)
        vectorSource.addFeatures(vesselTrackFeatures.features)

        dispatch(updateVesselTrackAsShowed(vesselTrack.identity))
      })
  }

  function hideVesselsTracks (vesselTracks) {
    vesselTracks
      .filter(positionsAndTrackDepth => positionsAndTrackDepth.toHide)
      .forEach(vesselTrack => {
        removeVesselTrackFeatures(vesselTrack.identity)

        dispatch(updateVesselTrackAsHidden(vesselTrack.identity))
      })
  }

  function updateTrackCircleStyle (vesselTrackCircle, radius) {
    if (vesselTrackCircle) {
      const feature = vectorSource.getFeatures()
        .find(feature => feature.dateTime === vesselTrackCircle.dateTime)

      if (feature) {
        const featureColor = feature?.getStyle()[0].getImage()?.getFill()?.getColor()

        feature.setStyle(getCircleStyle(featureColor, radius))
      }
    }
  }

  function addLayerToMap () {
    if (map) {
      layer.name = Layers.VESSEL_TRACK.code
      map.getLayers().push(layer)
    }

    return () => {
      if (map) {
        map.removeLayer(layer)
      }
    }
  }

  function showVesselTrack () {
    if (map && selectedVessel?.positions?.length) {
      const identity = getVesselFeatureIdFromVessel(selectedVessel)
      const vesselTrack = new VesselTrack(selectedVessel.positions, identity)

      vectorSource.addFeatures(vesselTrack.features)
      const vesselTrackExtent = getVesselTrackExtent(vesselTrack, identity)

      dispatch(setVesselTrackExtent(vesselTrackExtent))
      if (!updatedFromCron && vesselTrack.lastPositionCoordinates) {
        dispatch(animateToCoordinates(vesselTrack.lastPositionCoordinates))
      }
    }
  }

  function getVesselTrackExtent (vesselTrack, identity) {
    let vesselTrackExtent = vesselTrack.features[0].getGeometry().getExtent().slice(0)

    vesselTrack.features
      .filter(feature => feature.getId().includes(identity))
      .forEach(feature => {
        vesselTrackExtent = extend(vesselTrackExtent, feature.getGeometry().getExtent())
      })

    return vesselTrackExtent
  }

  return (
    <>
      {
        Object.keys(vesselsTracksShowed)
          .map(identity => vesselsTracksShowed[identity])
          .filter(vesselTrack => !vesselTrack.toShow && !vesselTrack.toHide)
          .map(vesselTrack => {
            return <CloseVesselTrackOverlay
              key={vesselTrack.identity}
              identity={vesselTrack.identity}
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

export default VesselsTracksLayer
