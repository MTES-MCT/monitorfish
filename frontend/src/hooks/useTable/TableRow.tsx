import styled from 'styled-components'

export const TableRow = styled.tr<{
  index: number
  isFocused?: boolean
  toClose?: boolean
}>`
  animation: ${p => (p.toClose ? 'close-alert-transition-item 3s ease forwards' : 'unset')};
  background: ${p => (p.isFocused ? p.theme.color.gainsboro : p.theme.color.cultured)};
  border-radius: 1px;
  border: 1px solid ${p => p.theme.color.lightGray};
  height: 15px;
  margin-top: 6px;
  overflow: hidden;
  transition: background 3s;
`
