import React from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { Title, Zone } from '../common_styles/common.style'
import YearControls from './YearControls'

function YearsToControlList(props) {
  const {
    /** @type {Object.<string, VesselControl[]>} yearsToControls */
    controlsFromDate,
    yearsToControls
  } = props

  return (
    <Zone>
      <Title> Historique des contrôles </Title>
      {yearsToControls && Object.keys(yearsToControls) && Object.keys(yearsToControls).length ? (
        <List>
          {Object.keys(yearsToControls)
            .sort((a, b) => b - a)
            .map((year, index) => <YearControls
                  key={year + index}
                  year={year}
                  yearControls={yearsToControls[year]}
                  isLastItem={yearsToControls[year].length === index + 1}
                />)
            })}
        </List>
      ) : (
        <NoControls>Aucun contrôle {controlsFromDate && `depuis ${controlsFromDate.getUTCFullYear() + 1}`}</NoControls>
      )}
    </Zone>
  )
}

const List = styled.ul`
  margin: 0;
  padding: 0;
  width: 100%;
`

const NoControls = styled.div`
  text-align: center;
  padding: 10px 0 10px 0;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  width: 100%;
`

export default YearsToControlList
