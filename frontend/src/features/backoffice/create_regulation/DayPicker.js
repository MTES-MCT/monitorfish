import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const WEEKDAY = {
  LUNDI: 'lundi',
  MARDI: 'mardi',
  MERCREDI: 'mercredi',
  JEUDI: 'jeudi',
  VENDREDI: 'vendredi',
  SAMEDI: 'samedi',
  DIMANCHE: 'dimanche'
}

const DayPicker = ({ value, setValue }) => {
  return <>
    <Circle $isGray={value === WEEKDAY.LUNDI} onClick={_ => setValue(WEEKDAY.LUNDI)} >L</Circle>
    <Circle $isGray={value === WEEKDAY.MARDI} onClick={_ => setValue(WEEKDAY.MARDI)} >M</Circle>
    <Circle $isGray={value === WEEKDAY.MERCREDI} onClick={_ => setValue(WEEKDAY.MERCREDI)} >M</Circle>
    <Circle $isGray={value === WEEKDAY.JEUDI} onClick={_ => setValue(WEEKDAY.JEUDI)} >J</Circle>
    <Circle $isGray={value === WEEKDAY.VENDREDI} onClick={_ => setValue(WEEKDAY.VENDREDI)} >V</Circle>
    <Circle $isGray={value === WEEKDAY.SAMEDI} onClick={_ => setValue(WEEKDAY.SAMEDI)} >S</Circle>
    <Circle $isGray={value === WEEKDAY.DIMANCHE} onClick={_ => setValue(WEEKDAY.DIMANCHE)} >D</Circle>
  </>
}

const Circle = styled.a` 
  display: inline-block;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  font-size: 13px;
  border: 1px solid ${COLORS.lightGray};
  margin-right: 5px;
  text-align: center;
  line-height: 2em;
  color: ${COLORS.slateGray};
  ${props => props.$isGray ? `background-color: ${COLORS.gainsboro}` : ''};
`

export default DayPicker
