import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import styled from 'styled-components'

import { Always } from './fields/Always'
import { AuthorizedRadioButtonGroup } from './fields/AuthorizedRadioButtonGroup'
import { DayTimeCheckbox } from './fields/DayTimeCheckbox'
import { FishingPeriodAnnualRecurrence } from './fields/FishingPeriodAnnualRecurrence'
import { FishingPeriodDateRanges } from './fields/FishingPeriodDateRanges'
import { FishingPeriodDates } from './fields/FishingPeriodDates'
import { FishingPeriodTimeSection } from './fields/FishingPeriodTimeSection'
import { HolidayCheckbox } from './fields/HolidayCheckbox'
import { WeekDays } from './fields/WeekDays'
import { Delimiter, FormContent, FormSection, RegulatorySectionTitle } from '../../../../commonStyles/Backoffice.style'
import { fishingPeriodToString } from '../../../utils'

type FishingPeriodFormProps = Readonly<{
  show: boolean
}>
export function FishingPeriodForm({ show }: FishingPeriodFormProps) {
  const fishingPeriod = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod)

  const timeIsDisabled = (function () {
    const atLeastOneDateElementIsCompleted =
      fishingPeriod &&
      (fishingPeriod.dateRanges?.length > 0 ||
        fishingPeriod.dates?.length > 0 ||
        fishingPeriod.weekdays?.length > 0 ||
        fishingPeriod.holidays !== undefined)

    return !atLeastOneDateElementIsCompleted
  })()

  const displayForm = fishingPeriod?.authorized !== undefined
  const disabled = fishingPeriod?.always ?? fishingPeriod?.annualRecurrence === undefined

  const fishingPeriodAsString = (function () {
    if (
      fishingPeriod &&
      (fishingPeriod.dateRanges?.length ||
        !!fishingPeriod.dates?.length ||
        !!fishingPeriod.weekdays?.length ||
        !!fishingPeriod.timeIntervals?.length ||
        !!fishingPeriod.daytime ||
        fishingPeriod.always !== undefined)
    ) {
      return fishingPeriodToString(fishingPeriod)
    }

    return undefined
  })()

  return (
    <FormSection $show={show}>
      <RegulatorySectionTitle>
        <AuthorizedRadioButtonGroup />
      </RegulatorySectionTitle>
      <Delimiter width={523} />
      <FormContent $display={displayForm}>
        <Always />
        <FishingPeriodAnnualRecurrence disabled={fishingPeriod?.always} />
        <DateTime>
          <ConditionalLines $disabled={disabled} $display={displayForm}>
            <FishingPeriodDateRanges disabled={disabled} />
            <FishingPeriodDates disabled={disabled} />
            <WeekDays disabled={disabled} />
            <HolidayCheckbox disabled={disabled} />
            <TimeTitle>Horaires {fishingPeriod?.authorized ? 'autorisés' : 'interdits'}</TimeTitle>
            <Delimiter width={500} />
            <FishingPeriodTimeSection disabled={disabled} timeIsDisabled={timeIsDisabled} />
            <DayTimeCheckbox disabled={disabled} timeIsDisabled={timeIsDisabled} />
          </ConditionalLines>
        </DateTime>
        {fishingPeriodAsString && <PeriodAsString>{fishingPeriodAsString}</PeriodAsString>}
      </FormContent>
    </FormSection>
  )
}

const PeriodAsString = styled.div`
  width: 420px;
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  background: ${p => p.theme.color.gainsboro};
  padding: 10px;
  margin-top: 20px;
  text-align: left;
`

const ConditionalLines = styled.div<{
  $disabled: boolean
  $display: boolean
}>`
  display: ${p => (p.$display ? 'flex' : 'none')};
  opacity: ${p => (p.$disabled ? '0.4' : '1')};
  flex-direction: column;
`

const DateTime = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: 25px;
`

const TimeTitle = styled(RegulatorySectionTitle)`
  margin-top: 30px;
`
