import { DrawZoneFilterButton } from '@features/Reporting/components/ZoneFilter/DrawZoneFilterButton'
import { ZoneFilterTags } from '@features/Reporting/components/ZoneFilter/ZoneFilterTags'
import styled from 'styled-components'

export function ReportingZoneFilter() {
  return (
    <Wrapper>
      <DrawZoneFilterButton />
      <ZoneFilterTags />
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
