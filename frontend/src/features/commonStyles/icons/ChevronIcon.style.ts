import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const ChevronIcon = styled(Icon.Chevron)<{
  $isOpen: boolean
}>`
  margin-right: 16px;
  transform: ${props => (!props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: all 0.5s;
`
