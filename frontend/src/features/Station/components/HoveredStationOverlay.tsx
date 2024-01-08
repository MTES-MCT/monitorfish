import { useForceUpdate, type Coordinates } from '@mtes-mct/monitor-ui'
import { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { StationCard } from './StationCard'
import { MonitorFishLayer } from '../../../domain/entities/layers/types'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { getDialogWindowPositionFromFeature } from '../../../utils/getDialogWindowPositionFromFeature'
import { FEATURE_MARGINS } from '../constants'
import { useGetStationsQuery } from '../stationApi'

import type { FeatureWithCodeAndEntityId } from '../../../libs/FeatureWithCodeAndEntityId'

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
  const { forceUpdate } = useForceUpdate()

  const hoveredStation = useMemo(
    () => (hoveredStationId ? stations?.find(station => station.id === hoveredStationId) : undefined),
    [stations, hoveredStationId]
  )

  const wrapperWindowPosition = useMemo(
    () => getDialogWindowPositionFromFeature(hoveredFeature, hoverDialogElementRef.current, FEATURE_MARGINS),
    // Dependency optimization
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hoverDialogElementRef.current, hoveredStationId]
  )

  useEffect(() => {
    if (hoveredStationId !== undefined) {
      forceUpdate()
    }
  }, [forceUpdate, hoveredStationId])

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
  left: ${p => p.$topLeftPosition[1]}px;
  position: absolute;
  top: ${p => p.$topLeftPosition[0]}px;
  visibility: ${p => (p.$isVisible ? 'visible' : 'hidden')};
  z-index: 5001;
`
