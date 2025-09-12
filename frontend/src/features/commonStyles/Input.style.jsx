import { Input } from 'rsuite'
import styled from 'styled-components'

export const Label = styled.span`
  text-align: left;
  color: ${p => p.theme.color.slateGray};
  min-width: 150px;
  display: inline-block;
  font-size: 13px;
  ${props => (props.isLast ? '' : 'margin-right: 20px')};
`

export const CustomInput = styled(Input)`
  font-size: 13px;
  ${props => (props.width ? '' : 'min-width: 100px;')}
  ${props => (props.width ? `width: ${props.width};` : '')}
  border: 1px solid ${props => (props.$isRed ? `${p => p.theme.color.maximumRed}` : `${p => p.theme.color.lightGray}`)};
  border-radius: 2px;
  color: ${p => p.theme.color.gunMetal}!important;
  font-weight: 500;
  background-color: ${props => (props.$isGray ? p => p.theme.color.gainsboro : p => p.theme.color.white)};
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
