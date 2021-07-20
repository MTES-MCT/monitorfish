import { COLORS } from '../../constants/constants'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

const baseBlackButton = css`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  :hover, :focus {
    background: ${COLORS.charcoal};
  }
  :disabled {
    border: 1px solid ${COLORS.lightGray};
    background: ${COLORS.lightGray};
    color: ${COLORS.white};
  }
`

const baseWhiteButton = css`
  border: 1px solid ${COLORS.charcoal};
  color: ${COLORS.charcoal};
  :disabled {
    border: 1px solid ${COLORS.lightGray};
    color: ${COLORS.slateGray};
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

export const BlackButton = styled(Button)`
  ${baseBlackButton}
`

export const WhiteButton = styled(Button)`
  ${baseWhiteButton}
`

export const BackofficeWhiteButton = styled(BackofficeButton)`
  ${baseWhiteButton}
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

export const AddRegulationButton = styled(Link)`
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

export const ValidateButton = styled(BlackButton)`
  margin: 0px 10px 0px 0px;
`

export const CancelButton = styled(WhiteButton)`
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
