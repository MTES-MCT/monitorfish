import { InfractionsSummary } from '@features/Vessel/components/VesselSidebar/components/Controls/InfractionsSummary'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { isDefined } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import styled from 'styled-components'

export function ProbabilityRiskFactorDetails({ isOpen }) {
  const riskFactor = useMainAppSelector(state => state.vessel.selectedVessel)?.riskFactor
  assertNotNullish(riskFactor)
  const currentYear = new Date().getUTCFullYear()

  return (
    <SubRiskDetails $isOpen={isOpen}>
      <Line />
      <InfractionsResumeZone>
        <InfractionsSummary
          numberOfControlsWithSomeGearsSeized={riskFactor.numberGearSeizuresLastFiveYears}
          numberOfControlsWithSomeSpeciesSeized={riskFactor.numberSpeciesSeizuresLastFiveYears}
          numberOfDiversions={riskFactor.numberVesselSeizuresLastFiveYears}
        />
      </InfractionsResumeZone>
      <Zone>
        <Fields>
          <TableBody>
            <Field>
              <Key>Temporalité</Key>
              <Value>
                {isDefined(riskFactor.numberControlsLastFiveYears) ? (
                  `${riskFactor.numberControlsLastFiveYears} contrôle${
                    riskFactor.numberControlsLastFiveYears > 1 ? 's' : ''
                  } sur 5 ans (${new Date(currentYear - 4, 0, 1).getUTCFullYear()} - ${currentYear})`
                ) : (
                  <NoValue>-</NoValue>
                )}
              </Value>
            </Field>
            <Field>
              <Key>Infractions pêche</Key>
              <Value>
                {isDefined(riskFactor.numberInfractionsLastFiveYears) &&
                isDefined(riskFactor.numberControlsLastFiveYears) ? (
                  `${riskFactor.numberInfractionsLastFiveYears} infraction${
                    riskFactor.numberInfractionsLastFiveYears > 1 ? 's' : ''
                  } pêche / ${riskFactor.numberControlsLastFiveYears} contrôle${
                    riskFactor.numberControlsLastFiveYears > 1 ? 's' : ''
                  }`
                ) : (
                  <NoValue>-</NoValue>
                )}
              </Value>
            </Field>
          </TableBody>
        </Fields>
      </Zone>
    </SubRiskDetails>
  )
}

const NoValue = styled.span`
  color: #ff3392;
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
  height: ${p => (p.$isOpen ? '105' : '0')}px;
  opacity: ${p => (p.$isOpen ? '1' : '0')};
  visibility: ${p => (p.$isOpen ? 'visible' : 'hidden')};
  overflow: hidden;
  transition: 0.2s all;
`

const TableBody = styled.tbody``

const InfractionsResumeZone = styled.div`
  margin: 5px 5px 0 5px;
`

const Zone = styled.div`
  margin: 0 5px 10px 45px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => p.theme.color.white};
`

const Fields = styled.table`
  display: table;
  margin: 0;
  min-width: 40%;
  padding: 0 5px 5px 20px;
  width: inherit;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: #ff3392;
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 20px;
  background: none;
  width: 120px;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const Value = styled.td`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`
