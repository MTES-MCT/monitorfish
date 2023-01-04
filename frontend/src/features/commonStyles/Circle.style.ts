import styled, { css } from 'styled-components'

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

export const GreenCircle = styled.span`
  ${circle}
  background-color: ${p => p.theme.color.mediumSeaGreen};
`

export const RedCircle = styled.span`
  ${circle}
  background-color: ${p => p.theme.color.maximumRed};
`

export const BlackCircle = styled.span`
  display: inline-block;
  height: 4px;
  width: 4px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 6px;
  background-color: ${p => p.theme.color.gunMetal};
`
