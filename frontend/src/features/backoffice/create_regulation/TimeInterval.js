import React from 'react'
import CustomDatePicker from './CustomDatePicker'
import { Row } from '../../commonStyles/FishingPeriod.style'
import { SquareButton } from '../../commonStyles/Buttons.style'

const TimeInterval = ({ disabled, id, timeInterval, onTimeIntervalChange, removeTimeInterval }) => {
  const setTimeInterval = (key, value) => {
    const newTimeInterval = {
      ...timeInterval,
      [key]: value
    }
    onTimeIntervalChange(id, newTimeInterval)
  }

  return (
    <Row>De <CustomDatePicker
        format='HH:mm'
        type='time'
        placement={'rightStart'}
        style={{ width: '55px', margin: '0px 5px' }}
        disabled={disabled}
        value={timeInterval.from}
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
        value={timeInterval.to}
        onChange={value => setTimeInterval('to', value)}
        onSelect={value => setTimeInterval('to', value)}
      />
      <SquareButton type='delete' onClick={() => removeTimeInterval(id)} />
    </Row>
  )
}

export default TimeInterval
