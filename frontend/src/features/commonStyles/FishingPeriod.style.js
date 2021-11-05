import styled from 'styled-components'
import { COLORS } from '../../constants/constants'

export const Row = styled.div`
  display: ${props => props.display === false ? 'none' : 'flex'};
  margin-bottom: 8px;
  align-items: center;
  color: ${COLORS.slateGray}
`
