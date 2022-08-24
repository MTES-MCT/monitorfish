import React from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { convertTimeToString, TIMES_SELECT_PICKER_VALUES } from '../../../../domain/entities/regulatory'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'

function TimeInterval(props) {
  const { disabled, id, isLast, onTimeIntervalChange, timeInterval } = props

  const setTimeInterval = (key, value) => {
    const split = value.split('h')
    const date = new Date()
    date.setHours(split[0])
    date.setMinutes(split[1])
    const newTimeInterval = {
      ...timeInterval,
      [key]: date,
    }
    onTimeIntervalChange(id, newTimeInterval)
  }

  return (
    <Wrapper $isLast={isLast}>
      De
      <CustomSelectComponent
        cleanable={false}
        data={TIMES_SELECT_PICKER_VALUES}
        disabled={disabled}
        onChange={value => setTimeInterval('from', value)}
        padding="0px"
        placeholder={'\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0'}
        placement="topStart"
        searchable={false}
        style={selectPickerStyle}
        value={convertTimeToString(timeInterval?.from)}
      />
      à
      <CustomSelectComponent
        cleanable={false}
        data={TIMES_SELECT_PICKER_VALUES}
        disabled={disabled}
        onChange={value => setTimeInterval('to', value)}
        padding="0px"
        placeholder={'\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0'}
        placement="topStart"
        searchable={false}
        style={selectPickerStyle}
        value={convertTimeToString(timeInterval?.to)}
      />
    </Wrapper>
  )
}

const selectPickerStyle = {
  borderColor: COLORS.lightGray,
  boxSizing: 'border-box',
  margin: '0px 5px',
  textOverflow: 'ellipsis',
  width: '85px',
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${props => (props.$isLast ? '' : 'margin-bottom: 5px;')}
  color: ${COLORS.slateGray};
  opacity: ${props => (props.disabled ? '0.4' : '1')};

  .rs-picker-toggle {
    width: 40px;
  }
`

export default TimeInterval
