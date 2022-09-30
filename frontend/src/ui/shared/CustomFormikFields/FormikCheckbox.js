import { useField } from 'formik'
import React from 'react'
import { Checkbox } from 'rsuite'

export function FormikCheckbox({ defaultValue, label, name, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers

  return (
    <Checkbox name={name} onChange={setValue} value={value} {...props} defaultValue={defaultValue}>
      {label}
    </Checkbox>
  )
}
