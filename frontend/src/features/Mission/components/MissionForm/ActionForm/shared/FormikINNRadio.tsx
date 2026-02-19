import { useGetIsInFrenchEezQuery } from '@features/Mission/missionActionApi'
import { FormikMultiRadio } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useFormikContext } from 'formik'
import { useEffect } from 'react'
import styled from 'styled-components'

import { FieldsetGroup } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'

export function FormikINNRadio() {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  const { data: isInFrenchEezQuery } = useGetIsInFrenchEezQuery(
    values.latitude && values.longitude
      ? {
          latitude: values.latitude,
          longitude: values.longitude
        }
      : skipToken
  )

  useEffect(() => {
    if (isInFrenchEezQuery === true) {
      setFieldValue('isINNControl', false)
    }
  }, [isInFrenchEezQuery, setFieldValue])

  const isNotInFrenchEez = isInFrenchEezQuery === undefined || isInFrenchEezQuery === true

  if (isNotInFrenchEez) {
    return null
  }

  return (
    <StyledFieldsetGroup isLight legend="Contrôle INN *">
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
