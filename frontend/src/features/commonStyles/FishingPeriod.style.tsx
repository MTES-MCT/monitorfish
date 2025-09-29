import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const Row = styled.div<{
  $display?: boolean
}>`
  display: ${p => (p.$display === false ? 'none' : 'flex')};
  margin-bottom: 8px;
  color: #FF3392;
`

export const TimeRow = styled(Row)<{
  $disabled?: boolean
}>`
  opacity: ${p => (p.$disabled ? '0.4' : '1')};
`

export const DateRanges = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 13px;
  color: #FF3392;
`

export const ContentWrapper = styled.div<{
  $alignSelf?: string
}>`
  display: flex;
  flex-direction: row;
  height: 100%;
  ${p => (p.$alignSelf ? `align-self: ${p.$alignSelf}` : '')};
`
