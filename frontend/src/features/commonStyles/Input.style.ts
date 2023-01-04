import { Input } from 'rsuite'
import styled from 'styled-components'

export const Label = styled.span<{
  isLast?: boolean
}>`
  text-align: left;
  color: ${p => p.theme.color.slateGray};
  min-width: 150px;
  display: inline-block;
  font-size: 13px;
  ${p => (p.isLast ? '' : 'margin-right: 20px')};
`

export const CustomInput = styled(Input)<{
  $isGray: boolean
  $isRed?: boolean
  width?: string
}>`
  font-size: 13px;
  ${p => (p.width ? '' : 'min-width: 100px;')}
  ${p => (p.width ? `width: ${p.width};` : '')}
  border: 1px solid ${p => (p.$isRed ? `${p.theme.color.maximumRed}` : `${p.theme.color.lightGray}`)};
  border-radius: 2px;
  color: ${p => p.theme.color.gunMetal}!important;
  font-weight: 500;
  background-color: ${p => (p.$isGray ? p.theme.color.gainsboro : p.theme.color.white)};
  margin: 0px 10px 0px 0px;
  padding: 8px;

  &:focus {
    color: ${p => p.theme.color.gunMetal}!important;
    border-color: ${p => p.theme.color.lightGray}!important;
    cursor: text;
  }

  &:hover {
    color: ${p => p.theme.color.gunMetal}!important;
    border-color: ${p => p.theme.color.lightGray}!important;
    cursor: text;
  }

  ::placeholder {
    font-size: 11px;
    color: ${p => p.theme.color.slateGray};
  }
`
