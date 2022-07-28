import { COLORS } from '../../constants/constants'
import styled from 'styled-components'
import { List } from 'rsuite'

const CardTableHeader = ({ children }) => {
  return <StyledCardTableHeader
    key={0}
    index={0}
  >
    {children}
  </StyledCardTableHeader>
}

const StyledCardTableHeader = styled(List.Item)`
  border: 1px solid ${COLORS.lightGray};
  border-radius: 1px;
  height: 15px;
  transition: background 3s;
  overflow: hidden;
  background: ${COLORS.background};
  color: ${COLORS.slateGray};
`

export default CardTableHeader
