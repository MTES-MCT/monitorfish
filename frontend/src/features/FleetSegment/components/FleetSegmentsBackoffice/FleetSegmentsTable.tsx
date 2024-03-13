import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useWindowResize } from '@hooks/useWindowResize'
import { useEffect } from 'react'
import { Table } from 'rsuite'

import getAllGearCodes from '../../../../domain/use_cases/gearCode/getAllGearCodes'
import getAllSpecies from '../../../../domain/use_cases/species/getAllSpecies'
import { EditAndDeleteCell, TagsCell } from '../../../Backoffice/tableCells'

const { Cell, Column, HeaderCell } = Table

export function FleetSegmentsTable({ faoAreas, fleetSegments, onDeleteFleetSegment, openEditFleetSegmentModal }) {
  const dispatch = useMainAppDispatch()
  const gears = useMainAppSelector(state => state.gear.gears)
  const species = useMainAppSelector(state => state.species.species)
  const { height } = useWindowResize()

  useEffect(() => {
    dispatch(getAllGearCodes())
    dispatch(getAllSpecies())
  }, [dispatch])

  return (
    <Table
      affixHorizontalScrollbar
      data={fleetSegments}
      height={height < 900 ? height - 120 : 800}
      locale={{
        emptyMessage: 'Aucun résultat',
        loading: 'Chargement...'
      }}
      rowHeight={36}
      rowKey="segment"
      shouldUpdateScroll={false}
    >
      <Column width={70}>
        <HeaderCell>N. impact</HeaderCell>
        <Cell dataKey="impactRiskFactor" />
      </Column>

      <Column width={110}>
        <HeaderCell>Segment</HeaderCell>
        <Cell dataKey="segment" />
      </Column>

      <Column width={200}>
        <HeaderCell>Nom du segment</HeaderCell>
        <Cell dataKey="segmentName" />
      </Column>

      <Column width={290}>
        <HeaderCell>Engins</HeaderCell>
        <TagsCell data={gears.map(gear => ({ label: gear.code, value: gear.code }))} dataKey="gears" id="segment" />
      </Column>

      <Column width={290}>
        <HeaderCell>Espèces ciblées</HeaderCell>
        <TagsCell
          data={species.map(gear => ({ label: gear.code, value: gear.code }))}
          dataKey="targetSpecies"
          id="segment"
        />
      </Column>

      <Column width={290}>
        <HeaderCell>Prises accessoires</HeaderCell>
        <TagsCell
          data={species.map(_species => ({ label: _species.code, value: _species.code }))}
          dataKey="bycatchSpecies"
          id="segment"
        />
      </Column>

      <Column width={300}>
        <HeaderCell>FAO</HeaderCell>
        <TagsCell
          data={faoAreas.map(faoArea => ({ label: faoArea, value: faoArea }))}
          dataKey="faoAreas"
          id="segment"
        />
      </Column>

      <Column fixed="right" width={75}>
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
