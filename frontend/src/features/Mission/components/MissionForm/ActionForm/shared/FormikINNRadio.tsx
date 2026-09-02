import {
  isPortInInnArea,
  isThirdCountryOrFlaglessVessel
} from '@features/Mission/components/MissionForm/ActionForm/shared/utils'
import { MissionAction } from '@features/Mission/missionAction.types'
import { useGetIsInInnAreaQuery } from '@features/Mission/missionActionApi'
import { FormikMultiRadio } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useFormikContext } from 'formik'
import { useEffect } from 'react'
import styled from 'styled-components'

import { FieldsetGroup } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'

export function FormikINNRadio() {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  const isEligibleVessel = isThirdCountryOrFlaglessVessel(values.flagState)
  const isLandControl = values.actionType === MissionAction.MissionActionType.LAND_CONTROL

  const { data, isFetching } = useGetIsInInnAreaQuery(
    !isLandControl && isEligibleVessel && values.latitude && values.longitude
      ? {
          latitude: values.latitude,
          longitude: values.longitude
        }
      : skipToken
  )

  const isInInnArea = isLandControl ? isPortInInnArea(values.portLocode) : data?.isInInnArea === true
  const isApplicable = isEligibleVessel && isInInnArea

  useEffect(() => {
    // `isINNControl` is required to complete the control, and a hidden field can never be answered
    if (!isApplicable && !isFetching) {
      setFieldValue('isINNControl', false)
    }
  }, [isApplicable, isFetching, setFieldValue])

  if (!isApplicable) {
    return null
  }

  return (
    <StyledFieldsetGroup isLight isRequired legend="Contrôle INN">
      <FormikMultiRadio
        isErrorMessageHidden
        isInline
        isLabelHidden
        isRequired
        label="Contrôle INN"
        name="isINNControl"
        options={[
          { label: 'Oui', value: true },
          { label: 'Non', value: false }
        ]}
      />
      <Helper>
        Un contrôle est considéré comme “INN” s’il est fait sur un navire tiers ou sans pavillon, dans les eaux
        d’outre-mer ou hors ZEE FR.
      </Helper>
    </StyledFieldsetGroup>
  )
}

const Helper = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
  margin-top: 12px;
`

const StyledFieldsetGroup = styled(FieldsetGroup)``
