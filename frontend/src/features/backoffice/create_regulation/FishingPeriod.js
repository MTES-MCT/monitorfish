import React, { useState, useCallback, useEffect } from 'react'
import { Label } from '../../commonStyles/Input.style'
import styled, { css } from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Radio, RadioGroup } from 'rsuite'
import { SquareButton } from '../../commonStyles/Buttons.style'
import DateRange from './DateRange'
import CustomDatePicker from './CustomDatePicker'
import DayPicker from './DayPicker'
import TimeInterval from './TimeInterval'
import { CustomCheckbox } from '../../commonStyles/Backoffice.style'
import { Row } from '../../commonStyles/FishingPeriod.style'
import { DEFAULT_DATE_RANGE } from '../../../domain/entities/regulatory'

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
    daytime,
    timeIntervals
  } = fishingPeriod

  const [displayForm, setDisplayForm] = useState(authorized)
  const [disabled, setDisabled] = useState(annualRecurrence === undefined)
  const [fishingPeriodAsString, setFishingPeriodAsString] = useState()

  useEffect(() => {
    if (daytime) {
      set('timeIntervals', [])
    }
  }, [daytime])

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

  // TODO make generic function to add and remove elements in an array

  /**
   * Remove a time slot object from the timeSlots list
   * @param {number} id: object id in the list
   */
  const removeDateRange = (id) => {
    let newDateRanges = []
    if (dateRanges.length > 1) {
      newDateRanges = [...dateRanges]
      newDateRanges.splice(id, 1)
    }
    set('dateRanges', newDateRanges)
  }

  /**
   * Add an empty time interval in the timeIntervals list
   */
  const addTimeInterval = () => {
    const newTimeIntervals = [...timeIntervals]
    newTimeIntervals.push({})
    set('timeIntervals', newTimeIntervals)
  }

  /**
   * Remove the element at the id index from the list
   * @param {number} id
   */
  const removeTimeInterval = (id) => {
    let newTimeIntervals = []
    if (newTimeIntervals.length > 1) {
      newTimeIntervals = [...timeIntervals]
      newTimeIntervals.splice(id, 1)
    }
    set('timeIntervals', newTimeIntervals)
  }

  /**
   * update a given object in the dateRanges list
   * @param {number} id: object id
   * @param {number} dateRanges: new object to insert
   */
  const updateDateRanges = (id, dateRange) => {
    // should we test the values here ?
    const newDateRanges = [...dateRanges]
    if (id === -1) {
      newDateRanges.push(dateRange)
    } else {
      newDateRanges[id] = dateRange
    }
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
    let newList = []
    if (id !== -1 && date?.length > 0) {
      newList = [...dates]
      newList[id] = date
    } else {
      newList.push(date)
    }
    set('dates', newList)
  }

  const onDeleteDate = (id) => {
    let newList = []
    if (dates?.length > 1) {
      newList = [...dates]
      newList.splice(id, 1)
    }
    set('dates', newList)
  }

  const onAddDate = () => {
    if (!disabled) {
      const newList = [...dates]
      newList.push(undefined)
      set('dates', newList)
    }
  }

  const onTimeIntervalChange = (id, timeInterval) => {
    let newList = []
    if (id !== -1 && timeIntervals?.length > 0) {
      newList = [...timeIntervals]
      newList[id] = timeInterval
    } else {
      newList.push(timeInterval)
    }
    set('timeIntervals', newList)
  }

  const setWeekdays = value => set('weekdays', value)
  const setHolidays = _ => set('holidays', !holidays)
  const setDaytime = _ => set('daytime', !daytime)

  useEffect(() => {
    if (dateRanges?.length || dates?.length || weekdays?.length || timeIntervals?.length || daytime) {
      setFishingPeriodAsString(fishingPeriodToString())
    } else {
      setFishingPeriodAsString(undefined)
    }
  }, [fishingPeriod, fishingPeriodAsString])

  const toArrayString = (array) => {
    if (array?.length) {
      if (array.length === 1) {
        return array[0]
      } else if (array.length === 2) {
        return array.join(' et ')
      } else {
        return array.slice(0, -1).join(', ').concat(' et ').concat(array.slice(-1))
      }
    }
  }

  const dateToString = (date) => {
    const options = { day: 'numeric', month: 'long' }
    if (annualRecurrence) {
      options.year = 'numeric'
    }
    return date.toLocaleDateString('fr-FR', options)
  }

  const fishingPeriodToString = () => {
    const textArray = []
    if (dateRanges?.length) {
      const array = toArrayString(
        dateRanges.map(({ startDate, endDate }) => {
          if (startDate && endDate) {
            return `du ${dateToString(startDate)} au ${dateToString(endDate)}`
          }
          return undefined
        }).filter(e => e)
      )
      if (array?.length) {
        textArray.push(array)
      }
    }
    if (dates?.length) {
      const array = toArrayString(dates.map((date) => {
        if (date) {
          return `le ${dateToString(date)} `
        }
        return undefined
      }).filter(e => e))
      if (array?.length) {
        textArray.push(array)
      }
    }
    if (weekdays?.length) {
      textArray.push(`le${weekdays.length > 1 ? 's' : ''} ${toArrayString(weekdays)}`)
    }
    if (holidays) {
      textArray.push('les jours fériés')
    }
    if (timeIntervals?.length) {
      const array = toArrayString(timeIntervals.map(({ from, to }) => {
        if (from && to) {
          return `de ${from.getHours()}:${from.getMinutes()} 
            à ${to.getHours()}:${to.getMinutes()}`
        }
        return undefined
      }).filter(e => e))
      if (array?.length) {
        textArray.push(array)
      }
    } else if (daytime) {
      textArray.push('du lever au coucher du soleil')
    }
    if (textArray?.length) {
      return `Pêche ${authorized ? 'autorisée' : 'interdite'} `.concat(textArray.join(', '))
    }
    return null
  }

  return <Wrapper show={show}>
    <Title>
      <PeriodRadioGroup
        inline={true}
        onChange={onPeriodChange}
        value={authorized}
      >
        Périodes
        <CustomRadio checked={authorized === true} value={true} />
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
            { dateRanges?.length > 0
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
                key={-1}
                id={-1}
                annualRecurrence={annualRecurrence}
                dateRange={DEFAULT_DATE_RANGE}
                updateList={updateDateRanges}
                removeDateRange={removeDateRange}
                disabled={disabled}
              />
            }
          </DateRanges>
          <SquareButton
            disabled={disabled || dateRanges?.length === 0}
            onClick={_ => !disabled && dateRanges?.length !== 0 && addDateRange()} />
        </Row>
        <Row>
          <Label>Dates précises</Label>
          <DateList >
            { dates?.length > 0
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
                    disabled={disabled || date === undefined}
                    onClick={_ => !disabled && date !== undefined && onDeleteDate(id)} />
                </DateRow>
              })
              : <DateRow key={-1}>
                  <CustomDatePicker
                    disabled={disabled}
                    value={undefined}
                    onChange={date => onDateChange(-1, date)}
                    format='DD/MM/YYYY'
                    placement={'rightStart'}
                    style={{ marginRight: '10px' }}
                  />
                  <SquareButton
                    type='delete'
                    disabled={true}
                  />
                </DateRow>
            }
          </DateList>
          <SquareButton
            disabled={disabled || dates?.length === 0}
            onClick={_ => !disabled && dates?.length !== 0 && onAddDate()}/>
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
        <Row>
          <DateRanges>
              { timeIntervals?.length > 0
                ? timeIntervals.map((timeInterval, id) => {
                  return <TimeInterval
                    key={id}
                    id={id}
                    timeInterval={timeInterval}
                    disabled={disabled || daytime}
                    onTimeIntervalChange={onTimeIntervalChange}
                    removeTimeInterval={removeTimeInterval}
                  />
                })
                : <TimeInterval
                  key={-1}
                  id={-1}
                  timeInterval={undefined}
                  disabled={disabled || daytime}
                  onTimeIntervalChange={onTimeIntervalChange}
                  removeTimeInterval={removeTimeInterval}
                />
              }
          </DateRanges>
          <SquareButton
              disabled={disabled || timeIntervals?.length === 0}
              onClick={_ => !disabled && timeIntervals?.length !== 0 && addTimeInterval()} />
        </Row>
        <Row>
          ou <DaytimeCheckbox
            disabled={disabled}
            checked={daytime}
            onChange={setDaytime}
          /> du lever au coucher du soleil
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
