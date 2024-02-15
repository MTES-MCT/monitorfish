import { FieldError, FormikDatePicker, useNewWindow } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import type { MissionMainFormValues } from '../types'

export function FormikDoubleDatePicker() {
  const { newWindowContainerRef } = useNewWindow()
  const { errors } = useFormikContext<MissionMainFormValues>()

  const error = errors.endDateTimeUtc ?? errors.startDateTimeUtc

  return (
    <Wrapper>
      <div>
        Du
        <FormikDatePicker
          baseContainer={newWindowContainerRef.current}
          isCompact
          isErrorMessageHidden
          isLabelHidden
          isStringDate
          label="Début de mission"
          name="startDateTimeUtc"
          withTime
        />
        au
        <FormikDatePicker
          baseContainer={newWindowContainerRef.current}
          isCompact
          isEndDate
          isErrorMessageHidden
          isLabelHidden
          isStringDate
          label="Fin de mission"
          name="endDateTimeUtc"
          withTime
        />
      </div>
      {error && <FieldError>{error}</FieldError>}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  > div {
    align-items: center;
    display: flex;

    > .Field-DatePicker {
      margin-left: 12px;

      :first-child {
        margin-right: 12px;
      }
    }
  }
`
