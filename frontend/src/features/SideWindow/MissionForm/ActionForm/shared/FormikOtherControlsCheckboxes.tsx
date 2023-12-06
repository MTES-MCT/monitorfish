import { FormikCheckbox } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useFormikContext } from 'formik'
import { useEffect } from 'react'
import styled from 'styled-components'

import { missionActions as missionSliceActions } from '../../../../../domain/actions'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { useGetMissionQuery } from '../../apis'
import { PAMControlUnitIds } from '../../constants'
import { FieldsetGroup } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'

export function FormikOtherControlsCheckboxes() {
  const dispatch = useMainAppDispatch()
  const { setFieldValue } = useFormikContext<MissionActionFormValues>()
  const mustResetOtherControlsCheckboxes = useMainAppSelector(state => state.mission.mustResetOtherControlsCheckboxes)
  const missionId = useMainAppSelector(store => store.sideWindow.selectedPath.id)
  const { data: missionData } = useGetMissionQuery(missionId || skipToken)

  useEffect(() => {
    if (mustResetOtherControlsCheckboxes) {
      setFieldValue('isAdministrativeControl', undefined)
      setFieldValue('isComplianceWithWaterRegulationsControl', undefined)
      setFieldValue('isSafetyEquipmentAndStandardsComplianceControl', undefined)
      setFieldValue('isSeafarersControl', undefined)

      dispatch(missionSliceActions.mustResetOtherControlsCheckboxes(false))
    }
  }, [dispatch, setFieldValue, mustResetOtherControlsCheckboxes])

  const isCurrentControlUnitPAM = missionData?.controlUnits?.some(
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
