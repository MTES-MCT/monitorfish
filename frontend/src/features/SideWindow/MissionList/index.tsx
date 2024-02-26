import { Accent, Button, Icon, IconButton, OPENLAYERS_PROJECTION } from '@mtes-mct/monitor-ui'
import { GeoJSON } from 'ol/format'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { MISSION_LIST_SUB_MENU_OPTIONS, MISSION_LIST_TABLE_OPTIONS } from './constants'
import { FilterBar } from './FilterBar'
import { hasSomeOngoingActions, renderStatus } from './utils'
import { SEA_FRONT_GROUP_SEA_FRONTS, SeaFrontGroup } from '../../../domain/entities/seaFront/constants'
import { fitToExtent } from '../../../domain/shared_slices/Map'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { useTable } from '../../../hooks/useTable'
import { EmptyCardTable } from '../../../ui/card-table/EmptyCardTable'
import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'
import { ExportActivityReportsDialog } from '../../ActivityReport/components/ExportActivityReportsDialog'
import { useGetFilteredMissionsQuery } from '../../Mission/components/MissionList/hooks/useGetFilteredMissionsQuery'
import { missionListActions } from '../../Mission/components/MissionList/slice'
import { addMission } from '../../Mission/useCases/addMission'
import { editMission } from '../../Mission/useCases/editMission'
import { SubMenu } from '../SubMenu'

import type { Mission, MissionWithActions } from '../../../domain/entities/mission/types'
import type { GeoJSON as GeoJSONType } from '../../../domain/types/GeoJSON'

export function MissionList() {
  const listSeaFront = useMainAppSelector(store => store.missionList.listSeaFront)

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)
  const [isExportActivityReportsModalOpen, setIsExportActivityReportsModalOpen] = useState<boolean | undefined>(
    undefined
  )

  const dispatch = useMainAppDispatch()

  const { isError, isLoading, missions, missionsSeaFrontFiltered } = useGetFilteredMissionsQuery()

  const { renderTableHead, tableData } = useTable<MissionWithActions>(
    missionsSeaFrontFiltered,
    MISSION_LIST_TABLE_OPTIONS,
    [],
    searchQuery
  )

  const countMissionsForSeaFrontGroup = useCallback(
    (seaFrontGroup: SeaFrontGroup): number =>
      missions.filter(({ facade }) => {
        if (seaFrontGroup === SeaFrontGroup.ALL) {
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
    (nextSeaFrontGroup: SeaFrontGroup) => {
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
        value={listSeaFront}
      />

      <Wrapper>
        <Header>
          <HeaderTitle>Missions et contrôles</HeaderTitle>
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
                  {tableData.map(augmentedMission => {
                    const hasSomeOngoingControls = hasSomeOngoingActions(augmentedMission)

                    return (
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
                        <TableBodyCell $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[3]?.fixedWidth}>
                          <span>{augmentedMission.$labelled.missionSource}</span>
                        </TableBodyCell>
                        <TableBodyCell
                          $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[4]?.fixedWidth}
                          title={augmentedMission.$labelled.controlUnits}
                        >
                          <span>{augmentedMission.$labelled.controlUnits}</span>
                        </TableBodyCell>
                        <TableBodyCell
                          $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[5]?.fixedWidth}
                          title={augmentedMission.$labelled.inspectedVessels}
                        >
                          <span>{augmentedMission.$labelled.inspectedVessels}</span>
                        </TableBodyCell>
                        <TableBodyCell
                          $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[6]?.fixedWidth}
                          $isControlNumberCell
                          title={hasSomeOngoingControls ? `Contrôle(s) en cours` : undefined}
                        >
                          <OngoingControlsVerticalBar $hasSomeOngoingControls={hasSomeOngoingControls}>
                            {augmentedMission.$labelled.inspectionsCount}
                          </OngoingControlsVerticalBar>
                        </TableBodyCell>
                        <TableBodyCell $fixedWidth={MISSION_LIST_TABLE_OPTIONS.columns[7]?.fixedWidth}>
                          <span>{renderStatus(augmentedMission.$labelled.status as Mission.MissionStatus)}</span>
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
                    )
                  })}
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

const OngoingControlsVerticalBar = styled.span<{
  $hasSomeOngoingControls: boolean | undefined
}>`
  display: inline-block;
  height: 32px;
  width: 100%;
  padding-left: 8px;
  padding-top: 6px;
  border-left: ${p => (p.$hasSomeOngoingControls ? `solid 4px ${p.theme.color.blueGray}` : 'solid 4px transparent')};
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
  $isControlNumberCell?: boolean | undefined
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
  padding: ${p => (p.$isControlNumberCell ? '4px 10px 4px 4px' : '9px 10px')};

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
