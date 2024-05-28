import { CountryFlag } from '@components/CountryFlag'
import styled from 'styled-components'

export const StyledCountryFlag = styled(CountryFlag)`
  margin-right: 8px;
  vertical-align: -2px;
`

export const None = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
`
