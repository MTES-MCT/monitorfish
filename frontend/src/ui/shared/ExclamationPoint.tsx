import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export const ExclamationPoint = styled.span<{
  color?: string
}>`
  background: ${THEME.color.goldenPoppy};
  border-radius: 15px;
  color: ${p => p.color || THEME.color.charcoal};
  display: inline-block;
  font: normal normal bold 10px/11px Arial;
  line-height: 7px;
  height: 20px;
  padding: 4px 4px 5px 8px;
  width: 20px;
  box-sizing: border-box;

  ::after {
    content: '! ';
  }
`
