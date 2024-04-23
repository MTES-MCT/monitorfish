import styled from 'styled-components'

export const Titled = styled.span.attrs(props => ({
  title: props.children ? String(props.children).trim() : undefined
}))``
