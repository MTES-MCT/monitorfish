import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { Input } from 'rsuite'

export const Label = styled.span`
  text-align: left;
  color: ${COLORS.slateGray};
  min-width: 150px;
  display: inline-block;
  font-size: 13px;
  ${props => props.isLast ? '' : 'margin-right: 20px'};
`

export const CustomInput = styled(Input)`
  font-size: 13px;
  ${props => props.width ? '' : 'min-width: 100px;'}
  ${props => props.width ? `width: ${props.width};` : ''}
  border: 1px solid ${props => props.$isRed ? `${COLORS.maximumRed}` : `${COLORS.lightGray}`};
  border-radius: 2px;
  color: ${COLORS.gunMetal}!important;
  font-weight: 500;
  background-color: ${props => props.$isGray ? COLORS.gainsboro : COLORS.white};
  margin: 0px 10px 0px 0px;
  padding: 8px;

  &:focus {
    color: ${COLORS.gunMetal}!important;
    border-color: ${COLORS.lightGray}!important;
    cursor: text;
  }

  &:hover {
    color: ${COLORS.gunMetal}!important;
    border-color: ${COLORS.lightGray}!important;
    cursor: text;
  }

  ::placeholder {
    font-size: 11px;
    color: ${COLORS.slateGray};
  }
`
