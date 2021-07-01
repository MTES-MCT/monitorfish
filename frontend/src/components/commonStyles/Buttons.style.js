import { COLORS } from '../../constants/constants'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

const baseBlackButton = css`
  background: ${COLORS.grayDarkerThree};
  color: ${COLORS.grayBackground};
  :hover, :focus {
    background: ${COLORS.grayDarkerThree};
  }
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    background: ${COLORS.grayDarker};
    color: ${COLORS.white};
  }
`

const baseWhiteButton = css`
// 1 px en #D6D6D6
  border: 1px solid ${COLORS.grayDarkerThree};
  color: ${COLORS.grayDarkerThree};
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    color: ${COLORS.textGray};
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
  border: 1px solid ${COLORS.grayDarker};
  border-radius: 2px;
  color: ${COLORS.grayDarker};
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
    background-color: ${COLORS.grayDarkerThree};
  }
  &:after {
    background-color: ${COLORS.white};
  }
  &:before {
    background-color: ${COLORS.white};
  }
`
