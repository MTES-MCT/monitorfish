import { Button } from '@mtes-mct/monitor-ui'
import { pipe } from 'ramda'
import { useMemo, useRef, useState } from 'react'
import { FlexboxGrid } from 'rsuite'
import styled from 'styled-components'

import { missionApi } from '../../../api/mission'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useTable } from '../../../hooks/useTable'
import { CardTable } from '../../../ui/card-table/CardTable'
import { CardTableBody } from '../../../ui/card-table/CardTableBody'
import { CardTableRow } from '../../../ui/card-table/CardTableRow'
import { EmptyCardTable } from '../../../ui/card-table/EmptyCardTable'
import { dayjs } from '../../../utils/dayjs'
import { SideWindowMenuKey } from '../constants'
import { MISSION_LIST_TABLE_OPTIONS } from './constants'
import { FilterBar } from './FilterBar'

import type { Mission } from '../../../domain/types/mission'
import type { MissionFilter } from './types'
import type { MutableRefObject } from 'react'

export function MissionList() {
  const searchInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const [filters, setFilters] = useState<MissionFilter[]>([])
  const { data: maybeMissions, error: apiError, isLoading } = missionApi.useGetAllQuery(undefined)
  const dispatch = useAppDispatch()

  const baseUrl = useMemo(() => window.location.origin, [])

  const { renderTableHead, tableData } = useTable<Mission>(
    maybeMissions,
    MISSION_LIST_TABLE_OPTIONS,
    searchInputRef.current?.value
  )

  const filteredMissions = useMemo(
    () => (filters.length ? (pipe as (...args: MissionFilter[]) => MissionFilter)(...filters)(tableData) : tableData),
    [filters, tableData]
  )

  return (
    <Wrapper>
      <div>
        <Button onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_FORM))}>Nouvelle mission</Button>
      </div>

      <FilterBar missions={tableData} onChange={setFilters} />

      {isLoading && <p>Chargement en cours...</p>}
      {apiError && <pre>{JSON.stringify(apiError)}</pre>}
      {!isLoading && !apiError && (
        <>
          <div>{`${filteredMissions.length ? filteredMissions.length : 'Aucune'} mission${
            filteredMissions.length > 1 ? 's' : ''
          }`}</div>
          <CardTable
            $hasScroll={filteredMissions.length > 9}
            data-cy="side-window-reporting-list"
            style={{ flexGrow: 1, marginTop: 10 }}
          >
            {renderTableHead()}

            <CardTableBody>
              {filteredMissions.map((mission, index) => (
                <CardTableRow key={mission.id} data-cy="side-window-current-reportings" index={index + 1}>
                  <FlexboxGrid>
                    <Cell $fixedWidth={7}>{dayjs(mission.startDate).format('D MMM YY, HH:MM')}</Cell>
                    <Cell $fixedWidth={7}>{dayjs(mission.endDate).format('D MMM YY, HH:MM')}</Cell>
                    <Cell $fixedWidth={10}>{mission.units}</Cell>
                    <Cell $fixedWidth={5}>{mission.type}</Cell>
                    <Cell $fixedWidth={5}>{mission.seaFront}</Cell>
                    <Cell $fixedWidth={10}>{mission.themes?.join(', ')}</Cell>
                    <Cell $fixedWidth={2}>{mission.inspectionsCount}</Cell>
                    <Cell $fixedWidth={5}>{mission.status}</Cell>
                    <Cell $fixedWidth={10}>{mission.alertType}</Cell>
                    <Cell $fixedWidth={2}>
                      <button onClick={() => undefined} type="button">
                        <img
                          alt="Voir sur la carte"
                          src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
                          title="Voir sur la carte"
                        />
                      </button>
                    </Cell>
                    <Cell $fixedWidth={2}>
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
        </>
      )}
    </Wrapper>
  )
}

// TODO Check why there is a `box-sizing: revert` in index.css.
const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  padding: 20px 30px 40px 0;
  width: 100%;

  * {
    box-sizing: border-box;
  }
`

const Cell = styled(FlexboxGrid.Item)<{
  $fixedWidth: number
}>`
  padding: 0 10px;
  width: ${p => p.$fixedWidth}rem;
`
