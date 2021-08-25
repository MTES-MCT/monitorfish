import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { Input } from 'rsuite'

export const Label = styled.span`
  text-align: left;
  color: ${COLORS.gunMetal};
  min-width: 154px;
  font-size: 13px;
  margin-right: 8px;
`

export const CustomInput = styled(Input)`
  font-size: 11px;
  height: 35px;
  ${props => props.width ? '' : 'min-width: 100px;'}
  ${props => props.width ? `width: ${props.width};` : ''}
  ${props => props.isred ? `border-color: ${COLORS.red};` : ''}
  margin: 0px 10px 0px 0px;
  padding: 8px;
`
