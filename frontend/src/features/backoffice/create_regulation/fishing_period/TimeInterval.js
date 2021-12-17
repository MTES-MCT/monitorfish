import React from 'react'
import styled from 'styled-components'
import { convertTimeToString, TIMES_SELECT_PICKER_VALUES } from '../../../../domain/entities/regulatory'
import { COLORS } from '../../../../constants/constants'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'

const TimeInterval = props => {
  const {
    disabled,
    id,
    timeInterval,
    onTimeIntervalChange,
    isLast
  } = props

  const setTimeInterval = (key, value) => {
    const split = value.split('h')
    const date = new Date()
    date.setHours(split[0])
    date.setMinutes(split[1])
    const newTimeInterval = {
      ...timeInterval,
      [key]: date
    }
    onTimeIntervalChange(id, newTimeInterval)
  }

  return (
    <Wrapper $isLast={isLast}>
      De
      <CustomSelectComponent
        style={selectPickerStyle}
        disabled={disabled}
        data={TIMES_SELECT_PICKER_VALUES}
        searchable={false}
        cleanable={false}
        value={convertTimeToString(timeInterval?.from)}
        onChange={value => setTimeInterval('from', value)}
        placeholder={'\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0'}
        padding={'0px'}
      />
      à
      <CustomSelectComponent
        style={selectPickerStyle}
        disabled={disabled}
        data={TIMES_SELECT_PICKER_VALUES}
        searchable={false}
        cleanable={false}
        value={convertTimeToString(timeInterval?.to)}
        onChange={value => setTimeInterval('to', value)}
        placeholder={'\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0'}
        padding={'0px'}
      />
    </Wrapper>
  )
}

const selectPickerStyle = {
  width: '85px',
  margin: '0px 5px',
  borderColor: COLORS.lightGray,
  boxSizing: 'border-box',
  textOverflow: 'ellipsis'
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${props => props.$isLast ? '' : 'margin-bottom: 5px;'}
  color: ${COLORS.slateGray};
  opacity: ${props => props.disabled ? '0.4' : '1'};
`

export default TimeInterval
