import { useFormikContext } from 'formik'
import { useEffect } from 'react'

import type { Promisable } from 'type-fest'

export type FormikEffectProps = {
  onChange: (nextValues: Record<string, any>) => Promisable<void>
}
export function FormikEffect({ onChange }: FormikEffectProps) {
  const { values } = useFormikContext<Record<string, any>>()

  useEffect(() => {
    onChange(values)
  }, [onChange, values])

  return <></>
}
