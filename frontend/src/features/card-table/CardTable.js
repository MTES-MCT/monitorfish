import { COLORS } from '../../constants/constants'
import styled from 'styled-components'
import { List } from 'rsuite'
import React from 'react'

// The width of the scrolling bar is 16 px. When we have more than
// 9 items, the scrolling bar is showed
const CardTable = styled(List)`
  width: ${p => p.hasScroll ? p.width + 16 : p.width};
  font-weight: 500;
  color: ${COLORS.gunMetal};
  box-shadow: unset;
`

export default CardTable
