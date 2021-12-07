import React, { useState, useCallback, useEffect } from 'react'
import { Label } from '../../../commonStyles/Input.style'
import styled, { css } from 'styled-components'
import { COLORS, SQUARE_BUTTON_TYPE } from '../../../../constants/constants'
import { Radio, RadioGroup } from 'rsuite'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import DateRange from './DateRange'
import CustomDatePicker from '../custom_form/CustomDatePicker'
import DayPicker from './DayPicker'
import TimeInterval from './TimeInterval'
import { CustomCheckbox, Delimiter } from '../../../commonStyles/Backoffice.style'
import { Row } from '../../../commonStyles/FishingPeriod.style'
import { DEFAULT_DATE_RANGE, fishingPeriodToString } from '../../../../domain/entities/regulatory'

const FISHING_PERIOD_KEYS = {
  DATE_RANGES: 'dateRanges',
  DATES: 'dates',
  TIME_INTERVALS: 'timeIntervals',
  AUTHORIZED: 'authorized',
  ANNUAL_RECURRENCE: 'annualRecurrence',
  WEEKDAYS: 'weekdays',
  HOLIDAYS: 'holidays',
  DAYTIME: 'daytime'
}

const FishingPeriodForm = (props) => {
  const {
    /** @type {FishingPeriod} fishingPeriod */
    fishingPeriod,
    setFishingPeriod,
    show
  } = props

  const {
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
  }, [fishingPeriod, timeIsDisabled])

  useEffect(() => {
    if (daytime) {
      set(FISHING_PERIOD_KEYS.TIME_INTERVALS, [])
    }
  }, [daytime])

  useEffect(() => {
    if (!displayForm && authorized !== undefined) {
      setDisplayForm(true)
    }
  }, [authorized])

  useEffect(() => {
    if (disabled && annualRecurrence !== undefined) {
      setDisabled(false)
    }
  }, [annualRecurrence])

  useEffect(() => {
    const {
      dateRanges,
      dates,
      weekdays,
      timeIntervals,
      daytime
    } = fishingPeriod
    if (dateRanges?.length || dates?.length || weekdays?.length || timeIntervals?.length || daytime) {
      setFishingPeriodAsString(fishingPeriodToString(fishingPeriod))
    } else {
      setFishingPeriodAsString(undefined)
    }
  }, [fishingPeriod, fishingPeriodAsString])

  const set = useCallback((key, value) => {
    const obj = {
      ...fishingPeriod,
      [key]: value
    }

    setFishingPeriod(obj)
  }, [fishingPeriod, setFishingPeriod])

  const push = useCallback((key, array, defaultValue) => {
    const newArray = array ? [...array] : []
    newArray.push(defaultValue || undefined)

    set(key, newArray)
  }, [set])

  const pop = useCallback((key, array) => {
    const newArray = [...array]
    newArray.pop()

    set(key, newArray)
  }, [set])

  const update = useCallback((id, key, array, value) => {
    const newArray = array ? [...array] : []

    if (id === -1) {
      newArray.push(value)
    } else {
      newArray[id] = value
    }

    set(key, newArray)
  }, [set])

  const updateDateRanges = (id, dateRange) => {
    update(id, FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges, dateRange)
  }

  const onDateChange = (id, date) => {
    update(id, FISHING_PERIOD_KEYS.DATES, dates, date)
  }

  const onTimeIntervalChange = (id, timeInterval) => {
    update(id, FISHING_PERIOD_KEYS.TIME_INTERVALS, timeIntervals, timeInterval)
  }

  const setWeekdays = value => set(FISHING_PERIOD_KEYS.WEEKDAYS, value)
  const setHolidays = _ => set(FISHING_PERIOD_KEYS.HOLIDAYS, !holidays)
  const setDaytime = _ => set(FISHING_PERIOD_KEYS.DAYTIME, !daytime)

  return <Wrapper show={show}>
    <Title >
      <AuthorizedRadio
        inline
        onChange={value => set(FISHING_PERIOD_KEYS.AUTHORIZED, value)}
        value={authorized}
      >
        Périodes
        <CustomRadio checked={authorized} value={true} >
          autorisées
          <GreenCircle />
        </CustomRadio>
        <CustomRadio checked={authorized === false} value={false} >
          interdites
          <RedCircle />
        </CustomRadio>
      </AuthorizedRadio>
    </Title>
    <Delimiter width='523' />
    <AnnualRecurrence display={displayForm} authorized={authorized}>
      <Label>Récurrence annuelle</Label>
      <RadioGroup
        inline
        onChange={value => set(FISHING_PERIOD_KEYS.ANNUAL_RECURRENCE, value)}
        value={annualRecurrence}
      >
        <CustomRadio value={true}>oui</CustomRadio>
        <CustomRadio value={false}>non</CustomRadio>
      </RadioGroup>
    </AnnualRecurrence>
    <DateTime display={displayForm} authorized={authorized}>
      <ConditionalLines display={displayForm} disabled={disabled}>
        <Row>
          <ContentWrapper>
            <Label>Plages de dates</Label>
          </ContentWrapper>
          <DateRanges>
            { dateRanges?.length > 0
              ? dateRanges.map((dateRange, id) => {
                return <DateRange
                    key={id}
                    id={id}
                    annualRecurrence={annualRecurrence}
                    dateRange={dateRange}
                    updateList={updateDateRanges}
                    disabled={disabled}
                    isLast={id === dateRanges.length - 1}
                  />
              })
              : <DateRange
                key={-1}
                id={-1}
                isLast
                annualRecurrence={annualRecurrence}
                dateRange={DEFAULT_DATE_RANGE}
                updateList={updateDateRanges}
                disabled={disabled}
              />
            }
          </DateRanges>
          <ContentWrapper alignItems={'flex-end'}>
            <SquareButton
              disabled={disabled || dateRanges?.length === 0}
              onClick={_ => !disabled && push(FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges, DEFAULT_DATE_RANGE)} />
            <SquareButton
              disabled={disabled || dateRanges?.length === 0}
              type={SQUARE_BUTTON_TYPE.DELETE}
              onClick={_ => !disabled && pop(FISHING_PERIOD_KEYS.DATE_RANGES, dateRanges)} />
          </ContentWrapper>
        </Row>
        <Row>
          <ContentWrapper>
            <Label>Dates précises</Label>
          </ContentWrapper>
          <DateList>
            { dates?.length > 0
              ? dates.map((date, id) => {
                return <DateRow key={id} $isLast={id === dates.length - 1}>
                  <CustomDatePicker
                    disabled={disabled}
                    value={date}
                    saveValue={date => onDateChange(id, date)}
                    format='DD/MM/YYYY'
                    placement={'rightStart'}
                    oneTap
                  />
                </DateRow>
              })
              : <DateRow key={-1} $isLast>
                  <CustomDatePicker
                    disabled={disabled}
                    value={undefined}
                    saveValue={date => onDateChange(-1, date)}
                    format='DD/MM/YYYY'
                    placement={'rightStart'}
                    oneTap
                  />
                </DateRow>
            }
          </DateList>
          <ContentWrapper alignItems={'flex-end'}>
            <SquareButton
              type={SQUARE_BUTTON_TYPE.DELETE}
              disabled={disabled || !dates?.length > 0}
              onClick={_ => !disabled && pop(FISHING_PERIOD_KEYS.DATES, dates)} />
            <SquareButton
              disabled={disabled || !dates?.length > 0}
              onClick={_ => !disabled && push(FISHING_PERIOD_KEYS.DATES, dates)} />
          </ContentWrapper>
        </Row>
        <Row>
          <Label>Jours de la semaine</Label>
          <DayPicker
            disabled={disabled}
            selectedList={weekdays}
            setSelectedList={setWeekdays}
          />
        </Row>
        <Row>
          <Label>Jours fériés</Label>
          <HolidaysCheckbox disabled={disabled} onChange={setHolidays} checked={holidays}/>
        </Row>
        <TimeTitle>Horaires {authorized ? 'autorisés' : 'interdits'}</TimeTitle>
        <Delimiter width='500' />
        <TimeRow disabled={timeIsDisabled}>
          <DateRanges>
              { timeIntervals?.length > 0
                ? timeIntervals.map((timeInterval, id) => {
                  return <TimeInterval
                    key={id}
                    id={id}
                    isLast={id === timeIntervals.length - 1}
                    timeInterval={timeInterval}
                    disabled={timeIsDisabled || disabled || daytime}
                    onTimeIntervalChange={onTimeIntervalChange}
                  />
                })
                : <TimeInterval
                  key={-1}
                  id={-1}
                  isLast
                  timeInterval={undefined}
                  disabled={timeIsDisabled || disabled || daytime}
                  onTimeIntervalChange={onTimeIntervalChange}
                />
              }
          </DateRanges>
          <ContentWrapper>
            <SquareButton
              type={SQUARE_BUTTON_TYPE.DELETE}
              disabled={timeIsDisabled || disabled || timeIntervals?.length === 0}
              onClick={_ => !disabled && pop(FISHING_PERIOD_KEYS.TIME_INTERVALS, timeIntervals)} />
            <SquareButton
              disabled={timeIsDisabled || disabled || timeIntervals?.length === 0}
              onClick={_ => !disabled && push(FISHING_PERIOD_KEYS.TIME_INTERVALS, timeIntervals, {})} />
          </ContentWrapper>
        </TimeRow>
        <TimeRow disabled={timeIsDisabled}>
          Ou<DaytimeCheckbox
            disabled={timeIsDisabled || disabled}
            checked={daytime}
            onChange={setDaytime}
          >du lever au coucher du soleil</DaytimeCheckbox>
        </TimeRow>
      </ConditionalLines>
    </DateTime>
    {fishingPeriodAsString &&
    <PeriodAsStringWrapper display={displayForm} authorized={authorized}>
      <PeriodAsString>
        {fishingPeriodAsString}
      </PeriodAsString>
    </PeriodAsStringWrapper>}
  </Wrapper>
}

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  ${props => props.alignItems ? `align-items: ${props.alignItems}` : ''};
`

const PeriodAsStringWrapper = styled.div`
  display: ${props => !props.display ? 'none' : 'flex'};
  border-left: 8px solid ${props => props.authorized ? COLORS.mediumSeaGreen : COLORS.red};
  padding-top: 20px;
