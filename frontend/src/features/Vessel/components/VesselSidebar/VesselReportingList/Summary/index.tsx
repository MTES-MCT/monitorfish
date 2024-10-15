import { Header, Zone } from '@features/Vessel/components/VesselSidebar/common_styles/common.style'
import { InfractionSuspicionSummary } from '@features/Vessel/components/VesselSidebar/VesselReportingList/Summary/InfractionSuspicionSummary'
import { customDayjs, Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { VesselReportings } from '@features/Reporting/types'

type SummaryProps = Readonly<{
  fromDate: Date
  vesselReportings: VesselReportings
}>
export function Summary({ fromDate, vesselReportings }: SummaryProps) {
  const yearsDepth = customDayjs().utc().get('year') - customDayjs(fromDate).get('year') + 1

  return (
    <Zone data-cy="vessel-reporting-summary">
      <Header>Résumé des derniers signalements ({yearsDepth} dernières années)</Header>
      <Body>
        <Columns $isFirst>
          <IconColumn>
            <Icon.Alert color={THEME.color.slateGray} />
          </IconColumn>
          <InfractionSuspicionSummary reportingSummary={vesselReportings.summary} />
        </Columns>
        <Columns $isFirst={false}>
          <IconColumn>
            <Icon.Observation color={THEME.color.slateGray} />
          </IconColumn>
          <Label>
            Observations <LabelNumber>{vesselReportings.summary?.numberOfObservations}</LabelNumber>
          </Label>
        </Columns>
      </Body>
    </Zone>
  )
}

const Body = styled.div`
  margin: 0;
  padding: 8px 5px 10px 10px;
  width: 100%;
`

const Label = styled.div`
  color: ${p => p.theme.color.slateGray};
  margin-right: 8px;
`

const LabelNumber = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin-left: 8px;
`

const Columns = styled.div<{
  $isFirst: boolean
}>`
  display: flex;
  margin-top: ${p => (p.$isFirst ? 10 : 16)}px;
`

const IconColumn = styled.div`
  flex-shrink: 0;
  margin-left: 6px;
  width: 30px;
`
