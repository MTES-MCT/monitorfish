import { RiskFactorCursor } from '@features/RiskFactor/components/RiskFactorCursor'
import { OpenedDetails } from '@features/RiskFactor/components/RiskFactorResume/common'
import {
  getControlPriorityLevel,
  getInfractionRateRiskFactorText,
  getRiskFactorColor
} from '@features/RiskFactor/utils'
import { FlatKeyValue } from '@features/Vessel/components/VesselSidebar/components/common/FlatKeyValue'
import { InfractionsSummary } from '@features/Vessel/components/VesselSidebar/components/Controls/InfractionsSummary'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { customDayjs, Icon, isDefined } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import styled from 'styled-components'

export function ProbabilityRiskFactorDetails({ isOpen }) {
  const riskFactor = useMainAppSelector(state => state.vessel.selectedVessel)?.riskFactor
  assertNotNullish(riskFactor)
  const currentYear = new Date().getUTCFullYear()

  const hasBeenControlledWithinPastFiveYears = riskFactor.lastControlDatetime
    ? customDayjs(riskFactor.lastControlDatetime).isAfter(customDayjs().subtract(5, 'year'))
    : false

  return (
    <SubRiskDetails $isOpen={isOpen}>
      <Line />
      <OpenedDetails>
        <InlineKey>Probabilité d’infraction du segment</InlineKey>
        {riskFactor.infringementRiskLevel ? (
          <InlineValue data-cy="risk-factor-infringementRiskLevel">
            <InlineValueText>
              {riskFactor.infringementRiskLevel?.toFixed(1)} –{' '}
              {getControlPriorityLevel(riskFactor.infringementRiskLevel, riskFactor.segmentHighestPriority)}
            </InlineValueText>
            <Icon.Info
              size={16}
              title="Cette note est déterminée par les DIRM, en analysant les données d’infraction de tous les navires appartenant au segment."
            />
          </InlineValue>
        ) : (
          <NoValue>-</NoValue>
        )}
        <StyledRiskFactorCursor
          color={getRiskFactorColor(riskFactor.infringementRiskLevel)}
          height={5}
          // eslint-disable-next-line no-unsafe-optional-chaining
          progress={(100 * riskFactor.infringementRiskLevel) / 4}
          value={riskFactor.infringementRiskLevel}
          withoutBox
        />
        <InlineKey>Fréquence d’infraction du navire</InlineKey>
        {riskFactor.infractionRateRiskFactor ? (
          <InlineValue data-cy="risk-factor-infractionRateRiskFactor">
            <InlineValueText>
              {riskFactor.infractionRateRiskFactor?.toFixed(1)} –{' '}
              {getInfractionRateRiskFactorText(
                riskFactor.infractionRateRiskFactor,
                hasBeenControlledWithinPastFiveYears
              )}
            </InlineValueText>
            <Icon.Info size={16} title="Cette note s’appuie sur l’historique d’infraction du navire." />
          </InlineValue>
        ) : (
          <NoValue>-</NoValue>
        )}
        <StyledRiskFactorCursor
          color={getRiskFactorColor(riskFactor.infractionRateRiskFactor)}
          height={5}
          // eslint-disable-next-line no-unsafe-optional-chaining
          progress={(100 * riskFactor.infractionRateRiskFactor) / 4}
          value={riskFactor.infractionRateRiskFactor}
          withoutBox
        />
        {/* infraction_rate_risk_factor */}
        <StyledFlatKeyValue
          column={[
            {
              key: 'Temporalité',
              value: isDefined(riskFactor.numberControlsLastFiveYears)
                ? `${riskFactor.numberControlsLastFiveYears} contrôle${
                    riskFactor.numberControlsLastFiveYears > 1 ? 's' : ''
                  } sur 5 ans (${new Date(currentYear - 4, 0, 1).getUTCFullYear()} - ${currentYear})`
                : undefined
            },
            {
              key: 'Infractions pêche',
              value:
                isDefined(riskFactor.numberInfractionsLastFiveYears) &&
                isDefined(riskFactor.numberControlsLastFiveYears)
                  ? `${riskFactor.numberInfractionsLastFiveYears} infraction${
                      riskFactor.numberInfractionsLastFiveYears > 1 ? 's' : ''
                    } pêche / ${riskFactor.numberControlsLastFiveYears} contrôle${
                      riskFactor.numberControlsLastFiveYears > 1 ? 's' : ''
                    }`
                  : undefined
            }
          ]}
          keyWidth={120}
        />
        <InfractionsSummary
          numberOfControlsWithSomeGearsSeized={riskFactor.numberGearSeizuresLastFiveYears}
          numberOfControlsWithSomeSpeciesSeized={riskFactor.numberSpeciesSeizuresLastFiveYears}
          numberOfDiversions={riskFactor.numberVesselSeizuresLastFiveYears}
        />
      </OpenedDetails>
    </SubRiskDetails>
  )
}

const StyledRiskFactorCursor = styled(RiskFactorCursor)`
  margin-top: 8px;
  margin-bottom: 16px;
  width: 100%;
`

const InlineKey = styled.span`
  margin-right: 8px;
  color: ${p => p.theme.color.slateGray};
`

const InlineValue = styled.span`
  display: flex;
  gap: 8px;
`

const InlineValueText = styled.span`
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 170px;
`

const StyledFlatKeyValue = styled(FlatKeyValue)`
  table {
    margin: 0;
  }
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
  height: ${p => (p.$isOpen ? '210' : '0')}px;
  opacity: ${p => (p.$isOpen ? '1' : '0')};
  visibility: ${p => (p.$isOpen ? 'visible' : 'hidden')};
  overflow: hidden;
  transition: 0.2s all;
`
