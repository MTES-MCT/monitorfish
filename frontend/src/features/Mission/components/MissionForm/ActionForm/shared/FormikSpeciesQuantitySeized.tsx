import { FormikNumberInput } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import type { MissionActionFormValues } from '@features/Mission/components/MissionForm/types'

export function FormikSpeciesQuantitySeized() {
  const { values } = useFormikContext<MissionActionFormValues>()

  return (
    !!values.hasSomeSpeciesSeized && (
      <StyledFormikNumberInput isRequired label="Quantités saisies (kg)" name="speciesQuantitySeized" />
    )
  )
}

const StyledFormikNumberInput = styled(FormikNumberInput)`
  margin-top: 12px;
  margin-left: 24px;
  width: 160px;
`
