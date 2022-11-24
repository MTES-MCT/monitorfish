import { useField } from 'formik'
import { useEffect } from 'react'

import { DateRangePicker, DateRangePickerProps } from '../../DateRangePicker'

export type FormikDateRangePickerProps = Omit<DateRangePickerProps, 'onChange'> & {
  name: string
}
export function FormikDateRangePicker({ name, ...originalProps }: FormikDateRangePickerProps) {
  const [, , helpers] = useField(name)
  const { setValue } = helpers

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => setValue(undefined), [])

  return <DateRangePicker onChange={setValue} {...originalProps} />
}
