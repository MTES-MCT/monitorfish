import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { Input } from 'rsuite'

export const Label = styled.span`
  text-align: left;
  color: ${COLORS.slateGray};
  min-width: 154px;
  font-size: 13px;
  margin-right: 8px;
`

export const CustomInput = styled(Input)`
  font-size: 11px;
  height: 35px;
  ${props => props.width ? '' : 'min-width: 100px;'}
  ${props => props.width ? `width: ${props.width};` : ''}
  border-color: ${props => props.isred ? `${COLORS.red}` : `${COLORS.lightGray}`};
  border-radius: 2px;
  color: ${COLORS.slateGray};
  margin: 0px 10px 0px 0px;
  padding: 8px;
  &:focus {
    border-color: red;
    transition: border-color 0.3s ease-in-out;
    outline: 0;
  }
`