`
const PeriodAsString = styled.div`
  width: 420px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  background: ${COLORS.gainsboro};
  padding: 10px;
  margin-left: 15px;
  text-align: left;
`

const AnnualRecurrence = styled.div`
  display: ${props => !props.display ? 'none' : 'flex'};
  border-left: 8px solid ${props => props.authorized ? COLORS.mediumSeaGreen : COLORS.red};
  padding-left: 15px;
  .rs-radio-group {
    margin-left: -10px;
  }
`

const TimeRow = styled(Row)`
  opacity: ${props => props.disabled ? '0.4' : '1'};
`

const ConditionalLines = styled.div`
  display: ${props => props.display ? 'flex' : 'none'};
  opacity: ${props => props.disabled ? '0.4' : '1'};
  flex-direction: column;
`

const Wrapper = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  ${props => props.show ? 'flex-direction: column;' : ''};
`

const DateRow = styled.div`
  display: flex;
  ${props => props.$isLast ? '' : 'margin-bottom: 5px;'}
`
const DateList = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 10px;
`

const DaytimeCheckbox = styled(CustomCheckbox)`
  margin-left: 5px;
`

const HolidaysCheckbox = styled(CustomCheckbox)`
  margin-top: -15px;
`
const DateTime = styled.div`
  display: ${props => props.display ? 'flex' : 'none'};
  flex-direction: row;
  opacity: ${props => props.disabled ? '0.4' : '1'};
  border-left: 8px solid ${props => props.authorized ? COLORS.mediumSeaGreen : COLORS.red};
  padding-left: 15px;
  padding-top: 25px;
