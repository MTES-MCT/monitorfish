import { useMemo, useRef } from 'react'
import styled from 'styled-components'

import { FEATURE_MARGINS } from './constants'
import { MonitorFishLayer } from '../../../../domain/entities/layers/types'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { getDialogWindowPositionFromFeature } from '../../../../utils/getDialogWindowPositionFromFeature'
import { useGetStationsQuery } from '../../stationApi'
import { StationCard } from '../StationCard'

import type { FeatureWithCodeAndEntityId } from '../../../../libs/FeatureWithCodeAndEntityId'
import type { Coordinates } from '@mtes-mct/monitor-ui'

type HoveredStationOverlayProps = {
  hoveredFeature: FeatureWithCodeAndEntityId | undefined
}
export function HoveredStationOverlay({ hoveredFeature }: HoveredStationOverlayProps) {
  const hoverDialogElementRef = useRef<HTMLDivElement | null>(null)

  const selectedStationId = useMainAppSelector(state => state.station.selectedStationId)
  const hoveredStationId =
    hoveredFeature?.code === MonitorFishLayer.STATION && hoveredFeature.entityId !== selectedStationId
      ? hoveredFeature.entityId
      : undefined

  const { data: stations } = useGetStationsQuery()

  const hoveredStation = useMemo(
    () => (hoveredStationId ? stations?.find(station => station.id === hoveredStationId) : undefined),
    [stations, hoveredStationId]
  )

  const wrapperWindowPosition = useMemo(
    () => getDialogWindowPositionFromFeature(hoveredFeature, hoverDialogElementRef.current, FEATURE_MARGINS),
    // Depency optimization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hoverDialogElementRef.current, hoveredStationId]
  )

  return (
    <Wrapper $isVisible={!!hoverDialogElementRef.current} $topLeftPosition={wrapperWindowPosition}>
      {hoveredStation && <StationCard ref={hoverDialogElementRef} station={hoveredStation} />}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $isVisible: boolean
  $topLeftPosition: Coordinates
}>`
  border-radius: 2px;
  cursor: grabbing;
  left: ${p => p.$topLeftPosition[1]}px;
  position: absolute;
  top: ${p => p.$topLeftPosition[0]}px;
  z-index: 5001;
  visibility: ${p => (p.$isVisible ? 'visible' : 'hidden')};
`
