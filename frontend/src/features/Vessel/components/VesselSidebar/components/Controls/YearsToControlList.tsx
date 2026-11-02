import {
  SidebarHeader,
  SidebarList,
  SidebarZone
} from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import { customDayjs } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { YearControls } from './YearControls'

import type { Inquiry } from '@features/Inquiry/Inquiry.types'
import type { MissionAction } from '@features/Mission/missionAction.types'

type YearsToControlListProps = {
  controlsFromDate: string
  yearsToControls: Record<number, MissionAction.MissionAction[]>
  yearsToInquiries: Record<number, Inquiry.Inquiry[]>
}

export function YearsToControlList({ controlsFromDate, yearsToControls, yearsToInquiries }: YearsToControlListProps) {
  const sortedYears = [...new Set([...Object.keys(yearsToControls), ...Object.keys(yearsToInquiries)])]
    .sort((a, b) => Number(b) - Number(a))
    .map(value => Number(value))

  return (
    <SidebarZone>
      <SidebarHeader>Historique des contrôles</SidebarHeader>
      {sortedYears.length ? (
        <SidebarList data-cy="vessel-control-years">
          {sortedYears.map(year => (
            <YearControls
              key={year}
              year={year}
              yearControls={yearsToControls[year] ?? []}
              yearInquiries={yearsToInquiries[year] ?? []}
            />
          ))}
        </SidebarList>
      ) : (
        <NoControls>Aucun contrôle {`depuis ${customDayjs(controlsFromDate).get('year')}`}</NoControls>
      )}
    </SidebarZone>
  )
}

const NoControls = styled.div`
  text-align: center;
  padding: 10px 0 10px 0;
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  width: 100%;
`
