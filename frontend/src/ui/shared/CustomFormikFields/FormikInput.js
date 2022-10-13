import { useField } from 'formik'
import React from 'react'
import { Input } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

export function FormikInput({ name, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers

  return <Input onChange={setValue} value={value || ''} {...props} />
}

export const FormikInputGhost = styled(FormikInput)`
  background-color: ${COLORS.white};
`
