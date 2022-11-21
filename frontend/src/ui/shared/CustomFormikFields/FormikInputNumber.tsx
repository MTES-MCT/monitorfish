/* eslint-disable react/jsx-props-no-spreading */
import { useField } from 'formik'
import { InputNumber } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

export function FormikInputNumber({ className, name, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers

  const handleOnChange = v => {
    setValue(v)
  }

  return <InputNumber className={className} onChange={handleOnChange} value={value} {...props} />
}

export const FormikInputNumberGhost = styled(FormikInputNumber)`
  background-color: ${COLORS.white};
  input {
    background-color: ${COLORS.white};
  }
`
