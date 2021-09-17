import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import InfractionsResume from '../../../controls/InfractionsResume'

const ProbabilityRiskFactorDetails = ({ isOpen }) => {
  return (
    <SubRiskDetails isOpen={isOpen}>
      <Line/>
      <InfractionsResumeZone>
        <InfractionsResume
          numberOfDiversions={0}
          numberOfEscortsToQuay={0}
          numberOfSeizures={1}
        />
      </InfractionsResumeZone>
      <Zone>
        <Fields>
          <TableBody>
            <Field>
              <Key>Temporalité</Key>
              <Value>
                8 contrôles sur 5 ans (2016-2021)
              </Value>
            </Field>
            <Field>
              <Key>Infractions pêche</Key>
              <Value>
                5 infractions pêche / 8 contrôles
              </Value>
            </Field>
          </TableBody>
        </Fields>
      </Zone>
    </SubRiskDetails>
  )
}

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
  margin: 5px 5px 0 25px;
`

const Zone = styled.div`
  margin: 0px 5px 10px 45px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
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
