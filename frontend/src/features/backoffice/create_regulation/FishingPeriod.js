import React, { useState, useEffect } from 'react'
import { Label } from '../../commonStyles/Input.style'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Radio, RadioGroup } from 'rsuite'
import { SquareButton } from '../../commonStyles/Buttons.style'
import TimeSlot from './TimeSlot'
import CustomDatePicker from './CustomDatePicker'
import DayPicker from './DayPicker'
import { CustomCheckbox } from '../../commonStyles/Backoffice.style'

const FishingPeriod = ({ show }) => {
  /* const {
    fishingPeriod,
    setFishingPeriod
  } = props */

  const [authorized, setAuthorized] = useState(undefined)
  const [displayForm, setDisplayForm] = useState(false)
  const [disabled, setDisabled] = useState(undefined)
  const [annual, setAnnual] = useState(undefined)
  const [holidays, setHolidays] = useState(false)
  const [timeSlots, setTimeSlots] = useState([{}])
  const [dates, setDates] = useState([undefined])
  const [weekdays, setWeekdays] = useState([])

  /**
   * Add a time slot object to the timeSlots list
   * @param {TimeSlot} timeSlot: object to add
   */
  const addTimeSlot = (timeSlot) => {
    console.log(`addTimeSlot ${timeSlot}`)
    // should we test the values here ?
    const newTimeSlots = [...timeSlots]
    newTimeSlots.push(timeSlot)
    setTimeSlots(newTimeSlots)
  }

  useEffect(() => {
    console.log('timeSlots has changed')
  }, [timeSlots])

  /**
   * Remove a time slot object from the timeSlots list
   * @param {number} id: object id in the list
   */
  const removeTimeSlot = (id) => {
    let newTimeSlots = [...timeSlots]
    if (newTimeSlots.length === 1) {
      newTimeSlots = [{}]
    } else {
      newTimeSlots.splice(id, 1)
    }
    setTimeSlots(newTimeSlots)
  }

  /**
   * update a given object in the timeSlots list
   * @param {number} id: object id
   * @param {number} timeSlot: new object to insert
   */
  const updateTimeSlots = (id, timeSlot) => {
    // should we test the values here ?
    const newTimeSlots = [...timeSlots]
    newTimeSlots[id] = timeSlot
    setTimeSlots(newTimeSlots)
  }

  return <Wrapper show={show}>
    <Title>
      <RadioGroup
        inline={true}
        onChange={value => {
          setAuthorized(value)
          if (!displayForm) {
            setDisplayForm(true)
          }
        }}
      >
        Périodes
        <CustomRadio checked={authorized} value={true} />
        {' autorisées'}
        <GreenCircle />
        <CustomRadio checked={authorized === false} value={false} />
        {' interdites'}
        <RedCircle />
      </RadioGroup>
    </Title>
    <DateWrapper>
      <Row display={displayForm}>
        <Label>Récurrence annuelle</Label>
        <RadioGroup
          inline={true}
          onChange={value => {
            setAnnual(value)
            if (disabled) {
              setDisabled(false)
            }
          }}
          value={annual}
        >
          <CustomRadio value={true} >oui</CustomRadio>
          <CustomRadio value={false} >non</CustomRadio>
        </RadioGroup>
      </Row>
      <ConditionnalLines display={displayForm} disabled={disabled}>
      <Row>
        <Label>Plages de dates</Label>
        <TimeSlots>
          {
            timeSlots.map((timeSlot, id) => {
              return <TimeSlot
                  key={id}
                  id={id}
                  annual={annual}
                  timeSlot={timeSlot}
                  updateList={updateTimeSlots}
                  removeTimeSlot={removeTimeSlot}
                  disabled={disabled}
                />
            })
          }
        </TimeSlots>
        <SquareButton onClick={() => {
          console.log('on SquareButton click')
          addTimeSlot({})
        }} />
      </Row>
      <Row>
        <Label>Dates précises</Label>
        <DateList >
          {
            dates.map((date, id) => {
              return <DateRow key={id}>
                <CustomDatePicker
                  // $isrequired={startDateIsRequired}
                  disabled={disabled}
                  value={date}
                  onChange={(date) => {
                    const newList = [...dates]
                    newList[id] = date
                    setDates(newList)
                  }}
                  format='DD/MM/YYYY'
                  placement={'rightStart'}
                  style={{ marginRight: '10px' }}
                />
                <SquareButton
                  type='delete'
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) {
                      const newList = [...dates]
                      newList.splice(id, 1)
                      setDates(newList)
                    }
                  }} />
              </DateRow>
            })
          }
        </DateList>
        <SquareButton
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              const newList = [...dates]
              newList.push(undefined)
              setDates(newList)
            }
          }}/>
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
        <HolidaysCheckbox disabled={disabled} onChange={_ => setHolidays(!holidays)}/>
      </Row>
      </ConditionnalLines>
    </DateWrapper>
    <ConditionnalLines display={displayForm}>
      <TimeWrapper disabled={disabled}>
        <Title>Horaires autorisées</Title>
        <Row>De <CustomDatePicker
            /* $isrequired={startDateIsRequired}
            value={currentStartDate}
            onChange={(date) => setCurrentStartDate(date)}
            onOk={(date, _) => setCurrentStartDate(date)} */
            format='MM/DD/YYYY'
            placement={'rightStart'}
            style={{ margin: '0px 5px' }}
            disabled={disabled}
          />
          à <CustomDatePicker
            /* $isrequired={startDateIsRequired}
            value={currentStartDate}
            onChange={(date) => setCurrentStartDate(date)}
            onOk={(date, _) => setCurrentStartDate(date)} */
            format='DD/MM/YYYY'
            placement={'rightStart'}
            style={{ margin: '0px 5px' }}
            disabled={disabled === 2}
          />
          <SquareButton disabled={disabled}/>
        </Row>
        <Row>
          ou <DaytimeCheckbox disabled={disabled} onChange={_ => setHolidays(!holidays)}/> du lever au coucher du soleil
        </Row>
      </TimeWrapper>
    </ConditionnalLines>
  </Wrapper>
}

const ConditionnalLines = styled.div`
  display: ${props => props.display ? 'flex' : 'none'};
  flex-direction: column;
`

const TimeWrapper = styled.div`
  opacity: ${props => props.disabled ? '0.4' : '1'};
`

const Wrapper = styled.div`
  display: ${props => props.show ? 'flex' : 'none'};
  ${props => props.show ? 'flex-direction: column;' : ''};
`

const DateRow = styled.div`
  display: flex;
  margin-bottom: 5px;
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
const DateWrapper = styled.div`
  margin-bottom: 30px;
  opacity: ${props => props.disabled ? '0.4' : '1'};
`

const TimeSlots = styled.div`
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

const Title = styled.div`
  display: flex;
  padding: 0px 0px 10px 0px;
  align-items: center;
  font-size: 13px;
  margin-bottom: 18px;
  color: ${COLORS.slateGray};
  border-bottom: 1px solid ${COLORS.lightGray}
`

const GreenCircle = styled.span`
  height: 10px;
  width: 10px;
  margin-right: 8px;
  background-color: ${COLORS.mediumSeaGreen};
  border-radius: 50%;
`

const RedCircle = styled.span`
  height: 10px;
  width: 10px;
  margin-right: 8px;
  background-color: ${COLORS.red};
  border-radius: 50%;
`

const CustomRadio = styled(Radio)`
  .rs-radio-checker {
    padding-top: 2px;
    padding-bottom: 0px;
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
  }

  .rs-radio-checker > label {
    font-size: 13px;
    color: ${COLORS.slateGray};
  }
`

export default FishingPeriod
