/* eslint-disable react/jsx-props-no-spreading */
import { useField } from 'formik'
import { Checkbox, CheckboxGroup } from 'rsuite'

import type { MonitorEnum } from '../../types'

export function FormikCheckboxGroup({ checkBoxValues, defaultValue, label, name, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers
  const handleSetValue = val => {
    setValue(val)
  }

  return (
    <CheckboxGroup name={name} onChange={handleSetValue} value={value} {...props} defaultValue={defaultValue}>
      {Object.entries(checkBoxValues as MonitorEnum)?.map(([key, val]) => (
        <Checkbox key={key} value={val.code}>
          {val.libelle}
        </Checkbox>
      ))}
    </CheckboxGroup>
  )
}
