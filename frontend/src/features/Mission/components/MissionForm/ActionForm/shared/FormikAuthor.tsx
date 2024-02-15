import { FieldError, FormikTextInput } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import type { MissionActionFormValues } from '../../types'

export function FormikAuthor() {
  const { errors } = useFormikContext<MissionActionFormValues>()

  const error = errors.userTrigram || errors.closedBy

  return (
    <Wrapper>
      <div>
        <FormikTextInput isErrorMessageHidden isLight label="Saisi par" name="userTrigram" />
        <FormikTextInput isErrorMessageHidden isLight label="Clôturé par" name="closedBy" />
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  > div {
    display: flex;

    > .Field-TextInput {
      width: 120px;

      &:not(:first-child) {
        margin-left: 24px;
      }
    }
  }
`
