/* eslint-disable react/jsx-props-no-spreading */
import { useField } from 'formik'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

type FormikErrorWrapperProps = {
  children: React.ReactNode
  name: string
  noMessage?: boolean
}
export function FormikErrorWrapper({ children, name, noMessage }: FormikErrorWrapperProps) {
  const [, meta] = useField(name)

  return (
    <ErrorWrapper error={!!meta.error}>
      {children}
      {!noMessage && !!meta.error && <div>{JSON.stringify(meta.error)}</div>}
    </ErrorWrapper>
  )
}

const ErrorWrapper = styled.div<{ error: boolean }>`
  .rs-input,
  .rs-input:hover,
  .rs-picker-toggle {
    ${p => (p.error ? `border: 1px solid ${COLORS.maximumRed};` : '')}
  }
  label {
    ${p => (p.error ? `color: ${COLORS.maximumRed};` : '')}
  }
`
