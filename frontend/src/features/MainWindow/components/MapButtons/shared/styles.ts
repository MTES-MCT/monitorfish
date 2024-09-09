import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const Content = styled.div<{
  $hasMargin?: boolean
}>`
  margin: ${p => (p.$hasMargin ? 16 : 0)}px;
`

export const Header = styled.div<{
  $isFirst?: boolean
}>`
  background: ${THEME.color.charcoal};
  border-top-left-radius: ${p => (p.$isFirst ? '2px' : '0')};
  border-top-right-radius: ${p => (p.$isFirst ? '2px' : '0')};
  color: ${THEME.color.gainsboro};
  font-size: 16px;
  padding: 9px 0 7px 15px;
  text-align: left;
`
