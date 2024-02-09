import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { getSegmentInfo, getTripSegments } from './utils'
import { useGetFleetSegmentsQuery } from '../../../../../api/fleetSegment'
import { COLORS } from '../../../../../constants/constants'

export type FleetSegmentsProps = {
  segments: string[] | undefined
}
export function FleetSegments({ segments }: FleetSegmentsProps) {
  const { data: fleetSegments } = useGetFleetSegmentsQuery()

  const tripSegments = getTripSegments(segments, fleetSegments)

  return (
    <>
      {tripSegments ? (
        tripSegments.map((segment, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={index}>
            {segment.segment}
            <TitleWrapper title={getSegmentInfo(segment)}>
              <StyledIconInfo size={16} />
            </TitleWrapper>
            {tripSegments.length === index + 1 ? '' : ', '}
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
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`

const StyledIconInfo = styled(Icon.Info)`
  margin-left: 5px;
`
