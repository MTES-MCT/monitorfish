import { useEffect, useRef, useState } from 'react'
import { Table } from 'rsuite'

import { deleteFleetSegment } from '../../../domain/use_cases/fleetSegment/deleteFleetSegment'
import { updateFleetSegment } from '../../../domain/use_cases/fleetSegment/updateFleetSegment'
import getAllGearCodes from '../../../domain/use_cases/gearCode/getAllGearCodes'
import getAllSpecies from '../../../domain/use_cases/species/getAllSpecies'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { useWindowResize } from '../../../hooks/useWindowResize'
import { DeleteCell, ImpactCell, INPUT_TYPE, ModifiableCell, TagPickerCell } from '../tableCells'

const { Column, HeaderCell } = Table

export function FleetSegmentsTable({ faoAreas, fleetSegments, setFleetSegments, year }) {
  const dispatch = useAppDispatch()
  const gears = useAppSelector(state => state.gear.gears)
  const species = useAppSelector(state => state.species.species)
  const doNotUpdateScrollRef = useRef(false)
  const [updatedInput, setUpdatedInput] = useState(undefined)
  const doNotUpdateRef = useRef(false)
  const { height, width } = useWindowResize()

  useEffect(() => {
    setTimeout(() => {
      // @ts-ignore
      document.querySelector(`[data-cy="${updatedInput}"]`)?.focus()
      doNotUpdateRef.current = false
    }, 100)
  }, [fleetSegments, updatedInput])

  useEffect(() => {
    if (!gears?.length) {
      dispatch(getAllGearCodes() as any)
    }

    if (!species?.length) {
      dispatch(getAllSpecies() as any)
    }
  }, [dispatch, gears, species])

  const triggerDeleteFleetSegment = (segment, _year) => {
    doNotUpdateScrollRef.current = true

    dispatch(deleteFleetSegment(segment, _year) as any).then(nextFleetSegments => setFleetSegments(nextFleetSegments))
  }

  const handleChangeModifiableKeyWithThrottle = (segment, _year, key, value) => {
    if (doNotUpdateRef.current) {
      return
    }

    doNotUpdateRef.current = true
    handleChangeModifiableKey(segment, _year, key, value)
  }

  const handleChangeModifiableKey = (segment, _year, key, value) => {
    if (!segment || !key) {
      return
    }

    const updateJSON = {
      bycatchSpecies: null,
      faoAreas: null,
      gears: null,
      impactRiskFactor: null,
      segment: null,
      segmentName: null,
      targetSpecies: null,
      year: null
    }
    updateJSON[key] = value

    dispatch(updateFleetSegment(segment, _year, updateJSON) as any).then(updatedFleetSegment => {
      const nextFleetSegments = fleetSegments
        .filter(_segment => _segment.segment !== segment)
        .concat(updatedFleetSegment)
        .sort((a, b) => a.segment.localeCompare(b.segment))
      setFleetSegments(nextFleetSegments)
    })
  }

  return gears?.length && species?.length && faoAreas?.length ? (
    <Table
      affixHorizontalScrollbar
      data={fleetSegments}
      height={height < 900 ? height - 120 : 830}
      locale={{
        emptyMessage: 'Aucun résultat',
        loading: 'Chargement...'
      }}
      onDataUpdated={() => {
        doNotUpdateScrollRef.current = true
      }}
      rowHeight={36}
      rowKey="segment"
      shouldUpdateScroll={!doNotUpdateScrollRef.current}
      width={width < 1800 ? width - 200 : 1600}
    >
      <Column width={70}>
        <HeaderCell>N. impact</HeaderCell>
        <ImpactCell
          dataKey="impactRiskFactor"
          id="segment"
          onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
        />
      </Column>

      <Column width={110}>
        <HeaderCell>Segment</HeaderCell>
        <ModifiableCell
          afterChange={tag => setUpdatedInput(tag)}
          dataKey="segment"
          id="segment"
          inputType={INPUT_TYPE.STRING}
          maxLength={null}
          onChange={(segment, key, value) =>
            handleChangeModifiableKeyWithThrottle(segment, year, key, value?.replace(/[ ]/g, ''))
          }
        />
      </Column>

      <Column width={200}>
        <HeaderCell>Nom du segment</HeaderCell>
        <ModifiableCell
          afterChange={undefined}
          dataKey="segmentName"
          id="segment"
          inputType={INPUT_TYPE.STRING}
          maxLength={null}
          onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
        />
      </Column>

      <Column width={290}>
        <HeaderCell>Engins</HeaderCell>
        <TagPickerCell
          data={gears.map(gear => ({ label: gear.code, value: gear.code }))}
          dataKey="gears"
          id="segment"
          onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
        />
      </Column>

      <Column width={290}>
        <HeaderCell>Espèces ciblées</HeaderCell>
        <TagPickerCell
          data={species.map(gear => ({ label: gear.code, value: gear.code }))}
          dataKey="targetSpecies"
          id="segment"
          onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
        />
      </Column>

      <Column width={290}>
        <HeaderCell>Prises accessoires</HeaderCell>
        <TagPickerCell
          data={species.map(_species => ({ label: _species.code, value: _species.code }))}
          dataKey="bycatchSpecies"
          id="segment"
          onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
        />
      </Column>

      <Column width={300}>
        <HeaderCell>FAO</HeaderCell>
        <TagPickerCell
          data={faoAreas.map(faoArea => ({ label: faoArea, value: faoArea }))}
          dataKey="faoAreas"
          id="segment"
          onChange={(segment, key, value) => handleChangeModifiableKey(segment, year, key, value)}
        />
      </Column>

      <Column width={30}>
        <HeaderCell> </HeaderCell>
        <DeleteCell
          dataKey="year"
          id="segment"
          onClick={(segment, _year) => triggerDeleteFleetSegment(segment, _year)}
        />
      </Column>
    </Table>
  ) : null
}
