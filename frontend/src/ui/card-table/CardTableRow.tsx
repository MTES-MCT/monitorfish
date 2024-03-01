import { List } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

export const CardTableRow = styled(List.Item).attrs(() => ({
  role: 'row'
}))<{
  index: number
  isFocused?: boolean
  toClose?: boolean
}>`
  background: ${p => (p.isFocused ? COLORS.gainsboro : COLORS.cultured)};
  border: 1px solid ${COLORS.lightGray};
  border-radius: 1px;
  height: 42px;
  margin-top: 6px;
  transition: background 3s;
  animation: ${p => (p.toClose ? 'close-alert-transition-item 3s ease forwards' : 'unset')};
  overflow: hidden;
`
