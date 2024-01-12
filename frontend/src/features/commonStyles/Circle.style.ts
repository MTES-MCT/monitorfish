import styled, { css } from 'styled-components'

import { COLORS } from '../../constants/constants'

const circle = css<{
  margin: string
}>`
  display: inline-block;
  height: 10px;
  width: 10px;
  margin: ${p => p.margin || 'unset'};
  border-radius: 50%;
  vertical-align: middle;
`

export const GreenCircle = styled.span<{
  margin: string
}>`
  ${circle}
  background-color: ${COLORS.mediumSeaGreen};
`

export const RedCircle = styled.span<{
  margin: string
}>`
  ${circle}
  background-color: ${COLORS.maximumRed};
`

export const BlackCircle = styled.span<{
  margin: string
}>`
  display: inline-block;
  height: 4px;
  width: 4px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 6px;
  background-color: ${COLORS.gunMetal};
`
