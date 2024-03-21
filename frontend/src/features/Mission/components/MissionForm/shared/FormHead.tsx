import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const FormHead = styled.div`
  align-items: end;
  display: flex;
  margin: 32px 40px 32px 40px;
  padding-bottom: 8px;
  height: 32px;
  border-bottom: 1px solid ${THEME.color.slateGray};
  flex-shrink: 0;

  > div {
    margin-left: auto;
  }

  > h2 {
    color: ${p => p.theme.color.charcoal};
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    margin: 0;

    > div {
      margin-right: 8px;
      vertical-align: -2px;
    }
  }
`
