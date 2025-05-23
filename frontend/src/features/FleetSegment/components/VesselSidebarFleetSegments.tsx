import { FleetSegmentsWithTooltip } from '@features/FleetSegment/components/FleetSegmentsWithTooltip'
import { VesselCurrentFleetSegmentDetails } from '@features/FleetSegment/components/VesselCurrentFleetSegmentDetails'
import {
  SidebarHeader,
  SidebarHeaderValue,
  SidebarZone
} from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import { pluralize } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type VesselSidebarFleetSegmentsProps = {
  className?: string | undefined
  segments: string[] | undefined
}
export function VesselSidebarFleetSegments({ className, segments }: VesselSidebarFleetSegmentsProps) {
  const numberOfSegments = segments?.length ?? 0

  return (
    <SidebarZone className={className}>
      <SidebarHeader>
        {pluralize('Segment', numberOfSegments)} de {pluralize('flotte', numberOfSegments)}{' '}
        {pluralize('actuel', numberOfSegments)}
        <SidebarHeaderValue>
          <FleetSegmentsWithTooltip segments={segments} />
        </SidebarHeaderValue>
      </SidebarHeader>
      <StyledVesselCurrentFleetSegmentDetails />
    </SidebarZone>
  )
}

const StyledVesselCurrentFleetSegmentDetails = styled(VesselCurrentFleetSegmentDetails)`
  padding: 6px 4px 4px;
`
