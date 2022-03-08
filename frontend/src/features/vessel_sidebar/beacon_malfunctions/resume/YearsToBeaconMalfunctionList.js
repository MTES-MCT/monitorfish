import React from 'react'
import styled from 'styled-components'
import YearBeaconMalfunctions from './YearBeaconMalfunctions'
import { COLORS } from '../../../../constants/constants'

const YearsToBeaconMalfunctionList = props => {
  const {
    /** @type {Object.<string, BeaconStatusWithDetails[]>} */
    yearsToBeaconMalfunctions,
    /** @type {Date} */
    vesselBeaconMalfunctionsFromDate
  } = props

  return <Zone>
    <Title>Historique des avaries VMS</Title>
    {
      yearsToBeaconMalfunctions && Object.keys(yearsToBeaconMalfunctions)?.length
        ? <List data-cy={'vessel-beacon-malfunctions-history'}>
          {
            Object.keys(yearsToBeaconMalfunctions)
              .sort((a, b) => b - a)
              .map((year, index) => {
                return <YearBeaconMalfunctions
                  key={year + index}
                  year={year}
                  yearBeaconMalfunctions={yearsToBeaconMalfunctions[year]}
                  isLastItem={yearsToBeaconMalfunctions[year].length === index + 1}
                />
              })
          }
        </List>
        : <NoBeaconMalfunction>
          Aucune avarie {vesselBeaconMalfunctionsFromDate && `depuis ${vesselBeaconMalfunctionsFromDate.getUTCFullYear() + 1}`}
        </NoBeaconMalfunction>
    }</Zone>
}

const List = styled.ul`
  margin: 0;
  padding: 0;
  width: 100%;
`

const NoBeaconMalfunction = styled.div`
  text-align: center;
  padding: 10px 0 10px 0;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  width: 100%
`

const Zone = styled.div`
  margin: 10px 5px 0 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.background};
`

const Title = styled.div`
  color: ${COLORS.slateGray};
  background: ${COLORS.lightGray};
  padding: 8.5px 10px 8px 20px;
  font-size: 0.8rem;
  flex-shrink: 0;
  flex-grow: 2;
  display: flex;
  width: 400px;
  font-size: 13px;
  font-weight: 500;
`

export default YearsToBeaconMalfunctionList
