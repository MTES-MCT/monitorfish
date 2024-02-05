import { Accent, Button, usePrevious } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { remove, update } from 'ramda'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { ControlUnitSelect } from './ControlUnitSelect'
import { useGetLegacyControlUnitsQuery } from '../../../../../api/legacyControlUnit'
import { getControlUnitsOptionsFromControlUnits } from '../../../../../domain/entities/controlUnits/utils'
import { INITIAL_MISSION_CONTROL_UNIT, PAMControlUnitIds } from '../../constants'
import { useGetMainFormFormikUsecases } from '../../hooks/useGetMainFormFormikUsecases'

import type { LegacyControlUnit } from '../../../../../domain/types/legacyControlUnit'
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

  const controlUnitsQuery = useGetLegacyControlUnitsQuery(undefined)

  const { administrationsAsOptions: allAdministrationsAsOptions, unitsAsOptions: allNamesAsOptions } = useMemo(
    () => getControlUnitsOptionsFromControlUnits(controlUnitsQuery.data),
    [controlUnitsQuery.data]
  )

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
    (
      index: number,
      nextControlUnit: LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft
    ) => {
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
        {(values.controlUnits || []).map((_, index) => (
          <ControlUnitSelect
            key={JSON.stringify(value)}
            activeAndSortedUnitsAsOptions={activeAndSortedUnitsAsOptions}
            allAdministrationsAsOptions={allAdministrationsAsOptions}
            allControlUnits={controlUnitsQuery.data || []}
            allNamesAsOptions={allNamesAsOptions}
            error={errors[index]}
            index={index}
            onChange={handleChange}
            onDelete={removeUnit}
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
