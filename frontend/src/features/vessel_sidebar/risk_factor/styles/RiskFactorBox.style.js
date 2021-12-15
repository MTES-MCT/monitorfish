import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'

export const RiskFactorBox = styled.div`
  width: ${props => props.isBig ? 36 : 28}px;
  height: ${props => props.isBig ? 20 : 17}px;
  padding-top: ${props => props.isBig ? 4 : 1}px;
  font-size: ${props => props.isBig ? 14 : 13}px;
  font-weight: 500;
  display: inline-block;
  user-select: none;
  color: ${COLORS.background};
  background: ${props => props.color};
  line-height: 14px;
  text-align: center;
  margin-right:  ${props => props.marginRight ? props.marginRight : 8}px;;
  visibility: ${props => props.hide ? 'hidden' : 'visible'};
  ${props => props.hide ? 'width: 13px;' : ''}
  border-radius: 1px;
`
