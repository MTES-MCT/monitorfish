import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import { FieldError, FormikDatePicker } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import type { MissionMainFormValues } from '../types'

export function FormikDoubleDatePicker() {
  const { errors } = useFormikContext<MissionMainFormValues>()

  const error = errors.endDateTimeUtc ?? errors.startDateTimeUtc

  return (
    <Wrapper>
      <div>
        <FormikDatePicker
          isCompact
          isErrorMessageHidden
          isRequired
          isStringDate
          label="Début de mission"
          name="startDateTimeUtc"
          withTime
        />
        <FormikDatePicker
          isCompact
          isEndDate
          isErrorMessageHidden
          isRequired
          isStringDate
          label="Fin de mission"
          name="endDateTimeUtc"
          withTime
        />
      </div>
      {error && error !== HIDDEN_ERROR && <FieldError>{error}</FieldError>}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  > div {
    align-items: center;
    display: flex;

    > .Field-DatePicker {
      &:last-child {
        margin-left: 12px;
      }
    }
  }
`
