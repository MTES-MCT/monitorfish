import { COLORS } from '../../constants/constants'
import styled from 'styled-components'
import { List } from 'rsuite'

const CardTableRow = styled(List.Item)`
  background: ${p => p.isFocused ? COLORS.gainsboro : COLORS.cultured};
  border: 1px solid ${COLORS.lightGray};
  border-radius: 1px;
  height: 15px;
  margin-top: 6px;
  transition: background 3s;
  animation: ${p => p.toClose ? 'close-alert-transition-item 3s ease forwards' : 'unset'};
  overflow: hidden;
`

export default CardTableRow
