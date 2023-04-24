import { Accent, Button, Icon, IconButton, Size } from '@mtes-mct/monitor-ui'
import { noop } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { MISSION_LIST_SUB_MENU_OPTIONS, MISSION_LIST_TABLE_OPTIONS } from './constants'
import { FilterBar } from './FilterBar'
import { getSeaFrontFilterFunction, mapFilterValuesToFilterFunctions, renderStatus } from './utils'
import { useGetMissionsQuery } from '../../../api/mission'
import { SEA_FRONT_GROUP_SEA_FRONTS, SeaFront } from '../../../constants'
import { missionActions } from '../../../domain/actions'
import { useGetMissionsWithActions } from '../../../domain/entities/mission/hooks/useGetMissionsWithActions'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { useTable } from '../../../hooks/useTable'
import { EmptyCardTable } from '../../../ui/card-table/EmptyCardTable'
import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'
import { SideWindowMenuKey } from '../constants'
import { SubMenu } from '../SubMenu'

import type { Mission, MissionWithActions } from '../../../domain/entities/mission/types'

export function MissionList() {
  const { fetchMissions, missionsWithActions } = useGetMissionsWithActions()
  const { mission } = useMainAppSelector(store => store)

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)

  const getMissionsApiQuery = useGetMissionsQuery(undefined)
  const dispatch = useMainAppDispatch()

  const filterBarFilterFunctions = useMemo(
    () => mapFilterValuesToFilterFunctions(mission.listFilterValues),
    [mission.listFilterValues]
  )
  const seaFrontGroupFilterFunction = useMemo(
    () => getSeaFrontFilterFunction(mission.listSeaFront),
    [mission.listSeaFront]
  )

  useEffect(() => {
    fetchMissions()
  }, [fetchMissions])

  const { renderTableHead, tableData } = useTable<MissionWithActions>(
    missionsWithActions,
    MISSION_LIST_TABLE_OPTIONS,
    [seaFrontGroupFilterFunction, ...filterBarFilterFunctions],
    searchQuery
  )

  const countMissionsForSeaFrontGroup = useCallback(
    (seaFrontGroup: SeaFront): number =>
      missionsWithActions.filter(({ facade }) =>
        facade && SEA_FRONT_GROUP_SEA_FRONTS[seaFrontGroup]
          ? SEA_FRONT_GROUP_SEA_FRONTS[seaFrontGroup].includes(facade as any)
          : true
      ).length,
    [missionsWithActions]
  )

  const goToMissionForm = useCallback(
    async (missionId?: Mission.Mission['id']) => {
      if (missionId) {
        // TODO Replace that with the virtual router route once it's integrated.
        dispatch(missionActions.setDraftId(missionId))
      } else {
        dispatch(missionActions.unsetDraft())
      }

      dispatch(openSideWindowTab(SideWindowMenuKey.MISSION_FORM))
    },
    [dispatch]
  )

  const handleSubMenuChange = useCallback(
    (nextSeaFrontGroup: SeaFront) => {
      dispatch(missionActions.setListSeaFront(nextSeaFrontGroup))
    },
    [dispatch]
  )

  return (
    <>
      <SubMenu
        counter={countMissionsForSeaFrontGroup}
        onChange={handleSubMenuChange}
        options={MISSION_LIST_SUB_MENU_OPTIONS}
        value={mission.listSeaFront}
      />

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
          <FilterBar onQueryChange={setSearchQuery} />

          {getMissionsApiQuery.isLoading && <p>Chargement en cours...</p>}
          {getMissionsApiQuery.error && <pre>{JSON.stringify(getMissionsApiQuery.error)}</pre>}
          {!getMissionsApiQuery.isLoading && !getMissionsApiQuery.error && (
            <>
              <div>{`${tableData.length ? tableData.length : 'Aucune'} mission${tableData.length > 1 ? 's' : ''}`}</div>
              <Table>
                {renderTableHead()}

                <TableBody>
                  {tableData.map(augmentedMission => (
                    <TableBodyRow key={augmentedMission.id} data-id={augmentedMission.id}>
                      <TableBodyCell $fixedWidth={136}>{augmentedMission.$labelled.startDateTimeUtc}</TableBodyCell>
                      <TableBodyCell $fixedWidth={136}>{augmentedMission.$labelled.endDateTimeUtc}</TableBodyCell>
                      <TableBodyCell $fixedWidth={80}>{augmentedMission.$labelled.missionTypes}</TableBodyCell>
                      <TableBodyCell $fixedWidth={80}>{augmentedMission.$labelled.missionSource}</TableBodyCell>
                      <TableBodyCell $fixedWidth={160} title={augmentedMission.$labelled.controlUnits}>
                        {augmentedMission.$labelled.controlUnits}
                      </TableBodyCell>
                      <TableBodyCell title={augmentedMission.$labelled.inspectedVessels}>
                        {augmentedMission.$labelled.inspectedVessels}
                      </TableBodyCell>
                      <TableBodyCell $fixedWidth={128}>{augmentedMission.$labelled.inspectionsCount}</TableBodyCell>
                      <TableBodyCell $fixedWidth={128}>
                        {renderStatus(augmentedMission.$labelled.status as Mission.MissionStatus)}
                      </TableBodyCell>
                      <TableBodyCell
                        $fixedWidth={48}
                        style={{
                          padding: '8px 12px',
                          textAlign: 'center'
                        }}
                      >
                        <IconButton
                          accent={Accent.TERTIARY}
                          Icon={Icon.ViewOnMap}
                          onClick={noop}
                          size={Size.SMALL}
                          title="Voir sur la carte"
                        />
                      </TableBodyCell>
                      <TableBodyCell
                        $fixedWidth={48}
                        style={{
                          padding: '8px 12px',
                          textAlign: 'center'
                        }}
                      >
                        <IconButton
                          accent={Accent.TERTIARY}
                          Icon={Icon.Edit}
                          onClick={() => goToMissionForm(augmentedMission.id)}
                          size={Size.SMALL}
                          title="Éditer la mission"
                        />
                      </TableBodyCell>
                    </TableBodyRow>
                  ))}
                </TableBody>

                {!tableData.length && <EmptyCardTable>Aucune mission</EmptyCardTable>}
              </Table>
            </>
          )}
        </Body>
      </Wrapper>
    </>
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

const Table = styled.div.attrs(() => ({
  className: 'Table'
}))`
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

const TableBody = styled.div.attrs(() => ({
  className: 'TableBody'
}))`
  color: ${p => p.theme.color.gunMetal};
  display: flex;
  flex-direction: column;
  max-height: 410px;
  overflow-y: auto;

  > div {
    > div:first-child {
      border-left: solid 1px ${p => p.theme.color.lightGray};
    }
  }
`

const TableBodyRow = styled.div.attrs(() => ({
  className: 'TableBodyRow'
}))`
  background-color: white;
  display: flex;

  :hover {
    background-color: ${p => p.theme.color.gainsboro};
  }
`

const TableBodyCell = styled.div.attrs(() => ({
  className: 'TableBodyCell'
}))<{
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
