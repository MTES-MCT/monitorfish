import { ReportingCard } from '@features/Reporting/components/ReportingCard'
import { CollapsibleListItem } from '@features/Vessel/components/VesselSidebar/components/common/CollapsibleListItem'
import styled from 'styled-components'

import { NonCompliantTrips } from './NonCompliantTrips'
import { RiskLevelBadge } from './RiskLevelBadge'
import { RiskElement } from '../../types'
import { getRiskElementTitle } from '../../utils'

type RiskElementItemProps = Readonly<{
  displayedRiskElement: RiskElement.DisplayedRiskElement
  riskElement: RiskElement.VesselRiskElement
}>
export function RiskElementItem({ displayedRiskElement, riskElement }: RiskElementItemProps) {
  const { metrics, reportings } = riskElement

  return (
    <CollapsibleListItem
      data-cy={`risk-element-${riskElement.code}`}
      title={
        <>
          <RiskLevelBadge riskLevel={riskElement.riskLevel} />
          <Title>{getRiskElementTitle(riskElement, displayedRiskElement.label)}</Title>
        </>
      }
    >
      <Content>
        <Description>{displayedRiskElement.description}</Description>
        {!!reportings && (
          <ReportingCard
            isArchived={reportings.reporting.isArchived}
            otherOccurrencesOfSameAlert={reportings.otherOccurrencesOfSameAlert}
            reporting={reportings.reporting}
          />
        )}
        {!reportings && metrics.type === RiskElement.MetricsType.TRIPS && (
          <NonCompliantTrips nonCompliantTrips={metrics.nonCompliantTrips} />
        )}
      </Content>
    </CollapsibleListItem>
  )
}

const Title = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
`

const Content = styled.div`
  font-size: 13px;
  padding: 16px;
`

const Description = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
  margin: 0 0 8px;
  white-space: normal;
`
