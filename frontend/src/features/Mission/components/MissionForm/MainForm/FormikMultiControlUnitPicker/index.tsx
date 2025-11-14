import { useGetLegacyControlUnitsQuery } from '@api/legacyControlUnit'
import { getControlUnitsOptionsFromControlUnits } from '@features/ControlUnit/utils'
import { INITIAL_MISSION_CONTROL_UNIT } from '@features/Mission/components/MissionForm/constants'
import { useForceUpdate } from '@hooks/useForceUpdate'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { ControlUnit, usePrevious } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { remove, update } from 'ramda'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { ControlUnitSelect } from './ControlUnitSelect'
import { useGetMainFormFormikUsecases } from '../../hooks/useGetMainFormFormikUsecases'

import type { MissionMainFormValues } from '../../types'
import type { LegacyControlUnit } from '@features/ControlUnit/legacyControlUnit'

type FormikMultiControlUnitPickerProps = Readonly<{
  missionId: number | undefined
  name: string
  validateBeforeOnChange: (nextValues: MissionMainFormValues) => void
}>
export function FormikMultiControlUnitPicker({
  missionId,
  name,
  validateBeforeOnChange
}: FormikMultiControlUnitPickerProps) {
  const { errors: allErrors, setFieldValue, values } = useFormikContext<MissionMainFormValues>()
  const engagedControlUnit = useMainAppSelector(state => state.missionForm.engagedControlUnit)
  const previousEngagedControlUnit = usePrevious(engagedControlUnit)

  const { updateMissionActionOtherControlsCheckboxes } = useGetMainFormFormikUsecases()
  const isPreviousControlUnitPAMOrULAM = !!usePrevious(
    values.controlUnits?.some(
      controlUnit =>
        controlUnit.id &&
        (ControlUnit.PAMControlUnitIds.includes(controlUnit.id) ||
          ControlUnit.ULAMControlUnitIds.includes(controlUnit.id))
    )
  )

  const { forceUpdate } = useForceUpdate()

  const controlUnitsQuery = useGetLegacyControlUnitsQuery(undefined)

  const { administrationsAsOptions: activeAdministrationsAsOptions } = useMemo(
    () => getControlUnitsOptionsFromControlUnits(controlUnitsQuery.data),
    [controlUnitsQuery.data]
  )

  const errors = (allErrors[name] || []) as Array<{
    administration: string
    name: string
  }>

  const removeUnit = useCallback(
    (index: number) => {
      const nextControlUnits = remove(index, 1, values[name])

      updateMissionActionOtherControlsCheckboxes(values, isPreviousControlUnitPAMOrULAM)
      setFieldValue(name, nextControlUnits)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values[name], isPreviousControlUnitPAMOrULAM]
  )

  const handleChange = useCallback(
    (
      index: number,
      nextControlUnit: LegacyControlUnit.LegacyControlUnit | LegacyControlUnit.LegacyControlUnitDraft
    ) => {
      const nextControlUnits = update(index, nextControlUnit, values[name])

      updateMissionActionOtherControlsCheckboxes(values, isPreviousControlUnitPAMOrULAM)
      setFieldValue(name, nextControlUnits)
      forceUpdate()
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values[name], isPreviousControlUnitPAMOrULAM]
  )

  useEffect(() => {
    if (!missionId && !engagedControlUnit && previousEngagedControlUnit !== engagedControlUnit) {
      validateBeforeOnChange(values)
    }
    // we want to trigger the `validateBeforeOnChange` when engagedControlUnit change
    // so when user confirm mission creation even if the control unit is engaged
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId, engagedControlUnit])

  const controlUnits = values.controlUnits?.length > 0 ? values.controlUnits : [INITIAL_MISSION_CONTROL_UNIT]

  return (
    <Wrapper>
      <>
        {controlUnits.map((controlUnit, index) => (
          <ControlUnitSelect
            // eslint-disable-next-line react/no-array-index-key
            key={`${controlUnit.id}-${index}`}
            activeAdministrationsAsOptions={activeAdministrationsAsOptions}
            allControlUnits={controlUnitsQuery.data ?? []}
            error={errors[index]}
            index={index}
            missionId={missionId}
            onChange={handleChange}
            onDelete={removeUnit}
          />
        ))}
      </>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  > button {
    margin-top: 16px;
  }
`
