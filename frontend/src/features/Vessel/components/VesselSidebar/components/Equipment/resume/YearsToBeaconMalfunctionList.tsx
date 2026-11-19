import {
  SidebarHeader,
  SidebarList,
  SidebarZone
} from '@features/Vessel/components/VesselSidebar/components/common/common.style'
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
      <SidebarHeader>Historique des avaries VMS</SidebarHeader>
      {yearsToBeaconMalfunctions && Object.keys(yearsToBeaconMalfunctions)?.length ? (
        <SidebarList data-cy="vessel-beacon-malfunctions-history">
          {sortedYears.map(year => (
            <YearBeaconMalfunctions
              key={year}
              setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
              year={year}
              yearBeaconMalfunctions={yearsToBeaconMalfunctions[year] ?? []}
            />
          ))}
        </SidebarList>
      ) : (
        <NoBeaconMalfunction>
          Aucune avarie {`depuis ${vesselBeaconMalfunctionsFromDate.getUTCFullYear() + 1}`}
        </NoBeaconMalfunction>
      )}
    </SidebarZone>
  )
}

const NoBeaconMalfunction = styled.div`
  color: ${THEME.color.gunMetal};
  font-size: 13px;
  padding: 10px 0 10px 0;
  text-align: center;
  width: 100%;
`
