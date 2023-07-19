import { List } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

// The width of the scrolling bar is 16 px. When we have more than
// 9 items, the scrolling bar is showed
export const CardTable = styled(List).attrs(() => ({
  role: 'table'
}))<{
  $hasScroll: boolean
  $width: number
}>`
  width: ${p => (p.$hasScroll ? p.$width + 16 : p.$width)};
  font-weight: 500;
  color: ${COLORS.gunMetal};
  box-shadow: unset;
`
