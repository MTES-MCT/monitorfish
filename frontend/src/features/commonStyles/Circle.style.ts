import styled, { css } from 'styled-components'

const circle = css<{
  $margin: string
}>`
  display: inline-block;
  height: 8px;
  width: 8px;
  margin: ${p => p.$margin || 'unset'};
  border-radius: 50%;
  vertical-align: middle;
`

export const GreenCircle = styled.span<{
  $margin: string
}>`
  ${circle}
  background-color: ${p => p.theme.color.mediumSeaGreen};
`

export const RedCircle = styled.span<{
  $margin: string
}>`
  ${circle}
  background-color: ${p => p.theme.color.maximumRed};
`
