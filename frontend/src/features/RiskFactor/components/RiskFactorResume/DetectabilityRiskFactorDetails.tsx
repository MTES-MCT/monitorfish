import { OpenedDetails } from '@features/RiskFactor/components/RiskFactorResume/common'
import { getControlPriorityLevel, getControlRateRiskFactorText, getRiskFactorColor } from '@features/RiskFactor/utils'
import { FlatKeyValue } from '@features/Vessel/components/VesselSidebar/components/common/FlatKeyValue'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { isDefined } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import styled from 'styled-components'

import { getDate } from '../../../../utils'
import { RiskFactorCursor } from '../RiskFactorCursor'

type DetectabilityRiskFactorDetailsProps = {
  isOpen: boolean
}
export function DetectabilityRiskFactorDetails({ isOpen }: DetectabilityRiskFactorDetailsProps) {
  const riskFactor = useMainAppSelector(state => state.vessel.selectedVessel)?.riskFactor
  assertNotNullish(riskFactor)

  return (
    <SubRiskDetails $isOpen={isOpen}>
      <Line />
      <OpenedDetails>
        <InlineKey>Priorité du segment {riskFactor.segmentHighestPriority}</InlineKey>
        <InlineValue data-cy="risk-factor-priority-level">
          {riskFactor.controlPriorityLevel ? (
            `${riskFactor.controlPriorityLevel?.toFixed(1)} – ${getControlPriorityLevel(
              riskFactor.controlPriorityLevel,
              riskFactor.segmentHighestPriority
            )}`
          ) : (
            <NoValue>-</NoValue>
          )}
        </InlineValue>
        <StyledRiskFactorCursor
          color={getRiskFactorColor(riskFactor.controlPriorityLevel)}
          height={5}
          // eslint-disable-next-line no-unsafe-optional-chaining
          progress={(100 * riskFactor.controlPriorityLevel) / 4}
          value={riskFactor.controlPriorityLevel}
          withoutBox
        />
        <InlineKey>Priorité du navire</InlineKey>
        <InlineValue>
          {riskFactor.controlRateRiskFactor ? (
            `${riskFactor.controlRateRiskFactor?.toFixed(1)} – ${getControlRateRiskFactorText(
              riskFactor.controlRateRiskFactor
            )}`
          ) : (
            <NoValue>-</NoValue>
          )}
        </InlineValue>
        <StyledRiskFactorCursor
          color={getRiskFactorColor(riskFactor.controlRateRiskFactor)}
          height={5}
          // eslint-disable-next-line no-unsafe-optional-chaining
          progress={(100 * riskFactor.controlRateRiskFactor) / 4}
          value={riskFactor.controlRateRiskFactor}
          withoutBox
        />
        <StyledFlatKeyValue
          column={[
            {
              key: 'Temporalité',
              value: isDefined(riskFactor.numberControlsLastThreeYears)
                ? `${riskFactor.numberControlsLastThreeYears} contrôle${
                    riskFactor.numberControlsLastThreeYears > 1 ? 's' : ''
                  } sur les 3 dernières années`
                : undefined
            },
            {
              key: 'Dernier contrôle',
              value: riskFactor.lastControlDatetime ? `Le ${getDate(riskFactor.lastControlDatetime)}` : undefined
            }
          ]}
          keyWidth={120}
        />
      </OpenedDetails>
    </SubRiskDetails>
  )
}

const StyledFlatKeyValue = styled(FlatKeyValue)`
  table {
    margin: 0;
  }
`

const StyledRiskFactorCursor = styled(RiskFactorCursor)`
  margin-top: 8px;
  margin-bottom: 16px;
  width: 100%;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
`

const SubRiskDetails = styled.div<{
  $isOpen: boolean
}>`
  width: 100%;
  height: ${props => (props.$isOpen ? '170' : '0')}px;
  opacity: ${props => (props.$isOpen ? '1' : '0')};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  overflow: hidden;
  transition: 0.2s all;
`

const InlineKey = styled.span`
  margin-right: 8px;
  color: ${p => p.theme.color.slateGray};
`

const InlineValue = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
`
