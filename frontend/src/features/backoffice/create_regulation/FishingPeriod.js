import React, { useState, useCallback, useEffect } from 'react'
import { Label } from '../../commonStyles/Input.style'
import styled, { css } from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Radio, RadioGroup } from 'rsuite'
import { SquareButton } from '../../commonStyles/Buttons.style'
import DateRange from './DateRange'
import CustomDatePicker from './CustomDatePicker'
import DayPicker from './DayPicker'
import { CustomCheckbox } from '../../commonStyles/Backoffice.style'
import { DEFAULT_DATE_RANGE, DEFAULT_DATE } from '../../../domain/entities/regulatory'

const FishingPeriod = (props) => {
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
    daytime
  } = fishingPeriod

  const [displayForm, setDisplayForm] = useState(false)
  const [disabled, setDisabled] = useState(true)
  const [fishingPeriodAsString, setFishingPeriodAsString] = useState()

  const set = useCallback((key, value) => {
    const obj = {
      ...fishingPeriod,
      [key]: value
    }
    setFishingPeriod(obj)
  })

  /**
   * Add a time slot object to the timeSlots list
   * @param {DateRange} timeSlot: object to add
   */
  const addDateRange = () => {
    const newDateRanges = [...dateRanges]
    newDateRanges.push(DEFAULT_DATE_RANGE)
    set('dateRanges', newDateRanges)
  }

  /**
   * Remove a time slot object from the timeSlots list
   * @param {number} id: object id in the list
   */
  const removeDateRange = (id) => {
    let newDateRanges = [...dateRanges]
    if (newDateRanges.length === 1) {
      newDateRanges = [{}]
    } else {
      newDateRanges.splice(id, 1)
    }
    set('dateRanges', newDateRanges)
  }

  /**
   * update a given object in the dateRanges list
   * @param {number} id: object id
   * @param {number} dateRanges: new object to insert
   */
  const updateDateRanges = (id, dateRange) => {
    // should we test the values here ?
    const newDateRanges = [...dateRanges]
    newDateRanges[id] = dateRange
    set('dateRanges', newDateRanges)
  }

  const onPeriodChange = (value) => {
    set('authorized', value)
    if (!displayForm) {
      setDisplayForm(true)
    }
  }

  const onRecurrenceChange = (value) => {
    set('annualRecurrence', value)
    if (disabled) {
      setDisabled(false)
    }
  }

  const onDateChange = (id, date) => {
    const newList = [...dates]
    newList[id] = date
    set('dates', newList)
  }

  const onDeleteDate = (id) => {
    if (!disabled) {
      const newList = [...dates]
      newList.splice(id, 1)
      set('dates', newList)
    }
  }

  const onAddDate = () => {
    if (!disabled) {
      const newList = [...dates]
      newList.push(undefined)
      set('dates', newList)
    }
  }

  const setWeekdays = value => set('weekdays', value)
  const setHolidays = _ => set('holidays', !holidays)
  const setDaytime = _ => set('daytime', !daytime)

  useEffect(() => {
    console.log('useEffect')
    console.log(fishingPeriod)
    if (dateRanges?.length > 0 || dates?.length > 0 || weekdays?.length > 0) {
      setFishingPeriodAsString(toString())
    }
  }, [fishingPeriod, fishingPeriodAsString])

  const toString = () => {
    const textArray = []
    if (dateRanges?.length > 0) {
      textArray.push(dateRanges.map(({ startDate, endDate }) => {
        if (startDate && startDate !== DEFAULT_DATE && endDate && endDate !== DEFAULT_DATE) {
          return `du ${startDate.day}/${startDate.month}${annualRecurrence && `/${startDate.year}`} 
            au ${endDate.day}/${endDate.month}${annualRecurrence && `/${endDate.year}`} `
        }
        return null
      }).join(', '))
    }
    if (dates?.length > 0) {
      textArray.push(dates.map(date => {
        return `le ${date.getDay()}/${date.getMonth()}/${date.getYear()} `
      }).join('et '))
    }
    if (weekdays?.length > 0) {
      textArray.push(`le${weekdays.length > 1 ? 's' : ''} ${weekdays.join(', ')}.`)
    }
    return `Pêche ${authorized ? 'autorisée' : 'interdite'} `.concat(textArray.join(', '))
  }

  return <Wrapper show={show}>
    <Title>
      <PeriodRadioGroup
        inline={true}
        onChange={onPeriodChange}
      >
        Périodes
        <CustomRadio checked={authorized} value={true} />
        {' autorisées'}
        <GreenCircle />
        <CustomRadio checked={authorized === false} value={false} />
        {' interdites'}
        <RedCircle />
      </PeriodRadioGroup>
    </Title>
    <PeriodRow display={displayForm} authorized={authorized}>
      <Label>Récurrence annuelle</Label>
      <RadioGroup
        inline={true}
        onChange={onRecurrenceChange}
        value={annualRecurrence}
      >
        <CustomRadio value={true} >oui</CustomRadio>
        <CustomRadio value={false} >non</CustomRadio>
      </RadioGroup>
    </PeriodRow>
    <DateTimeWrapper display={displayForm} authorized={authorized}>
      <ConditionnalLines display={displayForm} disabled={disabled}>
        <Row>
          <Label>Plages de dates</Label>
          <DateRanges>
            { dateRanges
              ? dateRanges.map((dateRange, id) => {
                return <DateRange
                    key={id}
                    id={id}
                    annualRecurrence={annualRecurrence}
                    dateRange={dateRange}
                    updateList={updateDateRanges}
                    removeDateRange={removeDateRange}
                    disabled={disabled}
                  />
              })
              : <DateRange
                key={0}
                id={0}
                annualRecurrence={annualRecurrence}
                dateRange={DEFAULT_DATE_RANGE}
                updateList={updateDateRanges}
                removeDateRange={removeDateRange}
                disabled={disabled}
              />
            }
          </DateRanges>
          <SquareButton
            disabled={disabled}
            onClick={addDateRange} />
        </Row>
        <Row>
          <Label>Dates précises</Label>
          <DateList >
            { dates && dates.length > 0
              ? dates.map((date, id) => {
                return <DateRow key={id}>
                  <CustomDatePicker
                    disabled={disabled}
                    value={date}
                    onChange={date => onDateChange(id, date)}
                    format='DD/MM/YYYY'
                    placement={'rightStart'}
                    style={{ marginRight: '10px' }}
                  />
                  <SquareButton
                    type='delete'
                    disabled={disabled}
                    onClick={_ => onDeleteDate(id)} />
                </DateRow>
              })
              : <DateRow key={0}>
                  <CustomDatePicker
                    disabled={disabled}
                    value={undefined}
                    onChange={date => onDateChange(0, date)}
                    format='DD/MM/YYYY'
                    placement={'rightStart'}
                    style={{ marginRight: '10px' }}
                  />
                  <SquareButton
                    type='delete'
                    disabled={disabled}
                    onClick={_ => onDeleteDate(0)} />
                </DateRow>
            }
          </DateList>
          <SquareButton
            disabled={disabled}
            onClick={onAddDate}/>
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
          <HolidaysCheckbox disabled={disabled} onChange={setHolidays}/>
        </Row>
        <TimeTitle>Horaires autorisées</TimeTitle>
        <Row>De <CustomDatePicker
            format='MM/DD/YYYY'
            placement={'rightStart'}
            style={{ margin: '0px 5px' }}
            disabled={disabled}
          />
          à <CustomDatePicker
            format='DD/MM/YYYY'
            placement={'rightStart'}
            style={{ margin: '0px 5px' }}
            disabled={disabled === 2}
          />
          <SquareButton disabled={disabled}/>
        </Row>
        <Row>
          ou <DaytimeCheckbox disabled={disabled} checked={daytime} onChange={setDaytime}/> du lever au coucher du soleil
        </Row>
      </ConditionnalLines>
    </DateTimeWrapper>
    {fishingPeriodAsString &&
    <PeriodAsStringWrapper display={displayForm} authorized={authorized}>
      <PeriodAsString >
        {fishingPeriodAsString}
      </PeriodAsString >
    </PeriodAsStringWrapper>}
  </Wrapper>
}

