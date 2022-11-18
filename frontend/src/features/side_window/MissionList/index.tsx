import { useMemo, useRef } from 'react'
import { FlexboxGrid } from 'rsuite'
import styled from 'styled-components'

// import { useAppDispatch } from '../../../hooks/useAppDispatch'
// import { useAppSelector } from '../../../hooks/useAppSelector'
import { useForceUpdate } from '../../../hooks/useForceUpdate'
import { useTable } from '../../../hooks/useTable'
import { CardTable } from '../../../ui/card-table/CardTable'
import { CardTableBody } from '../../../ui/card-table/CardTableBody'
import { CardTableFilters } from '../../../ui/card-table/CardTableFilters'
import { CardTableRow } from '../../../ui/card-table/CardTableRow'
import { EmptyCardTable } from '../../../ui/card-table/EmptyCardTable'
import { FilterTableInput } from '../../../ui/card-table/FilterTableInput'
import { dayjs } from '../../../utils/dayjs'
import { DUMMY_MISSIONS, MISSION_LIST_TABLE_OPTIONS } from './constants'

import type { Mission } from '../../../domain/types/mission'
import type { MutableRefObject } from 'react'

export function MissionList() {
  const searchInputRef = useRef() as MutableRefObject<HTMLInputElement>
  // const dispatch = useAppDispatch()
  // const { currentMissions } = useAppSelector(state => state.missions)
  const currentMissions = DUMMY_MISSIONS
  const { forceDebouncedUpdate } = useForceUpdate()

  const baseUrl = useMemo(() => window.location.origin, [])

  const { renderTableHead, tableData } = useTable<Mission>(
    currentMissions,
    MISSION_LIST_TABLE_OPTIONS,
    searchInputRef.current?.value
  )

  return (
    <Wrapper>
      <CardTableFilters>
        <FilterTableInput
          ref={searchInputRef}
          baseUrl={baseUrl}
          data-cy="side-window-reporting-search"
          onChange={forceDebouncedUpdate}
          placeholder="Rechercher une mission"
          type="text"
        />
      </CardTableFilters>

      <CardTable
        $hasScroll={tableData.length > 9}
        data-cy="side-window-reporting-list"
        style={{ flexGrow: 1, marginTop: 10 }}
      >
        {renderTableHead()}

        <CardTableBody>
          {tableData.map((mission, index) => (
            <CardTableRow key={mission.id} data-cy="side-window-current-reportings" index={index + 1}>
              <FlexboxGrid>
                <Cell fixedWidth={7}>{dayjs(mission.item.startDate).format('D MMM YY, HH:MM')}</Cell>
                <Cell fixedWidth={7}>{dayjs(mission.item.endDate).format('D MMM YY, HH:MM')}</Cell>
                <Cell fixedWidth={10}>{mission.item.unit}</Cell>
                <Cell fixedWidth={5}>{mission.item.type}</Cell>
                <Cell fixedWidth={5}>{mission.item.seaFront}</Cell>
                <Cell fixedWidth={10}>{mission.item.themes.join(', ')}</Cell>
                <Cell fixedWidth={2}>{mission.item.inspectionsCount}</Cell>
                <Cell fixedWidth={5}>{mission.item.status}</Cell>
                <Cell fixedWidth={5}>{mission.item.alert}</Cell>
                <Cell fixedWidth={2}>
                  <button onClick={() => undefined} type="button">
                    <img
                      alt="Voir sur la carte"
                      src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
                      title="Voir sur la carte"
                    />
                  </button>
                </Cell>
                <Cell fixedWidth={2}>
                  <button onClick={() => undefined} type="button">
                    <img alt="Editer la mission" src={`${baseUrl}/Bouton_edition.png`} title="Editer la mission" />
                  </button>
                </Cell>
              </FlexboxGrid>
            </CardTableRow>
          ))}
        </CardTableBody>

        {!tableData.length && <EmptyCardTable>Aucun signalement</EmptyCardTable>}
      </CardTable>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  padding: 20px 30px 40px 0;
  width: 100%;
`

const Cell = styled(FlexboxGrid.Item)<{
  fixedWidth: number
}>`
  padding: 0 10px;
  width: ${p => p.fixedWidth}rem;
`
