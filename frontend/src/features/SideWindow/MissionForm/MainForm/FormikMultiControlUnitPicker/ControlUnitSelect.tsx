import { Accent, Icon, IconButton, MultiSelect, Option, Select, TextInput, useForceUpdate } from '@mtes-mct/monitor-ui'
import { pick } from 'ramda'
import { useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDebouncedCallback } from 'use-debounce'

import {
  findControlUnitByAdministrationAndName,
  mapControlUnitsToUniqueSortedNamesAsOptions,
  mapControlUnitToResourcesAsOptions
} from './utils'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { mapToProp } from '../../../../../utils/mapToProp'
import { INITIAL_MISSION_CONTROL_UNIT } from '../../constants'

import type { ControlUnit } from '../../../../../domain/types/controlUnit'
import type { MissionFormValues } from '../../types'
import type { Promisable } from 'type-fest'

export type ControlUnitSelectProps = {
  administrationsAsOptions: Option[]
  controlUnits: ControlUnit[] | undefined
  defaultValue: MissionFormValues['controlUnits'][0]
  index: number
  onChange: (index: number, nextControlUnit: MissionFormValues['controlUnits'][0]) => Promisable<void>
  onDelete: (index: number) => Promisable<void>
}
export function ControlUnitSelect({
  administrationsAsOptions,
  controlUnits,
  defaultValue,
  index,
  onChange,
  onDelete
}: ControlUnitSelectProps) {
  const controlledValueRef = useRef(defaultValue)
  const { newWindowContainerRef } = useNewWindow()

  const [selectedControlUnit, setSelectedControlUnit] = useState<ControlUnit | undefined>(undefined)

  const { forceUpdate } = useForceUpdate()

  const resourcesAsOptions = useMemo((): Option<number>[] => {
    if (!selectedControlUnit) {
      return []
    }

    return mapControlUnitToResourcesAsOptions(selectedControlUnit)
  }, [selectedControlUnit])

  const controlledValueResourceIds = useMemo(
    () => (controlledValueRef.current.resources ? mapToProp(controlledValueRef.current.resources, 'id') : []),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [controlledValueRef.current]
  )

  const unitsAsOptions = useMemo(
    (): Option[] => {
      if (!controlUnits || !controlledValueRef.current.administration) {
        return []
      }

      const selectedAdministrationControlUnits = controlUnits.filter(
        ({ administration }) => administration === controlledValueRef.current.administration
      )

      return mapControlUnitsToUniqueSortedNamesAsOptions(selectedAdministrationControlUnits)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [controlledValueRef.current, controlUnits]
  )

  const handleAdministrationChange = useCallback(
    (nextAdministration: string | undefined) => {
      const nextControlUnit: MissionFormValues['controlUnits'][0] = {
        ...INITIAL_MISSION_CONTROL_UNIT,
        administration: nextAdministration
      }

      controlledValueRef.current = nextControlUnit
      forceUpdate()

      onChange(index, nextControlUnit)
    },
    [forceUpdate, index, onChange]
  )

  const handleNameChange = useCallback(
    (nextName: string | undefined) => {
      if (!controlUnits || !controlledValueRef.current.administration) {
        return
      }

      const nextSelectedControlUnit = nextName
        ? findControlUnitByAdministrationAndName(controlUnits, controlledValueRef.current.administration, nextName)
        : undefined

      const nextControlUnit: MissionFormValues['controlUnits'][0] = {
        ...INITIAL_MISSION_CONTROL_UNIT,
        ...pick(['administration'])(controlledValueRef.current),
        id: nextSelectedControlUnit ? nextSelectedControlUnit.id : undefined,
        name: nextName
      }

      controlledValueRef.current = nextControlUnit

      setSelectedControlUnit(nextSelectedControlUnit)

      onChange(index, nextControlUnit)
    },
    [controlUnits, index, onChange]
  )

  const handleResourcesChange = useCallback(
    (nextResourceIds: Array<ControlUnit['resources'][0]['id']> | undefined) => {
      if (!selectedControlUnit) {
        return
      }

      const nextResources = nextResourceIds
        ? selectedControlUnit.resources.filter(({ id }) => nextResourceIds.includes(id))
        : []

      const nextControlUnit: MissionFormValues['controlUnits'][0] = {
        ...controlledValueRef.current,
        resources: nextResources
      }

      controlledValueRef.current = nextControlUnit
      forceUpdate()

      onChange(index, nextControlUnit)
    },
    [forceUpdate, index, onChange, selectedControlUnit]
  )

  // Let's be careful here, this should normally depend on `[index, onChange]` dependencies
  // but since there is no reason these 2 values would change, this seems like an acceptable trade-off
  const handleContactChange = useDebouncedCallback((nextValue: string | undefined) => {
    const nextControlUnit: MissionFormValues['controlUnits'][0] = {
      ...controlledValueRef.current,
      contact: nextValue
    }

    controlledValueRef.current = nextControlUnit

    onChange(index, nextControlUnit)
  }, 500)

  const handleDelete = useCallback(() => {
    onDelete(index)
  }, [index, onDelete])

  return (
    // eslint-disable-next-line react/no-array-index-key
    <Wrapper key={`unit${index}`}>
      <UnitWrapper>
        <Select
          baseContainer={newWindowContainerRef.current}
          defaultValue={controlledValueRef.current.administration}
          disabled={!controlUnits}
          label={`Administration ${index + 1}`}
          name={`administration_${index}`}
          onChange={handleAdministrationChange}
          options={administrationsAsOptions}
          searchable
          virtualized
        />
        <Select
          baseContainer={newWindowContainerRef.current}
          defaultValue={controlledValueRef.current.administration}
          disabled={!controlUnits || !controlledValueRef.current.administration}
          label={`Unité ${index + 1}`}
          name={`name_${index}`}
          onChange={handleNameChange}
          options={unitsAsOptions}
          searchable
          virtualized
        />
        <MultiSelect
          baseContainer={newWindowContainerRef.current}
          defaultValue={controlledValueResourceIds}
          disabled={!controlUnits || !controlledValueRef.current.administration}
          label={`Moyen ${index + 1}`}
          name={`resources_${index}`}
          onChange={handleResourcesChange}
          options={resourcesAsOptions}
        />
        <TextInput
          defaultValue={controlledValueRef.current.contact}
          disabled={
            !controlUnits ||
            !controlledValueRef.current.name ||
            !controlledValueRef.current.resources ||
            !controlledValueRef.current.resources.length
          }
          label={`Contact de l’unité ${index + 1}`}
          name={`contact_${index}`}
          onChange={handleContactChange}
        />
      </UnitWrapper>

      <IconButton
        accent={Accent.SECONDARY}
        aria-label="Supprimer cette unité"
        disabled={index === 0}
        Icon={Icon.Delete}
        onClick={handleDelete}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: flex-start;
  display: flex;

  > button {
    margin: 22px 0 0 8px;
  }
`

const UnitWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;

  > div:not(:first-child) {
    margin-top: 8px;
  }
`
