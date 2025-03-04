import { LogbookMessageOverlay } from '@features/Logbook/overlays/LogbookMessageOverlay'
import CloseVesselTrackOverlay from '@features/Map/components/CloseVesselTrackOverlay'
import { monitorfishMap } from '@features/Map/monitorfishMap'
import {
  VESSEL_TRACK_VECTOR_LAYER,
  VESSEL_TRACK_VECTOR_SOURCE
} from '@features/Vessel/layers/VesselsTracksLayer/constants'
import {
  getFeaturesFromPositions,
  getVesselTrackExtent,
  removeVesselTrackFeatures,
  updateTrackCircleStyle
} from '@features/Vessel/types/track'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { usePrevious } from '@mtes-mct/monitor-ui'
import { memo, useEffect, useMemo } from 'react'

import { animateToCoordinates } from '../../../Map/slice'
import { setVesselTrackExtent, updateVesselTrackAsHidden, updateVesselTrackAsShowedWithExtend } from '../../slice'

import type { Coordinate } from 'ol/coordinate'

function VesselsTracksLayer() {
  const dispatch = useMainAppDispatch()
  const highlightedVesselTrackPosition = useMainAppSelector(state => state.vessel.highlightedVesselTrackPosition)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const displayedLogbookOverlays = useMainAppSelector(state => state.fishingActivities.displayedLogbookOverlays)
  const doNotAnimate = useMainAppSelector(state => state.map.doNotAnimate)

  const previousHighlightedVesselTrackPosition = usePrevious(highlightedVesselTrackPosition)
  const previousSelectedVessel = usePrevious(selectedVessel)

  const vesselsTracksShowedAndDefined = useMemo(
    () =>
      Object.keys(vesselsTracksShowed)
        .map(vesselCompositeIdentifier => vesselsTracksShowed[vesselCompositeIdentifier])
        // TODO Move these toShow and toHide properties in another state
        .filter(vesselTrack => !vesselTrack?.toShow && !vesselTrack?.toHide),
    [vesselsTracksShowed]
  )

  useEffect(() => {
    monitorfishMap.getLayers().push(VESSEL_TRACK_VECTOR_LAYER)

    return () => {
      monitorfishMap.removeLayer(VESSEL_TRACK_VECTOR_LAYER)
    }
  }, [])

  useEffect(() => {
    function showSelectedVesselTrack() {
      if (selectedVessel && selectedVesselPositions?.length) {
        const features = VESSEL_TRACK_VECTOR_SOURCE.getFeatures()
        const vesselCompositeIdentifier = getVesselCompositeIdentifier(selectedVessel)
        removeVesselTrackFeatures(features, VESSEL_TRACK_VECTOR_SOURCE, vesselCompositeIdentifier)

        const vesselTrackFeatures = getFeaturesFromPositions(selectedVesselPositions, vesselCompositeIdentifier)

        let lastPositionCoordinates: Coordinate | Coordinate[] | undefined
        if (vesselTrackFeatures[vesselTrackFeatures.length - 1]) {
          lastPositionCoordinates = vesselTrackFeatures[vesselTrackFeatures.length - 1]?.getGeometry()?.getCoordinates()
        }

        if (vesselTrackFeatures?.length) {
          VESSEL_TRACK_VECTOR_SOURCE.addFeatures(vesselTrackFeatures)
          const vesselTrackExtent = getVesselTrackExtent(vesselTrackFeatures, vesselCompositeIdentifier)

          dispatch(setVesselTrackExtent(vesselTrackExtent))
        }

        if (!doNotAnimate && lastPositionCoordinates) {
          dispatch(animateToCoordinates(lastPositionCoordinates))
        }
      }
    }

    showSelectedVesselTrack()
  }, [dispatch, doNotAnimate, selectedVessel, selectedVesselPositions])

  useEffect(() => {
    function hidePreviouslySelectedVessel() {
      if (previousSelectedVessel && !selectedVessel) {
        const features = VESSEL_TRACK_VECTOR_SOURCE.getFeatures()
        const vesselCompositeIdentifier = getVesselCompositeIdentifier(previousSelectedVessel)
        removeVesselTrackFeatures(features, VESSEL_TRACK_VECTOR_SOURCE, vesselCompositeIdentifier)

        dispatch(updateVesselTrackAsHidden(vesselCompositeIdentifier))
      }
    }

    hidePreviouslySelectedVessel()
  }, [dispatch, previousSelectedVessel, selectedVessel])

  useEffect(() => {
    if (!Object.keys(vesselsTracksShowed)?.length || !VESSEL_TRACK_VECTOR_SOURCE) {
      return
    }

    function showVesselsTracks(showedFeatures, vesselTracks) {
      vesselTracks
        .filter(vesselTrack => vesselTrack.toShow)
        .forEach(vesselTrack => {
          removeVesselTrackFeatures(showedFeatures, VESSEL_TRACK_VECTOR_SOURCE, vesselTrack.vesselCompositeIdentifier)

          const vesselTrackFeatures = getFeaturesFromPositions(
            vesselTrack.positions,
            vesselTrack.vesselCompositeIdentifier
          )
          if (vesselTrackFeatures.length) {
            VESSEL_TRACK_VECTOR_SOURCE.addFeatures(vesselTrackFeatures)
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
          removeVesselTrackFeatures(showedFeatures, VESSEL_TRACK_VECTOR_SOURCE, vesselTrack.vesselCompositeIdentifier)

          dispatch(updateVesselTrackAsHidden(vesselTrack.vesselCompositeIdentifier))
        })
    }

    const vesselTracks = Object.keys(vesselsTracksShowed).map(
      vesselCompositeIdentifier => vesselsTracksShowed[vesselCompositeIdentifier]
    )

    const features = VESSEL_TRACK_VECTOR_SOURCE.getFeatures()
    showVesselsTracks(features, vesselTracks)
    hideVesselsTracks(features, vesselTracks)
  }, [dispatch, vesselsTracksShowed])

  useEffect(() => {
    const features = VESSEL_TRACK_VECTOR_SOURCE.getFeatures()
    if (highlightedVesselTrackPosition) {
      updateTrackCircleStyle(features, previousHighlightedVesselTrackPosition, null)
      updateTrackCircleStyle(features, highlightedVesselTrackPosition, 7)
    } else {
      updateTrackCircleStyle(features, previousHighlightedVesselTrackPosition, null)
    }
  }, [highlightedVesselTrackPosition, previousHighlightedVesselTrackPosition])

  return (
    <>
      {vesselsTracksShowedAndDefined.map(vesselTrack => (
        <CloseVesselTrackOverlay
          key={vesselTrack?.vesselCompositeIdentifier}
          coordinates={vesselTrack?.coordinates}
          vesselCompositeIdentifier={vesselTrack?.vesselCompositeIdentifier}
        />
      ))}
      {displayedLogbookOverlays.map(logbookOverlay => (
        <LogbookMessageOverlay key={logbookOverlay.id} logbookOverlay={logbookOverlay} />
      ))}
      <div /> {/* returns at least a div */}
    </>
  )
}

export const VesselsTracksLayerMemoized = memo(VesselsTracksLayer)