const PeriodAsStringWrapper = styled.div`
  ${props => !props.display ? 'display: none;' : ''}
  border-left: 8px solid ${props => props.authorized ? COLORS.mediumSeaGreen : COLORS.red};
  padding-top: 20px;
  margin-bottom: 30px;
`
const PeriodAsString = styled.div`
  width: 420px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  background: ${COLORS.gainsboro};
  padding: 10px;
  margin-left: 15px;
`

const PeriodRow = styled.div`
  ${props => !props.display ? 'display: none;' : ''}
  border-left: 8px solid ${props => props.authorized ? COLORS.mediumSeaGreen : COLORS.red};
  padding-left: 15px;
  padding-bottom: 15px;
  .rs-radio-group {
    margin-left: 13px;
  }
`

const ConditionnalLines = styled.div`
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
`
const DateList = styled.div`
  display: flex;
  flex-direction: column;
`
const DaytimeCheckbox = styled(CustomCheckbox)`
  margin: -15px 5px 0px 5px;
`
const HolidaysCheckbox = styled(CustomCheckbox)`
  margin-top: -15px;
`
const DateTimeWrapper = styled.div`
  display: ${props => props.display ? 'flex' : 'none'};
  flex-direction: row;
  opacity: ${props => props.disabled ? '0.4' : '1'};
  border-left: 8px solid ${props => props.authorized ? COLORS.mediumSeaGreen : COLORS.red};
  padding-left: 15px;
  padding-top: 15px;
`

const normalTitle = css`
  display: flex;
  padding: 0px 0px 10px 0px;
  align-items: center;
  font-size: 13px;
  color: ${COLORS.slateGray};
  border-bottom: 1px solid ${COLORS.lightGray};
`
const Title = styled.div`
  ${normalTitle}
  margin-bottom: 18px;
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

const Row = styled.div`
  display: ${props => props.display === false ? 'none' : 'flex'};
  margin-bottom: 8px;
  align-items: center;
  color: ${COLORS.slateGray}
`

const circle = css`
  display: inline-block;
  height: 10px;
  width: 10px;
  margin-left: 6px;
  border-radius: 50%;
`
const GreenCircle = styled.span`
  ${circle}
  background-color: ${COLORS.mediumSeaGreen};
`

const RedCircle = styled.span`
  ${circle}
  background-color: ${COLORS.red};
`

const PeriodRadioGroup = styled(RadioGroup)` 
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
    color: ${COLORS.slateGray};
  }
`

export default FishingPeriod
