import { useField } from 'formik'
import React from 'react'
import { RadioGroup, Radio } from 'rsuite'

export function FormikRadioGroup({ defaultValue, name, radioValues, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers

  return (
    <RadioGroup inline name={name} onChange={setValue} value={value} {...props} defaultValue={defaultValue}>
      {Object.entries(radioValues).map(([key, val]) => (
        <Radio key={key} value={val.code}>
          {val.libelle}
        </Radio>
      ))}
    </RadioGroup>
  )
}