`

const normalTitle = css`
  display: flex;
  padding: 0px 0px 10px 0px;
  align-items: center;
  font-size: 13px;
  color: ${COLORS.slateGray};
`
const Title = styled.div`
  ${normalTitle}
`

const TimeTitle = styled(Title)`
  ${normalTitle}
  margin-top: 30px;
`

const DateRanges = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
`

const circle = css`
  display: inline-block;
  height: 10px;
  width: 10px;
  margin-left: 6px;
  border-radius: 50%;
  vertical-align: middle;
`
const GreenCircle = styled.span`
  ${circle}
  background-color: ${COLORS.mediumSeaGreen};
`

const RedCircle = styled.span`
  ${circle}
  background-color: ${COLORS.red};
`

const AuthorizedRadio = styled(RadioGroup)` 
  display: flex;
  flex-direction: row;
  align-items: center;
`

const CustomRadio = styled(Radio)`
  .rs-radio-checker {
    padding-top: 0px;
    padding-bottom: 4px;
    padding-left: 29px;
    min-height: 0px;
    line-height: 1;
    position: relative;
    &:before {
      box-sizing: border-box;
    }
    &:after {
      box-sizing: border-box;
    }
    margin-right: 0px;
  }

  .rs-radio-checker > label {
    font-size: 13px;
    vertical-align: sub;
    color: ${COLORS.gunMetal};
  }
`

export default FishingPeriodForm
