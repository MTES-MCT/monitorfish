import { DISABLED_DURING_POSITION_REPLAY_MESSAGE } from '@features/PositionReplay/constants'
import { DataKind, selectIsDataAvailable } from '@features/PositionReplay/replayableData'
import { DrawZoneFilterButton } from '@features/Reporting/components/ZoneFilter/DrawZoneFilterButton'
import { ZoneFilterTags } from '@features/Reporting/components/ZoneFilter/ZoneFilterTags'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import styled from 'styled-components'

export function ReportingZoneFilter() {
  const areReportingsAvailable = useMainAppSelector(state => selectIsDataAvailable(state, DataKind.REPORTINGS))

  return (
    <Wrapper>
      <DrawZoneFilterButton
        disabledReason={DISABLED_DURING_POSITION_REPLAY_MESSAGE}
        isDisabled={!areReportingsAvailable}
      />
      <ZoneFilterTags
        disabledReason={DISABLED_DURING_POSITION_REPLAY_MESSAGE}
        isDeletionDisabled={!areReportingsAvailable}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin-bottom: 24px;

  > button {
    width: 100%;
  }

  > .Component-SingleTag {
    margin-top: 4px;
    width: 100%;

    span {
      width: 100%;
    }
  }
`
