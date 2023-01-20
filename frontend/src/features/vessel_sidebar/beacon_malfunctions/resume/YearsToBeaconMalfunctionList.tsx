import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { YearBeaconMalfunctions } from './YearBeaconMalfunctions'

import type { BeaconMalfunctionResumeAndDetails } from '../../../../domain/entities/beaconMalfunction/types'

type YearsToBeaconMalfunctionListProps = {
  setIsCurrentBeaconMalfunctionDetails: (boolean) => void
  vesselBeaconMalfunctionsFromDate: Date
  yearsToBeaconMalfunctions: Record<number, BeaconMalfunctionResumeAndDetails[]>
}
export function YearsToBeaconMalfunctionList({
  setIsCurrentBeaconMalfunctionDetails,
  vesselBeaconMalfunctionsFromDate,
  yearsToBeaconMalfunctions
}: YearsToBeaconMalfunctionListProps) {
  const sortedYears = useMemo(
    () =>
      Object.keys(yearsToBeaconMalfunctions)
        .sort((a, b) => Number(b) - Number(a))
        .map(value => Number(value)),
    [yearsToBeaconMalfunctions]
  )

  return (
    <Zone>
      <Title>Historique des avaries VMS</Title>
      {yearsToBeaconMalfunctions && Object.keys(yearsToBeaconMalfunctions)?.length ? (
        <List data-cy="vessel-beacon-malfunctions-history">
          {sortedYears.map(year => (
            <YearBeaconMalfunctions
              key={year}
              setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
              year={year}
              yearBeaconMalfunctions={yearsToBeaconMalfunctions[year] || []}
            />
          ))}
        </List>
      ) : (
        <NoBeaconMalfunction>
          Aucune avarie {`depuis ${vesselBeaconMalfunctionsFromDate.getUTCFullYear() + 1}`}
        </NoBeaconMalfunction>
      )}
    </Zone>
  )
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
  width: 100%;
`

const Zone = styled.div`
  margin: 10px 5px 0 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${COLORS.white};
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
