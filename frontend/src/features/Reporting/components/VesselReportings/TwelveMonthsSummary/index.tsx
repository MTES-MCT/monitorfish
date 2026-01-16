import { getTitle } from '@features/Reporting/components/VesselReportings/TwelveMonthsSummary/utils'
import { SidebarHeader, SidebarZone } from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import { Tag, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { ThreatSummary } from '@features/Reporting/types'

type TwelveMonthsSummaryProps = Readonly<{
  threatSummary: Record<string, ThreatSummary[]>
}>
export function TwelveMonthsSummary({ threatSummary }: TwelveMonthsSummaryProps) {
  return (
    <StyledSidebarZone data-cy="vessel-reporting-summary">
      <SidebarHeader>Dernières suspicions d’infractions (12 derniers mois)</SidebarHeader>
      <Body>
        {Object.keys(threatSummary).length === 0 && (
          <Threat>
            <Label>Aucune suspicion d’infraction</Label>
          </Threat>
        )}
        {Object.keys(threatSummary).map(threat => (
          <Threat>
            <Label>{threat}</Label>

            <Tags>
              {threatSummary[threat]?.map(infraction => (
                <Tag backgroundColor={THEME.color.gainsboro} title={getTitle(threat, infraction)}>
                  <BadgeNumber>{infraction.numberOfOccurrences}</BadgeNumber>
                  {infraction.threatCharacterization} / NATINF {infraction.natinfCode}
                </Tag>
              ))}
            </Tags>
          </Threat>
        ))}
      </Body>
    </StyledSidebarZone>
  )
}

const Tags = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: space-between;
`

const BadgeNumber = styled.div`
  background: ${p => p.theme.color.maximumRed};
  border-radius: 13px;
  color: ${p => p.theme.color.white};
  font-size: 12px;
  font-weight: 700;
  width: 8px;
  margin-left: -5px;
  margin-right: 6px;
  margin-top: 3px;
  height: 16px;
  letter-spacing: 0;
  line-height: 15px;
  padding: 0 4px;
  text-align: center;
`

const StyledSidebarZone = styled(SidebarZone)`
  margin-bottom: 10px;
`

const Body = styled.div`
  margin: 0;
  padding: 0 5px 16px 8px;
  width: 100%;
`

const Threat = styled.div`
  margin-left: 8px;
  margin-top: 8px;
`

const Label = styled.div`
  color: ${p => p.theme.color.slateGray};
  margin-bottom: 8px;
  margin-top: 16px;
`
