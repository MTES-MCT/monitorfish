import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import { TagInfo } from '@features/Map/components/TagInfo'
import { ActivityOrigin } from '@features/Vessel/schemas/ActiveVesselSchema'
import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { getSegmentInfo, getSegmentsWithProperties } from './utils'

export type FleetSegmentsProps = {
  activityOrigin: ActivityOrigin | undefined
  segments: string[] | undefined
}
export function FleetSegmentsWithTooltip({ activityOrigin, segments }: FleetSegmentsProps) {
  const { data: fleetSegments } = useGetFleetSegmentsQuery()

  const segmentsWithProperties = getSegmentsWithProperties(segments, fleetSegments)

  return (
    <>
      {segments ? (
        <>
          {segments.map((segment, index) => (
            <StyledTagInfo
              key={segment}
              backgroundColor={
                activityOrigin === ActivityOrigin.FROM_LOGBOOK ? THEME.color.mediumSeaGreen25 : THEME.color.white
              }
              color={THEME.color.charcoal}
              title={getSegmentInfo(segmentsWithProperties[index], activityOrigin)}
            >
              {activityOrigin === ActivityOrigin.FROM_LOGBOOK ? segment : <i>{segment}</i>}
            </StyledTagInfo>
          ))}
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
