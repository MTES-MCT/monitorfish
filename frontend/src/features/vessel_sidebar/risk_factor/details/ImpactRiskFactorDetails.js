import React from 'react'
import styled from 'styled-components'
import { ReactComponent as InfoSVG } from '../../../icons/Information.svg'
import { COLORS } from '../../../../constants/constants'

const ImpactRiskFactorDetails = ({ isOpen }) => {
  return (
    <SubRiskDetails isOpen={isOpen}>
      <Line/>
      <Zone>
        <Fields>
          <TableBody>
            <Field>
              <Key big>Segment de flotte actuel</Key>
              <Value>
                MED06/ATL01 <Info title={'La note de risque de ce segment est la note attribuée par la DIRM de la ' +
              'façade dans son Plan de contrôle annuel.'}/>
              </Value>
            </Field>
          </TableBody>
        </Fields>
        <Fields>
          <TableBody>
            <Field>
              <Key>Engins à bord</Key>
              <Value>
                LLD, LLS
              </Value>
            </Field>
            <Field>
              <Key>Espèces à bord</Key>
              <Value>
                BFT, SWO, ALB
              </Value>
            </Field>
            <Field>
              <Key>Zones de la marée</Key>
              <Value>
                37. 1. 2
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

const Info = styled(InfoSVG)`
  width: 14px;
  vertical-align: text-bottom;
  margin-bottom: 2px;
  margin-left: ${props => props.isInfoSegment ? '5px' : '2px'};
`

const SubRiskDetails = styled.div`
  width: 100%;
  height: ${props => props.isOpen ? '140' : '0'}px;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  overflow: hidden;
  transition: 0.2s all;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  margin: 5px 5px 10px 45px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
`

const Fields = styled.table`
  padding: 10px 5px 5px 20px; 
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

export default ImpactRiskFactorDetails
