import { COLORS } from '../../constants/constants'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

const basePrimaryButton = css`
  background: #3B4559;
  color: #E5E5EB;
  :hover, :focus {
    background: #3B4559;
  }
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    background: ${COLORS.grayDarker};
    color: ${COLORS.white};
  }
`

const baseSecondaryButton = css`
  border: 1px solid #3B4559;
  color: #3B4559;
  :disabled {
    border: 1px solid #CCCFD6;
    color: #CCCFD6;
  }
`

const Button = styled.button`
  font-size: 13px;
  padding: 5px 12px;
  margin: 20px ${props => props.isLast ? '20px' : '0'} 20px 10px;
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
  border: 1px solid #3B4559;
  border-radius: 2px;
  color: #E5E5EB;
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

export const AddRegulationButton = styled(Link)`
  ${baseAddButton}
  min-width: 40px;
  min-height: 40px;
  && {
    background-color: #3B4559;
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
cursor: pointer;
width: 35px;
height: 35px;
border: 1px solid ${COLORS.grayDarker};
border-radius: 2px;
color: ${COLORS.grayDarker};
margin-right: 8px;

&:after {
  content: "";  
  display: block;
  background-color: ${COLORS.grayDarker};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

&:before {
  content: "";  
  display: block;
  background-color: ${COLORS.grayDarker};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
&:before {
  height: 15px;
  width: 1.5px;
}
&:after {
  height: 1.5px;
  width: 15px;
}
`
