import { List } from 'rsuite'
import styled from 'styled-components'

// The width of the scrolling bar is 16 px. When we have more than
// 9 items, the scrolling bar is showed
export const CardTable = styled(List).attrs(() => ({
  role: 'table'
}))<{
  $hasScroll: boolean
  $width: number
}>`
  box-shadow: unset;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  width: ${p => (p.$hasScroll ? p.$width + 16 : p.$width)};
`
