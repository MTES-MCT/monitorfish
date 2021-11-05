import React from 'react'
import styled from 'styled-components'
import CustomDatePicker from './CustomDatePicker'
// import { Row } from '../../commonStyles/FishingPeriod.style'
import { SquareButton } from '../../commonStyles/Buttons.style'
import { COLORS } from '../../../constants/constants'

const TimeInterval = ({ disabled, id, timeInterval, onTimeIntervalChange, removeTimeInterval }) => {
  const setTimeInterval = (key, value) => {
    const newTimeInterval = {
      ...timeInterval,
      [key]: value
    }
    onTimeIntervalChange(id, newTimeInterval)
  }

  return (
    <Wrapper>De <CustomDatePicker
        format='HH:mm'
        type='time'
        placement={'rightStart'}
        style={{ width: '55px', margin: '0px 5px' }}
        disabled={disabled}
        value={timeInterval?.from}
        onChange={value => setTimeInterval('from', value)}
        onSelect={value => setTimeInterval('from', value)}
      />
      à <CustomDatePicker
        format='HH:mm'
        ranges={[]}
        type='time'
        placement={'rightStart'}
        style={{ width: '55px', margin: '0px 5px' }}
        disabled={disabled === 2}
        value={timeInterval?.to}
        onChange={value => setTimeInterval('to', value)}
        onSelect={value => setTimeInterval('to', value)}
      />
      <SquareButton disabled={timeInterval === undefined} type='delete' onClick={() => removeTimeInterval(id)} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  color: ${COLORS.slateGray};
  opacity: ${props => props.disabled ? '0.4' : '1'};
`

export default TimeInterval
