import styled from 'styled-components'

import SearchIconSVG from '../../features/icons/Loupe_dark.svg?react'

export const FilterTableInput = styled.input<{
  $baseUrl: string
}>`
  background-color: white;
  border: 1px ${p => p.theme.color.lightGray} solid;
  border-radius: 0px;
  color: ${p => p.theme.color.gunMetal};
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
    border-bottom: 1px ${p => p.theme.color.lightGray} solid;
  }
`
