import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const InfoPoint = ({ title, dataCy, margin, color, backgroundColor, onMouseEnter, onMouseOut }) => {
  return <Wrapper
    data-cy={dataCy}
    title={title}
    margin={margin}
    color={color}
    backgroundColor={backgroundColor}
    onMouseEnter={onMouseEnter}
    onMouseOut={onMouseOut}
  >!</Wrapper>
}

const Wrapper = styled.a`
  display: inline-block;
  align-self: start;
  min-height: 14px;
  min-width: 14px;
  height: 14px;
  width: 14px;
  border-radius: 50%;
  ${props => props.margin ? `margin: ${props.margin};` : ''}
  background: ${props => props.backgroundColor ? props.backgroundColor : COLORS.slateGray} 0% 0% no-repeat padding-box;
  color: ${props => props.color ? props.color : COLORS.white};
  text-align: center;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  line-height: 12px;
  &:hover {
    text-decoration: none;${props => props.color ? props.color : COLORS.white};
    color: ${props => props.color ? props.color : COLORS.white};
  }
  &:focus {
    text-decoration: none;
    background-color: ${props => props.backgroundColor ? props.backgroundColor : COLORS.charcoal};
  }
  cursor: help;
`

export default InfoPoint
