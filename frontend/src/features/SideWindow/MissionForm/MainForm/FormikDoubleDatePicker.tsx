import { FormikDatePicker, useNewWindow } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export function FormikDoubleDatePicker() {
  const { newWindowContainerRef } = useNewWindow()

  return (
    <Wrapper>
      Du
      <FormikDatePicker
        baseContainer={newWindowContainerRef.current}
        isCompact
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
        isLabelHidden
        isStringDate
        label="Fin de mission"
        name="endDateTimeUtc"
        withTime
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: center;
  display: flex;

  > .Field-DatePicker {
    margin-left: 12px;

    :first-child {
      margin-right: 12px;
    }
  }
`
