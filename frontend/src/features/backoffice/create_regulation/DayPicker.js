import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const DayPicker = ({ selectedList, setSelectedList, disabled }) => {
  const WEEKDAYS = {
    lundi: 'L',
    mardi: 'M',
    mercredi: 'M',
    jeudi: 'J',
    vendredi: 'V',
    samedi: 'S',
    dimanche: 'D'
  }
  return <>
    {
      Object.keys(WEEKDAYS).map((weekday, id) => {
        return <Circle
          key={id}
          disabled={disabled}
          $isGray={selectedList.includes(weekday)}
          onClick={_ => {
            const newSelectedList = [...selectedList]
            if (selectedList.includes(weekday)) {
              newSelectedList.splice(id, 1)
            } else {
              newSelectedList.push(weekday)
            }
            setSelectedList(newSelectedList)
          }}>
            {WEEKDAYS[weekday]}
          </Circle>
      })
    }
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
  text-decoration: none;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? '0.4' : '1'};
  &:hover {
    text-decoration: none;
    color: ${COLORS.slateGray};
  }
`

export default DayPicker
