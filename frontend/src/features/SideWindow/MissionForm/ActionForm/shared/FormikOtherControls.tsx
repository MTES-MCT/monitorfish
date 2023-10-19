import { FormikCheckbox } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useEffect } from 'react'
import styled from 'styled-components'

import { missionActions as missionSliceActions } from '../../../../../domain/actions'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { PAMControlUnitIds } from '../../constants'
import { FieldsetGroup } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'

export function FormikOtherControls() {
  const dispatch = useMainAppDispatch()
  const { setFieldValue } = useFormikContext<MissionActionFormValues>()
  const { draft, resetOtherControls } = useMainAppSelector(state => state.mission)

  useEffect(() => {
    if (resetOtherControls) {
      setFieldValue('isAdministrativeControl', undefined)
      setFieldValue('isComplianceWithWaterRegulationsControl', undefined)
      setFieldValue('isSafetyEquipmentAndStandardsComplianceControl', undefined)
      setFieldValue('isSeafarersControl', undefined)

      dispatch(missionSliceActions.resetOtherControls(false))
    }
  }, [dispatch, setFieldValue, resetOtherControls])

  const isCurrentControlUnitPAM = draft?.mainFormValues.controlUnits?.some(
    controlUnit => controlUnit.id && PAMControlUnitIds.includes(controlUnit.id)
  )

  // Only PAM control units have these checkboxes displayed
  if (!isCurrentControlUnitPAM) {
    return null
  }

  return (
    <>
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
    </>
  )
}

const StyledFieldsetGroup = styled(FieldsetGroup)`
  > div {
    > .Field-Checkbox:not(:first-child) {
      margin-top: 16px;
    }
  }
`
