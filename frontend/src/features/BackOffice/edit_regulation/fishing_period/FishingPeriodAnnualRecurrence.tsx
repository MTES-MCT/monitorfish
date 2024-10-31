import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { useEffect } from 'react'
import { Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { useSetFishingPeriod } from '../../../../hooks/fishingPeriod/useSetFishingPeriod'
import { Label } from '../../../commonStyles/Input.style'
import { FISHING_PERIOD_KEYS } from '../../../Regulation/utils'

type FishingPeriodAnnualRecurrenceProps = Readonly<{
  disabled: boolean | undefined
}>
export function FishingPeriodAnnualRecurrence({ disabled = false }: FishingPeriodAnnualRecurrenceProps) {
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  const onAnnualRecurrenceChange = useSetFishingPeriod(FISHING_PERIOD_KEYS.ANNUAL_RECURRENCE)

  useEffect(() => {
    if (disabled) {
      onAnnualRecurrenceChange(undefined)
    }
  }, [disabled, onAnnualRecurrenceChange])

  return (
    <AnnualRecurrence $disabled={disabled}>
      <Label>Récurrence annuelle</Label>
      <RadioGroup
        inline
        onChange={value => onAnnualRecurrenceChange(value === 'true')}
        value={
          // eslint-disable-next-line no-nested-ternary
          processingRegulation.fishingPeriod?.annualRecurrence === undefined
            ? ''
            : processingRegulation.fishingPeriod?.annualRecurrence === true
              ? 'true'
              : 'false'
        }
      >
        <CustomRadio disabled={disabled} value="true">
          oui
        </CustomRadio>
        <CustomRadio disabled={disabled} value="false">
          non
        </CustomRadio>
      </RadioGroup>
    </AnnualRecurrence>
  )
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
    color: ${p => p.theme.color.gunMetal};
  }
`

const AnnualRecurrence = styled.div<{
  $disabled?: boolean
}>`
  .rs-radio-group {
    margin-left: -10px;
  }
  opacity: ${p => (p.$disabled ? '0.4' : '1')};
`
