import { Overlay } from 'ol'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { monitorfishMap } from '../../../map/monitorfishMap'
import { useGetStationsQuery } from '../../stationApi'
import { StationCard } from '../StationCard'

export function SelectedStationOverlay() {
  const selectionDialogElementRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<Overlay | undefined>(undefined)
  const overlayEntityIdRef = useRef<number | undefined>(undefined)

  const selectedStationId = useMainAppSelector(state => state.station.selectedStationId)
  const selectedStationOverlayPosition = useMainAppSelector(state => state.station.selectedStationOverlayPosition)

  const { data: stations } = useGetStationsQuery()

  const selectedStation = useMemo(
    () => (selectedStationId ? stations?.find(station => station.id === selectedStationId) : undefined),
    [stations, selectedStationId]
  )

  const removeOverlay = useCallback(() => {
    if (!overlayRef.current) {
      return
    }

    monitorfishMap.removeOverlay(overlayRef.current)

    overlayEntityIdRef.current = undefined
    overlayRef.current = undefined
  }, [])

  useEffect(() => {
    if (
      !selectionDialogElementRef.current ||
      !selectedStationOverlayPosition ||
      overlayEntityIdRef.current === selectedStationId
    ) {
      if (!selectedStationId && overlayRef.current) {
        removeOverlay()
      }

      return
    }

    const nextOverlay = new Overlay({
      className: 'ol-overlay-container overlay-active',
      element: selectionDialogElementRef.current
    })
    nextOverlay.setPosition(selectedStationOverlayPosition)

    removeOverlay()

    overlayRef.current = nextOverlay
    overlayEntityIdRef.current = selectedStationId

    monitorfishMap.addOverlay(nextOverlay)
  }, [removeOverlay, selectedStationId, selectedStationOverlayPosition])

  useEffect(
    () => () => {
      // removeOverlay()
    },
    [removeOverlay]
  )

  return (
    <Wrapper ref={selectionDialogElementRef}>
      {selectedStation && <StationCard isSelected station={selectedStation} />}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  border-radius: 2px;
  cursor: grabbing;
  left: 0;
  position: absolute;
  top: 0;
  z-index: 5000;
`
