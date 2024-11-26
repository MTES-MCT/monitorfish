import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { Always } from './Always'
import { DayTimeCheckbox } from './DayTimeCheckbox'
import { FishingPeriodAnnualRecurrence } from './FishingPeriodAnnualRecurrence'
import { FishingPeriodDateRanges } from './FishingPeriodDateRanges'
import { FishingPeriodDates } from './FishingPeriodDates'
import { Delimiter, FormContent, FormSection, RegulatorySectionTitle } from '../../../../commonStyles/Backoffice.style'
import { fishingPeriodToString } from '../../../utils'
import { AuthorizedRadioButtonGroup } from '../AuthorizedRadioButtonGroup'
import { FishingPeriodTimeSection } from './FishingPeriodTimeSection'
import { HolidayCheckbox } from './HolidayCheckbox'
import { WeekDays } from './WeekDays'

type FishingPeriodFormProps = Readonly<{
  show: boolean
}>
export function FishingPeriodForm({ show }: FishingPeriodFormProps) {
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)

  const [displayForm, setDisplayForm] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [fishingPeriodAsString, setFishingPeriodAsString] = useState<string | undefined>(undefined)
  const [timeIsDisabled, setTimeIsDisabled] = useState(true)

  useEffect(() => {
    const atLeastOneDateElementIsCompleted =
      processingRegulation.fishingPeriod &&
      (processingRegulation.fishingPeriod.dateRanges?.length > 0 ||
        processingRegulation.fishingPeriod.dates?.length > 0 ||
        processingRegulation.fishingPeriod.weekdays?.length > 0 ||
        processingRegulation.fishingPeriod.holidays !== undefined)
    setTimeIsDisabled(!atLeastOneDateElementIsCompleted)
  }, [processingRegulation.fishingPeriod, timeIsDisabled])

  useEffect(() => {
    if (!displayForm && processingRegulation.fishingPeriod?.authorized !== undefined) {
      setDisplayForm(true)
    }
  }, [displayForm, processingRegulation.fishingPeriod])

  useEffect(() => {
    if (processingRegulation.fishingPeriod?.always) {
      setDisabled(true)
    } else if (disabled && processingRegulation.fishingPeriod?.annualRecurrence !== undefined) {
      setDisabled(false)
    }
  }, [disabled, processingRegulation.fishingPeriod])

  useEffect(() => {
    if (
      processingRegulation.fishingPeriod &&
      (processingRegulation.fishingPeriod.dateRanges?.length ||
        !!processingRegulation.fishingPeriod.dates?.length ||
        !!processingRegulation.fishingPeriod.weekdays?.length ||
        !!processingRegulation.fishingPeriod.timeIntervals?.length ||
        !!processingRegulation.fishingPeriod.daytime ||
        processingRegulation.fishingPeriod.always !== undefined)
    ) {
      setFishingPeriodAsString(fishingPeriodToString(processingRegulation.fishingPeriod))
    } else {
      setFishingPeriodAsString(undefined)
    }
  }, [fishingPeriodAsString, processingRegulation.fishingPeriod])

  return (
    <FormSection show={show}>
      <RegulatorySectionTitle>
        <AuthorizedRadioButtonGroup title="Périodes" />
      </RegulatorySectionTitle>
      <Delimiter width={523} />
      <FormContent display={displayForm}>
        <Always authorized={processingRegulation.fishingPeriod?.authorized} />
        <FishingPeriodAnnualRecurrence disabled={processingRegulation.fishingPeriod?.always} />
        <DateTime>
          <ConditionalLines $disabled={disabled} $display={displayForm}>
            <FishingPeriodDateRanges disabled={disabled} />
            <FishingPeriodDates disabled={disabled} />
            <WeekDays disabled={disabled} />
            <HolidayCheckbox disabled={disabled} />
            <TimeTitle>Horaires {processingRegulation.fishingPeriod?.authorized ? 'autorisés' : 'interdits'}</TimeTitle>
            <Delimiter width={500} />
            <FishingPeriodTimeSection disabled={disabled} timeIsDisabled={timeIsDisabled} />
            <DayTimeCheckbox disabled={disabled} timeIsDisabled={timeIsDisabled} />
          </ConditionalLines>
        </DateTime>
        {fishingPeriodAsString && (
          <PeriodAsStringWrapper>
            <PeriodAsString>{fishingPeriodAsString}</PeriodAsString>
          </PeriodAsStringWrapper>
        )}
      </FormContent>
    </FormSection>
  )
}

const PeriodAsStringWrapper = styled.div`
  padding-top: 20px;
`
const PeriodAsString = styled.div`
  width: 420px;
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  background: ${p => p.theme.color.gainsboro};
  padding: 10px;
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
  display: 'flex';
  flex-direction: row;
  padding-top: 25px;
`

const TimeTitle = styled(RegulatorySectionTitle)`
  margin-top: 30px;
`
