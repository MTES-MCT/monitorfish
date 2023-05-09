import { Accent, Button, Icon, IconButton, OPENLAYERS_PROJECTION, Size } from '@mtes-mct/monitor-ui'
import { GeoJSON } from 'ol/format'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { MISSION_LIST_SUB_MENU_OPTIONS, MISSION_LIST_TABLE_OPTIONS } from './constants'
import { FilterBar } from './FilterBar'
import { renderStatus } from './utils'
import { SEA_FRONT_GROUP_SEA_FRONTS, SeaFrontGroup, SeaFrontLabel } from '../../../constants'
import { missionActions } from '../../../domain/actions'
import { useGetFilteredMissionsQuery } from '../../../domain/entities/mission/hooks/useGetFilteredMissionsQuery'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { fitToExtent } from '../../../domain/shared_slices/Map'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { useTable } from '../../../hooks/useTable'
import { EmptyCardTable } from '../../../ui/card-table/EmptyCardTable'
import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'
import { SideWindowMenuKey } from '../constants'
import { SubMenu } from '../SubMenu'

import type { Mission, MissionWithActions } from '../../../domain/entities/mission/types'
import type { GeoJSON as GeoJSONType } from '../../../domain/types/GeoJSON'

export function MissionList() {
  const { mission } = useMainAppSelector(store => store)

  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined)

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
          ? SEA_FRONT_GROUP_SEA_FRONTS[seaFrontGroup].map(seaFront => SeaFrontLabel[seaFront]).includes(facade as any)
          : false
      }).length,
    [missions]
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
    (nextSeaFrontGroup: SeaFrontGroup) => {
      dispatch(missionActions.setListSeaFront(nextSeaFrontGroup))
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
          <FilterBar onQueryChange={setSearchQuery} searchQuery={searchQuery} />

          {isLoading && <p>Chargement en cours...</p>}
          {isError && <pre>{JSON.stringify(isError)}</pre>}
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
                          disabled={!augmentedMission.geom}
                          Icon={Icon.ViewOnMap}
                          onClick={() => handleZoomToMission(augmentedMission.geom)}
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
