import { LogbookMessageOverlay } from '@features/Logbook/overlays/LogbookMessageOverlay'
import { useMapLayer } from '@features/Map/hooks/useMapLayer'
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
import { hideVesselTrack } from '@features/Vessel/useCases/hideVesselTrack'
import { getVesselCompositeIdentifier } from '@features/Vessel/utils'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { usePrevious } from '@mtes-mct/monitor-ui'
import { memo, useEffect, useMemo } from 'react'

import { resetAnimateToCoordinates, resetAnimateToExtent } from '../../../Map/slice'
import { animateToVesselCoordinates, fitMapToVesselTrack } from '../../../Map/useCases/animateMap'
import { CloseVesselTrackOverlay } from '../../components/CloseVesselTrackOverlay'
import {
  setVesselTrackExtent,
  updateVesselTrackAsHidden,
  updateVesselTrackAsShowedWithExtend,
  updateVesselTrackAsZoomed
} from '../../slice'

import type { Coordinate } from 'ol/coordinate'

function VesselsTracksLayer() {
  const dispatch = useMainAppDispatch()
  const highlightedVesselTrackPosition = useMainAppSelector(state => state.vessel.highlightedVesselTrackPosition)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const selectedVesselPositions = useMainAppSelector(state => state.vessel.selectedVesselPositions)
  const vesselsTracksShowed = useMainAppSelector(state => state.vessel.vesselsTracksShowed)
  const displayedLogbookOverlays = useMainAppSelector(state => state.fishingActivities.displayedLogbookOverlays)
  const animateToCoordinates = useMainAppSelector(state => state.map.animateToCoordinates)
  const animateToExtent = useMainAppSelector(state => state.map.animateToExtent)
  const vesselSidebarIsOpen = useMainAppSelector(state => state.vessel.vesselSidebarIsOpen)

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

  useMapLayer(VESSEL_TRACK_VECTOR_LAYER)

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
          const extent = getVesselTrackExtent(vesselTrackFeatures, vesselCompositeIdentifier)

          dispatch(setVesselTrackExtent(extent))

          if (animateToExtent) {
            fitMapToVesselTrack(extent)
            dispatch(resetAnimateToExtent())
          } else if (animateToCoordinates && lastPositionCoordinates) {
            animateToVesselCoordinates(lastPositionCoordinates as [number, number], vesselSidebarIsOpen)
            dispatch(resetAnimateToCoordinates())
          }
        }
      }
    }

    showSelectedVesselTrack()
  }, [dispatch, animateToCoordinates, animateToExtent, selectedVessel, selectedVesselPositions, vesselSidebarIsOpen])

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

  useEffect(() => {
    Object.entries(vesselsTracksShowed)
      .filter(([, track]) => track?.toZoom && track?.extent && !track?.toShow)
      .forEach(([vesselCompositeIdentifier, track]) => {
        fitMapToVesselTrack(track.extent!, () => dispatch(updateVesselTrackAsZoomed(vesselCompositeIdentifier)))
      })
  }, [dispatch, vesselsTracksShowed])

  return (
    <>
      {vesselsTracksShowedAndDefined.map(vesselTrack => (
        <CloseVesselTrackOverlay
          key={vesselTrack?.vesselCompositeIdentifier}
          coordinates={vesselTrack?.coordinates}
          onClose={() => dispatch(hideVesselTrack(vesselTrack!.vesselCompositeIdentifier))}
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
