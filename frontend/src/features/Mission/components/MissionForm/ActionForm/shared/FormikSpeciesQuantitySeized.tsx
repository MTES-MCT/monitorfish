import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import { FieldError, FormikNumberInput } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export function FormikSpeciesQuantitySeized() {
  const { errors, values } = useFormikContext<MissionActionFormValues>()

  return (
    <>
      {!!values.hasSomeSpeciesSeized && (
        <StyledFormikNumberInput
          isErrorMessageHidden
          isRequired
          label="Quantités saisies (kg)"
          name="speciesQuantitySeized"
        />
      )}
      {typeof errors.speciesQuantitySeized === 'string' && errors.speciesQuantitySeized !== HIDDEN_ERROR && (
        <FieldError>{errors.speciesQuantitySeized}</FieldError>
      )}
    </>
  )
}

const StyledFormikNumberInput = styled(FormikNumberInput)`
  margin-top: 12px;
  margin-left: 24px;
  width: 160px;
`
