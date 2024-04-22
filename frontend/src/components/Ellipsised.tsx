import styled from 'styled-components'

export const Ellipsised = styled.div.attrs(props => ({
  title: props.children ? String(props.children).trim() : undefined
}))`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
