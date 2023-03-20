import { Accent, Button, useForceUpdate } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { remove, update } from 'ramda'
import { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'

import { ControlUnitSelect } from './ControlUnitSelect'
import {
  mapControlUnitsToUniqueSortedAdministrationsAsOptions,
  mapControlUnitsToUniqueSortedNamesAsOptions
} from './utils'
import { useGetControlUnitsQuery } from '../../../../../api/controlUnit'
import { INITIAL_MISSION_CONTROL_UNIT } from '../../constants'

import type { MissionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export type FormikMultiControlUnitPickerProps = {
  name: string
}
export function FormikMultiControlUnitPicker({ name }: FormikMultiControlUnitPickerProps) {
  const [input, , helpers] = useField<MissionFormValues['controlUnits']>(name)

  const controlledValueRef = useRef<MissionFormValues['controlUnits']>(input.value)

  const controlUnitsQuery = useGetControlUnitsQuery(undefined)
  const { forceUpdate } = useForceUpdate()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultValues = useMemo(() => input.value || [], [input.value.length])

  const allAdministrationsAsOptions = useMemo((): Option[] => {
    if (!controlUnitsQuery.data) {
      return []
    }

    return mapControlUnitsToUniqueSortedAdministrationsAsOptions(controlUnitsQuery.data)
  }, [controlUnitsQuery.data])

  // Users must be able to select either by administration or by unit if they don't know the administration name
  const allNamesAsOptions = useMemo((): Array<Option<number>> => {
    if (!controlUnitsQuery.data) {
      return []
    }

    return mapControlUnitsToUniqueSortedNamesAsOptions(controlUnitsQuery.data)
  }, [controlUnitsQuery.data])

  const addUnit = useCallback(
    () => {
      const nextControlUnits = [...controlledValueRef.current, INITIAL_MISSION_CONTROL_UNIT]

      controlledValueRef.current = nextControlUnits

      helpers.setValue(nextControlUnits)

      forceUpdate()
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const removeUnit = useCallback(
    (index: number) => {
      const nextControlUnits = remove(index, 1, controlledValueRef.current)

      controlledValueRef.current = nextControlUnits

      helpers.setValue(nextControlUnits)

      forceUpdate()
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleChange = useCallback(
    (index: number, nextControlUnit: MissionFormValues['controlUnits'][0]) => {
      const nextControlUnits = update(index, nextControlUnit, controlledValueRef.current)

      controlledValueRef.current = nextControlUnits

      helpers.setValue(nextControlUnits)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const controlUnitSelects = useMemo(
    () => (
      <>
        {defaultValues.map((defaultValue, index) => (
          <ControlUnitSelect
            // eslint-disable-next-line react/no-array-index-key
            key={`unit${index}`}
            allAdministrationsAsOptions={allAdministrationsAsOptions}
            allNamesAsOptions={allNamesAsOptions}
            controlUnits={controlUnitsQuery.data}
            defaultValue={defaultValue}
            index={index}
            onChange={handleChange}
            onDelete={removeUnit}
          />
        ))}
      </>
    ),
    [allAdministrationsAsOptions, allNamesAsOptions, controlUnitsQuery.data, defaultValues, handleChange, removeUnit]
  )

  return (
    <Wrapper>
      {controlUnitSelects}

      <Button accent={Accent.SECONDARY} onClick={addUnit}>
        Ajouter une autre unité
      </Button>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  > button {
    margin-top: 16px;
  }
`
