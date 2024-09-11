import styled from 'styled-components'

import { COLORS } from '../../constants/constants'
import SearchIconSVG from '../../features/icons/Loupe_dark.svg?react'

export const FilterTableInput = styled.input<{
  $baseUrl: string
}>`
  background-color: white;
  border: 1px ${COLORS.lightGray} solid;
  border-radius: 0px;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  height: 40px;
  width: 280px;
  padding: 0 5px 0 10px;
  background-image: url(${p => `${p.$baseUrl}${SearchIconSVG}`});
  background-size: 25px;
  background-position: bottom 3px right 5px;
  background-repeat: no-repeat;

  &:hover,
  &:focus {
    border-bottom: 1px ${COLORS.lightGray} solid;
  }
`
