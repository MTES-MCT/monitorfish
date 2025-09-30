import { ALL_SEAFRONT_GROUP, type AllSeafrontGroup, SEAFRONT_GROUP_SEAFRONTS, SeafrontGroup } from '@constants/seafront'
import { CompletionStatusLabel } from '@features/Mission/components/MissionList/CompletionStatusLabel'
import { MissionStatusLabel } from '@features/Mission/components/MissionList/MissionStatusLabel'
import { MissionAction } from '@features/Mission/missionAction.types'
import { PageWithUnderlineTitle } from '@features/SideWindow/components/PageWithUnderlineTitle'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useTable } from '@hooks/useTable'
import { Accent, Button, Icon, IconButton, OPENLAYERS_PROJECTION } from '@mtes-mct/monitor-ui'
import { GeoJSON } from 'ol/format'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { MISSION_LIST_SUB_MENU_OPTIONS, MISSION_LIST_TABLE_OPTIONS, SUB_MENU_LABEL } from './constants'
import { FilterBar } from './FilterBar'
import { useGetFilteredMissionsQuery } from './hooks/useGetFilteredMissionsQuery'
import { missionListActions } from './slice'
import { EmptyCardTable } from '../../../../ui/card-table/EmptyCardTable'
import { ExportActivityReportsDialog } from '../../../ActivityReport/components/ExportActivityReportsDialog'
import { fitToExtent } from '../../../Map/slice'
import { SubMenu } from '../../../SideWindow/SubMenu'
import { Mission } from '../../mission.types'
import { addMission } from '../../useCases/addMission'
import { editMission } from '../../useCases/editMission'

import type { MultiPolygon } from 'geojson'

import FrontCompletionStatus = MissionAction.FrontCompletionStatus

