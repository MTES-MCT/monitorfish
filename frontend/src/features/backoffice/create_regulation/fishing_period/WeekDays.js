import React from 'react'
import { Row } from '../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../commonStyles/Input.style'
import DayPicker from './DayPicker'

const WeekDays = ({ disabled }) => {
  return <Row>
    <Label>Jours de la semaine</Label>
    <DayPicker disabled={disabled} />
  </Row>
}

export default WeekDays
