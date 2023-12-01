import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const HideIcon = styled(Icon.Display)<{
  title?: string
}>`
  margin-right: 4px;
  color: ${p => p.theme.color.lightGray};
`
