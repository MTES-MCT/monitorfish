import { Accent, Button } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { remove, update } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { ControlUnitSelect } from './ControlUnitSelect'
import { useGetControlUnitsQuery } from '../../../../../api/controlUnit'
import { getControlUnitsOptionsFromControlUnits } from '../../../../../domain/controlUnits/utils'
import { INITIAL_MISSION_CONTROL_UNIT } from '../../constants'

import type { ControlUnit } from '../../../../../domain/types/controlUnit'
import type { MissionFormValues } from '../../types'

export type FormikMultiControlUnitPickerProps = {
  name: string
}
export function FormikMultiControlUnitPicker({ name }: FormikMultiControlUnitPickerProps) {
  const [input, , helpers] = useField<MissionFormValues['controlUnits']>(name)

  const controlUnitsQuery = useGetControlUnitsQuery(undefined)

  const {
    activeControlUnits: allActiveControlUnits,
    administrationsAsOptions: allAdministrationsAsOptions,
    unitsAsOptions: allNamesAsOptions
  } = useMemo(() => getControlUnitsOptionsFromControlUnits(controlUnitsQuery.data), [controlUnitsQuery.data])

  const addUnit = useCallback(
    () => {
      const nextControlUnits = [...input.value, INITIAL_MISSION_CONTROL_UNIT]

      helpers.setValue(nextControlUnits)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const removeUnit = useCallback(
    (index: number) => {
      const nextControlUnits = remove(index, 1, input.value)

      helpers.setValue(nextControlUnits)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  const handleChange = useCallback(
    (index: number, nextControlUnit: ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft) => {
      const nextControlUnits = update(index, nextControlUnit, input.value)

      helpers.setValue(nextControlUnits)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [input.value]
  )

  return (
    <Wrapper>
      <>
        {(input.value || []).map((value, index) => (
          <ControlUnitSelect
            // eslint-disable-next-line react/no-array-index-key
            key={`unit${index}`}
            allAdministrationsAsOptions={allAdministrationsAsOptions}
            allControlUnits={allActiveControlUnits}
            allNamesAsOptions={allNamesAsOptions}
            index={index}
            onChange={handleChange}
            onDelete={removeUnit}
            value={value}
          />
        ))}
      </>

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
