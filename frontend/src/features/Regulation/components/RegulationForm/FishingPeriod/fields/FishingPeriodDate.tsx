import { useUpdateArrayInFishingPeriod } from '@features/Regulation/components/RegulationForm/FishingPeriod/hooks/useUpdateArrayInFishingPeriod'
import { FishingPeriodKey } from '@features/Regulation/utils'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { DatePicker } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type FishingPeriodDateProps = Readonly<{
  date: string | undefined
  disabled: boolean
  id: number
}>
export function FishingPeriodDate({ date, disabled, id }: FishingPeriodDateProps) {
  const fishingPeriod = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod)
  // TODO Simplify this unnecessarily complex pattern: a callback "maker" result called withing another callback.
  const updateDates = useUpdateArrayInFishingPeriod(FishingPeriodKey.DATES, fishingPeriod?.dates)

  return (
    <DateRow>
      <DatePicker
        defaultValue={date}
        disabled={disabled}
        isErrorMessageHidden
        isLabelHidden
        isStringDate
        label="Début"
        name={`startDate-${String(date)}`}
        onChange={nextDate => {
          updateDates(id, nextDate)
        }}
        withTime={false}
      />
    </DateRow>
  )
}

const DateRow = styled.div`
  margin-bottom: 5px;
  margin-right: 7px;
  display: flex;
`
