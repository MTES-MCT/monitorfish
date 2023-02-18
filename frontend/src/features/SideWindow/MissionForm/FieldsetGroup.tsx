import { Fieldset } from '@mtes-mct/monitor-ui'
import styled, { css } from 'styled-components'

export const FieldsetGroup = styled(Fieldset)<{
  isInline?: boolean
}>`
  /* TODO Add this prop in monitor-ui. */
  min-width: 0;

  > div {
    flex-direction: ${p => (p.isInline ? 'row' : 'column')};

    ${p =>
      p.isInline &&
      css`
        > div:first-child {
          flex-grow: 1;
          margin-right: 16px;
        }
      `}

    > button:not(:first-child),
    > div:not(:first-child),
    > fieldset:not(:first-child),
    > hr {
      margin-top: 24px;
    }
  }
`
