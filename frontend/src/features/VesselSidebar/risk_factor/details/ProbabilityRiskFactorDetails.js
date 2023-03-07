import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { InfractionsSummary } from '../../Controls/InfractionsSummary'
import { useSelector } from 'react-redux'

const ProbabilityRiskFactorDetails = ({ isOpen }) => {
  const {
    selectedVessel
  } = useSelector(state => state.vessel)
  const currentYear = new Date().getUTCFullYear()

  const {
    riskFactor
  } = selectedVessel

  return (
    <SubRiskDetails isOpen={isOpen}>
      <Line/>
      <InfractionsResumeZone>
        <InfractionsSummary
          numberOfGearSeized={riskFactor?.numberGearSeizuresLastFiveYears}
          numberOfSpeciesSeized={riskFactor?.numberSpeciesSeizuresLastFiveYears}
          numberOfDiversions={riskFactor?.numberVesselSeizuresLastFiveYears}
        />
      </InfractionsResumeZone>
      <Zone>
        <Fields>
          <TableBody>
            <Field>
              <Key>Temporalité</Key>
              <Value>
                {
                  riskFactor?.numberControlsLastFiveYears || riskFactor?.numberControlsLastFiveYears === 0
                    ? `${riskFactor?.numberControlsLastFiveYears} contrôle${riskFactor?.numberControlsLastFiveYears > 1 ? 's' : ''} sur 5 ans (${new Date(currentYear - 4, 0, 1).getUTCFullYear()} - ${currentYear})`
                    : <NoValue>-</NoValue>
                }
              </Value>
            </Field>
            <Field>
              <Key>Infractions pêche</Key>
              <Value>
                {
                  (riskFactor?.numberInfractionsLastFiveYears || riskFactor?.numberInfractionsLastFiveYears === 0) && (riskFactor?.numberControlsLastFiveYears || riskFactor?.numberControlsLastFiveYears === 0)
                    ? `${riskFactor?.numberInfractionsLastFiveYears} infraction${riskFactor?.numberInfractionsLastFiveYears > 1 ? 's' : ''} pêche / ${riskFactor?.numberControlsLastFiveYears} contrôle${riskFactor?.numberControlsLastFiveYears > 1 ? 's' : ''}`
                    : <NoValue>-</NoValue>
                }
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

const SubRiskDetails = styled.div`
  width: 100%;
  height: ${props => props.isOpen ? '105' : '0'}px;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
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
  padding: 0 5px 5px 20px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
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
  padding: 5px 5px 5px 0;
  background: none;
  width: ${props => props.big ? '160px' : '120px'};
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

export default ProbabilityRiskFactorDetails
