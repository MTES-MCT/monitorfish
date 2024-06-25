import { Titled } from '@components/Titled'

import type { LogbookMessage } from '@features/Logbook/LogbookMessage.types'

export function getFirstTitleRowText(
  isLessThanTwelveMetersVessel: boolean,
  tripSegments: LogbookMessage.Segment[] | undefined
) {
  const tripSegmentNames =
    tripSegments?.map(tripSegment => `${tripSegment.code} (${tripSegment.name.toUpperCase()})`) ?? []
  const tripSegmentNamesAsText = tripSegmentNames.length > 0 ? tripSegmentNames.join(', ') : 'SEGMENT(S) INCONNU(S)'

  return (
    <>
      {`PNO ${isLessThanTwelveMetersVessel ? '< 12 M' : '≥ 12 M'} - `}
      <Titled>{tripSegmentNamesAsText}</Titled>
    </>
  )
}
