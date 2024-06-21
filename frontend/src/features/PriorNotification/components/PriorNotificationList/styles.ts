import { CountryFlag } from '@components/CountryFlag'
import { Tag } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

// TODO Update that in monitor-ui.
export const FixedTag = styled(Tag)`
  align-items: baseline;
  line-height: 22px;
  white-space: nowrap;
`

export const StyledCountryFlag = styled(CountryFlag)`
  margin-right: 8px;
  vertical-align: -2px;
`

export const None = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
`
