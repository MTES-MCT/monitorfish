import { Accent, Button, usePrevious } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { remove, update } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { ControlUnitSelect } from './ControlUnitSelect'
import { useGetControlUnitsQuery } from '../../../../../api/controlUnit'
import { getControlUnitsOptionsFromControlUnits } from '../../../../../domain/entities/controlUnits/utils'
import { INITIAL_MISSION_CONTROL_UNIT, PAMControlUnitIds } from '../../constants'
import { useGetMainFormFormikUsecases } from '../../hooks/useGetMainFormFormikUsecases'

import type { ControlUnit } from '../../../../../domain/types/controlUnit'
import type { MissionMainFormValues } from '../../types'

export type FormikMultiControlUnitPickerProps = {
  name: string
}
export function FormikMultiControlUnitPicker({ name }: FormikMultiControlUnitPickerProps) {
  const { errors: allErrors, setFieldValue, values } = useFormikContext<MissionMainFormValues>()
  const { updateMissionActionOtherControlsCheckboxes } = useGetMainFormFormikUsecases()
  const previousIsControlUnitPAM =
    usePrevious(
      values.controlUnits?.some(controlUnit => controlUnit.id && PAMControlUnitIds.includes(controlUnit.id))
    ) || false

  const controlUnitsQuery = useGetControlUnitsQuery(undefined)

  const {
    activeControlUnits: allActiveControlUnits,
    administrationsAsOptions: allAdministrationsAsOptions,
    unitsAsOptions: allNamesAsOptions
  } = useMemo(() => getControlUnitsOptionsFromControlUnits(controlUnitsQuery.data), [controlUnitsQuery.data])

  const errors = (allErrors[name] || []) as Array<{
    administration: string
    name: string
  }>

  const addUnit = useCallback(
    () => {
      const nextControlUnits = [...values[name], INITIAL_MISSION_CONTROL_UNIT]

      setFieldValue(name, nextControlUnits)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values[name]]
  )

  const removeUnit = useCallback(
    (index: number) => {
      const nextControlUnits = remove(index, 1, values[name])

      updateMissionActionOtherControlsCheckboxes(values, previousIsControlUnitPAM)
      setFieldValue(name, nextControlUnits)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values[name], previousIsControlUnitPAM]
  )

  const handleChange = useCallback(
    (index: number, nextControlUnit: ControlUnit.ControlUnit | ControlUnit.ControlUnitDraft) => {
      const nextControlUnits = update(index, nextControlUnit, values[name])

      updateMissionActionOtherControlsCheckboxes(values, previousIsControlUnitPAM)
      setFieldValue(name, nextControlUnits)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values[name], previousIsControlUnitPAM]
  )

  return (
    <Wrapper>
      <>
        {(values.controlUnits || []).map((value, index) => (
          <ControlUnitSelect
            // eslint-disable-next-line react/no-array-index-key
            key={`unit${index}`}
            allAdministrationsAsOptions={allAdministrationsAsOptions}
            allControlUnits={allActiveControlUnits}
            allNamesAsOptions={allNamesAsOptions}
            error={errors[index]}
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
