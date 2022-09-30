import { useField } from 'formik'
import React from 'react'
import { InputNumber } from 'rsuite'

export function FormikInputNumber({ name, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers

  return <InputNumber onChange={setValue} value={value || ''} {...props} />
}
