import { CountryFlag } from '@components/CountryFlag'
import { Tag } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

// TODO Update that in monitor-ui.
export const FixedTag = styled(Tag)<{
  $isFullWidth?: boolean
}>`
  align-items: baseline;
  cursor: ${p => (p.onClick ? 'pointer' : 'default')};
  display: inline-block;
  line-height: 22px;
  max-width: ${p => (p.$isFullWidth ? 'auto' : '130px')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const StyledCountryFlag = styled(CountryFlag)`
  margin-right: 8px;
  vertical-align: -2px;
`

export const None = styled.span`
  color: #FF3392;
  font-style: italic;
`
