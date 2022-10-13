import { useField } from 'formik'
import React from 'react'
import { Input } from 'rsuite'

export function FormikTextarea({ name, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers

  return <Input as="textarea" onChange={setValue} rows={3} value={value} {...props} />
}
