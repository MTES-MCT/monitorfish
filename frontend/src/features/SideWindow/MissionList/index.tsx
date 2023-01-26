import { Button, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { noop } from 'lodash'
import { pipe } from 'ramda'
import { useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { MISSION_LIST_TABLE_OPTIONS } from './constants'
import { FilterBar } from './FilterBar'
import { missionApi } from '../../../api/mission'
import { missionActions } from '../../../domain/actions'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useTable } from '../../../hooks/useTable'
import { EmptyCardTable } from '../../../ui/card-table/EmptyCardTable'
import { dayjs } from '../../../utils/dayjs'
import { SideWindowMenuKey } from '../constants'

import type { MissionFilter } from './types'
import type { Mission } from '../../../domain/types/mission'
import type { MutableRefObject } from 'react'

export function MissionList() {
  const searchInputRef = useRef() as MutableRefObject<HTMLInputElement>
  const [filters, setFilters] = useState<MissionFilter[]>([])
  const missionApiQuery = missionApi.useGetManyQuery(undefined)
  const dispatch = useMainAppDispatch()

  const { renderTableHead, tableData } = useTable<Mission>(
    missionApiQuery.data,
    MISSION_LIST_TABLE_OPTIONS,
    searchInputRef.current?.value
  )

  const filteredMissions = useMemo(
    () => (filters.length ? (pipe as (...args: MissionFilter[]) => MissionFilter)(...filters)(tableData) : tableData),
    [filters, tableData]
  )

  return (
    <Wrapper>
      <Header>
        <HeaderTitle>Missions et contrôles</HeaderTitle>
        <HeaderButtonGroup>
          <Button Icon={Icon.Plus} onClick={() => dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_FORM))}>
            Ajouter une nouvelle mission
          </Button>
        </HeaderButtonGroup>
      </Header>

      <Body>
        <FilterBar missions={tableData} onChange={setFilters} />

        {missionApiQuery.isLoading && <p>Chargement en cours...</p>}
        {missionApiQuery.error && <pre>{JSON.stringify(missionApiQuery.error)}</pre>}
        {!missionApiQuery.isLoading && !missionApiQuery.error && (
          <>
            <div>{`${filteredMissions.length ? filteredMissions.length : 'Aucune'} mission${
              filteredMissions.length > 1 ? 's' : ''
            }`}</div>
            <Table data-cy="side-window-reporting-list">
              {renderTableHead()}

              <TableBody>
                {filteredMissions.map(mission => (
                  <TableBodyRow key={mission.id} data-cy="side-window-current-reportings">
                    <TableBodyCell $fixedWidth={112}>
                      {dayjs(mission.inputStartDateTimeUtc).format('D MMM YY, HH:MM')}
                    </TableBodyCell>
                    <TableBodyCell $fixedWidth={112}>
                      {dayjs(mission.inputEndDateTimeUtc).format('D MMM YY, HH:MM')}
                    </TableBodyCell>
                    <TableBodyCell $fixedWidth={160}>
                      {mission.controlUnits
                        ?.map(controlUnit => `${controlUnit.name} (${controlUnit.administration || '-'})`)
                        .join(', ')}
                    </TableBodyCell>
                    <TableBodyCell $fixedWidth={80}>{mission.missionType}</TableBodyCell>
                    <TableBodyCell $fixedWidth={80}>{mission.facade}</TableBodyCell>
                    {/* TODO Inspect that. */}
                    {/* <TableBodyCell $fixedWidth={160}>{mission.themes?.join(', ')}</TableBodyCell> */}
                    <TableBodyCell $fixedWidth={160}>THEMES</TableBodyCell>
                    {/* TODO Inspect that. */}
                    {/* <TableBodyCell $fixedWidth={48}>{mission.inspectionsCount}</TableBodyCell> */}
                    <TableBodyCell $fixedWidth={48}>0</TableBodyCell>
                    {/* TODO Inspect that. */}
                    {/* <TableBodyCell $fixedWidth={128}>{mission.status}</TableBodyCell> */}
                    <TableBodyCell $fixedWidth={128}>STATUS</TableBodyCell>
                    <TableBodyCell $fixedWidth={160}>ALERTE</TableBodyCell>
                    <TableBodyCell
                      $fixedWidth={48}
                      style={{
                        padding: '8px 12px',
                        textAlign: 'center'
                      }}
                    >
                      <IconButton Icon={Icon.ViewOnMap} onClick={noop} size={Size.SMALL} title="Voir sur la carte" />
                    </TableBodyCell>
                    <TableBodyCell
                      $fixedWidth={48}
                      style={{
                        padding: '8px 12px',
                        textAlign: 'center'
                      }}
                    >
                      <IconButton
                        Icon={Icon.Edit}
                        // TODO Move that into a useCallback.
                        onClick={() => {
                          dispatch(missionActions.setEditedMission(mission))
                          dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_FORM))
                        }}
                        size={Size.SMALL}
                        title="Éditer la mission"
                      />
                    </TableBodyCell>
                  </TableBodyRow>
                ))}
              </TableBody>

              {!tableData.length && <EmptyCardTable>Aucun signalement</EmptyCardTable>}
            </Table>
          </>
        )}
      </Body>
    </Wrapper>
  )
}

// TODO Check why there is a `box-sizing: revert` in index.css.
// TODO `line-height` should be 1.4 by default in html, body.
const Wrapper = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  margin-bottom: 20px;
  width: 100%;

  * {
    box-sizing: border-box;
    line-height: 1.4;
  }
`

const Header = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  border-bottom: solid 2px ${p => p.theme.color.gainsboro};
  display: flex;
  justify-content: space-between;
  padding: 1.875rem 2rem 1.875rem 3rem;
`

const HeaderTitle = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
`

const HeaderButtonGroup = styled.div`
  display: flex;

  > button:not(:first-child) {
    margin-left: 1rem;
  }
`

const Body = styled.div`
  padding: 2rem;
`

// TODO Integrate that into the UI with a clean code and design following the XD.
// https://xd.adobe.com/view/973ae2b4-ecd1-419f-b092-8545e0d8ce57-c269/screen/a2a88bd8-4965-4ac3-ad20-2da95408c36a/

const Table = styled.div`
  box-sizing: border-box;
  flex-grow: 1;
  font-size: 13px;
  margin-top: 10px;

  > div:first-child {
    background-color: ${p => p.theme.color.gainsboro};
  }

  * {
    box-sizing: border-box;
    font-size: inherit;
  }
`

const TableBody = styled.div`
  color: ${p => p.theme.color.gunMetal};
  display: flex;
  flex-direction: column;

  > div {
    > div:first-child {
      border-left: solid 1px ${p => p.theme.color.lightGray};
    }
  }
`

const TableBodyRow = styled.div`
  background-color: ${p => p.theme.color.cultured};
  display: flex;

  :hover {
    background-color: ${p => p.theme.color.gainsboro};
  }
`

const TableBodyCell = styled.div<{
  $fixedWidth: number
}>`
  border-bottom: solid 1px ${p => p.theme.color.lightGray};
  border-right: solid 1px ${p => p.theme.color.lightGray};
  overflow: hidden;
  padding: 9px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: ${p => p.$fixedWidth}px;
`
