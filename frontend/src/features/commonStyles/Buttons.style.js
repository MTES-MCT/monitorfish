import { COLORS, SQUARE_BUTTON_TYPE } from '../../constants/constants'
import styled, { css } from 'styled-components'

export const basePrimaryButton = css`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  ${props => props.width ? `width: ${props.width};` : ''}
  :hover, :focus {
    background: ${COLORS.charcoal};
  }
  :disabled {
    border: 1px solid ${COLORS.lightGray};
    background: ${COLORS.lightGray};
    color: ${COLORS.white};
  }
`

const baseSecondaryButton = css`
  border: 1px solid ${COLORS.charcoal};
  color: ${COLORS.gunMetal};
  ${props => props.width ? `width: ${props.width};` : ''}
  :disabled {
    border: 1px solid ${COLORS.lightGray};
    color: ${COLORS.slateGray};
  }
`

const Button = styled.button`
  font-size: 13px;
  padding: 5px 12px;
  margin: 20px ${props => props.isLast ? '20px' : '0'} 20px 10px;
  height: 30px;
`

const BackofficeButton = styled.button`
  font-size: 13px;
  padding: 6px 12px;
  margin: 15px ${props => props.isLast ? '20px' : '0'} 15px 10px;
`

export const PrimaryButton = styled(Button)`
  ${basePrimaryButton}
`

export const SecondaryButton = styled(Button)`
  ${baseSecondaryButton}
`

export const BackofficeSecondaryButton = styled(BackofficeButton)`
  ${baseSecondaryButton}
`

const baseAddButton = css`
  position: relative;
  border: 1px solid ${COLORS.lightGray};
  border-radius: 2px;
  color: ${COLORS.lightGray};
  &:after {
    content: "";  
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 1.6px;
    width: 15px;
  }
  &:before {
    content: "";  
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
    background-color: ${COLORS.charcoal};
  }
  &:after {
    background-color: ${COLORS.white};
  }
  &:before {
    background-color: ${COLORS.white};
  }
`

export const ValidateButton = styled(PrimaryButton)`
  margin: 0px 10px 0px 0px;
`

export const CancelButton = styled(SecondaryButton)`
  margin: 0px 10px 0px 0px;
`

export const SquareButton = styled.a`
position: relative;
box-sizing: border-box;
cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
width: 38px;
height: 35px;
border: 1px solid ${COLORS.lightGray};
border-radius: 2px;
color: ${COLORS.lightGray};
margin-right: 5px;
opacity: ${props => props.disabled ? '0.4' : '1'};
&:after {
  content: "";  
  display: block;
  background-color: ${COLORS.lightGray};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

&:before {
  content: "";  
  display: block;
  background-color: ${COLORS.lightGray};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
&:before {
  height: ${props => props.type === SQUARE_BUTTON_TYPE.DELETE ? '1.5px' : '15px'};
  width: ${props => props.type === SQUARE_BUTTON_TYPE.DELETE ? '15px' : '1.5px'};
}
&:after {
  height: 1.5px;
  width: 15px;
}
`
