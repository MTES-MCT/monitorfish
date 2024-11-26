import { DayPicker } from './DayPicker'
import { Row } from '../../../../commonStyles/FishingPeriod.style'
import { Label } from '../../../../commonStyles/Input.style'

type WeekDaysProps = Readonly<{
  disabled: boolean
}>
export function WeekDays({ disabled }: WeekDaysProps) {
  return (
    <Row>
      <Label>Jours de la semaine</Label>
      <DayPicker disabled={disabled} />
    </Row>
  )
}
