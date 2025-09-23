import { WindowContext } from '@api/constants'
import { EditAndDeleteCell, TagsCell } from '@features/Regulation/components/RegulationTables/tableCells'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useWindowResize } from '@hooks/useWindowResize'
import { useEffect } from 'react'
import { Table } from 'rsuite'

import { getAllGearCodes } from '../../../../domain/use_cases/gearCode/getAllGearCodes'
import { getAllSpecies } from '../../../../domain/use_cases/species/getAllSpecies'

import type { FleetSegment } from '@features/FleetSegment/types'
import type { MainAppAsyncThunk } from '@store'

const { Cell, Column, HeaderCell } = Table

type FleetSegmentsTableProps = Readonly<{
  faoAreas: string[]
  fleetSegments: FleetSegment[]
  onDeleteFleetSegment: (segment: string, year: number) => void
  openEditFleetSegmentModal: (fleetSegment: FleetSegment) => void
}>
export function FleetSegmentsTable({
  faoAreas,
  fleetSegments,
  onDeleteFleetSegment,
  openEditFleetSegmentModal
}: FleetSegmentsTableProps) {
  const dispatch = useMainAppDispatch()
  const gears = useMainAppSelector(state => state.gear.gears)
  const species = useMainAppSelector(state => state.species.species)
  const { height } = useWindowResize()

  useEffect(() => {
    /* TODO: understand why BackofficeAppPromiseThunk type is not accepted */
    dispatch(getAllGearCodes<MainAppAsyncThunk>(WindowContext.BackOffice))
    dispatch(getAllSpecies<MainAppAsyncThunk>(WindowContext.BackOffice))
  }, [dispatch])

  return (
    <Table
      affixHorizontalScrollbar
      data={fleetSegments}
      height={height < 900 ? height - 120 : 750}
      locale={{
        emptyMessage: 'Aucun résultat',
        loading: 'Chargement...'
      }}
      rowHeight={36}
      rowKey="segment"
      shouldUpdateScroll={false}
    >
      <Column fixed="left" width={80}>
        <HeaderCell>Segment</HeaderCell>
        <Cell dataKey="segment" />
      </Column>

      <Column width={70}>
        <HeaderCell>N. impact</HeaderCell>
        <Cell dataKey="impactRiskFactor" />
      </Column>

      <Column width={130}>
        <HeaderCell>Nom du segment</HeaderCell>
        <Cell dataKey="segmentName" />
      </Column>

      <Column width={280}>
        <HeaderCell>Engins</HeaderCell>
        <TagsCell data={gears.map(gear => ({ label: gear.code, value: gear.code }))} dataKey="gears" id="segment" />
      </Column>

      <Column width={250}>
        <HeaderCell>FAO</HeaderCell>
        <TagsCell
          data={faoAreas?.map(faoArea => ({ label: faoArea, value: faoArea }))}
          dataKey="faoAreas"
          id="segment"
        />
      </Column>

      <Column width={90}>
        <HeaderCell>Maill. min.</HeaderCell>
        <Cell dataKey="minMesh" />
      </Column>

      <Column width={90}>
        <HeaderCell>Maill. max.</HeaderCell>
        <Cell dataKey="maxMesh" />
      </Column>

      <Column width={100}>
        <HeaderCell>Espèce SCIP</HeaderCell>
        <Cell dataKey="mainScipSpeciesType" />
      </Column>

      <Column width={250}>
        <HeaderCell>Espèces ciblées</HeaderCell>
        <TagsCell
          data={species.map(gear => ({ label: gear.code, value: gear.code }))}
          dataKey="targetSpecies"
          id="segment"
        />
      </Column>

      <Column width={120}>
        <HeaderCell>Pourcent. min.</HeaderCell>
        <Cell dataKey="minShareOfTargetSpecies" />
      </Column>

      <Column width={130}>
        <HeaderCell>Types de navires</HeaderCell>
        <Cell dataKey="vesselTypes" />
      </Column>

      <Column width={90}>
        <HeaderCell>Priorité</HeaderCell>
        <Cell dataKey="priority" />
      </Column>

      <Column fixed="right" width={60}>
        <HeaderCell> </HeaderCell>
        <EditAndDeleteCell
          dataKey="year"
          id="segment"
          onDelete={onDeleteFleetSegment}
          onEdit={openEditFleetSegmentModal}
        />
      </Column>
    </Table>
  )
}
