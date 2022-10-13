import { useField } from 'formik'
import React from 'react'
import { Checkbox, CheckboxGroup } from 'rsuite'

export function FormikCheckboxGroup({ checkBoxValues, defaultValue, label, name, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers

  return (
    <CheckboxGroup name={name} onChange={setValue} value={value} {...props} defaultValue={defaultValue}>
      {Object.entries(checkBoxValues)?.map(([key, val]) => (
        <Checkbox key={key} value={val.code}>
          {val.libelle}
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}
