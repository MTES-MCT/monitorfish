import styled from 'styled-components'

import { COLORS } from '../../../../../../constants/constants'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import { InfractionsSummary } from '../../Controls/InfractionsSummary'

export function ProbabilityRiskFactorDetails({ isOpen }) {
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const currentYear = new Date().getUTCFullYear()

  if (!selectedVessel) {
    return <></>
  }

  return (
    <SubRiskDetails $isOpen={isOpen}>
      <Line />
      <InfractionsResumeZone>
        <InfractionsSummary
          numberOfControlsWithSomeGearsSeized={selectedVessel.riskFactor.numberGearSeizuresLastFiveYears}
          numberOfControlsWithSomeSpeciesSeized={selectedVessel.riskFactor.numberSpeciesSeizuresLastFiveYears}
          numberOfDiversions={selectedVessel.riskFactor.numberVesselSeizuresLastFiveYears}
        />
      </InfractionsResumeZone>
      <Zone>
        <Fields>
          <TableBody>
            <Field>
              <Key>Temporalité</Key>
              <Value>
                {selectedVessel.riskFactor.numberControlsLastFiveYears ||
                selectedVessel.riskFactor.numberControlsLastFiveYears === 0 ? (
                  `${selectedVessel.riskFactor.numberControlsLastFiveYears} contrôle${
                    selectedVessel.riskFactor.numberControlsLastFiveYears > 1 ? 's' : ''
                  } sur 5 ans (${new Date(currentYear - 4, 0, 1).getUTCFullYear()} - ${currentYear})`
                ) : (
                  <NoValue>-</NoValue>
                )}
              </Value>
            </Field>
            <Field>
              <Key>Infractions pêche</Key>
              <Value>
                {(selectedVessel.riskFactor.numberInfractionsLastFiveYears ||
                  selectedVessel.riskFactor.numberInfractionsLastFiveYears === 0) &&
                (selectedVessel.riskFactor.numberControlsLastFiveYears ||
                  selectedVessel.riskFactor.numberControlsLastFiveYears === 0) ? (
                  `${selectedVessel.riskFactor.numberInfractionsLastFiveYears} infraction${
                    selectedVessel.riskFactor.numberInfractionsLastFiveYears > 1 ? 's' : ''
                  } pêche / ${selectedVessel.riskFactor.numberControlsLastFiveYears} contrôle${
                    selectedVessel.riskFactor.numberControlsLastFiveYears > 1 ? 's' : ''
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
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid ${COLORS.lightGray};
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
  margin: 0px 5px 10px 45px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.white};
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
  color: ${COLORS.slateGray};
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
  color: ${COLORS.gunMetal};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  font-weight: 500;
`