export function MissionList() {
  const listSeafrontGroup = useMainAppSelector(store => store.missionList.listSeafrontGroup)

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [isExportActivityReportsModalOpen, setIsExportActivityReportsModalOpen] = useState<boolean | undefined>(
    undefined
  )

  const dispatch = useMainAppDispatch()

  const { isError, isLoading, missions, missionsSeafrontFiltered } = useGetFilteredMissionsQuery()

  const { renderTableHead, tableData } = useTable<Mission.MissionWithActions>(
    missionsSeafrontFiltered,
    MISSION_LIST_TABLE_OPTIONS,
    [],
    searchQuery
  )

  const countMissionsForSeafrontGroup = useCallback(
    (seafrontGroup: SeafrontGroup | AllSeafrontGroup): number =>
      missions.filter(({ facade }) => {
        if (seafrontGroup === ALL_SEAFRONT_GROUP) {
          return true
        }

        return facade && SEAFRONT_GROUP_SEAFRONTS[seafrontGroup]
          ? SEAFRONT_GROUP_SEAFRONTS[seafrontGroup].includes(facade as any)
          : false
      }).length,
    [missions]
  )

  const goToMissionForm = useCallback(
    async (missionId?: Mission.Mission['id']) => {
      dispatch(missionId ? editMission(missionId) : addMission())
    },
    [dispatch]
  )

  const handleSubMenuChange = useCallback(
    (nextSeafrontGroup: SeafrontGroup | AllSeafrontGroup) => {
      dispatch(missionListActions.setListSeafront(nextSeafrontGroup))
    },
    [dispatch]
  )

  const handleZoomToMission = (geometry: MultiPolygon | undefined) => {
    if (!geometry) {
      return
    }

    const feature = new GeoJSON({
      featureProjection: OPENLAYERS_PROJECTION
    }).readFeature(geometry)

    const extent = feature?.getGeometry()?.getExtent()
    if (!extent) {
      return
    }

    dispatch(fitToExtent(extent))
  }

  return (
    <>
      <SubMenu
        counter={countMissionsForSeafrontGroup}
        onChange={handleSubMenuChange}
        options={MISSION_LIST_SUB_MENU_OPTIONS}
        value={listSeafrontGroup}
        width={127}
      />

      <PageWithUnderlineTitle.Wrapper>
        <PageWithUnderlineTitle.Header>
          <PageWithUnderlineTitle.HeaderTitle>
            {listSeafrontGroup === ALL_SEAFRONT_GROUP && <>Toutes les missions</>}
            {listSeafrontGroup !== ALL_SEAFRONT_GROUP && <>Missions en {SUB_MENU_LABEL[listSeafrontGroup]}</>}
          </PageWithUnderlineTitle.HeaderTitle>
          <PageWithUnderlineTitle.HeaderButtonGroup>
            <Button Icon={Icon.Plus} onClick={() => goToMissionForm()}>
              Ouvrir une nouvelle mission
            </Button>
            <Button
              accent={Accent.TERTIARY}
              Icon={Icon.Download}
              onClick={() => setIsExportActivityReportsModalOpen(true)}
            >
              Exporter les ACT-REP
            </Button>
          </PageWithUnderlineTitle.HeaderButtonGroup>
        </PageWithUnderlineTitle.Header>

        <PageWithUnderlineTitle.Body>
          <FilterBar onQueryChange={setSearchQuery} searchQuery={searchQuery} />

          {isLoading && <p>Chargement en cours...</p>}
          {isError && <pre>La liste des missions n’a pas pu être récupérée.</pre>}
          {!isLoading && !isError && (
            <>
              <div>
                {!!tableData.length && (
                  <>
                    {tableData.length} mission{tableData.length > 1 ? 's' : ''}
                  </>
                )}
              </div>
              <Table>
                {renderTableHead()}

                <TableBody>
                  {tableData.map(augmentedMission => (
                    <TableBodyRow key={augmentedMission.id} data-id={augmentedMission.id}>
                      <TableBodyCell $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[0]?.fixedWidth}>
                        <span>{augmentedMission.$labelled.startDateTimeUtc}</span>
                      </TableBodyCell>
                      <TableBodyCell $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[1]?.fixedWidth}>
                        <span>{augmentedMission.$labelled.endDateTimeUtc}</span>
                      </TableBodyCell>
                      <TableBodyCell $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[2]?.fixedWidth}>
                        <span>{augmentedMission.$labelled.missionTypes}</span>
                      </TableBodyCell>
                      <TableBodyCell
                        $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[3]?.fixedWidth}
                        title={augmentedMission.$labelled.controlUnits}
                      >
                        <span>{augmentedMission.$labelled.controlUnits}</span>
                      </TableBodyCell>
                      <TableBodyCell
                        $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[4]?.fixedWidth}
                        title={augmentedMission.$labelled.inspectedVessels}
                      >
                        <span>{augmentedMission.$labelled.inspectedVessels}</span>
                      </TableBodyCell>
                      <TableBodyCell $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[5]?.fixedWidth}>
                        {augmentedMission.$labelled.inspectionsCount}
                      </TableBodyCell>
                      <TableBodyCell $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[6]?.fixedWidth}>
                        <MissionStatusLabel status={augmentedMission.$labelled.status as Mission.MissionStatus} />
                      </TableBodyCell>
                      <TableBodyCell $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[7]?.fixedWidth}>
                        <CompletionStatusLabel
                          completion={augmentedMission.$labelled.completion as FrontCompletionStatus | undefined}
                        />
                      </TableBodyCell>
                      <TableBodyCell
                        $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[8]?.fixedWidth}
                        style={{ padding: '4px 7px 4px 9px' }}
                      >
                        <IconButton
                          accent={Accent.TERTIARY}
                          disabled={!augmentedMission.geom}
                          Icon={Icon.ViewOnMap}
                          iconSize={20}
                          onClick={() => handleZoomToMission(augmentedMission.geom)}
                          title="Voir sur la carte"
                        />
                      </TableBodyCell>
                      <TableBodyCell
                        $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[9]?.fixedWidth}
                        style={{ padding: '4px 7px 4px 9px' }}
                      >
                        <IconButton
                          accent={Accent.TERTIARY}
                          Icon={Icon.Edit}
                          iconSize={20}
                          onClick={() => goToMissionForm(augmentedMission.id)}
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
        </PageWithUnderlineTitle.Body>
      </PageWithUnderlineTitle.Wrapper>
      {isExportActivityReportsModalOpen && (
        <ExportActivityReportsDialog onExit={() => setIsExportActivityReportsModalOpen(false)} />
      )}
    </>
  )
}

const Table = styled.table.attrs(() => ({
  className: 'Table'
}))`
  align-self: flex-start;
  box-sizing: border-box;
  font-size: 13px;
  margin-top: 10px;

  * {
    box-sizing: border-box;
    font-size: inherit;
  }
`

const TableBody = styled.tbody.attrs(() => ({
  className: 'TableBody'
}))`
  color: ${p => p.theme.color.gunMetal};
  display: flex;
  flex-direction: column;
  max-height: 650px;
  overflow-y: auto;

  td:first-child {
    border-left: solid 1px ${p => p.theme.color.lightGray};
  }
}
`

const TableBodyRow = styled.tr.attrs(() => ({
  className: 'TableBodyRow'
}))`
  background-color: white;
  display: flex;

  &:hover {
    background-color: ${p => p.theme.color.gainsboro};
  }
`

const TableBodyCell = styled.td.attrs(() => ({
  className: 'TableBodyCell'
}))<{
  $fixedWidth?: number | undefined
}>`
  align-items: center;
  border-bottom: solid 1px ${p => p.theme.color.lightGray};
  border-spacing: 6px 0px;
  border-left: none;
  border-right: solid 1px ${p => p.theme.color.lightGray};
  display: flex;
  flex-grow: ${p => (p.$fixedWidth ? 0 : 1)};
  max-width: ${p => (p.$fixedWidth ? `${p.$fixedWidth}px` : 'auto')};
  min-width: ${p => (p.$fixedWidth ? `${p.$fixedWidth}px` : 'auto')};
  padding: 9px 10px;

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
