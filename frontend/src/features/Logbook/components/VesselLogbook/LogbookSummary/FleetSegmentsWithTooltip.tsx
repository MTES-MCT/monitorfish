import { useGetFleetSegmentsQuery } from '@features/FleetSegment/apis'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { getSegmentInfo, getTripSegments } from './utils'

export type FleetSegmentsProps = {
  segments: string[] | undefined
}
export function FleetSegmentsWithTooltip({ segments }: FleetSegmentsProps) {
  const { data: fleetSegments } = useGetFleetSegmentsQuery()

  const tripSegments = getTripSegments(segments, fleetSegments)

  return (
    <>
      {segments ? (
        segments.map((segment, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={index}>
            {segment}
            <TitleWrapper title={getSegmentInfo(tripSegments[index])}>
              <StyledIconInfo size={16} />
            </TitleWrapper>
            {segments.length === index + 1 ? '' : ', '}
          </span>
        ))
      ) : (
        <NoValue>-</NoValue>
      )}
    </>
  )
}

const TitleWrapper = styled.span`
  vertical-align: baseline;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`

const StyledIconInfo = styled(Icon.Info)`
  margin-left: 5px;
`
