import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Delimiter, FormContent, FormSection, RegulatorySectionTitle } from '../../../commonStyles/Backoffice.style'
import { fishingPeriodToString } from '../../../../domain/entities/regulation'
import AuthorizedRadioButtonGroup from '../AuthorizedRadioButtonGroup'
import FishingPeriodDateRanges from './FishingPeriodDateRanges'
import HolidayCheckbox from './HolidayCheckbox'
import DayTimeCheckbox from './DayTimeCheckbox'
import FishingPeriodTimeSection from './FishingPeriodTimeSection'
import WeekDays from './WeekDays'
import FishingPeriodDates from './FishingPeriodDates'
import FishingPeriodAnnualRecurrence from './FishingPeriodAnnualRecurrence'
import Always from './Always'

const FishingPeriodForm = ({ show }) => {
  const { fishingPeriod } = useSelector(state => state.regulation.processingRegulation)

  const {
    always,
    authorized,
    annualRecurrence,
    dateRanges,
    dates,
    weekdays,
    holidays,
    daytime,
    timeIntervals
  } = fishingPeriod

  const [displayForm, setDisplayForm] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [fishingPeriodAsString, setFishingPeriodAsString] = useState()
  const [timeIsDisabled, setTimeIsDisabled] = useState(true)

  useEffect(() => {
    const atLeastOneDateElementIsCompleted = dateRanges?.length > 0 || dates?.length > 0 || weekdays?.length > 0 || holidays !== undefined
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
    if (dateRanges?.length || dates?.length || weekdays?.length || timeIntervals?.length || daytime || always !== undefined) {
      setFishingPeriodAsString(fishingPeriodToString(fishingPeriod))
    } else {
      setFishingPeriodAsString(undefined)
    }
  }, [fishingPeriod, dateRanges, dates, weekdays, timeIntervals, daytime, always, fishingPeriodAsString])

  return <FormSection show={show}>
    <RegulatorySectionTitle >
      <AuthorizedRadioButtonGroup title={'Périodes'} />
    </RegulatorySectionTitle>
    <Delimiter width='523' />
    <FormContent display={displayForm} authorized={authorized}>
      <Always authorized={authorized} />
      <FishingPeriodAnnualRecurrence disabled={always}/>
      <DateTime>
        <ConditionalLines $display={displayForm} disabled={disabled}>
          <FishingPeriodDateRanges disabled={disabled} />
          <FishingPeriodDates disabled={disabled} />
          <WeekDays disabled={disabled} />
          <HolidayCheckbox disabled={disabled} />
          <TimeTitle>Horaires {authorized ? 'autorisés' : 'interdits'}</TimeTitle>
          <Delimiter width='500' />
          <FishingPeriodTimeSection timeIsDisabled={timeIsDisabled} disabled={disabled} />
          <DayTimeCheckbox timeIsDisabled={timeIsDisabled} disabled={disabled} />
        </ConditionalLines>
      </DateTime>
      {fishingPeriodAsString &&
      <PeriodAsStringWrapper >
        <PeriodAsString>
          {fishingPeriodAsString}
        </PeriodAsString>
      </PeriodAsStringWrapper>}
    </FormContent>
  </FormSection>
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
  display: ${props => props.$display ? 'flex' : 'none'};
  opacity: ${props => props.disabled ? '0.4' : '1'};
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
