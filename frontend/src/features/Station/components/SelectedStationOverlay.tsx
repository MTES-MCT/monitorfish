import { monitorfishMap } from '@features/Map/monitorfishMap'
import { useForceUpdate } from '@mtes-mct/monitor-ui'
import { Overlay } from 'ol'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { StationCard } from './StationCard'
import { getStationPointFeature } from './StationLayer/utils'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { useMoveOverlayWhenDragging } from '../../../hooks/useMoveOverlayWhenDragging'
import { getDialogOverlayOffsetFromFeature } from '../../../utils/getDialogOverlayOffsetFromFeature'
import { FEATURE_MARGINS } from '../constants'
import { useGetStationsQuery } from '../stationApi'

import type { FeatureWithCodeAndEntityId } from '../../../libs/FeatureWithCodeAndEntityId'
import type { Geometry } from 'ol/geom'

export function SelectedStationOverlay() {
  const wrapperElementRef = useRef<HTMLDivElement | null>(null)
  const selectionDialogElementRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<Overlay | undefined>(undefined)
  const currentOffsetRef = useRef([0, 0])

  const isStationLayerDisplayed = useMainAppSelector(state => state.displayedComponent.isStationLayerDisplayed)
  const selectedStationId = useMainAppSelector(state => state.station.selectedStationId)
  const { data: stations } = useGetStationsQuery()
  const { forceUpdate } = useForceUpdate()

  const selectedStation = useMemo(
    () => (selectedStationId ? stations?.find(station => station.id === selectedStationId) : undefined),
    [stations, selectedStationId]
  )
  const selectedStationFeature = useMemo(
    () => (selectedStation ? getStationPointFeature(selectedStation) : undefined),
    [selectedStation]
  )

  const removeOverlay = useCallback(() => {
    if (!overlayRef.current) {
      return
    }

    monitorfishMap.removeOverlay(overlayRef.current)

    overlayRef.current = undefined
  }, [])

  const updateOverlay = useCallback(
    (feature: FeatureWithCodeAndEntityId<Geometry>, wrapperElement: HTMLDivElement) => {
      const nextOverlay = new Overlay({
        className: 'ol-overlay-container overlay-active',
        element: wrapperElement
      })
      nextOverlay.setProperties({ entityId: feature.entityId })
      nextOverlay.setPosition(feature.getGeometry()?.getExtent())
      nextOverlay.setOffset(currentOffsetRef.current)

      removeOverlay()

      overlayRef.current = nextOverlay

      monitorfishMap.addOverlay(nextOverlay)
    },
    [removeOverlay]
  )

  useEffect(() => {
    if (
      !wrapperElementRef.current ||
      !selectionDialogElementRef.current ||
      !selectedStationFeature ||
      overlayRef.current?.getProperties().entityId === selectedStationFeature.entityId
    ) {
      if (!selectedStationFeature) {
        removeOverlay()
      }

      return
    }

    updateOverlay(selectedStationFeature, wrapperElementRef.current)
  }, [removeOverlay, selectedStationFeature, updateOverlay])

  useMoveOverlayWhenDragging(
    overlayRef.current,
    currentOffsetRef,
    () => {},
    true,
    () => {}
  )

  useEffect(() => {
    if (selectedStationId !== undefined) {
      forceUpdate()
    }

    if (
      overlayRef.current &&
      selectedStationFeature &&
      selectionDialogElementRef.current?.offsetWidth &&
      selectionDialogElementRef.current?.offsetWidth > 0
    ) {
      currentOffsetRef.current = getDialogOverlayOffsetFromFeature(
        selectedStationFeature,
        selectionDialogElementRef.current,
        FEATURE_MARGINS
      )

      overlayRef.current.setOffset(currentOffsetRef.current)
    }
  }, [
    forceUpdate,
    isStationLayerDisplayed,
    selectedStationFeature,
    selectedStationId,
    selectionDialogElementRef.current?.offsetWidth
  ])

  useEffect(() => () => removeOverlay(), [removeOverlay])

  return (
    <WrapperToBeKeptForDOMManagement $isVisible={!!selectionDialogElementRef.current} id="selected-station-overlay">
      <div ref={wrapperElementRef}>
        {isStationLayerDisplayed && selectedStation && (
          <StationCard ref={selectionDialogElementRef} isSelected station={selectedStation} />
        )}
      </div>
    </WrapperToBeKeptForDOMManagement>
  )
}

const WrapperToBeKeptForDOMManagement = styled.div<{
  $isVisible: boolean
}>`
  left: 0;
  position: absolute;
  top: 0;
  visibility: ${p => (p.$isVisible ? 'visible' : 'hidden')};
  z-index: 5000;
`
