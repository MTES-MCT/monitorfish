import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import {
  getControlPriorityLevel,
  getControlRateRiskFactorText,
  getRiskFactorColor
} from '../../../../domain/entities/vessel/riskFactor'
import RiskFactorCursor from '../RiskFactorCursor'
import { useSelector } from 'react-redux'
import { getDate } from '../../../../utils'

const DetectabilityRiskFactorDetails = ({ isOpen }) => {
  const {
    selectedVessel
  } = useSelector(state => state.vessel)

  const {
    riskFactor
  } = selectedVessel

  return (
    <SubRiskDetails isOpen={isOpen}>
      <Line/>
      <Zone>
        <InlineKey>
          Priorité du segment{' '}
          {
            riskFactor?.segmentHighestPriority
              ? riskFactor?.segmentHighestPriority
              : null
          }
        </InlineKey>
        <InlineValue
          data-cy={'risk-factor-priority-level'}
        >
          {
            riskFactor?.controlPriorityLevel
              ? `${riskFactor?.controlPriorityLevel?.toFixed(1)} – ${getControlPriorityLevel(riskFactor?.controlPriorityLevel)}`
              : <NoValue>-</NoValue>
          }
        </InlineValue>
        <FullWidth>
          <RiskFactorCursor
            height={5}
            withoutBox
            value={riskFactor?.controlPriorityLevel}
            color={getRiskFactorColor(riskFactor?.controlPriorityLevel)}
            progress={100 * riskFactor?.controlPriorityLevel / 4}
          />
        </FullWidth>
        <InlineKey>Priorité du navire</InlineKey>
        <InlineValue>
          {
            riskFactor?.controlRateRiskFactor
              ? `${riskFactor?.controlRateRiskFactor?.toFixed(1)} – ${getControlRateRiskFactorText(riskFactor?.controlRateRiskFactor)}`
              : <NoValue>-</NoValue>
          }
        </InlineValue>
        <FullWidth>
          <RiskFactorCursor
            height={5}
            withoutBox
            value={riskFactor?.controlRateRiskFactor}
            color={getRiskFactorColor(riskFactor?.controlRateRiskFactor)}
            progress={100 * riskFactor?.controlRateRiskFactor / 4}
          />
        </FullWidth>
        <Fields>
          <TableBody>
            <Field>
              <Key>Temporalité</Key>
              <Value>
                {
                  riskFactor?.numberControlsLastThreeYears || riskFactor?.numberControlsLastThreeYears === 0
                    ? `${riskFactor?.numberControlsLastThreeYears} contrôle${riskFactor?.numberControlsLastThreeYears > 1 ? 's' : ''} sur les 3 dernières années`
                    : <NoValue>-</NoValue>
                }
              </Value>
            </Field>
            <Field>
              <Key>Dernier contrôle</Key>
              <Value>
                {
                  riskFactor?.lastControlDatetime
                    ? `Le ${getDate(riskFactor?.lastControlDatetime)}`
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

const FullWidth = styled.div`
  width: 100%;
`

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid ${COLORS.lightGray};
`

const SubRiskDetails = styled.div`
  width: 100%;
  height: ${props => props.isOpen ? '170' : '0'}px;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  overflow: hidden;
  transition: 0.2s all;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  margin: 10px 5px 10px 45px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.white};
`

const Fields = styled.table`
  padding: 5px 5px 5px 20px;
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

const InlineKey = styled.span`
  margin: 5px 5px;
  margin-left: 20px;
  font-size: 13px;
  color: ${COLORS.slateGray};
`

const InlineValue = styled.span`
  margin: 5px 5px;
  font-size: 13px;
  margin-left: 15px;
  color: ${COLORS.gunMetal};
  font-weight: 500;
`

export default DetectabilityRiskFactorDetails
