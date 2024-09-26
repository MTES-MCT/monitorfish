import styled from 'styled-components'

import { NoRsuiteOverrideWrapper } from '../../../ui/NoRsuiteOverrideWrapper'

export const Page = styled(NoRsuiteOverrideWrapper)`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-bottom: 20px;
  overflow: auto;

  * {
    box-sizing: border-box;
  }
`
