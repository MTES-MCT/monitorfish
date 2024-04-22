import {
  ALL_SEA_FRONT_GROUP,
  SEA_FRONT_GROUP_SEA_FRONTS,
  SeaFrontGroup,
  type AllSeaFrontGroup
} from '@constants/seaFront'
import { CompletionStatusLabel } from '@features/Mission/components/MissionList/CompletionStatusLabel'
import { MissionStatusLabel } from '@features/Mission/components/MissionList/MissionStatusLabel'
import { MissionAction } from '@features/Mission/missionAction.types'
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
import { fitToExtent } from '../../../../domain/shared_slices/Map'
import { EmptyCardTable } from '../../../../ui/card-table/EmptyCardTable'
import { NoRsuiteOverrideWrapper } from '../../../../ui/NoRsuiteOverrideWrapper'
import { ExportActivityReportsDialog } from '../../../ActivityReport/components/ExportActivityReportsDialog'
import { SubMenu } from '../../../SideWindow/SubMenu'
import { Mission } from '../../mission.types'
import { addMission } from '../../useCases/addMission'
import { editMission } from '../../useCases/editMission'

import type { GeoJSON as GeoJSONType } from '../../../../domain/types/GeoJSON'

import FrontCompletionStatus = MissionAction.FrontCompletionStatus

export function MissionList() {
  const listSeaFrontGroup = useMainAppSelector(store => store.missionList.listSeaFrontGroup)

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [isExportActivityReportsModalOpen, setIsExportActivityReportsModalOpen] = useState<boolean | undefined>(
    undefined
  )

  const dispatch = useMainAppDispatch()

  const { isError, isLoading, missions, missionsSeaFrontFiltered } = useGetFilteredMissionsQuery()

  const { renderTableHead, tableData } = useTable<Mission.MissionWithActions>(
    missionsSeaFrontFiltered,
    MISSION_LIST_TABLE_OPTIONS,
    [],
    searchQuery
  )

  const countMissionsForSeaFrontGroup = useCallback(
    (seaFrontGroup: SeaFrontGroup | AllSeaFrontGroup): number =>
      missions.filter(({ facade }) => {
        if (seaFrontGroup === ALL_SEA_FRONT_GROUP) {
          return true
        }

        return facade && SEA_FRONT_GROUP_SEA_FRONTS[seaFrontGroup]
          ? SEA_FRONT_GROUP_SEA_FRONTS[seaFrontGroup].includes(facade as any)
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
    (nextSeaFrontGroup: SeaFrontGroup | AllSeaFrontGroup) => {
      dispatch(missionListActions.setListSeaFront(nextSeaFrontGroup))
    },
    [dispatch]
  )

  const handleZoomToMission = (geometry: GeoJSONType.MultiPolygon | undefined) => {
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
        counter={countMissionsForSeaFrontGroup}
        onChange={handleSubMenuChange}
        options={MISSION_LIST_SUB_MENU_OPTIONS}
        value={listSeaFrontGroup}
        width={127}
      />

      <Wrapper>
        <Header>
          <HeaderTitle>
            {listSeaFrontGroup === ALL_SEA_FRONT_GROUP && <>Toutes les missions</>}
            {listSeaFrontGroup !== ALL_SEA_FRONT_GROUP && <>Missions en {SUB_MENU_LABEL[listSeaFrontGroup]}</>}
          </HeaderTitle>
          <HeaderButtonGroup>
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
          </HeaderButtonGroup>
        </Header>

        <Body>
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
        </Body>
      </Wrapper>
      {isExportActivityReportsModalOpen && (
        <ExportActivityReportsDialog onExit={() => setIsExportActivityReportsModalOpen(false)} />
      )}
    </>
  )
}

const Wrapper = styled(NoRsuiteOverrideWrapper)`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  width: 100%;
  overflow-y: auto;
`

const Header = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  border-bottom: solid 2px ${p => p.theme.color.gainsboro};
  display: flex;
  min-height: 80px;
  justify-content: space-between;
  padding: 0 40px 0 40px;
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
  padding: 40px;
`

const Table = styled.div.attrs(() => ({
  className: 'Table'
}))`
  align-self: flex-start;
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
  max-height: 650px;
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
