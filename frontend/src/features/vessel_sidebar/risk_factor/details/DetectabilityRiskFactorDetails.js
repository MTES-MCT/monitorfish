import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { getRiskFactorColor } from '../../../../domain/entities/riskFactor'
import RiskFactorCursor from '../RiskFactorCursor'

const DetectabilityRiskFactorDetails = ({ isOpen }) => {
  return (
    <SubRiskDetails isOpen={isOpen}>
      <Line/>
      <Zone>
        <InlineKey>Priorité du segment MED06/ATL02</InlineKey>
        <InlineValue>3 – élevée</InlineValue>
        <FullWidth>
          <RiskFactorCursor
            height={5}
            withoutBox
            value={3}
            color={getRiskFactorColor(3)}
            progress={100 * 3 / 4}
          />
        </FullWidth>
        <InlineKey>Priorité du navire</InlineKey>
        <InlineValue>3.8 – contrôles rares</InlineValue>
        <FullWidth>
          <RiskFactorCursor
            height={5}
            withoutBox
            value={3.8}
            color={getRiskFactorColor(3.8)}
            progress={100 * 3.8 / 4}
          />
        </FullWidth>
        <Fields>
          <TableBody>
            <Field>
              <Key>Temporalité</Key>
              <Value>
                1 contrôle sur les 3 dernières années
              </Value>
            </Field>
            <Field>
              <Key>Dernier contrôle</Key>
              <Value>
                Le 22/11/2019 (1 infraction)
              </Value>
            </Field>
          </TableBody>
        </Fields>
      </Zone>
    </SubRiskDetails>
  )
}

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
  background: ${COLORS.background};
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
