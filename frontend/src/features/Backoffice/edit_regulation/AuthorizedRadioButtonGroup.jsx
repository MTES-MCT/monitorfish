import React from 'react'
import { useSelector } from 'react-redux'
import { Radio, RadioGroup } from 'rsuite'
import styled, { css } from 'styled-components'
import useSetFishingPeriod from '../../../hooks/fishingPeriod/useSetFishingPeriod'
import { FISHING_PERIOD_KEYS } from '../../../domain/entities/regulation'
import { COLORS } from '../../../constants/constants'

const AuthorizedRadioButtonGroup = ({ title }) => {
  const { authorized } = useSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const setAuthorized = useSetFishingPeriod(FISHING_PERIOD_KEYS.AUTHORIZED)

  return <AuthorizedRadio
    inline
    onChange={setAuthorized}
    value={authorized}
  >
    {title}
    <CustomRadio checked={authorized} value={true} >
      autorisées
      <GreenCircle />
    </CustomRadio>
    <CustomRadio checked={authorized === false} value={false} >
      interdites
      <RedCircle />
    </CustomRadio>
  </AuthorizedRadio>
}

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
  background-color: ${COLORS.maximumRed};
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

export const customRadioGroup = css`
  display: flex;
  flex-direction: row;
  align-items: center;
`

export const AuthorizedRadio = styled(RadioGroup)`
  ${customRadioGroup}
`

export default AuthorizedRadioButtonGroup
