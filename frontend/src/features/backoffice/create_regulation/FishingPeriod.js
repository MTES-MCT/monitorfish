import React, { useState } from 'react'
import { Label } from '../../commonStyles/Input.style'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Radio, RadioGroup } from 'rsuite'
import { SquareButton } from '../../commonStyles/Buttons.style'
import TimeSlot from './TimeSlot'
import CustomDatePicker from './CustomDatePicker'

const FishingPeriod = (props) => {
  /* const {
    fishingPeriod,
    setFishingPeriod
  } = props */

  const [annual, setAnnual] = useState(true)
  return <>
    <Title>
      <GreenCircle />
      Périodes autorisées
      <CustomRadio />
    </Title>
    <Row>
      <Label>Récurrence annuelle</Label>
      <RadioGroup
        inline={true}
        onChange={value => setAnnual(value)}
        value={annual}
      >
        <CustomRadio value={true}>oui</CustomRadio>
        <CustomRadio value={false}>non</CustomRadio>
      </RadioGroup>
    </Row>
    <Row>
      <Label>Plages de dates</Label>
      <TimeSlots>
        <TimeSlot annual={annual} />
      </TimeSlots>
      <SquareButton />
    </Row>
    <Row>
      <Label>Dates précises</Label>
      <CustomDatePicker
        /* $isrequired={startDateIsRequired}
        value={currentStartDate}
        onChange={(date) => setCurrentStartDate(date)}
        onOk={(date, _) => setCurrentStartDate(date)} */
        format='DD/MM/YYYY'
        placement={'rightStart'}
        style={{ marginRight: '10px' }}
      />
      <SquareButton />
    </Row>
    <Label>Jours de la semaine</Label>
    <Label>Jours fériés</Label>
    <Title>Horaires autorisées</Title>
    <Label>Plages de dates</Label>
  </>
}

const TimeSlots = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
`

const Row = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: center;
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
