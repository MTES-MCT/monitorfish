/* eslint-disable react/jsx-props-no-spreading */
import { useField } from 'formik'
import { RadioGroup, Radio } from 'rsuite'

import type { MonitorEnum } from '../../types'

type FormikRadioGroupType = {
  [x: string]: any
  name: string
  radioValues: MonitorEnum
}
export function FormikRadioGroup({ name, radioValues, ...props }: FormikRadioGroupType) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers

  const handleOnChange = e => {
    setValue(e)
  }

  return (
    <RadioGroup inline name={name} onChange={handleOnChange} value={value} {...props}>
      {Object.entries(radioValues).map(([key, val]) => (
        <Radio key={key} value={val.code}>
          {val.libelle}
        </Radio>
      ))}
    </RadioGroup>
  )
}
