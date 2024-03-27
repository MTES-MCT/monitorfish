import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import { FormikDatePicker, useNewWindow } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'

import type { MissionActionFormValues } from '../../types'

export function DatePickerField() {
  const { newWindowContainerRef } = useNewWindow()
  const { errors } = useFormikContext<MissionActionFormValues>()

  const error = errors.actionDatetimeUtc

  return (
    <FormikDatePicker
      baseContainer={newWindowContainerRef.current}
      isErrorMessageHidden={error === HIDDEN_ERROR}
      isLight
      isRequired
      isStringDate
      label="Date et heure du contrôle"
      name="actionDatetimeUtc"
      withTime
    />
  )
}
