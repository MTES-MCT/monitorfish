import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { ControlUnit, FormikCheckbox } from '@mtes-mct/monitor-ui'
import { assertNotNullish } from '@utils/assertNotNullish'
import { useFormikContext } from 'formik'
import { useEffect } from 'react'
import styled from 'styled-components'

import { FieldsetGroup } from '../../shared/FieldsetGroup'
import { missionFormActions } from '../../slice'

import type { MissionActionFormValues } from '../../types'

export function FormikOtherControlsCheckboxes() {
  const dispatch = useMainAppDispatch()
  const { setFieldValue } = useFormikContext<MissionActionFormValues>()
  const mustResetOtherControlsCheckboxes = useMainAppSelector(
    state => state.missionForm.mustResetOtherControlsCheckboxes
  )
  const draft = useMainAppSelector(state => state.missionForm.draft)
  assertNotNullish(draft)

  useEffect(() => {
    if (mustResetOtherControlsCheckboxes) {
      setFieldValue('isAdministrativeControl', undefined)
      setFieldValue('isComplianceWithWaterRegulationsControl', undefined)
      setFieldValue('isSafetyEquipmentAndStandardsComplianceControl', undefined)
      setFieldValue('isSeafarersControl', undefined)

      dispatch(missionFormActions.mustResetOtherControlsCheckboxes(false))
    }
  }, [dispatch, setFieldValue, mustResetOtherControlsCheckboxes])

  const isCurrentControlUnitPAMOrULAM = draft.mainFormValues.controlUnits.some(
    controlUnit =>
      controlUnit.id &&
      (ControlUnit.PAMControlUnitIds.includes(controlUnit.id) ||
        ControlUnit.ULAMControlUnitIds.includes(controlUnit.id))
  )

  // Only PAM or ULAM control units have these checkboxes displayed
  if (!isCurrentControlUnitPAMOrULAM) {
    return null
  }

  return (
    <StyledFieldsetGroup isLight legend="Autre(s) contrôle(s) effectué(s) par l’unité sur le navire">
      <FormikCheckbox label="Contrôle administratif" name="isAdministrativeControl" />
      <FormikCheckbox
        label="Respect du code de la navigation sur le plan d’eau"
        name="isComplianceWithWaterRegulationsControl"
      />
      <FormikCheckbox label="Gens de mer" name="isSeafarersControl" />
      <FormikCheckbox
        label="Equipement de sécurité et respect des normes"
        name="isSafetyEquipmentAndStandardsComplianceControl"
      />
    </StyledFieldsetGroup>
  )
}

const StyledFieldsetGroup = styled(FieldsetGroup)`
  > div {
    > .Field-Checkbox:not(:first-child) {
      margin-top: 16px;
    }
  }
`
