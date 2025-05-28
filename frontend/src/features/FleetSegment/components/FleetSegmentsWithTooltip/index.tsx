import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import { FLEET_SEGMENT_ORIGIN_LABEL } from '@features/FleetSegment/constants'
import { TagInfo } from '@features/Map/components/TagInfo'
import { ActivityOrigin } from '@features/Vessel/schemas/ActiveVesselSchema'
import { pluralize, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { getSegmentInfo, getSegmentsWithProperties } from './utils'

export type FleetSegmentsProps = {
  activityOrigin: ActivityOrigin | undefined
  hasWhiteBackground?: boolean
  segments: string[] | undefined
}
export function FleetSegmentsWithTooltip({ activityOrigin, hasWhiteBackground = false, segments }: FleetSegmentsProps) {
  const { data: fleetSegments } = useGetFleetSegmentsQuery()

  const segmentsWithProperties = getSegmentsWithProperties(segments, fleetSegments)

  return (
    <>
      {segments ? (
        <>
          {segments.map((segment, index) => (
            <StyledTagInfo
              key={segment}
              backgroundColor={hasWhiteBackground ? THEME.color.gainsboro : THEME.color.white}
              color={THEME.color.charcoal}
              title={getSegmentInfo(segmentsWithProperties[index])}
            >
              {segment}
            </StyledTagInfo>
          ))}
          {activityOrigin === ActivityOrigin.FROM_LOGBOOK && (
            <StyledTagInfo
              backgroundColor={THEME.color.mediumSeaGreen25}
              color={THEME.color.charcoal}
              title={FLEET_SEGMENT_ORIGIN_LABEL[activityOrigin]}
            >
              {pluralize('Segment', segments?.length ?? 0)} {pluralize('actuel', segments?.length ?? 0)}
            </StyledTagInfo>
          )}
          {activityOrigin === ActivityOrigin.FROM_RECENT_PROFILE && (
            <StyledTagInfo
              backgroundColor={THEME.color.goldenPoppy25}
              color={THEME.color.charcoal}
              title={FLEET_SEGMENT_ORIGIN_LABEL[activityOrigin]}
            >
              {pluralize('Segment', segments?.length ?? 0)} {pluralize('récent', segments?.length ?? 0)}
            </StyledTagInfo>
          )}
        </>
      ) : (
        <NoValue>-</NoValue>
      )}
    </>
  )
}

const StyledTagInfo = styled(TagInfo)`
  margin-top: -1px;
  margin-right: 8px;
  margin-bottom: 0;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`
