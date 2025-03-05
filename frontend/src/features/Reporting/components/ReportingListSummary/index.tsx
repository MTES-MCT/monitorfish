import {
  SidebarHeader,
  SidebarZone
} from '@features/Vessel/components/VesselSidebar/components/common_styles/common.style'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { InfractionSuspicionSummary } from './InfractionSuspicionSummary'

import type { ReportingSummary } from '@features/Reporting/types'

type ReportingListSummaryProps = Readonly<{
  reportingSummary: ReportingSummary
}>
export function TwelveMonthsSummary({ reportingSummary }: ReportingListSummaryProps) {
  return (
    <StyledSidebarZone data-cy="vessel-reporting-summary">
      <SidebarHeader>Résumé des derniers signalements (12 derniers mois)</SidebarHeader>
      <Body>
        <Columns $isFirst>
          <IconColumn>
            <Icon.Alert color={THEME.color.slateGray} />
          </IconColumn>
          <InfractionSuspicionSummary reportingSummary={reportingSummary} />
        </Columns>
        <Columns $isFirst={false}>
          <IconColumn>
            <Icon.Observation color={THEME.color.slateGray} />
          </IconColumn>
          <Label>
            Observations <LabelNumber>{reportingSummary.numberOfObservations}</LabelNumber>
          </Label>
        </Columns>
      </Body>
    </StyledSidebarZone>
  )
}

const StyledSidebarZone = styled(SidebarZone)`
  margin-bottom: 10px;
`

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
