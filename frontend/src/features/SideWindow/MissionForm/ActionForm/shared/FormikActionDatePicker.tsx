import { DatePicker, useNewWindow } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { useMemo } from 'react'

export function FormikActionDatePicker() {
  const { newWindowContainerRef } = useNewWindow()

  const [field, meta, helpers] = useField<string | undefined>('actionDatetimeUtc')

  const handleChange = useMemo(
    () => (value: string | undefined) => {
      helpers.setValue(value)
    },

    // We don't want to trigger infinite re-renderings
    // since `helpers.setError` & `helpers.setValue` change after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <DatePicker
      baseContainer={newWindowContainerRef.current}
      defaultValue={field.value}
      error={meta.error}
      isLight
      isStringDate
      label="Date et heure du contrôle"
      onChange={handleChange}
      withTime
    />
  )
}
