import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import { useGetMissionActionFormikUsecases } from '@features/Mission/components/MissionForm/hooks/useGetMissionActionFormikUsecases'
import { DatePicker, useNewWindow } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'

import type { MissionActionFormValues } from '../../types'

export function DatePickerField() {
  const { newWindowContainerRef } = useNewWindow()
  const { updateMissionLocation } = useGetMissionActionFormikUsecases()
  const { errors, setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  const error = errors.actionDatetimeUtc

  function handleChange(nextActionDatetimeUtc) {
    setFieldValue('actionDatetimeUtc', nextActionDatetimeUtc)

    updateMissionLocation(values)
  }

  return (
    <DatePicker
      baseContainer={newWindowContainerRef.current}
      defaultValue={values.actionDatetimeUtc}
      error={error}
      isErrorMessageHidden={error === HIDDEN_ERROR}
      isLight
      isRequired
      isStringDate
      label="Date et heure du contrôle"
      name="actionDatetimeUtc"
      /* eslint-disable-next-line react/jsx-no-bind */
      onChange={handleChange}
      withTime
    />
  )
}
