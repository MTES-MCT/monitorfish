import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

export const Row = styled.div`
  display: ${props => props.display === false ? 'none' : 'flex'};
  margin-bottom: 8px;
  color: ${COLORS.slateGray}
`

export const TimeRow = styled(Row)`
  opacity: ${props => props.disabled ? '0.4' : '1'};
`

export const DateRanges = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 13px;
  color: ${COLORS.slateGray};
  margin-right: 10px;
`

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  ${props => props.alignSelf ? `align-self: ${props.alignSelf}` : ''};
`
