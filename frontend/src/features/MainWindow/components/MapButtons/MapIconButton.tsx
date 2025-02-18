import { IconButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const MapIconButton = styled(IconButton)<{ $isActive: boolean }>`
  padding: unset;
  border-radius: 2px;
  width: 40px;
  height: 40px;
  ${p => (p.$isActive ? `background: ${p.theme.color.blueGray};` : '')}
  ${p => (p.$isActive ? `border-color: ${p.theme.color.blueGray};` : '')}
`
