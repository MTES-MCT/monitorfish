import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { Radio, RadioGroup } from 'rsuite'
import { Label } from '../../../commonStyles/Input.style'
import { COLORS } from '../../../../constants/constants'
import useSetFishingPeriod from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { FISHING_PERIOD_KEYS } from '../../../../domain/entities/regulation'

const FishingPeriodAnnualRecurrence = ({ disabled }) => {
  const { annualRecurrence } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const onAnnualRecurrenceChange = useSetFishingPeriod(FISHING_PERIOD_KEYS.ANNUAL_RECURRENCE)

  useEffect(() => {
    if (disabled) {
      onAnnualRecurrenceChange(undefined)
    }
  }, [disabled])

  return <AnnualRecurrence disabled={disabled}>
    <Label>Récurrence annuelle</Label>
    <RadioGroup
      inline
      onChange={value => onAnnualRecurrenceChange(value === 'true')}
      value={
        annualRecurrence === undefined
          ? ''
          : annualRecurrence === true
            ? 'true'
            : 'false'
      }
    >
      <CustomRadio disabled={disabled} value={'true'}>
        oui
      </CustomRadio>
      <CustomRadio disabled={disabled} value={'false'}>
        non
      </CustomRadio>
    </RadioGroup>
  </AnnualRecurrence>
}

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

const AnnualRecurrence = styled.div`
  .rs-radio-group {
    margin-left: -10px;
  }
  opacity: ${props => props.disabled ? '0.4' : '1'};
`

export default FishingPeriodAnnualRecurrence
