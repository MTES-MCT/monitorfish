import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { fishingPeriodToString } from '../../../../domain/entities/regulatory'
import { Delimiter, FormContent, FormSection, RegulatorySectionTitle } from '../../../commonStyles/Backoffice.style'
import AuthorizedRadioButtonGroup from '../AuthorizedRadioButtonGroup'
import Always from './Always'
import DayTimeCheckbox from './DayTimeCheckbox'
import FishingPeriodAnnualRecurrence from './FishingPeriodAnnualRecurrence'
import FishingPeriodDateRanges from './FishingPeriodDateRanges'
import FishingPeriodDates from './FishingPeriodDates'
import FishingPeriodTimeSection from './FishingPeriodTimeSection'
import HolidayCheckbox from './HolidayCheckbox'
import WeekDays from './WeekDays'

function FishingPeriodForm({ show }) {
  const { fishingPeriod } = useSelector(state => state.regulation.processingRegulation)

  const { always, annualRecurrence, authorized, dateRanges, dates, daytime, holidays, timeIntervals, weekdays } =
    fishingPeriod

  const [displayForm, setDisplayForm] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [fishingPeriodAsString, setFishingPeriodAsString] = useState()
  const [timeIsDisabled, setTimeIsDisabled] = useState(true)

  useEffect(() => {
    const atLeastOneDateElementIsCompleted =
      dateRanges?.length > 0 || dates?.length > 0 || weekdays?.length > 0 || holidays !== undefined
    setTimeIsDisabled(!atLeastOneDateElementIsCompleted)
  }, [fishingPeriod, timeIsDisabled, dateRanges, dates, weekdays, holidays])

  useEffect(() => {
    if (!displayForm && authorized !== undefined) {
      setDisplayForm(true)
    }
  }, [displayForm, authorized])

  useEffect(() => {
    if (always) {
      setDisabled(true)
    } else if (disabled && annualRecurrence !== undefined) {
      setDisabled(false)
    }
  }, [disabled, annualRecurrence, always])

  useEffect(() => {
    if (
      dateRanges?.length ||
      dates?.length ||
      weekdays?.length ||
      timeIntervals?.length ||
      daytime ||
      always !== undefined
    ) {
      setFishingPeriodAsString(fishingPeriodToString(fishingPeriod))
    } else {
      setFishingPeriodAsString(undefined)
    }
  }, [fishingPeriod, dateRanges, dates, weekdays, timeIntervals, daytime, always, fishingPeriodAsString])

  return (
    <FormSection show={show}>
      <RegulatorySectionTitle>
        <AuthorizedRadioButtonGroup title="Périodes" />
      </RegulatorySectionTitle>
      <Delimiter width="523" />
      <FormContent authorized={authorized} display={displayForm}>
        <Always authorized={authorized} />
        <FishingPeriodAnnualRecurrence disabled={always} />
        <DateTime>
          <ConditionalLines $display={displayForm} disabled={disabled}>
            <FishingPeriodDateRanges disabled={disabled} />
            <FishingPeriodDates disabled={disabled} />
            <WeekDays disabled={disabled} />
            <HolidayCheckbox disabled={disabled} />
            <TimeTitle>Horaires {authorized ? 'autorisés' : 'interdits'}</TimeTitle>
            <Delimiter width="500" />
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
  color: ${COLORS.gunMetal};
  background: ${COLORS.gainsboro};
  padding: 10px;
  text-align: left;
`

const ConditionalLines = styled.div`
  display: ${props => (props.$display ? 'flex' : 'none')};
  opacity: ${props => (props.disabled ? '0.4' : '1')};
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

export default FishingPeriodForm
