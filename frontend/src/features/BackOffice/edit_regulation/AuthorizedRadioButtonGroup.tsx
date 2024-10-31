import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Radio, RadioGroup } from 'rsuite'
import styled, { css } from 'styled-components'

import { useSetFishingPeriod } from '../../../hooks/fishingPeriod/useSetFishingPeriod'
import { FISHING_PERIOD_KEYS } from '../../Regulation/utils'

type AuthorizedRadioButtonGroupProps = Readonly<{
  title: string
}>
export function AuthorizedRadioButtonGroup({ title }: AuthorizedRadioButtonGroupProps) {
  // const { authorized } = useBackofficeAppSelector(state => state.regulation.processingRegulation.fishingPeriod)
  const processingRegulation = useBackofficeAppSelector(state => state.regulation.processingRegulation)
  const setAuthorized = useSetFishingPeriod(FISHING_PERIOD_KEYS.AUTHORIZED)

  return (
    // TODO Remove these any (migration to TS).
    <AuthorizedRadio inline onChange={setAuthorized} value={processingRegulation.fishingPeriod?.authorized as any}>
      {title}
      <CustomRadio checked={processingRegulation.fishingPeriod?.authorized === true} value={true as any}>
        autorisées
        <GreenCircle />
      </CustomRadio>
      <CustomRadio checked={processingRegulation.fishingPeriod?.authorized === false} value={false as any}>
        interdites
        <RedCircle />
      </CustomRadio>
    </AuthorizedRadio>
  )
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
  background-color: ${p => p.theme.color.mediumSeaGreen};
`

const RedCircle = styled.span`
  ${circle}
  background-color: ${p => p.theme.color.maximumRed};
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
    color: ${p => p.theme.color.gunMetal};
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
