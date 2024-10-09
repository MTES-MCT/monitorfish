import { InfractionSuspicionSummary } from '@features/Reporting/components/VesselReportingList/Summary/InfractionSuspicionSummary'
import { Header, Zone } from '@features/Vessel/components/VesselSidebar/common_styles/common.style'
import { useGetVesselReportingsByVesselIdentityQuery } from '@features/Vessel/vesselApi'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs, Icon, THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import styled from 'styled-components'

export function Summary() {
  const archivedReportingsFromDate = useMainAppSelector(state => state.mainWindowReporting.archivedReportingsFromDate)
  const vesselIdentity = useMainAppSelector(state => state.mainWindowReporting.vesselIdentity)
  const yearsDepth = customDayjs().utc().get('year') - customDayjs(archivedReportingsFromDate).get('year') + 1

  const { data: selectedVesselReportings } = useGetVesselReportingsByVesselIdentityQuery(
    vesselIdentity
      ? {
          fromDate: archivedReportingsFromDate,
          vesselIdentity
        }
      : skipToken
  )
  const summary = selectedVesselReportings?.summary

  return (
    <Zone data-cy="vessel-reporting-summary">
      <Header>Résumé des derniers signalements ({yearsDepth} dernières années)</Header>
      <Body>
        <Columns $isFirst>
          <IconColumn>
            <Icon.Alert color={THEME.color.slateGray} />
          </IconColumn>
          <InfractionSuspicionSummary />
        </Columns>
        <Columns $isFirst={false}>
          <IconColumn>
            <Icon.Observation color={THEME.color.slateGray} />
          </IconColumn>
          <Label>
            Observations <LabelNumber>{summary?.numberOfObservations}</LabelNumber>
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
