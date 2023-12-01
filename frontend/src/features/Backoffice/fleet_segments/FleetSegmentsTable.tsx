import { useCallback, useEffect, useRef, useState } from 'react'
import { Table } from 'rsuite'

import { deleteFleetSegment as deleteFleetSegmentAction } from '../../../domain/use_cases/fleetSegment/deleteFleetSegment'
import { updateFleetSegment as updateFleetSegmentAction } from '../../../domain/use_cases/fleetSegment/updateFleetSegment'
import getAllGearCodes from '../../../domain/use_cases/gearCode/getAllGearCodes'
import getAllSpecies from '../../../domain/use_cases/species/getAllSpecies'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { useWindowResize } from '../../../hooks/useWindowResize'
import { DeleteCell, ImpactCell, INPUT_TYPE, ModifiableCell, TagPickerCell } from '../tableCells'

const { Column, HeaderCell } = Table

export function FleetSegmentsTable({ faoAreas, fleetSegments, setFleetSegments, year }) {
  const dispatch = useMainAppDispatch()
  const gears = useMainAppSelector(state => state.gear.gears)
  const species = useMainAppSelector(state => state.species.species)
  const { height } = useWindowResize()
  const { blockUpdate, isUpdateBlocked, setInputDataCySelector } = useBlockUpdateAndFocusOnDataRefresh(fleetSegments)

  useEffect(() => {
    dispatch(getAllGearCodes())
    dispatch(getAllSpecies())
  }, [dispatch])

  const deleteFleetSegment = useCallback(
    (segment, _year) => {
      dispatch(deleteFleetSegmentAction(segment, _year)).then(nextFleetSegments => setFleetSegments(nextFleetSegments))
    },
    [dispatch, setFleetSegments]
  )

  const updateFleetSegment = useCallback(
    (segment, _year, key, value, _fleetSegments) => {
      if (!segment || !key) {
        return
      }

      const updatedFields = {
        bycatchSpecies: null,
        faoAreas: null,
        gears: null,
        impactRiskFactor: null,
        segment: null,
        segmentName: null,
        targetSpecies: null,
        year: null
      }
      updatedFields[key] = value

      dispatch(updateFleetSegmentAction(segment, _year, updatedFields, _fleetSegments)).then(nextFleetSegments =>
        setFleetSegments(nextFleetSegments)
      )
    },
    [dispatch, setFleetSegments]
  )

  const handleChangeModifiableKeyWithThrottle = useCallback(
    (segment, _year, key, value, _fleetSegments) => {
      if (isUpdateBlocked) {
        return
      }

      blockUpdate()
      updateFleetSegment(segment, _year, key, value, _fleetSegments)
    },
    [isUpdateBlocked, updateFleetSegment, blockUpdate]
  )

  return gears?.length && species?.length && faoAreas?.length ? (
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
        <ImpactCell
          dataKey="impactRiskFactor"
          id="segment"
          onChange={(segment, key, value) => updateFleetSegment(segment, year, key, value, fleetSegments)}
        />
      </Column>

      <Column width={110}>
        <HeaderCell>Segment</HeaderCell>
        <ModifiableCell
          afterChange={tag => setInputDataCySelector(tag)}
          dataKey="segment"
          id="segment"
          inputType={INPUT_TYPE.STRING}
          isDisabled={isUpdateBlocked}
          maxLength={null}
          onChange={(segment, key, value) =>
            handleChangeModifiableKeyWithThrottle(segment, year, key, value?.replace(/[ ]/g, ''), fleetSegments)
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
          isDisabled={false}
          maxLength={null}
          onChange={(segment, key, value) => updateFleetSegment(segment, year, key, value, fleetSegments)}
        />
      </Column>

      <Column width={290}>
        <HeaderCell>Engins</HeaderCell>
        <TagPickerCell
          data={gears.map(gear => ({ label: gear.code, value: gear.code }))}
          dataKey="gears"
          id="segment"
          onChange={(segment, key, value) => updateFleetSegment(segment, year, key, value, fleetSegments)}
        />
      </Column>

      <Column width={290}>
        <HeaderCell>Espèces ciblées</HeaderCell>
        <TagPickerCell
          data={species.map(gear => ({ label: gear.code, value: gear.code }))}
          dataKey="targetSpecies"
          id="segment"
          onChange={(segment, key, value) => updateFleetSegment(segment, year, key, value, fleetSegments)}
        />
      </Column>

      <Column width={290}>
        <HeaderCell>Prises accessoires</HeaderCell>
        <TagPickerCell
          data={species.map(_species => ({ label: _species.code, value: _species.code }))}
          dataKey="bycatchSpecies"
          id="segment"
          onChange={(segment, key, value) => updateFleetSegment(segment, year, key, value, fleetSegments)}
        />
      </Column>

      <Column width={300}>
        <HeaderCell>FAO</HeaderCell>
        <TagPickerCell
          data={faoAreas.map(faoArea => ({ label: faoArea, value: faoArea }))}
          dataKey="faoAreas"
          id="segment"
          onChange={(segment, key, value) => updateFleetSegment(segment, year, key, value, fleetSegments)}
        />
      </Column>

      <Column width={30}>
        <HeaderCell> </HeaderCell>
        <DeleteCell dataKey="year" id="segment" onClick={(segment, _year) => deleteFleetSegment(segment, _year)} />
      </Column>
    </Table>
  ) : null
}

export function useBlockUpdateAndFocusOnDataRefresh(savedData) {
  const [isUpdateBlocked, setIsUpdateBlocked] = useState(false)
  const inputDataCySelectorRef = useRef('')
  const intervalRef = useRef<NodeJS.Timer>()

  const blockUpdate = () => setIsUpdateBlocked(true)
  const setInputDataCySelector = dataCySelector => {
    inputDataCySelectorRef.current = dataCySelector
  }
  const focusAndUnblock = useCallback(() => {
    const domElement = document.querySelector(`[data-cy="${inputDataCySelectorRef.current}"]`)
    if (!domElement) {
      return
    }

    const timeout = setTimeout(() => {
      // @ts-ignore
      domElement.focus()
      clearTimeout(timeout)
    }, 200)

    setIsUpdateBlocked(false)
    clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (!isUpdateBlocked) {
      return undefined
    }

    intervalRef.current = setInterval(focusAndUnblock, 200)

    return () => clearInterval(intervalRef.current)
  }, [savedData, isUpdateBlocked, focusAndUnblock])

  return {
    blockUpdate,
    isUpdateBlocked,
    setInputDataCySelector
  }
}
