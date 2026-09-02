import { ListItem, SidebarZone } from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { YearBeaconMalfunctions } from './YearBeaconMalfunctions'

import type { BeaconMalfunctionResumeAndDetails } from '@features/BeaconMalfunction/types'

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
  const sortedYears = Object.keys(yearsToBeaconMalfunctions)
    .sort((a, b) => Number(b) - Number(a))
    .map(value => Number(value))

  return (
    <SidebarZone>
      <Title>Historique des avaries VMS</Title>
      {yearsToBeaconMalfunctions && Object.keys(yearsToBeaconMalfunctions)?.length ? (
        <List data-cy="vessel-beacon-malfunctions-history">
          {sortedYears.map(year => (
            <ListItem key={year}>
              <YearBeaconMalfunctions
                setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
                year={year}
                yearBeaconMalfunctions={yearsToBeaconMalfunctions[year] ?? []}
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <NoBeaconMalfunction>
          Aucune avarie {`depuis ${vesselBeaconMalfunctionsFromDate.getUTCFullYear() + 1}`}
        </NoBeaconMalfunction>
      )}
    </SidebarZone>
  )
}

const List = styled.ul`
  margin: 0;
  padding: 0;
  width: 100%;
`

const NoBeaconMalfunction = styled.div`
  color: ${THEME.color.gunMetal};
  font-size: 13px;
  padding: 10px 0 10px 0;
  text-align: center;
  width: 100%;
`

const Title = styled.div`
  color: ${THEME.color.slateGray};
  background: ${THEME.color.lightGray};
  display: flex;
  flex-shrink: 0;
  flex-grow: 2;
  font-size: 13px;
  padding: 8.5px 10px 8px 20px;
  width: 400px;
  font-weight: 500;
`
