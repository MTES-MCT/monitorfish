import styled, { css } from 'styled-components'

import { SQUARE_BUTTON_TYPE } from '../../constants/constants'

export const basePrimaryButton = css<{
  width?: string
}>`
  background: ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gainsboro};
  ${p => (p.width ? `width: ${p.width};` : '')}
  :hover, :focus {
    background: ${p => p.theme.color.charcoal};
  }
  :disabled {
    border: 1px solid ${p => p.theme.color.lightGray};
    background: ${p => p.theme.color.lightGray};
    color: ${p => p.theme.color.white};
  }
`

const baseSecondaryButton = css<{
  width?: string
}>`
  border: 1px solid ${p => p.theme.color.charcoal};
  color: ${p => p.theme.color.gunMetal};
  ${p => (p.width ? `width: ${p.width};` : '')}
  :disabled {
    border: 1px solid ${p => p.theme.color.lightGray};
    color: ${p => p.theme.color.slateGray};
  }
`

const Button = styled.button<{
  isLast?: boolean
}>`
  font-size: 13px;
  padding: 5px 12px;
  margin: 20px ${p => (p.isLast ? '20px' : '0')} 20px 10px;
  height: 30px;
`

export const PrimaryButton = styled(Button)`
  ${basePrimaryButton}
`

export const SecondaryButton = styled(Button)`
  ${baseSecondaryButton}
`

const baseAddButton = css`
  position: relative;
  border: 1px solid ${p => p.theme.color.lightGray};
  border-radius: 2px;
  color: ${p => p.theme.color.lightGray};
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 1.6px;
    width: 15px;
  }
  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 16px;
    width: 1.5px;
  }
`

export const AddRegulationButton = styled.a`
  ${baseAddButton}
  min-width: 40px;
  min-height: 40px;
  && {
    background-color: ${p => p.theme.color.charcoal};
  }
  &:after {
    background-color: ${p => p.theme.color.white};
  }
  &:before {
    background-color: ${p => p.theme.color.white};
  }
  cursor: pointer;
`

export const ValidateButton = styled(PrimaryButton)`
  margin: 0px 10px 0px 0px;
`

export const CancelButton = styled(SecondaryButton)`
  margin: 0px 10px 0px 0px;
`

export const SquareButton = styled.a<{
  disabled: boolean
}>`
  position: relative;
  box-sizing: border-box;
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
  width: 34px;
  height: 34px;
  border: 1px solid ${p => p.theme.color.lightGray};
  border-radius: 2px;
  color: ${p => p.theme.color.lightGray};
  margin-right: 5px;
  opacity: ${p => (p.disabled ? '0.4' : '1')};
  &:after {
    content: '';
    display: block;
    background-color: ${p => p.theme.color.lightGray};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &:before {
    content: '';
    display: block;
    background-color: ${p => p.theme.color.lightGray};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &:before {
    height: ${p => (p.type === SQUARE_BUTTON_TYPE.DELETE ? '1.5px' : '12px')};
    width: ${p => (p.type === SQUARE_BUTTON_TYPE.DELETE ? '12px' : '1.5px')};
  }
  &:after {
    height: 1.5px;
    width: 12px;
  }
`
