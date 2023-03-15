import { Button, getLocalizedDayjs, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { noop } from 'lodash'
import { pipe } from 'ramda'
import { useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { MISSION_LIST_TABLE_OPTIONS } from './constants'
import { FilterBar } from './FilterBar'
import { useGetMissionsQuery } from '../../../api/mission'
import { missionActions } from '../../../domain/actions'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useTable } from '../../../hooks/useTable'
import { EmptyCardTable } from '../../../ui/card-table/EmptyCardTable'
import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'
import { SideWindowMenuKey } from '../constants'

import type { MissionFilter } from './types'
import type { Mission } from '../../../domain/types/mission'
import type { MutableRefObject } from 'react'

export function MissionList() {
  const searchInputRef = useRef() as MutableRefObject<HTMLInputElement>

  const [filters, setFilters] = useState<MissionFilter[]>([])

  const getMissionsApiQuery = useGetMissionsQuery(undefined)
  const dispatch = useMainAppDispatch()

  const { renderTableHead, tableData } = useTable<Mission.Mission>(
    getMissionsApiQuery.data,
    MISSION_LIST_TABLE_OPTIONS,
    searchInputRef.current?.value
  )

  const filteredMissions = useMemo(
    () => (filters.length ? (pipe as (...args: MissionFilter[]) => MissionFilter)(...filters)(tableData) : tableData),
    [filters, tableData]
  )

  const goToMissionForm = useCallback(
    async (missionId?: Mission.Mission['id']) => {
      if (missionId) {
        dispatch(missionActions.setDraftId(missionId))
      } else {
        dispatch(missionActions.initializeDraft())
      }

      dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_FORM))
    },
    [dispatch]
  )

  return (
    <Wrapper>
      <Header>
        <HeaderTitle>Missions et contrôles</HeaderTitle>
        <HeaderButtonGroup>
          <Button Icon={Icon.Plus} onClick={() => goToMissionForm()}>
            Ajouter une nouvelle mission
          </Button>
        </HeaderButtonGroup>
      </Header>

      <Body>
        <FilterBar missions={tableData} onChange={setFilters} />

        {getMissionsApiQuery.isLoading && <p>Chargement en cours...</p>}
        {getMissionsApiQuery.error && <pre>{JSON.stringify(getMissionsApiQuery.error)}</pre>}
        {!getMissionsApiQuery.isLoading && !getMissionsApiQuery.error && (
          <>
            <div>{`${filteredMissions.length ? filteredMissions.length : 'Aucune'} mission${
              filteredMissions.length > 1 ? 's' : ''
            }`}</div>
            <Table data-cy="side-window-reporting-list">
              {renderTableHead()}

              <TableBody>
                {filteredMissions.map(mission => (
                  <TableBodyRow key={mission.id} data-cy="side-window-current-reportings">
                    <TableBodyCell $fixedWidth={144}>
                      {getLocalizedDayjs(mission.startDateTimeUtc).format('D MMM YY, HH:MM')}
                    </TableBodyCell>
                    <TableBodyCell $fixedWidth={144}>
                      {mission.endDateTimeUtc
                        ? getLocalizedDayjs(mission.endDateTimeUtc).format('D MMM YY, HH:MM')
                        : '-'}
                    </TableBodyCell>
                    <TableBodyCell>
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
                        onClick={() => goToMissionForm(mission.id)}
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

const Wrapper = styled(NoRsuiteOverrideWrapper)`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  width: 100%;
`

const Header = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  border-bottom: solid 2px ${p => p.theme.color.gainsboro};
  display: flex;
  min-height: 80px;
  justify-content: space-between;
  padding: 0 32px 0 48px;
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
    margin-left: 16px;
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px;
`

// TODO Integrate that into the UI with a clean code and design following the XD.
// https://xd.adobe.com/view/973ae2b4-ecd1-419f-b092-8545e0d8ce57-c269/screen/a2a88bd8-4965-4ac3-ad20-2da95408c36a/

const Table = styled.div`
  box-sizing: border-box;
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
  $fixedWidth?: number
}>`
  border-bottom: solid 1px ${p => p.theme.color.lightGray};
  border-right: solid 1px ${p => p.theme.color.lightGray};
  flex-grow: ${p => (p.$fixedWidth ? 0 : 1)};
  max-width: ${p => (p.$fixedWidth ? `${p.$fixedWidth}px` : 'auto')};
  min-width: ${p => (p.$fixedWidth ? `${p.$fixedWidth}px` : 'auto')};
  overflow: hidden;
  padding: 9px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
`
