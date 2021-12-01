import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { WEEKDAYS } from '../../../../domain/entities/regulatory'

const DayPicker = ({ selectedList, setSelectedList, disabled }) => {
  return <>
    {
      Object.keys(WEEKDAYS).map((weekday, id) => {
        return <Circle
          key={id}
          disabled={disabled}
          value={weekday}
          $isGray={selectedList?.includes(weekday)}
          onClick={e => {
            let newSelectedList
            const value = e.currentTarget.getAttribute('value')
            if (selectedList?.includes(value)) {
              newSelectedList = selectedList.filter(elem => elem !== value)
            } else {
              newSelectedList = [
                ...selectedList,
                value
              ]
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
  color: ${props => props.$isGray ? COLORS.slateGray : COLORS.grayShadow};
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
