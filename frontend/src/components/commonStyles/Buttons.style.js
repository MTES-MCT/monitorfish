import { COLORS } from '../../constants/constants'
import styled from 'styled-components'

const button = styled.button`
  font-size: 13px;
  padding: 5px 12px;
  margin: 20px ${props => props.isLast ? '20px' : '0'} 20px 10px;
`

export const BlackButton = styled(button)`
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

export const WhiteButton = styled(button)`
  border: 1px solid ${COLORS.grayDarkerThree};
  color: ${COLORS.grayDarkerThree};
  :disabled {
    border: 1px solid ${COLORS.grayDarker};
    color: ${COLORS.grayDarker};
  }
`
