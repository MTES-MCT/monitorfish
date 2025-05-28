import { FleetSegmentsWithTooltip } from '@features/FleetSegment/components/FleetSegmentsWithTooltip'
import { VesselCurrentFleetSegmentDetails } from '@features/FleetSegment/components/VesselCurrentFleetSegmentDetails'
import {
  SidebarHeader,
  SidebarHeaderValue,
  SidebarZone
} from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import { ActivityOrigin } from '@features/Vessel/schemas/ActiveVesselSchema'
import { pluralize } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type VesselSidebarFleetSegmentsProps = {
  activityOrigin: ActivityOrigin | undefined
  className?: string | undefined
  segments: string[] | undefined
}
export function VesselSidebarFleetSegments({ activityOrigin, className, segments }: VesselSidebarFleetSegmentsProps) {
  const numberOfSegments = segments?.length ?? 0

  return (
    <SidebarZone className={className}>
      <SidebarHeader>
        {pluralize('Segment', numberOfSegments)} de {pluralize('flotte', numberOfSegments)}{' '}
        <SidebarHeaderValue>
          <FleetSegmentsWithTooltip activityOrigin={activityOrigin} segments={segments} />
        </SidebarHeaderValue>
      </SidebarHeader>
      <StyledVesselCurrentFleetSegmentDetails />
    </SidebarZone>
  )
}

const StyledVesselCurrentFleetSegmentDetails = styled(VesselCurrentFleetSegmentDetails)`
  padding: 6px 4px 4px;
`
