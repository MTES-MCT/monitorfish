import { useMemo } from 'react'
import styled from 'styled-components'

import { YearControls } from './YearControls'
import { COLORS } from '../../../../../constants/constants'
import { Header, Zone } from '../common_styles/common.style'

import type { Dayjs } from 'dayjs'
import type { MissionAction } from '../../../../Mission/missionAction.types'

type YearsToControlListProps = {
  controlsFromDate: Dayjs
  yearsToControls: Record<number, MissionAction.MissionAction[]>
}
export function YearsToControlList({ controlsFromDate, yearsToControls }: YearsToControlListProps) {
  const sortedYears = useMemo(
    () =>
      Object.keys(yearsToControls)
        .sort((a, b) => Number(b) - Number(a))
        .map(value => Number(value)),
    [yearsToControls]
  )

  return (
    <Zone>
      <Header>Historique des contrôles</Header>
      {yearsToControls && Object.keys(yearsToControls) && Object.keys(yearsToControls).length ? (
        <List data-cy="vessel-control-years">
          {sortedYears.map(year => (
            <YearControls key={year} year={year} yearControls={yearsToControls[year] ?? []} />
          ))}
        </List>
      ) : (
        <NoControls>Aucun contrôle {`depuis ${controlsFromDate.get('year')}`}</NoControls>
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
