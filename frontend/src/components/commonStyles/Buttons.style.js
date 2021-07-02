import { COLORS } from '../../constants/constants'
import styled, { css } from 'styled-components'

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
  border: 1px solid ${COLORS.grayDarkerThree};
  color: ${COLORS.grayDarkerThree};
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    color: ${COLORS.grayDarker};
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

export const BackofficeBottomButton = styled(BackofficeButton)`
  ${baseBlackButton}
  position: fixed;
  bottom: 0;
  left: 25%;
  margin-left: -120px;
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
