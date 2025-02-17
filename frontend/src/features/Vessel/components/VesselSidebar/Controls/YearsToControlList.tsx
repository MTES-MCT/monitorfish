import { customDayjs } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { YearControls } from './YearControls'
import { COLORS } from '../../../../../constants/constants'
import { SidebarHeader, SidebarZone } from '../common_styles/common.style'

import type { MissionAction } from '../../../../Mission/missionAction.types'

type YearsToControlListProps = {
  controlsFromDate: string
  yearsToControls: Record<number, MissionAction.MissionAction[]>
}
export function YearsToControlList({ controlsFromDate, yearsToControls }: YearsToControlListProps) {
  const sortedYears = Object.keys(yearsToControls)
    .sort((a, b) => Number(b) - Number(a))
    .map(value => Number(value))

  return (
    <SidebarZone>
      <SidebarHeader>Historique des contrôles</SidebarHeader>
      {yearsToControls && Object.keys(yearsToControls) && Object.keys(yearsToControls).length ? (
        <List data-cy="vessel-control-years">
          {sortedYears.map(year => (
            <YearControls key={year} year={year} yearControls={yearsToControls[year] ?? []} />
          ))}
        </List>
      ) : (
        <NoControls>Aucun contrôle {`depuis ${customDayjs(controlsFromDate).get('year')}`}</NoControls>
      )}
    </SidebarZone>
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
