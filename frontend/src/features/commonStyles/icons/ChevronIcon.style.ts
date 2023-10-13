import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const ChevronIcon = styled(Icon.Chevron)<{
  $isOpen: boolean
}>`
  margin-right: 16px;
  transform: ${p => (!p.$isOpen ? 'rotate(0deg)' : 'rotate(180deg)')};
  transition: all 0.5s;
`
