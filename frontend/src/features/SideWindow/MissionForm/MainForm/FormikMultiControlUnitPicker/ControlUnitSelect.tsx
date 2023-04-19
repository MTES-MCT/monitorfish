import { Accent, Icon, IconButton, MultiSelect, Select, TextInput } from '@mtes-mct/monitor-ui'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import {
  findControlUnitByname,
  mapControlUnitsToUniqueSortedNamesAsOptions,
  mapControlUnitToSortedResourcesAsOptions
} from './utils'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { INITIAL_MISSION_CONTROL_UNIT } from '../../constants'
import { isValidControlUnit } from '../../utils'

import type { ControlResource } from '../../../../../domain/types/controlResource'
import type { ControlUnit } from '../../../../../domain/types/controlUnit'
import type { MissionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'
import type { Promisable } from 'type-fest'

export type ControlUnitSelectProps = {
  allAdministrationsAsOptions: Option[]
  allNamesAsOptions: Option[]
  controlUnits: ControlUnit.ControlUnit[] | undefined
  index: number
  onChange: (index: number, nextControlUnit: ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft) => Promisable<void>
  onDelete: (index: number) => Promisable<void>
  value: ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft
}
export function ControlUnitSelect({
  allAdministrationsAsOptions,
  allNamesAsOptions,
  controlUnits,
  index,
  onChange,
  onDelete,
  value
}: ControlUnitSelectProps) {
  const { newWindowContainerRef } = useNewWindow()

  const [controlledValue, setControlledValue] = useState(value)
  const [selectedControlUnit, setSelectedControlUnit] = useState<ControlUnit.ControlUnit | undefined>(
    isValidControlUnit(value) ? value : undefined
  )

  const filteredNamesAsOptions = useMemo((): Option[] => {
    if (!controlUnits || !controlledValue.administration) {
      return allNamesAsOptions
    }

    const selectedAdministrationControlUnits = controlUnits.filter(
      ({ administration }) => administration === controlledValue.administration
    )

    return mapControlUnitsToUniqueSortedNamesAsOptions(selectedAdministrationControlUnits)
  }, [allNamesAsOptions, controlledValue, controlUnits])

  const selectedControlUnitResourcesAsOptions = useMemo(
    (): Option<ControlResource>[] =>
      selectedControlUnit ? mapControlUnitToSortedResourcesAsOptions(selectedControlUnit) : [],
    [selectedControlUnit]
  )

  const handleAdministrationChange = useCallback(
    (nextAdministration: string | undefined) => {
      const nextControlUnit: MissionFormValues['controlUnits'][0] = {
        ...INITIAL_MISSION_CONTROL_UNIT,
        administration: nextAdministration
      }

      setControlledValue(nextControlUnit)
      setSelectedControlUnit(undefined)

      onChange(index, nextControlUnit)
    },
    [index, onChange]
  )

  const handleNameChange = useCallback(
    (nextName: string | undefined) => {
      if (!controlUnits) {
        return
      }

      const nextSelectedControlUnit = nextName ? findControlUnitByname(controlUnits, nextName) : undefined
      const nextControlUnit: ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft = nextSelectedControlUnit
        ? {
            ...nextSelectedControlUnit,
            contact: controlledValue.contact,
            resources: controlledValue.resources
          }
        : {
            ...INITIAL_MISSION_CONTROL_UNIT,
            administration: controlledValue.administration
          }

      setControlledValue(nextControlUnit)
      setSelectedControlUnit(nextSelectedControlUnit)

      onChange(index, nextControlUnit)
    },
    [controlledValue, controlUnits, index, onChange]
  )

  const handleResourcesChange = useCallback(
    (nextResources: ControlResource[] | undefined) => {
      const nextControlUnit: ControlUnit.ControlUnitDraft = {
        ...controlledValue,
        resources: nextResources || []
      }

      setControlledValue(nextControlUnit)

      onChange(index, nextControlUnit)
    },
    [controlledValue, index, onChange]
  )

  const handleContactChange = useCallback(
    (nextValue: string | undefined) => {
      const nextControlUnit: ControlUnit.ControlUnitDraft = {
        ...controlledValue,
        contact: nextValue
      }

      setControlledValue(nextControlUnit)

      onChange(index, nextControlUnit)
    },
    [controlledValue, index, onChange]
  )

  const handleDelete = useCallback(() => {
    onDelete(index)
  }, [index, onDelete])

  return (
    // eslint-disable-next-line react/no-array-index-key
    <Wrapper key={`unit${index}`}>
      <UnitWrapper>
        <Select
          baseContainer={newWindowContainerRef.current}
          disabled={!controlUnits}
          label={`Administration ${index + 1}`}
          name={`administration_${index}`}
          onChange={handleAdministrationChange}
          options={allAdministrationsAsOptions}
          searchable
          value={controlledValue.administration}
          virtualized
        />
        <Select
          baseContainer={newWindowContainerRef.current}
          disabled={!controlUnits}
          label={`Unité ${index + 1}`}
          name={`unit_${index}`}
          onChange={handleNameChange}
          options={filteredNamesAsOptions}
          searchable
          value={controlledValue.name}
          virtualized
        />
        <MultiSelect
          baseContainer={newWindowContainerRef.current}
          disabled={!controlUnits || !controlledValue.administration || !controlledValue.name}
          isUndefinedWhenDisabled
          label={`Moyen ${index + 1}`}
          name={`resources_${index}`}
          onChange={handleResourcesChange}
          options={selectedControlUnitResourcesAsOptions}
          optionValueKey="name"
          value={controlledValue.resources}
        />
        <TextInput
          disabled={!controlUnits || !controlledValue.name}
          label={`Contact de l’unité ${index + 1}`}
          name={`contact_${index}`}
          onChange={handleContactChange}
          value={controlledValue.contact}
        />
      </UnitWrapper>

      {index > 0 && (
        <IconButton
          accent={Accent.SECONDARY}
          aria-label="Supprimer cette unité"
          Icon={Icon.Delete}
          onClick={handleDelete}
        />
      )}
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
  min-width: 384px;
  max-width: 384px;
  width: 384px;

  > div:not(:first-child) {
    margin-top: 8px;
  }
`
