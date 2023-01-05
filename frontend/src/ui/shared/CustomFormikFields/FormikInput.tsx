/* eslint-disable react/jsx-props-no-spreading */
import { useField } from 'formik'
import { Input } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

export function FormikInput({ name, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers

  const handleOnChange = v => {
    setValue(v)
  }

  return <Input onChange={handleOnChange} value={value || ''} {...props} />
}

export const FormikInputGhost = styled(FormikInput)`
  background-color: ${COLORS.white};
`
