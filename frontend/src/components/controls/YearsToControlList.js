import React from 'react'
import styled from 'styled-components'
import YearControls from './YearControls'
import { COLORS } from '../../constants/constants'
import { Zone, Title } from './Controls.style'

const YearsToControlList = props => {
  const {
    /** @type {Object.<string, VesselControl[]>} yearsToControls */
    yearsToControls,
    controlsFromDate
  } = props

  return <Zone>
  <Title> Historique des contrôles </Title>
  {
      yearsToControls && Object.keys(yearsToControls) && Object.keys(yearsToControls).length
        ? <List>
        {
          Object.keys(yearsToControls)
            .sort((a, b) => b - a)
            .map((year, index) => {
              return <YearControls
                  key={year + index}
                  year={year}
                  yearControls={yearsToControls[year]}
                  isLastItem={yearsToControls[year].length === index + 1}
                />
            })
        }
          </List>
        : <NoControls>
            Aucun contrôle {controlsFromDate && `depuis ${controlsFromDate.getUTCFullYear() + 1}`}
        </NoControls>
  }</Zone>
}

const List = styled.ul`
  margin: 0;
  padding: 0;
  width: 100%;
`

const NoControls = styled.div`
  text-align: center;
  padding: 10px 0 10px 0;
  color: ${COLORS.grayDarkerThree};
  font-size: 13px;
  width: 100%
`

export default YearsToControlList
